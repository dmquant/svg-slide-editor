'use client';

import React, { useEffect } from 'react';
import { SVGElement, TextElement, ImageElement, LineElement, SymbolElement, UseElement, TEXT_STYLES } from '@/types/editor';
import Tooltip from '../ui/Tooltip';
import { v4 as uuidv4 } from 'uuid';

export type Tool = 'select' | 'rectangle' | 'circle' | 'text' | 'image' | 'line' | 'bullet' | 'styled-text' | 'symbol';

interface ToolbarProps {
  currentTool: Tool;
  onChangeTool: (tool: Tool) => void;
  onAddElement: (element: Partial<SVGElement>) => void;
  onClearCanvas?: () => void;
  isPreviewMode?: boolean;
  onTogglePreviewMode?: () => void;
}

// Type for text style properties
type TextStyleProps = {
  fontSize?: number;
  fontWeight?: string;
  fill?: string;
};

const Toolbar: React.FC<ToolbarProps> = ({
  currentTool,
  onChangeTool,
  onAddElement,
  onClearCanvas,
  isPreviewMode = false,
  onTogglePreviewMode,
}) => {
  // Default element properties for new elements
  const createDefaultElement = (type: SVGElement['type'], subType?: string): Partial<SVGElement> => {
    const baseElement = {
      id: uuidv4(),
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
        // Fix the TypeScript error by checking if subType is a valid key in TEXT_STYLES
        const validTextClass = subType && Object.keys(TEXT_STYLES).includes(subType) ? 
          subType as keyof typeof TEXT_STYLES : undefined;
          
        // Properly type the textStyle object
        const textStyle: TextStyleProps = validTextClass ? TEXT_STYLES[validTextClass] : {};
        
        // Calculate approximate dimensions based on text length and font size
        const text = subType || 'Text';
        const fontSize = textStyle.fontSize || 18;
        const estimatedWidth = text.length * (fontSize * 0.6);
        const estimatedHeight = fontSize * 1.5;
        
        return {
          ...baseElement,
          type: 'text',
          fill: textStyle.fill || '#000000',
          text: text,
          fontSize: fontSize,
          fontFamily: 'Noto Sans SC, sans-serif',
          fontWeight: textStyle.fontWeight || 'normal',
          textClass: validTextClass,
          width: estimatedWidth,  // Improved width estimate
          height: estimatedHeight, // Improved height estimate
        } as Partial<TextElement>;
      
      case 'image':
        return {
          ...baseElement,
          type: 'image',
          href: 'https://via.placeholder.com/100',
        } as Partial<ImageElement>;
      
      case 'line':
        return {
          ...baseElement,
          type: 'line',
          x1: 100,
          y1: 100,
          x2: 300,
          y2: 100,
          stroke: '#007856',
          strokeWidth: subType === 'header-line' ? 4 : 2,
          lineClass: subType as 'header-line' | 'footer-line',
        } as Partial<LineElement>;
      
      case 'circle':
        if (subType === 'bullet-point') {
          return {
            ...baseElement,
            type: 'circle',
            width: 12,
            height: 12,
            fill: '#007856',
            stroke: 'none',
            className: 'bullet-point',
          };
        }
        return baseElement;
      
      case 'rect':
        if (subType === 'highlight-box') {
          return {
            ...baseElement,
            type: 'rect',
            fill: '#f0f9f6',
            stroke: '#007856',
            strokeWidth: 2,
            rx: 8,
            ry: 8,
            width: 200,
            height: 100,
            className: 'highlight-box',
          };
        }
        return baseElement;
      
      case 'symbol':
        return {
          ...baseElement,
          type: 'symbol',
          content: '<path class="nvidia-green" d="M95,50c0,24.85-20.15,45-45,45S5,74.85,5,50S25.15,5,50,5S95,25.15,95,50z"/>',
          viewBox: '0 0 100 100',
        } as Partial<SymbolElement>;
      
      case 'use':
        return {
          ...baseElement,
          type: 'use',
          href: '#nvidia-icon',
        } as Partial<UseElement>;
        
      default:
        return baseElement;
    }
  };
  
  // Handle tool selection
  const handleToolSelect = (toolId: Tool) => {
    // Just set the tool - no automatic element creation
    onChangeTool(toolId);
    
    // Special case handling
    switch (toolId) {
      case 'image':
        const imageElement = createDefaultElement('image');
        setTimeout(() => onAddElement(imageElement), 10);
        break;
      
      case 'line':
        const lineElement = createDefaultElement('line', 'header-line');
        setTimeout(() => onAddElement(lineElement), 10);
        break;
        
      case 'bullet':
        const bulletElement = createDefaultElement('circle', 'bullet-point');
        setTimeout(() => onAddElement(bulletElement), 10);
        break;
        
      case 'styled-text':
        // Open a submenu or use a default style
        const headingElement = createDefaultElement('text', 'heading');
        setTimeout(() => onAddElement(headingElement), 10);
        break;
      
      case 'symbol':
        // For symbols, first check if we need to create a symbol definition
        const symbolElement = createDefaultElement('symbol');
        setTimeout(() => onAddElement(symbolElement), 10);
        break;
    }
  };
  
  // Handle clearing the canvas
  const handleClearCanvas = () => {
    if (onClearCanvas && confirm('Are you sure you want to clear all elements from the canvas?')) {
      onClearCanvas();
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
      label: 'Basic Text', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      )
    },
    { 
      id: 'styled-text', 
      label: 'Styled Text', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    { 
      id: 'line', 
      label: 'Line', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12h16" />
        </svg>
      )
    },
    { 
      id: 'bullet', 
      label: 'Bullet Point', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="6" cy="12" r="3" fill="currentColor" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12h8" />
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
    { 
      id: 'symbol', 
      label: 'Symbol/Icon', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
        </svg>
      )
    },
  ] as const;
  
  return (
    <div className="flex flex-col items-center gap-4">
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
      
      {/* Divider */}
      <div className="w-8 border-t border-gray-200 my-2"></div>
      
      {/* Clear Canvas button */}
      <Tooltip content="Clear Canvas">
        <button
          className="p-2 w-10 h-10 rounded-md flex items-center justify-center text-red-600 hover:bg-red-50"
          onClick={handleClearCanvas}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </Tooltip>
      
      {/* Preview/Edit Toggle Button */}
      {onTogglePreviewMode && (
        <Tooltip content={isPreviewMode ? "Edit Mode" : "Preview Mode"}>
          <button
            className={`
              p-2 w-10 h-10 rounded-md flex items-center justify-center
              ${isPreviewMode ? 'bg-green-100 text-green-600' : 'text-gray-600 hover:bg-gray-100'}
            `}
            onClick={onTogglePreviewMode}
          >
            {isPreviewMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </Tooltip>
      )}
    </div>
  );
};

export default Toolbar; 