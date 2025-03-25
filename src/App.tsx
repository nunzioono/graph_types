import { useState } from 'react';
import { Graph } from '@/components/Graph'
import { FormGraph } from '@/components/GraphForm';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

type Graph = {
  graphviz: string,
  engine: string
}

function App() {
  const [graphs, setGraphs] = useState<Graph[]>([]);

  const addGraph = (graph: { graphviz: string, engine: string }) => {
    setGraphs([...graphs, graph]);
  }

  const removeGraph = (index: number) => {
    setGraphs(graphs.filter((_: Graph, i: number) => i !== index));
  }

  return (
    <div className="h-screen w-screen flex justify-center items-center overflow-hidden">
      <div className='h-5/6 w-5/6 flex flex-col justify-center items-center my-10 overflow-hidden'>
        <Card className='h-full w-full overflow-hidden'>
          <CardHeader>
            <CardTitle>Graphviz</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-full w-full flex flex-row justify-center overflow-hidden">
              <FormGraph addGraph={addGraph} />
              <div className="h-full w-2/3 flex flex-wrap ml-6 rounded-2xl border-2 -border-r-2 border-gray-200 overflow-y-auto overflow-x-hidden">
                {graphs.map((graph, index) => (
                  <Graph key={index} engine={graph.engine} graphviz={graph.graphviz} removeGraph={() => removeGraph(index)} />
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default App
