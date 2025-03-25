import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from '@/components/ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const formSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  engine: z.enum(["dot", "neato", "twopi", "circo", "fdp", "sfdp", "patchwork", "osage"]),
  graphviz: z.string().min(2, {
    message: "Graphviz must be at least 2 characters.",
  }),
})

export function FormGraph(props: { addGraph: (graph: { graphviz: string, engine: string }) => void }) {
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      graphviz: "digraph G { a -> b; b -> c; c -> d; d -> a; }",
      engine: "circo",
    },
  })

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    props.addGraph({ graphviz: values.graphviz, engine: values.engine })
  }

  return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormLabel>Add new graph</FormLabel>
            <FormField
              control={form.control}
              name="title"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Graph title" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the title of the graph.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Graph description" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the description of the graph.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="engine"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Engine</FormLabel>
                    <FormControl>
                      <FormItem>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a graph engine" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dot">Dot</SelectItem>
                            <SelectItem value="neato">Neato</SelectItem>
                            <SelectItem value="twopi">Twopi</SelectItem>
                            <SelectItem value="circo">Circo</SelectItem>
                            <SelectItem value="fdp">Fdp</SelectItem>
                            <SelectItem value="sfdp">Sfdp</SelectItem>
                            <SelectItem value="patchwork">Patchwork</SelectItem>
                            <SelectItem value="osage">Osage</SelectItem>
                          </SelectContent>
                        </Select>
                    </FormItem>
                </FormControl>
                <FormDescription>
                  This will be the engine used to render the graph.
                </FormDescription>
                <FormMessage />
              </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="graphviz"
              render={({ field }: { field: any }) => (
                <FormItem>
                  <FormLabel>Graphviz</FormLabel>
                  <FormControl>
                    <Textarea placeholder="digraph G { a -> b; }" {...field} />
                  </FormControl>
                  <FormDescription>
                    This will be the graphviz code for the graph.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
  );
}
