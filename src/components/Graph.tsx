import { instance } from '@viz-js/viz'
import { useEffect, useRef, useState, memo, useCallback } from 'react'
import { Button } from "@/components/ui/button";
import { Pencil, Save, Trash2 } from "lucide-react";
import { useComponentLogger, hashString, truncate } from '@/contexts/LoggingContext';
import { CodeEditor } from './CodeEditor';

type SvgProps = {
  graphviz: string,
  engine: string
}

// Enhanced memo implementation with custom equality function
const Svg = memo(({ graphviz, engine }: SvgProps) => {
  const logger = useComponentLogger('Svg');
  const renderCount = useRef(0);

  // Increment render count
  renderCount.current++;

  logger.debug(`Rendering ${renderCount.current} with graphviz hash: ${hashString(graphviz)}`);

  // Store graphviz in ref to detect actual changes
  const graphvizRef = useRef(graphviz);
  const engineRef = useRef(engine);

  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use a stable reference for the render function
  const renderSvg = useCallback(async () => {
    // Use operation tracing to create groups automatically
    return logger.traceAsync('renderSvg', async () => {
      try {
        const viz = await instance();
        logger.debug(`Viz.js instance obtained`);

        try {
          logger.debug(`Rendering SVG with engine: ${engineRef.current}`);
          const renderedSvg = viz.renderSVGElement(graphvizRef.current, { engine: engineRef.current });
          logger.info(`SVG rendered successfully`);
          setSvg(renderedSvg);
          setError(null);
          return renderedSvg;
        } catch (err) {
          logger.error(`Error rendering SVG:`, err);
          setError("Error rendering SVG");
          throw err;
        }
      } catch (err) {
        logger.error(`Error initializing Viz.js:`, err);
        setError("Error initializing Viz.js");
        throw err;
      }
    }, 'info');
  }, [logger]); // Logger is the only dependency

  useEffect(() => {
    logger.group(`SVG effect (render: ${renderCount.current})`);

    // Only re-render if the graphviz or engine actually changed
    if (graphvizRef.current !== graphviz || engineRef.current !== engine) {
      logger.info(`Props changed, triggering re-render`, {
        graphvizChanged: graphvizRef.current !== graphviz,
        engineChanged: engineRef.current !== engine,
        oldGraphvizHash: hashString(graphvizRef.current),
        newGraphvizHash: hashString(graphviz)
      });

      // Update refs with new values
      graphvizRef.current = graphviz;
      engineRef.current = engine;

      // Render with new values
      renderSvg().catch(err => {
        logger.error('Unhandled error in renderSvg', err);
      });
    } else {
      logger.debug('No prop changes, skipping render');
    }

    logger.groupEnd();

    return () => {
      logger.debug(`Svg effect cleanup`);
    };
  }, [graphviz, engine, renderSvg, logger]);

  // Initial render
  useEffect(() => {
    logger.startOperation('svg-initial-render', 'info');

    renderSvg().catch(err => {
      logger.error('Unhandled error in initial renderSvg', err);
    });

    return () => {
      logger.endOperation('svg-initial-render');
      logger.debug(`Svg component unmounting`);
    };
  }, [renderSvg, logger]);

  // Add SVG processing to ensure viewBox is set properly
  useEffect(() => {
    if (svg) {
      // Make sure SVG has proper attributes to scale and render correctly
      if (!svg.hasAttribute('viewBox') && svg.hasAttribute('width') && svg.hasAttribute('height')) {
        const width = svg.getAttribute('width') || '300';
        const height = svg.getAttribute('height') || '200';
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      }

      // Ensure SVG doesn't force the container to stretch
      svg.style.maxWidth = 'none';
      svg.style.width = 'auto';
    }
  }, [svg]);

  if (error || !svg || !svg.outerHTML) {
    return <p className="text-red-500">Error: {error || "Failed to render SVG"}</p>;
  }

  return (
    <div className="svg-wrapper" style={{ display: 'inline-block', overflowX: 'auto' }} dangerouslySetInnerHTML={{ __html: svg.outerHTML }} />
  );
}, (prevProps, nextProps) => {
  // Custom equality check for memo
  // Only re-render if graphviz or engine actually changed
  return prevProps.graphviz === nextProps.graphviz &&
         prevProps.engine === nextProps.engine;
});

type GraphProps = {
  id: string,
  title?: string,
  description?: string,
  engine?: string,
  graphviz: string,
  removeGraph: () => void,
  modifyGraph: (updatedGraphviz: string) => void
}

export const Graph = memo(({
  id,
  title = "Default Title",
  description = "Default Description",
  engine = "dot",
  graphviz,
  removeGraph,
  modifyGraph
}: GraphProps) => {
  const logger = useComponentLogger('Graph');
  const renderCount = useRef(0);

  // Increment render count
  renderCount.current++;

  // Use a group for the entire component render
  logger.group(`Graph ${id.substring(0, 8)} render ${renderCount.current}`);
  logger.debug(`Graphviz hash: ${hashString(graphviz)}`);

  const [isEditing, setIsEditing] = useState(false);
  const [editedGraphviz, setEditedGraphviz] = useState(graphviz);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update editedGraphviz when graphviz prop changes
  useEffect(() => {
    setEditedGraphviz(graphviz);
  }, [graphviz]);

  // Create stable callback functions using useCallback
  const handleEdit = useCallback(() => {
    logger.startOperation('edit', 'info');
    logger.info(`Edit button clicked for ID: ${truncate(id)}`);
    setEditedGraphviz(graphviz); // Reset to current value when starting edit
    setIsEditing(true);
    logger.endOperation('edit');
  }, [id, graphviz, logger]);

  const handleSave = useCallback(() => {
    logger.startOperation('save', 'info');
    logger.info(`Save button clicked for ID: ${truncate(id)}`);

    if (editedGraphviz !== graphviz) {
      logger.info(`New graphviz value different from current`, {
        oldHash: hashString(graphviz),
        newHash: hashString(editedGraphviz)
      });
      modifyGraph(editedGraphviz);
    } else {
      logger.debug(`No changes to graphviz`);
    }

    setIsEditing(false);
    logger.endOperation('save');
  }, [id, graphviz, editedGraphviz, modifyGraph, logger]);

  // Component mount/unmount logging
  useEffect(() => {
    logger.info(`Component mounted with ID: ${truncate(id)}`);
    return () => {
      logger.info(`Component unmounting with ID: ${truncate(id)}`);
    };
  }, [id, logger]);

  // Log editing state changes
  useEffect(() => {
    logger.debug(`isEditing changed to: ${isEditing}`);
  }, [isEditing, logger]);

  // Ensure we end the group at the end of rendering
  useEffect(() => {
    return () => {
      logger.groupEnd();
    };
  }, [logger]);

  // Memoize the SVG component to prevent unnecessary re-renders
  const MemoizedSvg = useCallback(() => (
    <Svg graphviz={graphviz} engine={engine} />
  ), [graphviz, engine]);

  const result = (
    <div className="flex flex-col border p-4 m-2 rounded-md group">
      <div className="relative flex justify-between">
        {/* Controls that appear on hover */}
        <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-70 transition-opacity duration-200 z-10">
          {isEditing ? (
            <Button variant="default" onClick={handleSave}>
              <Save />
            </Button>
          ) : (
            <Button variant="default" onClick={handleEdit}>
              <Pencil />
            </Button>
          )}
          <Button variant="destructive" onClick={removeGraph}>
            <Trash2 />
          </Button>
        </div>

        {/* Title and description that appear on hover */}
        <div className="flex flex-col justify-around pt-2 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex flex-col">
            <b className="text-lg">{title}</b>
            <p className="text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>

      {/* Editing area */}
      {isEditing && (
        <div className="mt-4 w-full">
          <CodeEditor
            ref={textareaRef}
            value={editedGraphviz}
            onChange={(value) => setEditedGraphviz(value)}
            placeholder="Enter GraphViz code"
            className="mt-2"
            minHeight="200px"
          />
        </div>
      )}

      {/* Graph visualization with explicitly forcing scroll */}
      <div className="mt-4 w-full overflow-hidden">
        <div className="overflow-x-scroll" style={{ width: '100%', overflowX: 'auto', display: 'block' }}>
          <div style={{ minWidth: 'min-content', display: 'inline-block' }}>
            <MemoizedSvg />
          </div>
        </div>
      </div>
    </div>
  );

  return result;
}, (prevProps, nextProps) => {
  // Custom comparison for the Graph component
  // Only re-render if any of these props changed
  return prevProps.id === nextProps.id &&
         prevProps.graphviz === nextProps.graphviz &&
         prevProps.engine === nextProps.engine &&
         prevProps.title === nextProps.title &&
         prevProps.description === nextProps.description;
});
