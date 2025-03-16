import React, { useState, useEffect, useRef } from 'react';
import { File, Trash2, PlusCircle, Edit, Eye, Play, Share2 } from 'lucide-react';

// Code block processor - extracts JS code blocks for execution
const extractJsCodeBlocks = (markdown) => {
  if (!markdown) return [];
  
  const regex = /```(?:javascript|js)([\s\S]*?)```/g;
  const codeBlocks = [];
  let match;
  
  while ((match = regex.exec(markdown)) !== null) {
    codeBlocks.push({
      code: match[1].trim(),
      fullMatch: match[0],
      index: match.index
    });
  }
  
  return codeBlocks;
};

// Syntax highlighter for code
const highlightCode = (code, language) => {
  // Simple syntax highlighting for JavaScript
  if (language === 'js' || language === 'javascript') {
    return code
      // Keywords
      .replace(/\b(const|let|var|function|return|if|else|for|while|class|import|export|from|await|async|try|catch|throw|new|this)\b/g, '<span class="text-purple-600">$1</span>')
      // Strings
      .replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="text-green-600">$&</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-blue-600">$1</span>')
      // Comments
      .replace(/(\/\/.*)/g, '<span class="text-gray-500">$1</span>')
      // Function calls
      .replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)\(/g, '<span class="text-yellow-600">$1</span>(');
  }
  
  return code;
};

// Simple markdown renderer
const renderMarkdown = (markdown) => {
  if (!markdown) return '';
  
  // Extract JS code blocks for special handling
  const jsCodeBlocks = extractJsCodeBlocks(markdown);
  
  // Process regular markdown with placeholders for JS blocks
  let processedMarkdown = markdown;
  let jsBlockPlaceholders = [];
  
  jsCodeBlocks.forEach((block, index) => {
    const placeholder = `__JS_CODE_BLOCK_${index}__`;
    jsBlockPlaceholders.push(placeholder);
    processedMarkdown = processedMarkdown.replace(block.fullMatch, placeholder);
  });
  
  let html = processedMarkdown
    // Headers
    .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold my-4">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold my-3">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold my-2">$1</h3>')
    
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // Lists
    .replace(/^\- (.*)$/gm, '<ul class="list-disc pl-5 my-2"><li>$1</li></ul>')
    .replace(/<\/ul>\n<ul class="list-disc pl-5 my-2">/g, '')
    
    // Checkboxes
    .replace(/- \[ \] (.*$)/gm, '<div class="flex items-center my-1"><input type="checkbox" class="mr-2"> <span>$1</span></div>')
    .replace(/- \[x\] (.*$)/gm, '<div class="flex items-center my-1"><input type="checkbox" class="mr-2" checked> <span>$1</span></div>')
    
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 hover:underline">$1</a>')
    
    // Regular code blocks (non-JS)
    .replace(/```([a-z]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      // Skip if it's a JS code block placeholder
      if (jsBlockPlaceholders.includes(match)) return match;
      
      const highlightedCode = lang ? highlightCode(code, lang) : code;
      return `<pre class="bg-gray-100 p-2 rounded my-2 overflow-x-auto"><code class="language-${lang || 'text'}">${highlightedCode}</code></pre>`;
    })
    
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 rounded">$1</code>')
    
    // Paragraphs
    .replace(/^(?!<[a-z]).+/gm, '<p class="my-2">$&</p>');
  
  // Replace JS code block placeholders with interactive components
  jsCodeBlocks.forEach((block, index) => {
    const placeholder = `__JS_CODE_BLOCK_${index}__`;
    const highlightedCode = highlightCode(block.code, 'js');
    const jsBlockHtml = `
      <div class="js-code-block my-4 border rounded overflow-hidden">
        <div class="bg-gray-200 px-3 py-1 flex justify-between items-center">
          <div class="font-mono text-sm">JavaScript</div>
          <div class="flex">
            <button class="js-run-btn p-1 text-green-600 hover:text-green-800" data-code-index="${index}">
              <span class="flex items-center"><svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>Run</span>
            </button>
            <button class="js-copy-btn p-1 text-blue-600 hover:text-blue-800 ml-2" data-code-index="${index}">
              <span class="flex items-center"><svg class="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>Copy</span>
            </button>
          </div>
        </div>
        <pre class="bg-gray-100 p-3 m-0 overflow-x-auto"><code class="language-javascript">${highlightedCode}</code></pre>
        <div class="js-output bg-black text-green-400 p-3 font-mono text-sm" style="display: none;" data-output-index="${index}"></div>
      </div>
    `;
    html = html.replace(placeholder, jsBlockHtml);
  });
  
  return html;
};

const MarkdownEditorApp = () => {
  // State
  const [files, setFiles] = useState([
    { id: 1, name: 'README.md', content: '# README\n\nThis is a sample markdown file.\n\n## Features\n\n- Edit markdown\n- Preview rendered output\n- Manage multiple files\n- Interactive JavaScript code blocks' },
    { id: 2, name: 'notes.md', content: '# My Notes\n\n- First item\n- Second item\n\n## Code Example\n\n```js\nconst hello = () => {\n  console.log("Hello world!");\n  return "Hello from the JavaScript executor!";\n};\n\n// Call the function\nconst result = hello();\nconsole.log("Function returned:", result);\n```' },
    { id: 3, name: 'todo.md', content: '# TODO List\n\n- [ ] First task\n- [x] Completed task\n- [ ] Another task\n\n## Links\n\n[Google](https://google.com)' },
    { id: 4, name: 'javascript.md', content: '# JavaScript Examples\n\n## Basic Example\n\n```javascript\n// Simple counter\nlet count = 0;\nfor (let i = 0; i < 5; i++) {\n  count += i;\n  console.log(`Count: ${count}`);\n}\nconsole.log("Final count:", count);\n```\n\n## DOM Manipulation Example\n\n```javascript\n// Create a virtual element (in a real environment this would modify the DOM)\nconst div = document.createElement("div");\ndiv.textContent = "Hello DOM!";\nconsole.log("Created element:", div.outerHTML);\n\n// Simulate event handling\nfunction handleClick() {\n  console.log("Button clicked!");\n  return "Action performed";\n}\n\nconsole.log("Result:", handleClick());\n```\n\n## Error Handling\n\n```javascript\ntry {\n  // This will cause an error\n  const obj = null;\n  console.log(obj.property);\n} catch (error) {\n  console.error("Caught an error:", error.message);\n}\n\nconsole.log("Script continues after error handling");\n```' }
  ]);
  const [selectedFileId, setSelectedFileId] = useState(1);
  const [editContent, setEditContent] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Refs
  const textareaRef = useRef(null);

  // Find the selected file
  const selectedFile = files.find(file => file.id === selectedFileId) || files[0];

  // Initialize editor content when selected file changes
  useEffect(() => {
    if (selectedFile) {
      setEditContent(selectedFile.content);
    }
  }, [selectedFileId, selectedFile]);

  // Save content to the selected file
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setEditContent(newContent);
    
    // Update the file content in the files array
    setFiles(files.map(file => 
      file.id === selectedFileId ? { ...file, content: newContent } : file
    ));
  };

  // Add a new file
  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    
    const fileName = newFileName.trim().endsWith('.md') 
      ? newFileName.trim() 
      : `${newFileName.trim()}.md`;
      
    const newFile = {
      id: Date.now(),
      name: fileName,
      content: `# ${newFileName.trim()}\n\nStart writing here...`
    };
    
    setFiles([...files, newFile]);
    setSelectedFileId(newFile.id);
    setNewFileName('');
    setShowNewFileModal(false);
  };

  // Delete a file
  const handleDeleteFile = (fileId) => {
    if (files.length <= 1) {
      return; // Don't allow deleting the last file
    }
    
    const newFiles = files.filter(file => file.id !== fileId);
    setFiles(newFiles);
    
    // If the deleted file was selected, select the first file
    if (selectedFileId === fileId) {
      setSelectedFileId(newFiles[0].id);
    }
    
    setShowDeleteConfirm(null);
  };

  // Insert markdown formatting
  const insertMarkdown = (format) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = editContent.substring(start, end);
    
    let newText = editContent;
    
    switch (format) {
      case 'bold':
        newText = editContent.substring(0, start) + `**${selectedText}**` + editContent.substring(end);
        break;
      case 'italic':
        newText = editContent.substring(0, start) + `*${selectedText}*` + editContent.substring(end);
        break;
      case 'link':
        newText = editContent.substring(0, start) + `[${selectedText || 'link text'}](url)` + editContent.substring(end);
        break;
      case 'list':
        newText = editContent.substring(0, start) + `- ${selectedText}` + editContent.substring(end);
        break;
      case 'code':
        newText = editContent.substring(0, start) + '`' + selectedText + '`' + editContent.substring(end);
        break;
      case 'h1':
        newText = editContent.substring(0, start) + `# ${selectedText}` + editContent.substring(end);
        break;
      case 'h2':
        newText = editContent.substring(0, start) + `## ${selectedText}` + editContent.substring(end);
        break;
      case 'h3':
        newText = editContent.substring(0, start) + `### ${selectedText}` + editContent.substring(end);
        break;
      default:
        break;
    }
    
    setEditContent(newText);
    
    // Update the file content
    setFiles(files.map(file => 
      file.id === selectedFileId ? { ...file, content: newText } : file
    ));
    
    // Focus back on textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = format === 'link' && !selectedText 
        ? start + 1 // Position cursor after opening bracket
        : start + newText.length - editContent.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b': // Bold
          e.preventDefault();
          insertMarkdown('bold');
          break;
        case 'i': // Italic
          e.preventDefault();
          insertMarkdown('italic');
          break;
        case 'k': // Link
          e.preventDefault();
          insertMarkdown('link');
          break;
        case '1': // H1
          e.preventDefault();
          insertMarkdown('h1');
          break;
        case '2': // H2
          e.preventDefault();
          insertMarkdown('h2');
          break;
        case '3': // H3
          e.preventDefault();
          insertMarkdown('h3');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white p-4 flex flex-col">
        <h2 className="text-xl font-bold mb-4">Files</h2>
        <div className="flex-grow overflow-auto">
          <ul>
            {files.map(file => (
              <li 
                key={file.id} 
                className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${selectedFileId === file.id ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
                onClick={() => setSelectedFileId(file.id)}
              >
                <div className="flex items-center">
                  <File size={18} className="mr-2" />
                  {file.name}
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(file.id);
                  }}
                  className="text-gray-400 hover:text-red-500"
                  disabled={files.length <= 1}
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        </div>
        <button 
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center justify-center"
          onClick={() => setShowNewFileModal(true)}
        >
          <PlusCircle size={18} className="mr-2" />
          Add File
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col">
        {/* Toolbar */}
        <div className="bg-gray-200 p-2 flex items-center">
          <div className="font-medium">{selectedFile?.name}</div>
          <div className="ml-auto">
            <button 
              className={`py-1 px-3 rounded mr-2 ${!previewMode ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setPreviewMode(false)}
            >
              <Edit size={16} className="inline mr-1" /> Edit
            </button>
            <button 
              className={`py-1 px-3 rounded ${previewMode ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
              onClick={() => setPreviewMode(true)}
            >
              <Eye size={16} className="inline mr-1" /> Preview
            </button>
          </div>
        </div>

        {/* Editor Toolbar (visible only in edit mode) */}
        {!previewMode && (
          <div className="bg-gray-100 border-b p-2 flex flex-wrap">
            <button onClick={() => insertMarkdown('h1')} className="p-1 mr-1 hover:bg-gray-200 rounded" title="Heading 1">H1</button>
            <button onClick={() => insertMarkdown('h2')} className="p-1 mr-1 hover:bg-gray-200 rounded" title="Heading 2">H2</button>
            <button onClick={() => insertMarkdown('h3')} className="p-1 mr-1 hover:bg-gray-200 rounded" title="Heading 3">H3</button>
            <button onClick={() => insertMarkdown('bold')} className="p-1 mr-1 hover:bg-gray-200 rounded font-bold" title="Bold (Ctrl+B)">B</button>
            <button onClick={() => insertMarkdown('italic')} className="p-1 mr-1 hover:bg-gray-200 rounded italic" title="Italic (Ctrl+I)">I</button>
            <button onClick={() => insertMarkdown('link')} className="p-1 mr-1 hover:bg-gray-200 rounded text-blue-500 underline" title="Link (Ctrl+K)">Link</button>
            <button onClick={() => insertMarkdown('list')} className="p-1 mr-1 hover:bg-gray-200 rounded" title="List Item">• List</button>
            <button onClick={() => insertMarkdown('code')} className="p-1 mr-1 hover:bg-gray-200 rounded font-mono" title="Code">Code</button>
            <button 
              onClick={() => {
                const codeBlock = "```javascript\n// Your code here\nconsole.log('Hello world!');\n```";
                const textarea = textareaRef.current;
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const newText = editContent.substring(0, start) + codeBlock + editContent.substring(end);
                setEditContent(newText);
                setFiles(files.map(file => 
                  file.id === selectedFileId ? { ...file, content: newText } : file
                ));
                // Focus and position cursor
                setTimeout(() => {
                  textarea.focus();
                  const newPos = start + codeBlock.indexOf("// Your code here");
                  textarea.setSelectionRange(newPos, newPos + "// Your code here".length);
                }, 0);
              }} 
              className="p-1 mr-1 hover:bg-gray-200 rounded bg-yellow-100" 
              title="Insert JS Code Block"
            >
              <span className="flex items-center text-xs">
                <Play size={14} className="mr-1" />JS Code
              </span>
            </button>
          </div>
        )}

        {/* Editor/Preview Area */}
        <div className="flex-grow p-4 overflow-auto">
          {previewMode ? (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(editContent) }}
              ref={el => {
                // Add event listeners for JS code blocks after rendering
                if (el) {
                  // Add event listeners for run buttons
                  const runButtons = el.querySelectorAll('.js-run-btn');
                  runButtons.forEach(button => {
                    button.addEventListener('click', () => {
                      const codeIndex = button.getAttribute('data-code-index');
                      const jsCodeBlocks = extractJsCodeBlocks(editContent);
                      const codeToRun = jsCodeBlocks[codeIndex]?.code;
                      
                      if (codeToRun) {
                        const outputEl = el.querySelector(`.js-output[data-output-index="${codeIndex}"]`);
                        if (outputEl) {
                          // Clear previous output
                          outputEl.innerHTML = '';
                          outputEl.style.display = 'block';
                          
                          // Capture console.log output
                          const originalConsoleLog = console.log;
                          const originalConsoleError = console.error;
                          const originalConsoleWarn = console.warn;
                          
                          // Override console methods to capture output
                          console.log = (...args) => {
                            originalConsoleLog(...args);
                            outputEl.innerHTML += `<div>> ${args.map(arg => 
                              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                            ).join(' ')}</div>`;
                          };
                          
                          console.error = (...args) => {
                            originalConsoleError(...args);
                            outputEl.innerHTML += `<div class="text-red-500">> Error: ${args.map(arg => 
                              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                            ).join(' ')}</div>`;
                          };
                          
                          console.warn = (...args) => {
                            originalConsoleWarn(...args);
                            outputEl.innerHTML += `<div class="text-yellow-500">> Warning: ${args.map(arg => 
                              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                            ).join(' ')}</div>`;
                          };
                          
                          try {
                            // Execute the code
                            const result = new Function(codeToRun)();
                            
                            // If the code returns a value, display it
                            if (result !== undefined) {
                              outputEl.innerHTML += `<div class="mt-2 pt-2 border-t border-gray-700">> Result: ${
                                typeof result === 'object' ? JSON.stringify(result) : String(result)
                              }</div>`;
                            }
                          } catch (error) {
                            outputEl.innerHTML += `<div class="text-red-500">> Runtime Error: ${error.message}</div>`;
                          } finally {
                            // Restore original console methods
                            console.log = originalConsoleLog;
                            console.error = originalConsoleError;
                            console.warn = originalConsoleWarn;
                          }
                        }
                      }
                    });
                  });
                  
                  // Add event listeners for copy buttons
                  const copyButtons = el.querySelectorAll('.js-copy-btn');
                  copyButtons.forEach(button => {
                    button.addEventListener('click', () => {
                      const codeIndex = button.getAttribute('data-code-index');
                      const jsCodeBlocks = extractJsCodeBlocks(editContent);
                      const codeToCopy = jsCodeBlocks[codeIndex]?.code;
                      
                      if (codeToCopy) {
                        navigator.clipboard.writeText(codeToCopy).then(() => {
                          // Show temporary "Copied!" text
                          const originalText = button.innerHTML;
                          button.innerHTML = '<span class="flex items-center">Copied!</span>';
                          setTimeout(() => {
                            button.innerHTML = originalText;
                          }, 2000);
                        });
                      }
                    });
                  });
                }
              }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              className="w-full h-full p-4 font-mono border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={editContent}
              onChange={handleContentChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your markdown here..."
            />
          )}
        </div>
      </div>

      {/* New File Modal */}
      {showNewFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Create New File</h3>
            <input
              type="text"
              className="w-full p-2 border rounded mb-4"
              placeholder="File name (e.g. notes.md)"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddFile()}
              autoFocus
            />
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded mr-2"
                onClick={() => {
                  setShowNewFileModal(false);
                  setNewFileName('');
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                onClick={handleAddFile}
                disabled={!newFileName.trim()}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Delete File</h3>
            <p className="mb-4">Are you sure you want to delete this file? This action cannot be undone.</p>
            <div className="flex justify-end">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded mr-2"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
                onClick={() => handleDeleteFile(showDeleteConfirm)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditorApp; 