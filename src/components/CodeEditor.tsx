import React, { useState, useRef, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Textarea } from './ui/textarea';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const CodeEditor = React.forwardRef<HTMLTextAreaElement, CodeEditorProps>(
  ({ value, onChange, placeholder, className, minHeight = "200px" }, forwardedRef) => {
    const [internalValue, setInternalValue] = useState(value);
    const [lines, setLines] = useState<number[]>([]);
    const localRef = useRef<HTMLTextAreaElement>(null);

    // Create a ref that can be either the forwarded one or a local one
    const textareaRef = forwardedRef || localRef;

    // Update internal value when prop value changes
    useEffect(() => {
      setInternalValue(value);
    }, [value]);

    // Update line numbers when text changes
    useEffect(() => {
      if (internalValue) {
        const lineCount = (internalValue.match(/\n/g) || []).length + 1;
        setLines(Array.from({ length: lineCount }, (_, i) => i + 1));
      } else {
        setLines([1]);
      }
    }, [internalValue]);

    // Handle textarea scrolling to sync line numbers
    const handleScroll = () => {
      const lineNumbers = document.getElementById('line-numbers');
      if (lineNumbers && 'current' in textareaRef && textareaRef.current) {
        lineNumbers.scrollTop = textareaRef.current.scrollTop;
      }
    };

    return (
      <div className={cn("border rounded-md overflow-hidden flex", className)} style={{ minHeight }}>
        <div
          id="line-numbers"
          className="bg-muted text-muted-foreground text-right p-2 select-none overflow-hidden"
          style={{ minWidth: '3rem' }}
        >
          {lines.map(line => (
            <div key={line} className="text-sm leading-relaxed">{line}</div>
          ))}
        </div>
        <Textarea
          ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
          value={internalValue}
          onChange={(e) => {
            setInternalValue(e.target.value);
            if (onChange) {
              onChange(e.target.value);
            }
          }}
          placeholder={placeholder}
          className="flex-1 resize-none border-0 font-mono text-sm rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{ minHeight }}
          onScroll={handleScroll}
        />
      </div>
    );
  }
);

CodeEditor.displayName = 'CodeEditor';

// Add a way to access the current value from outside
export type CodeEditorRef = {
  getContent: () => string;
};

export const CodeEditorWithRef = React.forwardRef<CodeEditorRef, CodeEditorProps>(
  (props, ref) => {
    const internalRef = useRef<{ getContent: () => string }>(null);

    // Expose the getContent method
    React.useImperativeHandle(ref, () => ({
      getContent: () => {
        return internalRef.current?.getContent() || "";
      }
    }));

    return <CodeEditor {...props} ref={internalRef as any} />;
  }
);
