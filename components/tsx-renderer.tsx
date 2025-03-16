import React, { useState } from 'react';

// Simple icon components to replace lucide-react
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polygon points="10 8 16 12 10 16 10 8"></polygon>
  </svg>
);

const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const PackageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

// This is a simplified TSX renderer that simulates a development environment
const TSXRenderer = () => {
  const [code, setCode] = useState(`// Edit your TSX component here
import React, { useState } from 'react';

const DemoComponent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center">
      <h2 className="text-xl font-bold text-gray-800 mb-2">TSX Demo Component</h2>
      <p className="text-gray-600 mb-4">Count: {count}</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => setCount(count + 1)}
      >
        Increment
      </button>
    </div>
  );
};

export default DemoComponent;`);
  
  // Component state
  const [output, setOutput] = useState(null);
  const [error, setError] = useState(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [count, setCount] = useState(0);
  const [modules, setModules] = useState([]);
  const [showModuleEditor, setShowModuleEditor] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [hasRun, setHasRun] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);

  // This function simulates the compilation process
  const compileCode = () => {
    setIsCompiling(true);
    setError(null);
    setOutput(null);
    
    // Simulate compilation delay
    setTimeout(() => {
      try {
        // Basic syntax check
        if (code.trim() === '') {
          throw new Error('Component code cannot be empty');
        }
        
        // Check for import statements and verify they exist in our module system
        const importRegex = /import\s+.*\s+from\s+['"](.*)['"]/g;
        const matches = Array.from(code.matchAll(importRegex));
        const imports = matches.map(match => match[1])
          .filter(imp => !imp.startsWith('react')); // Ignore React imports
        
        // Only check for imports if we have actual modules defined
        if (imports.length > 0 && modules.length > 0) {
          // Check if all imports are defined
          const missingImports = imports.filter(imp => 
            !modules.some(mod => mod.name === imp)
          );
          
          if (missingImports.length > 0) {
            throw new Error(`Missing modules: ${missingImports.join(', ')}`);
          }
        }
        
        // In a real implementation, this would use a proper TypeScript/Babel compiler
        // For demo purposes, we're just checking for some common errors
        if (!code.includes('export default')) {
          throw new Error('Component must have a default export');
        }
        
        if (!code.includes('return')) {
          throw new Error('Component must return JSX');
        }
        
        // Reset count to show the component "refreshed"
        setCount(0);
        
        // Simulate successful compilation
        setOutput("Compilation successful at " + new Date().toLocaleTimeString());
        setHasRun(true);
        setLastRunTime(Date.now());
        setIsCompiling(false);
      } catch (err) {
        setError(err.message);
        setOutput(null);
        setIsCompiling(false);
      }
    }, 500);
  };
  
  // Module management functions
  const addNewModule = () => {
    setCurrentModule({
      name: '',
      code: '// New module code here'
    });
    setShowModuleEditor(true);
  };
  
  const editModule = (moduleName) => {
    const module = modules.find(m => m.name === moduleName);
    if (module) {
      setCurrentModule({...module});
      setShowModuleEditor(true);
    }
  };
  
  const saveModule = () => {
    if (!currentModule.name.trim()) {
      setError("Module name cannot be empty");
      return;
    }
    
    // Validate module path format
    if (!currentModule.name.startsWith('./') && !currentModule.name.startsWith('../')) {
      setError("Module path must start with './' or '../'");
      return;
    }
    
    setModules(prev => {
      const existingIndex = prev.findIndex(m => m.name === currentModule.name);
      if (existingIndex >= 0) {
        // Update existing module
        const updated = [...prev];
        updated[existingIndex] = {...currentModule};
        return updated;
      } else {
        // Add new module
        return [...prev, {...currentModule}];
      }
    });
    
    // Clear any errors that might have been shown
    setError(null);
    setShowModuleEditor(false);
    setCurrentModule(null);
  };
  
  const deleteModule = (moduleName) => {
    setModules(prev => prev.filter(m => m.name !== moduleName));
  };

  // Function to determine what styling to use for the preview container
  const getPreviewStyles = () => {
    const baseStyles = "border border-gray-300 rounded p-2 bg-white";
    if (lastRunTime) {
      const timeSinceRun = Date.now() - lastRunTime;
      if (timeSinceRun < 1000) {
        return `${baseStyles} shadow-lg border-blue-500 border-2 transition-all duration-500`;
      }
    }
    return baseStyles;
  };
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-gray-800 text-white p-4">
        <h1 className="text-xl font-bold">TSX Live Renderer</h1>
      </header>
      
      <main className="flex flex-1 overflow-hidden">
        {/* Code Editor Panel */}
        <div className="w-1/2 flex flex-col border-r border-gray-300">
          <div className="p-2 bg-gray-700 text-white flex justify-between items-center">
            <span>Component Editor</span>
            <button 
              className="flex items-center bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
              onClick={compileCode}
            >
              <span className="mr-1"><PlayIcon /></span>
              Run
            </button>
          </div>
          <textarea
            className="flex-1 p-4 font-mono text-sm bg-gray-800 text-gray-200 resize-none outline-none"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          
          {/* Module Manager */}
          <div className="bg-gray-700 border-t border-gray-600 p-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white text-sm font-medium">Import Modules</h3>
              <button 
                className="flex items-center bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs text-white"
                onClick={addNewModule}
              >
                <span className="mr-1"><PlusIcon /></span>
                Add Module
              </button>
            </div>
            
            <div className="max-h-32 overflow-y-auto">
              {modules.map((module) => (
                <div 
                  key={module.name} 
                  className="flex items-center justify-between bg-gray-800 mb-1 p-1 rounded text-gray-200 text-xs"
                >
                  <div className="flex items-center">
                    <span className="mr-1"><PackageIcon /></span>
                    <span className="font-mono">{module.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      className="text-blue-400 hover:text-blue-300 px-1"
                      onClick={() => editModule(module.name)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-400 hover:text-red-300 px-1"
                      onClick={() => deleteModule(module.name)}
                    >
                      <XIcon />
                    </button>
                  </div>
                </div>
              ))}
              {modules.length === 0 && (
                <div className="text-gray-400 text-xs italic p-1">
                  No modules defined. Add a module to import it.
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Preview Panel */}
        <div className="w-1/2 flex flex-col">
          <div className="p-2 bg-gray-200 border-b border-gray-300 flex justify-between items-center">
            <span className="font-medium">Component Preview</span>
            <div className="text-xs text-gray-500">
              {hasRun ? 'Last run: ' + new Date(lastRunTime).toLocaleTimeString() : 'Not run yet'}
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto bg-gray-50">
            {error ? (
              <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
                <div className="flex items-center mb-2">
                  <span className="mr-2"><AlertIcon /></span>
                  <span className="font-bold">Compilation Error</span>
                </div>
                <code className="block whitespace-pre-wrap">{error}</code>
              </div>
            ) : isCompiling ? (
              <div className="text-center p-4">
                <div className="inline-block bg-blue-100 text-blue-800 rounded-full px-3 py-1">
                  Compiling...
                </div>
              </div>
            ) : output ? (
              <div className="mb-4">
                <div className="p-2 bg-green-100 text-green-800 rounded mb-4">
                  {output}
                </div>
                <div className={getPreviewStyles()}>
                  <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md flex flex-col items-center">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">TSX Demo Component</h2>
                    <p className="text-gray-600 mb-4">Count: {count}</p>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      onClick={() => setCount(count + 1)}
                    >
                      Increment
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 p-4">
                <div className="mb-2">Click "Run" to compile and preview your component</div>
                <div className="w-10 h-10 mx-auto text-gray-400">
                  <PlayIcon />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-200 p-2 text-center text-gray-600 text-sm">
        TSX Renderer - Development Environment
      </footer>
      
      {/* Module Editor Modal */}
      {showModuleEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-2/3 max-w-2xl overflow-hidden">
            <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
              <h3 className="font-medium">
                {currentModule.name ? `Edit Module: ${currentModule.name}` : 'New Module'}
              </h3>
              <button 
                className="text-gray-300 hover:text-white"
                onClick={() => setShowModuleEditor(false)}
              >
                <XIcon />
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Path:
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="./components/MyComponent"
                  value={currentModule?.name || ''}
                  onChange={(e) => setCurrentModule({...currentModule, name: e.target.value})}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use relative paths like './components/MyComponent' or './utils/helpers'
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Module Code:
                </label>
                <textarea
                  className="w-full h-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm font-mono text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={currentModule?.code || ''}
                  onChange={(e) => setCurrentModule({...currentModule, code: e.target.value})}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  onClick={() => setShowModuleEditor(false)}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={saveModule}
                >
                  Save Module
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TSXRenderer;