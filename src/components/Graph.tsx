import { instance } from '@viz-js/viz'
import { ChangeEvent, useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
import { Pencil, Save, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type SvgProps = {
  graphviz: string,
  engine: string
}

const Svg: React.FC<SvgProps> = ({ graphviz, engine }) => {
  const [svg, setSvg] = useState<SVGSVGElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    instance()
      .then(viz => {
        try {
          const renderedSvg = viz.renderSVGElement(graphviz, { engine });
          setSvg(renderedSvg);
        } catch (err) {
          console.log(err);
          setError("Error rendering SVG");
        }
      })
      .catch(() => {
        setError("Error initializing Viz.js");
      });
  }, [graphviz]);

  return error || !svg || !svg.outerHTML ? <p>error</p>:<div dangerouslySetInnerHTML={{ __html: svg.outerHTML  }} />
}

type GraphProps = {
  title?: string,
  description?: string,
  engine?: string,
  graphviz: string,
  removeGraph: () => void
}

export const Graph: React.FC<GraphProps> = ({ title = "Default Title", description = "Default Description", engine = "dot", graphviz, removeGraph }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [graphvizState, setGraphvizState] = useState(graphviz);

  const handleEdit = () => {;
    setIsEditing(true);
  }

  const handleSave = () => {
    setIsEditing(false);
  }

  return (
    <div className="flex flex-col">
        <div className="relative flex justify-between hover:opacity-70 opacity-0 transition-opacity duration-300">
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
        <div className="flex flex-col justify-around">
          <div className="flex flex-col">
          <b>{title}</b>
          <h2>{description}</h2>
          </div>
          {isEditing && (
            <Textarea value={graphvizState} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setGraphvizState(e.target.value)} />
          )}
        </div>
      </div>
      <Svg graphviz={graphviz} engine={engine} />
    </div>
  );
}
