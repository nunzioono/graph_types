import { useState, useCallback, memo, useEffect } from 'react';
import { Graph } from '@/components/Graph'
import { FormGraph } from '@/components/GraphForm';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LoggingProvider, useComponentLogger } from '@/contexts/LoggingContext';
import { LoggingControls } from '@/components/LoggingControls';
import { Button } from '@/components/ui/button';

type Graph = {
  id: string;
  graphviz: string;
  engine: string;
}

// Memoize the Graph components to prevent unnecessary re-renders
const MemoizedGraph = memo(({ graph, removeGraph, modifyGraph }: {
  graph: Graph,
  removeGraph: () => void,
  modifyGraph: (updatedGraphviz: string) => void
}) => {
  return (
    <Graph
      key={graph.id}
      id={graph.id}
      engine={graph.engine}
      graphviz={graph.graphviz}
      removeGraph={removeGraph}
      modifyGraph={modifyGraph}
    />
  );
}, (prevProps, nextProps) => {
  // Only re-render if the graph data changed
  return prevProps.graph.id === nextProps.graph.id &&
         prevProps.graph.graphviz === nextProps.graph.graphviz &&
         prevProps.graph.engine === nextProps.graph.engine;
  // Note: removeGraph and modifyGraph callbacks should be stable
});

export default function AppContainer() {
  const [showLoggingControls, setShowLoggingControls] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);

  // Detect if device is mobile or tablet
  useEffect(() => {
    const checkMobileTablet = () => {
      setIsMobileOrTablet(window.innerWidth < 1024); // Consider devices below 1024px as mobile/tablet
    };

    // Check on initial load
    checkMobileTablet();

    // Check on resize
    window.addEventListener('resize', checkMobileTablet);

    // Cleanup
    return () => window.removeEventListener('resize', checkMobileTablet);
  }, []);

  return (
    <LoggingProvider initialConfig={{ enabled: !isMobileOrTablet }}>
      <div className="h-screen w-screen flex flex-col">
        {!isMobileOrTablet && (
          <div className="p-2 bg-slate-100 flex justify-end">
            <Button
              variant="outline"
              onClick={() => setShowLoggingControls(prev => !prev)}
            >
              {showLoggingControls ? 'Hide' : 'Show'} Logging Controls
            </Button>
          </div>
        )}

        {showLoggingControls && !isMobileOrTablet && (
          <div className="p-4">
            <LoggingControls />
          </div>
        )}

        <AppContent isMobileOrTablet={isMobileOrTablet} />
      </div>
    </LoggingProvider>
  );
}

function AppContent({ isMobileOrTablet }: { isMobileOrTablet: boolean }) {
  const [graphs, setGraphs] = useState<Graph[]>([]);
  const logger = useComponentLogger('App');

  // Only log if not on mobile/tablet
  if (!isMobileOrTablet) {
    logger.debug(`Render with ${graphs.length} graphs`);
  }

  // Create stable callback functions using useCallback
  const addGraph = useCallback((graph: { graphviz: string, engine: string }) => {
    const newGraph = {
      ...graph,
      id: `graph-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    if (!isMobileOrTablet) {
      logger.info(`Adding new graph`, {
        engine: newGraph.engine
      });
    }

    setGraphs(prev => [...prev, newGraph]);
  }, [logger, isMobileOrTablet]);

  const removeGraph = useCallback((id: string) => {
    if (!isMobileOrTablet) {
      logger.info(`Removing graph`);
    }
    setGraphs(prev => prev.filter((graph) => graph.id !== id));
  }, [logger, isMobileOrTablet]);

  const modifyGraph = useCallback((id: string, updatedGraphviz: string) => {
    if (!isMobileOrTablet) {
      logger.info(`Modifying graph`);
    }
    setGraphs(prev => prev.map(graph =>
      graph.id === id
        ? { ...graph, graphviz: updatedGraphviz }
        : graph
    ));
  }, [logger, isMobileOrTablet]);

  return (
    <div className="flex-1 flex justify-center items-center p-2 sm:p-4">
      <div className='h-[90vh] w-full sm:w-[95%] md:w-[90%] lg:w-[85%] flex flex-col justify-center items-center my-2 sm:my-4 overflow-auto sm:overflow-hidden'>
        <Card className='h-full w-full flex flex-col'>
          <CardHeader className="p-2 sm:p-4 md:p-6 shrink-0">
            <CardTitle className="text-lg sm:text-xl md:text-2xl">Graphviz</CardTitle>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 md:p-6 flex-grow overflow-auto sm:overflow-y-auto">
            <div className="h-auto min-h-full w-full flex flex-col md:flex-row justify-start gap-4">
              <div className="w-full md:w-1/3 lg:w-1/3 shrink-0">
                <FormGraph addGraph={addGraph} />
              </div>
              <div className="h-[300px] md:h-auto w-full md:w-2/3 flex flex-wrap rounded-2xl border-2 border-gray-200 overflow-auto md:overflow-y-auto md:overflow-x-hidden p-2 sm:p-4">
                {graphs.map((graph) => (
                  <MemoizedGraph
                    key={graph.id}
                    graph={graph}
                    removeGraph={() => removeGraph(graph.id)}
                    modifyGraph={(updatedGraphviz) => modifyGraph(graph.id, updatedGraphviz)}
                  />
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-2 sm:p-4 shrink-0"></CardFooter>
        </Card>
      </div>
    </div>
  );
}
