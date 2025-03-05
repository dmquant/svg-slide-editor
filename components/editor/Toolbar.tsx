'use client';

import React from 'react';
import { SVGElement } from '@/types/editor';
import Tooltip from '../ui/Tooltip';

export type Tool = 'select' | 'rectangle' | 'circle' | 'text' | 'image';

interface ToolbarProps {
  currentTool: Tool;
  onChangeTool: (tool: Tool) => void;
  onAddElement: (element: Partial<SVGElement>) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onChangeTool,
  onAddElement,
}) => {
  // Default element properties for new elements (used only for 'text' and 'image' tools)
  const createDefaultElement = (type: SVGElement['type']): Partial<SVGElement> => {
    const baseElement = {
      type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1,
    };
    
    // Add type-specific properties
    switch (type) {
      case 'text':
        return {
          ...baseElement,
          text: 'Text',
          fontSize: 18,
          fontFamily: 'Arial',
        };
      case 'image':
        return {
          ...baseElement,
          href: 'https://via.placeholder.com/100',
        };
      default:
        return baseElement;
    }
  };
  
  // Handle tool selection
  const handleToolSelect = (toolId: Tool) => {
    // First set the tool regardless
    onChangeTool(toolId);
    
    // For text and image tools, directly add an element since they are not drawn
    if (toolId === 'text' || toolId === 'image') {
      const elementType = toolId === 'text' ? 'text' : 'image';
      const newElement = createDefaultElement(elementType as SVGElement['type']);
      
      // Set a small delay to avoid any race conditions
      setTimeout(() => {
        onAddElement(newElement);
      }, 10);
    }
  };
  
  const tools = [
    { 
      id: 'select', 
      label: 'Select', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    },
    { 
      id: 'rectangle', 
      label: 'Rectangle', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
        </svg>
      )
    },
    { 
      id: 'circle', 
      label: 'Circle', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth="2" />
        </svg>
      )
    },
    { 
      id: 'text', 
      label: 'Text', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      )
    },
    { 
      id: 'image', 
      label: 'Image', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
  ] as const;
  
  return (
    <div className="flex flex-col items-center gap-6">
      {tools.map((tool) => (
        <Tooltip key={tool.id} content={tool.label}>
          <button
            className={`
              p-2 w-10 h-10 rounded-md flex items-center justify-center
              ${currentTool === tool.id ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}
            `}
            onClick={() => handleToolSelect(tool.id)}
          >
            {tool.icon}
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default Toolbar; 