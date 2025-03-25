import { useState } from 'react';
import { Graph } from '@/components/Graph'
import { FormGraph } from '@/components/GraphForm';
import { Card, CardContent } from '@/components/ui/card';

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
    <div className="h-screen w-screen flex justify-center items-center">
    <Card className="w-full m-10 overflow-hidden">
      <CardContent className="h-full flex flex-row justify-around">
        <FormGraph addGraph={addGraph} />
        <div className="h-min-full h-max-full aspect-square w-2/3 flex flex-wrap ml-6 rounded-2xl border-2 -border-r-2 border-gray-200 inset-shadow-lg">
          {graphs.map((graph, index) => (
            <Graph key={index} engine={graph.engine} graphviz={graph.graphviz} removeGraph={() => removeGraph(index)} />
          ))}
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

export default App
