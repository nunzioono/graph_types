import { instance } from '@viz-js/viz'
import { useEffect, useRef, useState, memo, useCallback } from 'react'
import { Button } from "@/components/ui/button";
import { Pencil, Save, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useComponentLogger, hashString, truncate } from '@/contexts/LoggingContext';

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

  return error || !svg || !svg.outerHTML ?
    <p className="text-red-500">Error: {error || "Failed to render SVG"}</p> :
    <div dangerouslySetInnerHTML={{ __html: svg.outerHTML }} />
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Create stable callback functions using useCallback
  const handleEdit = useCallback(() => {
    logger.startOperation('edit', 'info');
    logger.info(`Edit button clicked for ID: ${truncate(id)}`);
    setIsEditing(true);
    logger.endOperation('edit');
  }, [id, logger]);

  const handleSave = useCallback(() => {
    logger.startOperation('save', 'info');
    logger.info(`Save button clicked for ID: ${truncate(id)}`);

    if (textareaRef.current) {
      const newValue = textareaRef.current.value;
      if (newValue !== graphviz) {
        logger.info(`New graphviz value different from current`, {
          oldHash: hashString(graphviz),
          newHash: hashString(newValue)
        });
        modifyGraph(newValue);
      } else {
        logger.debug(`No changes to graphviz`);
      }
    } else {
      logger.warn(`textareaRef.current is null`);
    }

    setIsEditing(false);
    logger.endOperation('save');
  }, [id, graphviz, modifyGraph, logger]);

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
    <div className="flex flex-col border p-4 m-2 rounded-md">
      <div className="relative flex justify-between">
        <div className="absolute top-0 right-0 flex gap-2">
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
        <div className="flex flex-col justify-around pt-10">
          <div className="flex flex-col">
            <b>{title}</b>
            <h2>{description}</h2>
          </div>
          {isEditing && (
            <Textarea
              ref={textareaRef}
              defaultValue={graphviz}
              className="min-h-[200px] mt-2"
            />
          )}
        </div>
      </div>

      <div className="mt-4">
        {/*        <p className="text-xs text-gray-500 mb-2">
          Graph ID: {truncate(id, 8)} |
          Graphviz Hash: {hashString(graphviz)} |
          Render count: {renderCount.current}
        </p>
*/}
        <MemoizedSvg />
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
