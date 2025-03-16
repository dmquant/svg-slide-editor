'use client';

import { useState, useEffect, ReactNode, useMemo } from 'react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as babel from '@babel/standalone';
// Import Lucide components
import { 
  Play, Pause, Upload, Download, FileVideo, Loader,
  Camera, Video, Image, File, Mic, Speaker, Volume2, Mail,
  Send, Calendar, Clock, Search, Menu, Home, Settings,
  User, Users, Heart, Star, Bookmark, Share, Edit, Trash,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, PackageIcon
} from 'lucide-react';

// Define the return type for the hook
interface UseTSXRendererResult {
  renderedComponent: ReactNode | null;
  compileError: ReactNode | null;
  modules: Module[];
  addModule: (module: Module) => void;
  updateModule: (module: Module) => void;
  deleteModule: (name: string) => void;
  compileCode: () => void;
  isCompiling: boolean;
  lastCompileTime: number | null;
}

// Define a module interface
interface Module {
  name: string;
  code: string;
}

// Available components for use in the TSX renderer
// These will be provided to the evaluated code
const availableComponents = {
  // Basic React hooks
  useState: React.useState,
  useEffect: React.useEffect,
  useRef: React.useRef,
  
  // Lucide React Icons
  Play, Pause, Upload, Download, FileVideo, Loader,
  Camera, Video, Image, File, Mic, Speaker, Volume2, Mail,
  Send, Calendar, Clock, Search, Menu, Home, Settings,
  User, Users, Heart, Star, Bookmark, Share, Edit, Trash,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight, PackageIcon,
  
  // UI components to use in the TSX
  Button: ({ children, onClick, color = 'blue' }: { children: React.ReactNode; onClick?: () => void; color?: string }) => (
    <button 
      onClick={onClick}
      className={`px-4 py-2 bg-${color}-500 text-white rounded hover:bg-${color}-600`}
    >
      {children}
    </button>
  ),
  
  Card: ({ children, title }: { children: React.ReactNode; title?: string }) => (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md">
      {title && <h3 className="text-xl font-bold mb-4">{title}</h3>}
      {children}
    </div>
  ),
  
  Text: ({ children, size = 'md', weight = 'normal', className = '' }: { 
    children: React.ReactNode; 
    size?: 'sm' | 'md' | 'lg' | 'xl'; 
    weight?: 'normal' | 'bold';
    className?: string;
  }) => {
    const sizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl'
    };
    
    const weightClasses = {
      normal: 'font-normal',
      bold: 'font-bold'
    };
    
    return (
      <p className={`${sizeClasses[size]} ${weightClasses[weight]} ${className}`}>
        {children}
      </p>
    );
  },
  
  Flex: ({ children, direction = 'row', align = 'center', justify = 'start', gap = 2, className = '' }: 
    { 
      children: React.ReactNode; 
      direction?: 'row' | 'column'; 
      align?: string; 
      justify?: string; 
      gap?: number;
      className?: string;
    }) => (
    <div className={`flex flex-${direction} items-${align} justify-${justify} gap-${gap} ${className}`}>
      {children}
    </div>
  ),

  // Input component
  Input: ({ 
    value, 
    onChange, 
    placeholder, 
    className = '', 
    onKeyPress,
    type = 'text',
    disabled = false,
    min,
    max,
    step,
    autoFocus = false,
    name,
  }: { 
    value: string | number; 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; 
    placeholder?: string;
    className?: string;
    onKeyPress?: (e: React.KeyboardEvent) => void;
    type?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    step?: number;
    autoFocus?: boolean;
    name?: string;
  }) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      autoFocus={autoFocus}
      name={name}
      className={`border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${className}`}
    />
  )
};

/**
 * A hook that compiles and renders TSX code in a controlled environment
 */
export function useTSXRenderer(tsxCode: string): UseTSXRendererResult {
  const [renderedComponent, setRenderedComponent] = useState<ReactNode | null>(null);
  const [compileError, setCompileError] = useState<ReactNode | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [lastCompileTime, setLastCompileTime] = useState<number | null>(null);
  
  // Create a stable reference to available components
  const componentLibrary = useMemo(() => availableComponents, []);
  
  // Create the wrapper component source that will be prepended to user code
  const wrapperComponentSrc = useMemo(() => `
    // Import available components
    const { 
      // React hooks
      useState, useEffect, useRef, 
      
      // UI components
      Button, Card, Text, Flex, Input,
      
      // Lucide React icons
      Play, Pause, Upload, Download, FileVideo, Loader,
      Camera, Video, Image, File, Mic, Speaker, Volume2, Mail,
      Send, Calendar, Clock, Search, Menu, Home, Settings,
      User, Users, Heart, Star, Bookmark, Share, Edit, Trash,
      ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
      ArrowUp, ArrowDown, ArrowLeft, ArrowRight, PackageIcon
    } = componentLibrary;
    
    // Utility functions
    const classNames = (...classes) => classes.filter(Boolean).join(' ');

    // React Key Helper - use this to handle key props safely
    const withoutKeyProp = (props) => {
      if (props && typeof props === 'object' && 'key' in props) {
        // Extract key and return the rest of the props
        // This prevents the "key in props" React warning
        const { key, ...otherProps } = props;
        console.warn('React Warning: Detected "key" in props object that would be spread. Keys should be passed directly to JSX elements.');
        return { extractedKey: key, safeProps: otherProps };
      }
      return { extractedKey: undefined, safeProps: props };
    };

    // Example usage:
    // const someProps = { key: id, className: 'item' };
    // const { extractedKey, safeProps } = withoutKeyProp(someProps);
    // return <div key={extractedKey} {...safeProps}>Content</div>;
  `, []);

  // Module management functions
  const addModule = (module: Module) => {
    setModules(prev => [...prev, module]);
  };

  const updateModule = (module: Module) => {
    setModules(prev => prev.map(m => m.name === module.name ? module : m));
  };

  const deleteModule = (name: string) => {
    setModules(prev => prev.filter(m => m.name !== name));
  };

  // Add function to get module code by name
  const getModuleByName = (name: string): Module | undefined => {
    return modules.find(m => m.name === name);
  };

  // Process imports and replace with actual module code
  const processImports = (code: string): string => {
    let processedCode = code;
    
    // Fix React key props in spreads
    const fixReactKeyProps = (src: string): string => {
      // Add a warning comment at the top about key props in spreads
      const warning = `
// IMPORTANT: React Warning about 'key' props
// The 'key' prop cannot be included in props objects that are spread into JSX.
// Instead, always pass 'key' directly to JSX elements:
//   BAD:  const props = {key: id, ...otherProps}; <div {...props} />
//   GOOD: const props = {...otherProps}; <div key={id} {...props} />
//
// This renderer will attempt to detect and fix these issues automatically,
// but it's better to follow the correct pattern in your code.

`;
      
      // Look for object literals with key: value pairs (various patterns)
      // Pattern 1: const/let/var declaration followed by JSX with spread
      const propsRegex1 = /(?:const|let|var)\s+(\w+)\s*=\s*\{\s*key\s*:\s*([^,}]+)([^}]*)\};?\s*[\s\S]*?<(\w+)\s+\{\.\.\.\1\}/g;
      
      // Pattern 2: Assignment within a render function
      const propsRegex2 = /(?:let|const|var)?\s*(\w+)\s*=\s*\{\s*key\s*:\s*([^,}]+)([^}]*)\};?\s*[\s\S]*?<(\w+)\s+\{\.\.\.\1\}/g;
      
      // Apply first pattern
      let fixedSrc = src.replace(propsRegex1, (match, propsName, keyValue, restProps, element) => {
        return `// Auto-fixed key prop
const ${propsName} = {${restProps}}; // key removed from props
<${element} key={${keyValue}} {...${propsName}}`;
      });
      
      // Apply second pattern - only where not already fixed
      if (!fixedSrc.includes('// Auto-fixed key prop')) {
        fixedSrc = fixedSrc.replace(propsRegex2, (match, propsName, keyValue, restProps, element) => {
          if (match.includes('// Auto-fixed key prop')) return match; // Don't replace already fixed instances
          return `// Auto-fixed key prop
const ${propsName} = {${restProps}}; // key removed from props
<${element} key={${keyValue}} {...${propsName}}`;
        });
      }
      
      // Add extra runtime checks for key props in spreads
      fixedSrc = `
// Extra React key safety checks
const ensureKeyNotInProps = (props) => {
  if (props && 'key' in props) {
    console.warn('React Warning: Detected "key" in props object. Keys should be passed directly to JSX elements.');
    const { key, ...otherProps } = props;
    return { extractedKey: key, safeProps: otherProps };
  }
  return { extractedKey: undefined, safeProps: props };
};

${fixedSrc}`;
      
      // Return the modified source with the warning
      return warning + fixedSrc;
    };
    
    // Apply the key props fix
    processedCode = fixReactKeyProps(processedCode);
    
    // First find any component definitions
    const componentRegex = /(?:const|let|var|function)\s+([A-Z][a-zA-Z0-9_]*)\s*=.*/g;
    const componentMatches = Array.from(processedCode.matchAll(componentRegex));
    const componentNames = componentMatches.map(match => match[1]);
    
    // Find export default statements and extract component name
    const exportDefaultRegex = /export\s+default\s+([A-Z][a-zA-Z0-9_]*)\s*;?/g;
    const exportMatches = Array.from(processedCode.matchAll(exportDefaultRegex));
    
    // Handle named exports - these have priority
    if (exportMatches.length > 0) {
      // First remove all export default statements to avoid syntax errors
      processedCode = processedCode.replace(/export\s+default\s+[A-Za-z0-9_]+\s*;?/g, '');
      
      // Then add a variable at the end that points to the main component
      processedCode += `\n// Main component reference\nconst __COMPONENT_TO_RENDER = ${exportMatches[0][1]};\n`;
    }
    // If no export default but we found component definitions, use the last one
    else if (componentNames.length > 0 && !processedCode.includes('__COMPONENT_TO_RENDER')) {
      processedCode += `\n// Inferred main component\nconst __COMPONENT_TO_RENDER = ${componentNames[componentNames.length - 1]};\n`;
    }
    
    // Remove any remaining export default statements
    processedCode = processedCode.replace(/export\s+default\s+/g, '// export default replaced\n');
    
    // Handle standard imports
    processedCode = processedCode.replace(/import\s+{[\s\w,\s]+}\s+from\s+['"]lucide-react['"];?/g, '// Import handled by the renderer');
    processedCode = processedCode.replace(/import\s+[\s\w,*\s]+\s+from\s+['"]react['"];?/g, '// Import handled by the renderer');
    processedCode = processedCode.replace(/import\s+(\w+)\s+from\s+['"]react['"];?/g, '// Import handled by the renderer');
    
    // Handle custom module imports
    const importRegex = /import\s+.*\s+from\s+['"](\.\/.*|\.\.\/.*)['"]/g;
    const matches = Array.from(processedCode.matchAll(importRegex));
    
    for (const match of matches) {
      const importStatement = match[0];
      const modulePath = match[1];
      
      const module = getModuleByName(modulePath);
      if (module) {
        // Replace the import with module content
        processedCode = processedCode.replace(
          importStatement, 
          `// Module ${modulePath} injected by renderer\n${module.code}\n`
        );
      }
    }
    
    // Handle other external imports
    processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, (match) => {
      // Don't replace relative imports that we've already handled
      if (match.includes('./') || match.includes('../')) {
        // Check if we've already processed this import
        const module = modules.find(m => match.includes(m.name));
        if (module) {
          return match; // Keep the import as is, we'll handle it
        }
        return '// External module not found: ' + match;
      }
      return '// External import handled by renderer: ' + match;
    });
    
    return processedCode;
  };

  // Compilation function
  const compileCode = () => {
    if (!tsxCode.trim()) {
      setRenderedComponent(null);
      setCompileError(null);
      return;
    }

    setIsCompiling(true);
    setCompileError(null);

    // Use setTimeout to simulate a compilation delay and not block the UI
    setTimeout(() => {
      try {
        // Process the code to replace imports with module code
        let processedCode = processImports(tsxCode);
        
        // Basic syntax check
        if (processedCode.trim() === '') {
          throw new Error('Component code cannot be empty');
        }
        
        // Check for export defaults
        if (!processedCode.includes('export default')) {
          setCompileError(
            <div className="text-amber-500">
              <h3 className="font-bold">Warning:</h3>
              <p>No default export found in the component. Adding a default export is recommended.</p>
            </div>
          );
        }
        
        // Wrap the user's code with our imports
        const wrappedCode = `${wrapperComponentSrc}
          
          ${processedCode}
        `;

        // Add additional checks for common key prop issues in the code before compilation
        // Our regex approach in processImports has already handled the most common cases
        
        // Transpile the TSX to JavaScript
        let compiledCode;
        try {
          compiledCode = babel.transform(wrappedCode, {
            presets: ['react', 'typescript'],
            filename: 'component.tsx'
          }).code;

          if (!compiledCode) {
            throw new Error('Failed to compile TSX code');
          }
        } catch (babelError: unknown) {
          console.error('Babel compilation error:', babelError);
          const errorMessage = babelError instanceof Error 
            ? babelError.message 
            : String(babelError);
          throw new Error(`TSX compilation error: ${errorMessage}`);
        }

        // Create a function from the compiled code
        const ComponentFunction = new Function('React', 'componentLibrary', `
          // Store scope variables to help with debugging
          const scopeVars = {};
          
          // Wrap in try/catch to get better error messages
          try {
            ${compiledCode}
            
            // Store all variables in scope for debugging
            for (const key in this) {
              if (key !== 'scopeVars') {
                scopeVars[key] = {
                  type: typeof this[key],
                  isFunction: typeof this[key] === 'function',
                  isComponent: typeof this[key] === 'function' && /^[A-Z]/.test(key)
                };
              }
            }
            
            // Try to find the component to render
            try {
              // First check for our transformed export default
              if (typeof __COMPONENT_TO_RENDER !== 'undefined') {
                return __COMPONENT_TO_RENDER;
              }
              
              // Also check for any manually exported components
              const componentNames = ['TodoApp', 'Counter', 'App', 'Component', 'MediaPlayer', 'FileUploader'];
              for (const name of componentNames) {
                if (typeof this[name] === 'function') {
                  return this[name];
                }
              }
              
              // Next check for default exports from Babel transformation
              if (typeof default_1 !== 'undefined') return default_1;
              if (typeof _default !== 'undefined') return _default;
              
              // Check for named exports that might be components
              if (typeof exports !== 'undefined') {
                for (const key in exports) {
                  if (typeof exports[key] === 'function' && /^[A-Z]/.test(key)) {
                    return exports[key];
                  }
                }
              }
              
              // Check for variables directly assigned to component functions
              // First, check for variables that have "App" in their name
              for (const key in this) {
                if (
                  typeof this[key] === 'function' && 
                  /App$/.test(key) &&
                  key !== 'React'
                ) {
                  return this[key];
                }
              }
              
              // Then, check for any uppercase functions that could be components
              const possibleComponents = Object.entries(this)
                .filter(([key, value]) => {
                  // Filter for React components (functions that start with uppercase)
                  return typeof value === 'function' && 
                         /^[A-Z]/.test(key) && 
                         key !== 'React' && 
                         !['Button', 'Card', 'Text', 'Flex', 'Input'].includes(key) &&
                         !key.startsWith('_');
                })
                .map(([name, func]) => ({ name, func }));
                
              if (possibleComponents.length) {
                return possibleComponents[possibleComponents.length - 1].func;
              }
              
              // If still not found, try to use any function
              for (const key in this) {
                if (
                  typeof this[key] === 'function' && 
                  !key.startsWith('_') && 
                  key !== 'React'
                ) {
                  return this[key];
                }
              }
              
              // If we got here, we couldn't find a component
              throw new Error(\`No React component found. Available scope variables: \${JSON.stringify(scopeVars)}\`);
            } catch (err) {
              throw new Error('Failed to find a valid React component: ' + err.message);
            }
          } catch (outerErr) {
            console.error('Execution error:', outerErr);
            throw new Error(\`Execution error: \${outerErr.message}\`);
          }
        `);
        
        // For debugging purposes only
        if (process.env.NODE_ENV === 'development') {
          console.log('Compiled code:', compiledCode);
        }

        try {
          // Execute the function to get the component
          const Component = ComponentFunction.call({}, React, componentLibrary);
          
          if (!Component) {
            throw new Error('No component was returned');
          }
          
          // Create a wrapper to catch runtime errors
          const SafeRenderer = () => {
            try {
              // Check if Component is a valid React component
              if (!Component) {
                throw new Error('Component is undefined or null');
              }
              
              // For class components or function components
              if (typeof Component === 'function') {
                return React.createElement(Component);
              } 
              
              // For JSX elements directly (rare but possible)
              if (React.isValidElement(Component)) {
                return Component;
              }
              
              // For objects with render method (like old class component instances)
              if (Component && typeof Component === 'object' && typeof Component.render === 'function') {
                return React.createElement(Component.render);
              }
              
              // If the component is something unexpected
              throw new Error(`Invalid component type: ${typeof Component}. Component: ${JSON.stringify(Component)}`);
            } catch (runtimeError: unknown) {
              console.error('Runtime error rendering component:', runtimeError);
              
              const errorMessage = runtimeError instanceof Error 
                ? runtimeError.message 
                : String(runtimeError);
              
              const errorStack = runtimeError instanceof Error 
                ? runtimeError.stack 
                : String(runtimeError);
              
              return React.createElement('div', {
                className: 'p-4 border border-red-500 rounded bg-red-50 text-red-700'
              }, 
                React.createElement('h3', { className: 'font-bold mb-2' }, 'Runtime Error'),
                React.createElement('p', { className: 'mb-2' }, errorMessage),
                React.createElement('details', { className: 'mt-2' },
                  React.createElement('summary', { className: 'cursor-pointer font-bold' }, 'Error Details'),
                  React.createElement('pre', { className: 'text-sm whitespace-pre-wrap mt-2 p-2 bg-red-100 rounded' }, 
                    errorStack
                  )
                )
              );
            }
          };

          setRenderedComponent(
            <div className="p-4 border rounded">
              <div className="bg-gray-50 p-2 mb-4 text-sm text-gray-500 border-b">
                <strong>Rendered Component</strong> (with access to UI components and Lucide icons)
              </div>
              <SafeRenderer />
              
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 border-t pt-2">
                  <summary className="cursor-pointer text-sm text-gray-500">Debugging Info</summary>
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                    <p className="mb-1"><strong>Component Type:</strong> {typeof Component}</p>
                    <p className="mb-1">
                      <strong>Is Function:</strong> {Component && typeof Component === 'function' ? 'Yes' : 'No'}
                    </p>
                    <p className="mb-1">
                      <strong>Is Valid Element:</strong> {Component && React.isValidElement(Component) ? 'Yes' : 'No'}
                    </p>
                    <p>
                      <strong>Has Render Method:</strong> {Component && typeof Component === 'object' && typeof Component.render === 'function' ? 'Yes' : 'No'}
                    </p>
                  </div>
                </details>
              )}
            </div>
          );
          
          setCompileError(null);
          setLastCompileTime(Date.now());
        } catch (execError) {
          console.error('Execution error:', execError);
          
          setCompileError(
            <div className="text-red-500">
              <h3 className="font-bold">Execution error:</h3>
              <p>{execError instanceof Error ? execError.message : String(execError)}</p>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-bold">Debug Info</summary>
                  <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                    <pre className="whitespace-pre-wrap">
                      {execError instanceof Error ? execError.stack : 'No stack trace available'}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          );
          setRenderedComponent(null);
        }
      } catch (error) {
        console.error('TSX compilation error:', error);
        
        setCompileError(
          <div className="text-red-500">
            <h3 className="font-bold">Compilation error:</h3>
            <p>{error instanceof Error ? error.message : String(error)}</p>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-2">
                <summary className="cursor-pointer font-bold">Debug Info</summary>
                <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                  <pre className="whitespace-pre-wrap">
                    {error instanceof Error ? error.stack : 'No stack trace available'}
                  </pre>
                </div>
              </details>
            )}
          </div>
        );
        setRenderedComponent(null);
      } finally {
        setIsCompiling(false);
      }
    }, 300);  // Slight delay for better UX
  };

  // Run compilation on initial load and when code changes (if autocompile is enabled)
  useEffect(() => {
    // We don't want to auto-compile on every keystroke as it would be too intensive
    // We'll let the user trigger compilation manually through the UI
    if (modules.length > 0) {
      // If modules change, we should recompile
      compileCode();
    }
  }, [modules]); // Only recompile when modules change

  return { 
    renderedComponent, 
    compileError,
    modules,
    addModule,
    updateModule,
    deleteModule, 
    compileCode,
    isCompiling,
    lastCompileTime
  };
} 