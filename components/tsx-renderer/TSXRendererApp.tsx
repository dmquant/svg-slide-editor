'use client';

import React, { useState, useCallback } from 'react';
import { useTSXRenderer } from '@/hooks/useTSXRenderer';
import TSXCodeEditor from '@/components/tsx-renderer/TSXCodeEditor';
import ImportTSXDialog from '@/components/tsx-renderer/ImportTSXDialog';
import { Play, AlertCircle, Package, X, Plus } from 'lucide-react';

// Default example TSX code
const DEFAULT_TSX_CODE = `// You can use the following pre-defined components:
// Button, Card, Text, Flex
// And React hooks: useState, useEffect, useRef

const Counter = () => {
  const [count, setCount] = useState(0);
  
  return (
    <Card title="Counter Example">
      <Text size="xl" weight="bold">{count}</Text>
      
      <Flex gap={3} justify="center" className="mt-4">
        <Button 
          color="red" 
          onClick={() => setCount(count - 1)}
        >
          Decrease
        </Button>
        
        <Button 
          color="green" 
          onClick={() => setCount(count + 1)}
        >
          Increase
        </Button>
      </Flex>
    </Card>
  );
};

export default Counter;
`;

// Let's add more examples users can switch between
const EXAMPLES = {
  counter: DEFAULT_TSX_CODE,
  todo: `// Todo List Example
// This example shows how to properly handle React keys

const TodoApp = () => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  
  const addTodo = () => {
    if (input.trim()) {
      // Using a timestamp as a unique ID - better than array index
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };
  
  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  // Function to render a single todo item
  const renderTodoItem = (todo) => {
    // Properly use the key directly on the JSX element, not in a spread
    return (
      <div 
        key={todo.id}  
        className="flex items-center p-2 border rounded" 
        onClick={() => toggleTodo(todo.id)}
      >
        <input 
          type="checkbox" 
          checked={todo.completed} 
          readOnly 
          className="mr-2"
        />
        <Text className={todo.completed ? 'line-through' : ''}>
          {todo.text}
        </Text>
      </div>
    );
  };
  
  return (
    <Card title="Todo List">
      <Flex gap={2} className="mb-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add a todo..."
          className="flex-1"
        />
        <Button onClick={addTodo}>Add</Button>
      </Flex>
      
      {todos.length === 0 ? (
        <Text>No todos yet! Add one above.</Text>
      ) : (
        <div className="space-y-2">
          {todos.map(renderTodoItem)}
        </div>
      )}
    </Card>
  );
};

export default TodoApp;`,
  mediaPlayer: `// Media Player Example
// Uses Lucide React icons without import statements

const MediaPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  
  return (
    <Card title="Media Player">
      <div className="w-full bg-gray-200 h-2 rounded mb-4">
        <div className="bg-blue-500 h-2 rounded w-1/3"></div>
      </div>
      
      <Flex justify="center" gap={4} className="mb-6">
        {/* Lucide icons can be used directly without imports */}
        <button onClick={() => {}} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft size={24} />
        </button>
        
        <button 
          onClick={() => setIsPlaying(!isPlaying)} 
          className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        
        <button onClick={() => {}} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronRight size={24} />
        </button>
      </Flex>
      
      <Flex align="center" gap={2} className="mb-2">
        <Volume2 size={18} />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none"
        />
        <Text size="sm">{volume}%</Text>
      </Flex>
      
      <Flex justify="between" className="text-gray-500 text-sm">
        <span>1:23</span>
        <span>3:45</span>
      </Flex>
    </Card>
  );
};

export default MediaPlayer;
`,
  fileUploader: `// File Uploader Example 
// Demonstrates proper handling of keys for lists

const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    // ✅ BEST PRACTICE: Generate a unique ID for each item that needs a key
    // Using timestamp + random string to ensure uniqueness
    const newFiles = Array.from(e.dataTransfer.files).map(file => ({
      id: Date.now() + '-' + Math.random().toString(36).substring(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
    }));
    
    setFiles([...files, ...newFiles]);
  };
  
  const getFileIcon = (type) => {
    if (type.includes('image')) return <Image size={24} />;
    if (type.includes('video')) return <Video size={24} />;
    return <File size={24} />;
  };
  
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };
  
  // ✅ BEST PRACTICE: Create a function to render each item with its key
  // This ensures key is applied directly to the JSX element
  const renderFileItem = (file) => {
    // Create props object WITHOUT the key
    const flexProps = {
      className: "p-3", 
      align: "center", 
      gap: 3
    };
    
    // Apply key directly to JSX element, then spread other props
    return (
      <Flex key={file.id} {...flexProps}>
        {getFileIcon(file.type)}
        <div className="flex-1">
          <Text weight="bold">{file.name}</Text>
          <Text size="sm" className="text-gray-500">{formatSize(file.size)}</Text>
        </div>
        <Trash 
          size={18} 
          className="text-red-500 cursor-pointer"
          onClick={() => setFiles(files.filter(f => f.id !== file.id))}
        />
      </Flex>
    );
  };
  
  return (
    <Card title="File Uploader">
      <div 
        className={\`border-2 border-dashed p-8 rounded-lg text-center mb-4 \${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }\`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload size={32} className="mx-auto text-gray-400 mb-2" />
        <Text>Drag and drop files here, or</Text>
        <Button color="blue" className="mt-2">
          Select Files
        </Button>
      </div>
      
      {files.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 p-2 border-b">
            <Text weight="bold">Uploaded Files ({files.length})</Text>
          </div>
          <div className="divide-y">
            {/* ✅ Using renderFileItem instead of inline map for clarity */}
            {files.map(renderFileItem)}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FileUploader;
`,
  keyPropsExample: `// Key Props Best Practices Example
// This shows how to properly handle the 'key' prop in React

const KeyPropsExample = () => {
  const [items, setItems] = useState([
    { id: 1, name: 'Item 1', color: 'blue' },
    { id: 2, name: 'Item 2', color: 'green' },
    { id: 3, name: 'Item 3', color: 'red' }
  ]);
  
  // ✅ GOOD PATTERN: Key is passed directly to the JSX element
  const renderGoodExample = (item) => {
    // Extract props without the key
    const { color, name } = item;
    
    // Other props without key
    const props = { 
      className: \`p-2 bg-\${color}-100 border border-\${color}-500 rounded\`,
      onClick: () => alert(\`Clicked \${name}\`)
    };
    
    // CORRECT: Key is passed directly to JSX element, other props are spread
    return (
      <div key={item.id} {...props}>
        <Text>{name}</Text>
      </div>
    );
  };
  
  // ❌ BAD PATTERN: This causes the React error you see in the console
  // "A props object containing a 'key' prop is being spread into JSX"
  const renderBadExampleCode = () => {
    return (
      <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
        <code className="text-red-500">{
\`// ❌ ERROR-CAUSING PATTERN:
// This will cause the React "key prop is being spread into JSX" error
const badProps = { 
  key: item.id,  // React can't extract this special prop correctly 
  className: "some-class" 
};
<div {...badProps}>Content</div>\`
        }</code>
        
        <code className="text-green-500 block mt-4">{
\`// ✅ CORRECT PATTERN:
// Keep 'key' separate from other props
const goodProps = { className: "some-class" };
<div key={item.id} {...goodProps}>Content</div>\`
        }</code>
      </pre>
    );
  };
  
  return (
    <Card title="React Key Props Best Practices">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
        <h3 className="font-bold text-blue-800">Why React Has This Requirement</h3>
        <p className="text-blue-700">
          React uses the 'key' prop for its reconciliation algorithm to identify 
          which items have changed, been added, or removed. Because of this special 
          handling, React requires that <strong>key props must be passed directly 
          to JSX elements</strong>, not included in objects that get spread.
        </p>
      </div>
      
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
        <h3 className="font-bold text-yellow-800">The Error You'll See</h3>
        <p className="text-yellow-700">
          If you include 'key' in a props object and spread it, you'll get this error:
        </p>
        <pre className="mt-2 bg-gray-100 p-2 text-xs">
          A props object containing a "key" prop is being spread into JSX:
          let props = &#123;key: someKey, ...&#125;
          &lt;span &#123;...props&#125; /&gt;
        </pre>
      </div>
      
      <h3 className="text-lg font-bold mb-2">✅ Correct Implementation:</h3>
      <div className="space-y-2 mb-4">
        {items.map(renderGoodExample)}
      </div>
      
      <h3 className="text-lg font-bold mb-2">Code Examples:</h3>
      {renderBadExampleCode()}
    </Card>
  );
};

export default KeyPropsExample;
`
};

// Module Editor Component
const ModuleEditor = ({ module, onSave, onCancel }) => {
  const [moduleData, setModuleData] = useState(module || { name: '', code: '' });
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!moduleData.name.trim()) {
      setError("Module name cannot be empty");
      return;
    }
    
    // Validate module path format
    if (!moduleData.name.startsWith('./') && !moduleData.name.startsWith('../')) {
      setError("Module path must start with './' or '../'");
      return;
    }
    
    onSave(moduleData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-2/3 max-w-2xl overflow-hidden">
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
          <h3 className="font-medium">
            {moduleData.name ? `Edit Module: ${moduleData.name}` : 'New Module'}
          </h3>
          <button 
            className="text-gray-300 hover:text-white"
            onClick={onCancel}
          >
            <X />
          </button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-4 p-2 bg-red-100 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Path:
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="./components/MyComponent"
              value={moduleData.name}
              onChange={(e) => setModuleData({...moduleData, name: e.target.value})}
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
              value={moduleData.code}
              onChange={(e) => setModuleData({...moduleData, code: e.target.value})}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleSave}
            >
              Save Module
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TSXRendererApp: React.FC = () => {
  const [tsxCode, setTSXCode] = useState<string>(DEFAULT_TSX_CODE);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModuleEditor, setShowModuleEditor] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);

  const { 
    renderedComponent, 
    compileError, 
    modules, 
    addModule, 
    updateModule, 
    deleteModule, 
    compileCode, 
    isCompiling, 
    lastCompileTime 
  } = useTSXRenderer(tsxCode);

  // Handle file import
  const handleImportTSX = useCallback((content: string) => {
    setTSXCode(content);
    setIsImportDialogOpen(false);
  }, []);

  // Handle code changes from the editor
  const handleCodeChange = useCallback((newCode: string) => {
    setTSXCode(newCode);
    setError(null);
  }, []);

  // Module management functions
  const openModuleEditor = (module = null) => {
    setCurrentModule(module);
    setShowModuleEditor(true);
  };

  const handleSaveModule = (module) => {
    if (currentModule && currentModule.name) {
      // Update existing module
      updateModule(module);
    } else {
      // Add new module
      addModule(module);
    }
    setShowModuleEditor(false);
    setCurrentModule(null);
  };

  // Function to determine preview styles
  const getPreviewStyles = () => {
    const baseStyles = "p-4 border rounded bg-white";
    if (lastCompileTime) {
      const timeSinceRun = Date.now() - lastCompileTime;
      if (timeSinceRun < 1000) {
        return `${baseStyles} shadow-lg border-blue-500 border-2 transition-all duration-500`;
      }
    }
    return baseStyles;
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">TSX Renderer</h1>
        <div className="flex gap-2">
          <div className="dropdown relative">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition flex items-center"
              onClick={() => {
                const menu = document.getElementById('example-menu');
                if (menu) menu.classList.toggle('hidden');
              }}
            >
              Examples
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div id="example-menu" className="hidden absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10">
              <div className="p-2">
                <button 
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-100 rounded"
                  onClick={() => {
                    setTSXCode(EXAMPLES.counter);
                    document.getElementById('example-menu')?.classList.add('hidden');
                  }}
                >
                  Counter Example
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-100 rounded"
                  onClick={() => {
                    setTSXCode(EXAMPLES.todo);
                    document.getElementById('example-menu')?.classList.add('hidden');
                  }}
                >
                  Todo List Example
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-100 rounded"
                  onClick={() => {
                    setTSXCode(EXAMPLES.mediaPlayer);
                    document.getElementById('example-menu')?.classList.add('hidden');
                  }}
                >
                  Media Player Example
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-100 rounded"
                  onClick={() => {
                    setTSXCode(EXAMPLES.fileUploader);
                    document.getElementById('example-menu')?.classList.add('hidden');
                  }}
                >
                  File Uploader Example
                </button>
                <button 
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-purple-100 rounded"
                  onClick={() => {
                    setTSXCode(EXAMPLES.keyPropsExample);
                    document.getElementById('example-menu')?.classList.add('hidden');
                  }}
                >
                  Key Props Example
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsImportDialogOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Import TSX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Code Editor */}
        <div className="border rounded-md shadow-sm flex flex-col">
          <div className="bg-gray-800 p-3 border-b flex justify-between items-center">
            <h2 className="font-semibold text-white">TSX Code</h2>
            <button 
              className="flex items-center bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm"
              onClick={compileCode}
              disabled={isCompiling}
            >
              <Play className="w-4 h-4 mr-1" />
              {isCompiling ? 'Compiling...' : 'Run'}
            </button>
          </div>
          <div className="flex-grow p-0 h-[400px]">
            <TSXCodeEditor 
              value={tsxCode} 
              onChange={handleCodeChange} 
              language="tsx"
            />
          </div>
          
          {/* Module Manager */}
          <div className="bg-gray-700 border-t border-gray-600 p-2">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white text-sm font-medium">Import Modules</h3>
              <button 
                className="flex items-center bg-blue-500 hover:bg-blue-600 px-2 py-1 rounded text-xs text-white"
                onClick={() => openModuleEditor()}
              >
                <Plus className="w-3 h-3 mr-1" />
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
                    <Package className="w-3 h-3 mr-1" />
                    <span className="font-mono">{module.name}</span>
                  </div>
                  <div className="flex space-x-1">
                    <button 
                      className="text-blue-400 hover:text-blue-300 px-1"
                      onClick={() => openModuleEditor(module)}
                    >
                      Edit
                    </button>
                    <button 
                      className="text-red-400 hover:text-red-300 px-1"
                      onClick={() => deleteModule(module.name)}
                    >
                      <X className="w-3 h-3" />
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

        {/* Rendered Output */}
        <div className="border rounded-md shadow-sm">
          <div className="bg-gray-100 p-3 border-b flex justify-between items-center">
            <h2 className="font-semibold">Rendered Component</h2>
            <div className="text-xs text-gray-500">
              {lastCompileTime ? 'Last run: ' + new Date(lastCompileTime).toLocaleTimeString() : 'Not compiled yet'}
            </div>
          </div>
          <div className="p-4 h-[500px] overflow-auto">
            {compileError ? (
              <div className="compilation-error">
                {typeof compileError === 'string' ? (
                  <div className="text-red-500 whitespace-pre-wrap">
                    <h3 className="font-bold mb-2">Compilation Error:</h3>
                    <code>{compileError}</code>
                  </div>
                ) : (
                  compileError
                )}
              </div>
            ) : error ? (
              <div className="text-red-500 whitespace-pre-wrap">
                <h3 className="font-bold mb-2">Runtime Error:</h3>
                <code>{error}</code>
              </div>
            ) : renderedComponent ? (
              <div className={getPreviewStyles()}>
                <ErrorBoundary onError={(e) => setError(e.message)}>
                  {renderedComponent}
                </ErrorBoundary>
              </div>
            ) : (
              <div className="text-center text-gray-500 p-4">
                <div className="mb-2">Click "Run" to compile and preview your component</div>
                <div className="w-10 h-10 mx-auto text-gray-400">
                  <Play className="mx-auto" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import Dialog */}
      {isImportDialogOpen && (
        <ImportTSXDialog 
          onClose={() => setIsImportDialogOpen(false)}
          onImport={handleImportTSX}
        />
      )}

      {/* Module Editor */}
      {showModuleEditor && (
        <ModuleEditor
          module={currentModule}
          onSave={handleSaveModule}
          onCancel={() => {
            setShowModuleEditor(false);
            setCurrentModule(null);
          }}
        />
      )}
    </div>
  );
};

// Error Boundary Component to catch runtime errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Error is handled in parent component
    }
    return this.props.children;
  }
}

export default TSXRendererApp; 