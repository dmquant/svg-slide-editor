'use client';

import React, { useEffect, useRef } from 'react';
import { Highlight, themes } from 'prism-react-renderer';

interface TSXCodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  readOnly?: boolean;
}

const TSXCodeEditor: React.FC<TSXCodeEditorProps> = ({
  value,
  onChange,
  language = 'tsx',
  readOnly = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLPreElement>(null);
  
  // Sync scroll positions between the textarea and syntax highlighter
  useEffect(() => {
    const textarea = textareaRef.current;
    const highlight = highlightRef.current;
    
    if (!textarea || !highlight) return;
    
    const syncScroll = () => {
      highlight.scrollTop = textarea.scrollTop;
      highlight.scrollLeft = textarea.scrollLeft;
    };
    
    textarea.addEventListener('scroll', syncScroll);
    return () => textarea.removeEventListener('scroll', syncScroll);
  }, []);

  // Handle tab key and auto-indentation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      
      // Get cursor position
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      // Add two spaces instead of tab character
      const newText = 
        value.substring(0, start) + '  ' + value.substring(end);
      
      // Update the state with the new text
      if (onChange) {
        onChange(newText);
      }
      
      // Set cursor position after the inserted tab
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start + 2;
          textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  return (
    <div className="relative w-full h-full font-mono text-sm">
      {/* Syntax highlighter overlay */}
      <Highlight
        theme={themes.vsDark}
        code={value}
        language={language as any}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            ref={highlightRef}
            className={`${className} absolute top-0 left-0 w-full h-full m-0 p-4 overflow-auto`}
            style={{
              ...style,
              backgroundColor: '#1e1e1e',
              pointerEvents: 'none',
              whiteSpace: 'pre-wrap',
              wordBreak: 'keep-all',
            }}
          >
            {tokens.map((line, i) => (
              <div 
                key={i} 
                {...getLineProps({ line, key: i })} 
                style={{ display: 'flex' }}
              >
                <span 
                  style={{ 
                    userSelect: 'none', 
                    opacity: 0.5, 
                    marginRight: '16px',
                    minWidth: '24px', 
                    textAlign: 'right' 
                  }}
                >
                  {i + 1}
                </span>
                <span>
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token, key })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>
      
      {/* Actual editable textarea */}
      <textarea
        ref={textareaRef}
        className="absolute top-0 left-0 w-full h-full m-0 p-4 bg-transparent text-transparent caret-white resize-none outline-none pl-16"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        style={{
          fontFamily: 'monospace',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          whiteSpace: 'pre-wrap',
          wordBreak: 'keep-all',
        }}
      />
    </div>
  );
};

export default TSXCodeEditor; 