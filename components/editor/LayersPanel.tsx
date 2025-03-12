'use client';

import React from 'react';
import { SVGElement } from '@/types/editor';

interface LayersPanelProps {
  elements: SVGElement[];
  selectedElement: SVGElement | null;
  onSelectElement: (element: SVGElement) => void;
  onReorderElements: (reorderedElements: SVGElement[]) => void;
  onDeleteElement: (elementId: string) => void;
}

const LayersPanel: React.FC<LayersPanelProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onReorderElements,
  onDeleteElement,
}) => {
  // Move an element up in the stack (rendered later = appears on top)
  const moveUp = (index: number) => {
    if (index >= elements.length - 1) return; // Already at the top
    
    const newElements = [...elements];
    const temp = newElements[index];
    newElements[index] = newElements[index + 1];
    newElements[index + 1] = temp;
    
    onReorderElements(newElements);
  };
  
  // Move an element down in the stack (rendered earlier = appears on bottom)
  const moveDown = (index: number) => {
    if (index <= 0) return; // Already at the bottom
    
    const newElements = [...elements];
    const temp = newElements[index];
    newElements[index] = newElements[index - 1];
    newElements[index - 1] = temp;
    
    onReorderElements(newElements);
  };
  
  // Helper function to get element type icon
  const getElementIcon = (type: string, elementId: string) => {
    switch (type) {
      case 'rect':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
          </svg>
        );
      case 'circle':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="12" r="9" strokeWidth="2" />
          </svg>
        );
      case 'path':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
        );
      case 'text':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        );
      case 'image':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
          </svg>
        );
    }
  };

  return (
    <div className="h-full">
      {elements.length === 0 ? (
        <div className="text-gray-500 text-sm">
          No elements on this slide
        </div>
      ) : (
        <div className="space-y-2">
          {/* Elements are rendered from bottom to top in SVG, so we display them in reverse order */}
          {[...elements].reverse().map((element, reversedIndex) => {
            const index = elements.length - 1 - reversedIndex;
            const isSelected = selectedElement?.id === element.id;
            
            return (
              <div 
                key={element.id}
                className={`
                  flex items-center p-2 rounded-md cursor-pointer
                  ${isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'}
                `}
                onClick={() => onSelectElement(element)}
              >
                <div className="mr-2 text-gray-600">
                  {getElementIcon(element.type, element.id)}
                </div>
                
                <div className="flex-1 truncate">
                  <div className="text-sm truncate">
                    {element.type === 'text' ? ((element.text || 'Text') as React.ReactNode) : (element.type as React.ReactNode)}
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteElement(element.id); }}
                    className="p-1 text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LayersPanel; 