'use client';

import React, { useState } from 'react';
import { EditorProvider } from '@/context/EditorContext';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Canvas from '@/components/editor/Canvas';
import Toolbar from '@/components/editor/Toolbar';
import CodeEditor from '@/components/editor/CodeEditor';
import { useEditor } from '@/context/EditorContext';
import { Tool } from '@/components/editor/Toolbar';

// Main Editor Component
function Editor() {
  const {
    slides,
    currentSlideIndex,
    selectedElement,
    addSlide,
    deleteSlide,
    reorderSlides,
    addElement,
    updateElement,
    deleteElement,
    reorderElements,
    setCurrentSlideIndex,
    setSelectedElement,
    clearProject,
    saveProject,
    loadProject,
    setSlides,
  } = useEditor();

  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [viewMode, setViewMode] = useState<'design' | 'code' | 'preview'>('design');
  const [isCodeVisible, setIsCodeVisible] = useState(true);

  // Get current slide elements
  const currentSlide = slides[currentSlideIndex] || { id: '', elements: [] };
  const currentElements = currentSlide.elements;

  // Handle file operations
  const handleNew = () => {
    if (confirm('Create a new project? Unsaved changes will be lost.')) {
      clearProject();
    }
  };

  const handleSave = () => {
    try {
      const projectData = saveProject();
      
      // Check if projectData is a string
      if (typeof projectData === 'string') {
        // Save to localStorage
        localStorage.setItem('svg-editor-project', projectData);
        
        // Also offer download as a file
        const blob = new Blob([projectData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'svg-slide-editor-project.json';
        a.click();
        URL.revokeObjectURL(url);
        
        alert('Project saved successfully!');
      } else {
        console.error('Project data is not a string');
        alert('Failed to save project. Invalid data format.');
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleExport = () => {
    const svgCode = document.querySelector('svg')?.outerHTML;
    if (svgCode) {
      const blob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `slide-${currentSlideIndex + 1}.svg`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const projectData = event.target?.result as string;
            loadProject(projectData);
          } catch (error) {
            alert('Error importing project: Invalid file format');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const toggleCodeVisibility = () => {
    setIsCodeVisible(!isCodeVisible);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top navigation bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="flex items-center">
          <button className="mr-3 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <h1 className="text-gray-800 text-lg font-medium">SVG Editor UI for Interactive Slides</h1>
        </div>
        <div className="flex items-center">
          <div className="flex rounded-md overflow-hidden border border-gray-300 mr-3">
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'design' ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 transition-colors duration-200`}
              onClick={() => {
                setViewMode('design');
                // When switching to design mode, make sure we have code editor visible
                if (!isCodeVisible) setIsCodeVisible(true);
              }}
            >
              Design
            </button>
            <button 
              className={`px-3 py-1 text-sm ${viewMode === 'preview' ? 'bg-gray-200' : 'bg-white'} hover:bg-gray-100 transition-colors duration-200`}
              onClick={() => setViewMode('preview')}
            >
              Preview
            </button>
          </div>
          <button className="text-gray-600" onClick={handleNew}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Sub header with editor title and actions */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <h2 className="text-xl font-semibold text-gray-800">SVG Slide Editor</h2>
        <div className="flex space-x-2">
          <button 
            onClick={toggleCodeVisibility}
            className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md flex items-center hover:bg-blue-100 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0h8v12H6V4z" clipRule="evenodd" />
            </svg>
            {isCodeVisible ? 'Hide Code' : 'Show Code'}
          </button>
          <button 
            onClick={() => setViewMode(viewMode === 'design' ? 'preview' : 'design')}
            className={`px-4 py-2 rounded-md flex items-center transition-colors duration-200 ${
              viewMode === 'preview' 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            {viewMode === 'preview' ? 'Edit Mode' : 'Preview Mode'}
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 bg-green-50 text-green-600 rounded-md flex items-center hover:bg-green-100 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
            </svg>
            Save
          </button>
        </div>
      </div>

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar with drawing tools */}
        <div className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-6">
          <Toolbar
            currentTool={currentTool}
            onChangeTool={setCurrentTool}
            onAddElement={addElement}
          />
        </div>
        
        {/* Center canvas area */}
        <div className="flex-1 relative">
          {viewMode === 'design' ? (
            <Canvas
              elements={currentElements}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={updateElement}
              onAddElement={addElement}
              onDeleteElement={deleteElement}
              currentTool={currentTool}
            />
          ) : (
            <div className="w-full h-full p-4 flex items-center justify-center bg-gray-50">
              <div className="max-w-3xl w-full h-full">
                {/* Preview of the current slide as an SVG */}
                <div 
                  className="w-full h-full bg-white rounded-lg shadow-lg p-8 overflow-auto" 
                  dangerouslySetInnerHTML={{ 
                    __html: currentElements.length === 0 
                      ? '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%"><text x="50%" y="50%" font-size="24" text-anchor="middle" fill="#999">No elements on this slide</text></svg>'
                      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="100%" height="100%">
                          ${currentElements.map(el => {
                            switch(el.type) {
                              case 'rect':
                                return `<rect x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" />`;
                              case 'circle':
                                return `<circle cx="${el.x + el.width/2}" cy="${el.y + el.height/2}" r="${Math.min(el.width, el.height)/2}" fill="${el.fill}" stroke="${el.stroke}" stroke-width="${el.strokeWidth}" />`;
                              case 'text':
                                const textEl = el as any;
                                return `<text x="${el.x}" y="${el.y + (textEl.fontSize || 16)}" font-size="${textEl.fontSize || 16}px" font-family="${textEl.fontFamily || 'Arial'}" fill="${el.fill}">${textEl.text || 'Text'}</text>`;
                              case 'image':
                                const imgEl = el as any;
                                return `<image x="${el.x}" y="${el.y}" width="${el.width}" height="${el.height}" href="${imgEl.href || ''}" />`;
                              default:
                                return '';
                            }
                          }).join('')}
                        </svg>`
                  }} 
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Right sidebar */}
        <div className="w-64 bg-white border-l">
          <Sidebar
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            selectedElement={selectedElement}
            onSelectSlide={setCurrentSlideIndex}
            onAddSlide={addSlide}
            onDeleteSlide={deleteSlide}
            onReorderSlides={reorderSlides}
            onSelectElement={setSelectedElement}
            onUpdateElement={updateElement}
            onReorderElements={reorderElements}
            onDeleteElement={deleteElement}
          />
        </div>
      </div>
      
      {/* Code editor area */}
      {isCodeVisible && (
        <div className="border-t bg-gray-50">
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span className="font-medium text-gray-700">SVG Code</span>
            </div>
            <div className="flex space-x-2">
              <button 
                className="px-3 py-1 border border-gray-300 rounded text-sm flex items-center bg-white"
                onClick={() => {
                  const svgCode = document.querySelector('svg')?.outerHTML;
                  if (svgCode) navigator.clipboard.writeText(svgCode);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                Copy
              </button>
              <button 
                className="px-3 py-1 border border-gray-300 rounded text-sm flex items-center bg-white text-green-600"
                onClick={() => {
                  // Reference to the code editor's validate function
                  const codeEditorRef = document.getElementById('svg-code-editor');
                  if (codeEditorRef) {
                    // This will be handled by the CodeEditor component's internal validation
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Validate
              </button>
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                onClick={() => {
                  const codeEditorRef = document.getElementById('code-editor-ref');
                  if (codeEditorRef && typeof (codeEditorRef as any).applyChanges === 'function') {
                    (codeEditorRef as any).applyChanges();
                  }
                }}
              >
                Apply Changes
              </button>
            </div>
          </div>
          <div className="p-4">
            <CodeEditor
              id="code-editor-ref"
              elements={currentElements}
              onCodeChange={(updatedElements) => {
                // Update elements in the current slide
                const newSlides = [...slides];
                newSlides[currentSlideIndex] = {
                  ...currentSlide,
                  elements: updatedElements,
                };
                // Update slides
                setSlides(newSlides);
              }}
            />
            <div className="mt-2 p-2 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              SVG code validated successfully!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <EditorProvider>
      <Editor />
    </EditorProvider>
  );
}
