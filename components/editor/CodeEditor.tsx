'use client';

import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useSvgGenerator } from '@/hooks/useSvgGenerator';
import { useSvgParser } from '@/hooks/useSvgParser';
import { SVGElement } from '@/types/editor';

interface CodeEditorProps {
  elements: SVGElement[];
  onCodeChange: (updatedElements: SVGElement[]) => void;
  id?: string;
}

const CodeEditor = forwardRef<HTMLDivElement, CodeEditorProps>(({ 
  elements, 
  onCodeChange,
  id 
}, ref) => {
  const { generateSvgCode } = useSvgGenerator();
  const { parseSvgCode } = useSvgParser();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(true);

  // Generate SVG code when elements change
  useEffect(() => {
    const generatedCode = generateSvgCode(elements);
    setCode(generatedCode);
    setIsValid(true);
  }, [elements, generateSvgCode]);

  // Handle code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    try {
      // Parse the code and update elements if valid
      const parsedElements = parseSvgCode(newCode);
      setError(null);
      setIsValid(true);
    } catch (err) {
      // Don't update elements if there's an error
      setError((err as Error).message);
      setIsValid(false);
    }
  };

  // Validate code
  const validateCode = () => {
    try {
      parseSvgCode(code);
      setError(null);
      setIsValid(true);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setIsValid(false);
      return false;
    }
  };

  // Copy code to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
  };

  // Apply changes
  const applyChanges = () => {
    if (validateCode()) {
      try {
        const parsedElements = parseSvgCode(code);
        onCodeChange(parsedElements);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  // Expose methods via ref and attach to DOM element
  useEffect(() => {
    if (id) {
      const element = document.getElementById(id);
      if (element) {
        (element as any).applyChanges = applyChanges;
        (element as any).validateCode = validateCode;
        (element as any).copyToClipboard = copyToClipboard;
      }
    }
  }, [id, code]);

  return (
    <div className="flex flex-col h-full" id={id}>
      <textarea
        value={code}
        onChange={handleCodeChange}
        className="font-mono text-sm p-4 w-full h-full resize-none focus:outline-none border-0"
        spellCheck={false}
      />
    </div>
  );
});

// Add display name for debugging
CodeEditor.displayName = 'CodeEditor';

export default CodeEditor; 