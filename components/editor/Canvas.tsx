'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useElementDrag } from '@/hooks/useElementDrag';
import { useSvgGenerator } from '@/hooks/useSvgGenerator';
import { SVGElement } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';
import { Tool } from '@/components/editor/Toolbar';

interface CanvasProps {
  elements: SVGElement[];
  selectedElement: SVGElement | null;
  onSelectElement: (element: SVGElement | null) => void;
  onUpdateElement: (updatedElement: SVGElement) => void;
  onAddElement: (element: Partial<SVGElement>) => void;
  currentTool: Tool;
}

const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onAddElement,
  currentTool,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState('0 0 800 600');
  const [isClient, setIsClient] = useState(false);
  const [drawStartPos, setDrawStartPos] = useState<{ x: number; y: number } | null>(null);
  const [tempShape, setTempShape] = useState<Partial<SVGElement> | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // This effect runs only on the client after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const { startDrag } = useElementDrag({
    onDragComplete: onUpdateElement,
  });
  
  // Handle element selection
  const handleElementClick = (e: React.MouseEvent, element: SVGElement) => {
    e.stopPropagation();
    if (currentTool === 'select') {
      onSelectElement(element);
    }
  };
  
  // Handle canvas click (deselect)
  const handleCanvasClick = () => {
    if (currentTool === 'select') {
      onSelectElement(null);
    }
  };

  // Convert client coordinates to SVG coordinates
  const clientToSVGCoordinates = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const svgWidth = svgRect.width;
    const svgHeight = svgRect.height;
    
    // Get the ViewBox dimensions
    const [minX, minY, width, height] = viewBox.split(' ').map(Number);
    
    // Convert client coordinates to SVG coordinates
    const x = minX + (clientX - svgRect.left) * (width / svgWidth);
    const y = minY + (clientY - svgRect.top) * (height / svgHeight);
    
    return { x, y };
  };
  
  // Handle mouse down for drawing
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isClient) return; // Only handle events on the client side
    
    // Only start drawing if we've selected a drawing tool (not select)
    if (currentTool !== 'select' && !isDrawing) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const { x, y } = clientToSVGCoordinates(e.clientX, e.clientY);
      
      // Only start drawing if coordinates are valid
      if (x >= 0 && y >= 0) {
        setDrawStartPos({ x, y });
        setIsDrawing(true);
        
        // Create initial shape
        const initialShape: Partial<SVGElement> = {
          type: getCurrentToolType(),
          x,
          y,
          width: 1, // Start with tiny width/height to avoid NaN errors
          height: 1,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 1,
        };
        
        setTempShape(initialShape);
        
        // Add mouse event listeners to document to handle cases when mouse moves outside of SVG
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);
      }
    }
  };
  
  // Handle global mouse move (for when the pointer moves outside the SVG)
  const handleGlobalMouseMove = (e: MouseEvent) => {
    if (isDrawing && drawStartPos && tempShape) {
      e.preventDefault();
      
      const { x, y } = clientToSVGCoordinates(e.clientX, e.clientY);
      
      // Calculate width and height based on drag direction
      const width = Math.abs(x - drawStartPos.x);
      const height = Math.abs(y - drawStartPos.y);
      
      // Update shape position if dragging left or up
      const newX = Math.min(x, drawStartPos.x);
      const newY = Math.min(y, drawStartPos.y);
      
      setTempShape({
        ...tempShape,
        x: newX,
        y: newY,
        width: Math.max(width, 1),
        height: Math.max(height, 1),
      });
    }
  };
  
  // Handle mouse move for drawing (when mouse is over the SVG)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isClient) return;
    
    if (isDrawing && drawStartPos && tempShape) {
      e.preventDefault();
      e.stopPropagation();
      
      const { x, y } = clientToSVGCoordinates(e.clientX, e.clientY);
      
      // Calculate width and height based on drag direction
      const width = Math.abs(x - drawStartPos.x);
      const height = Math.abs(y - drawStartPos.y);
      
      // Update shape position if dragging left or up
      const newX = Math.min(x, drawStartPos.x);
      const newY = Math.min(y, drawStartPos.y);
      
      setTempShape({
        ...tempShape,
        x: newX,
        y: newY,
        width: Math.max(width, 1),
        height: Math.max(height, 1),
      });
    }
  };
  
  // Handle global mouse up (for when the pointer is released outside the SVG)
  const handleGlobalMouseUp = (e: MouseEvent) => {
    if (isDrawing && tempShape) {
      e.preventDefault();
      
      finalizeDrawing();
      
      // Remove global event listeners
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  };
  
  // Handle mouse up for drawing
  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isClient) return;
    
    if (isDrawing && tempShape) {
      e.preventDefault();
      e.stopPropagation();
      
      finalizeDrawing();
      
      // Remove global event listeners
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    }
  };
  
  // Finalize the drawing process
  const finalizeDrawing = () => {
    if (tempShape && tempShape.width && tempShape.height) {
      // Only add the shape if it has some size
      if (tempShape.width > 5 || tempShape.height > 5) {
        onAddElement(tempShape);
      }
    }
    
    // Reset drawing state
    setIsDrawing(false);
    setDrawStartPos(null);
    setTempShape(null);
  };
  
  // Cleanup event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);
  
  // Map the toolbar tool to SVG element type
  const getCurrentToolType = (): SVGElement['type'] => {
    switch (currentTool) {
      case 'rectangle':
        return 'rect';
      case 'circle':
        return 'circle';
      case 'text':
        return 'text';
      case 'image':
        return 'image';
      default:
        return 'rect';
    }
  };
  
  // Render the temporary shape while drawing
  const renderTempShape = () => {
    if (!tempShape || !isDrawing) return null;
    
    switch (tempShape.type) {
      case 'rect':
        return (
          <rect
            x={tempShape.x}
            y={tempShape.y}
            width={tempShape.width}
            height={tempShape.height}
            fill={tempShape.fill || '#ffffff'}
            stroke={tempShape.stroke || '#000000'}
            strokeWidth={tempShape.strokeWidth || 1}
            strokeDasharray="4 4"
          />
        );
      case 'circle':
        const cx = (tempShape.x || 0) + (tempShape.width || 0) / 2;
        const cy = (tempShape.y || 0) + (tempShape.height || 0) / 2;
        const r = Math.min(tempShape.width || 0, tempShape.height || 0) / 2;
        return (
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill={tempShape.fill || '#ffffff'}
            stroke={tempShape.stroke || '#000000'}
            strokeWidth={tempShape.strokeWidth || 1}
            strokeDasharray="4 4"
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-[800px] h-[600px] bg-white rounded-md shadow-md overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={viewBox}
          className="w-full h-full"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid background */}
          <pattern
            id="grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth="1"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Only render SVG elements on the client side to avoid hydration issues */}
          {isClient && elements.map((element) => {
            const isSelected = selectedElement?.id === element.id;
            
            // Render different element types
            switch (element.type) {
              case 'rect':
                return (
                  <rect
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    fill={element.fill}
                    stroke={isSelected ? '#3b82f6' : element.stroke}
                    strokeWidth={isSelected ? 2 : element.strokeWidth}
                    onClick={(e) => handleElementClick(e, element)}
                    onMouseDown={(e) => currentTool === 'select' ? startDrag(e, element) : undefined}
                    className={currentTool === 'select' ? "cursor-move" : ""}
                  />
                );
              case 'circle':
                return (
                  <circle
                    key={element.id}
                    cx={element.x + (element.width / 2)}
                    cy={element.y + (element.height / 2)}
                    r={Math.min(element.width, element.height) / 2}
                    fill={element.fill}
                    stroke={isSelected ? '#3b82f6' : element.stroke}
                    strokeWidth={isSelected ? 2 : element.strokeWidth}
                    onClick={(e) => handleElementClick(e, element)}
                    onMouseDown={(e) => currentTool === 'select' ? startDrag(e, element) : undefined}
                    className={currentTool === 'select' ? "cursor-move" : ""}
                  />
                );
              case 'path':
                return (
                  <path
                    key={element.id}
                    d={element.d || ''}
                    fill={element.fill}
                    stroke={isSelected ? '#3b82f6' : element.stroke}
                    strokeWidth={isSelected ? 2 : element.strokeWidth}
                    onClick={(e) => handleElementClick(e, element)}
                    onMouseDown={(e) => currentTool === 'select' ? startDrag(e, element) : undefined}
                    className={currentTool === 'select' ? "cursor-move" : ""}
                  />
                );
              case 'text':
                return (
                  <text
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    fill={element.fill}
                    fontSize={element.fontSize || 16}
                    fontFamily={element.fontFamily || 'Arial'}
                    onClick={(e) => handleElementClick(e, element)}
                    onMouseDown={(e) => currentTool === 'select' ? startDrag(e, element) : undefined}
                    className={currentTool === 'select' ? "cursor-move" : ""}
                  >
                    {element.text || 'Text'}
                  </text>
                );
              case 'image':
                return (
                  <image
                    key={element.id}
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    href={element.href}
                    preserveAspectRatio={element.preserveAspectRatio || 'xMidYMid meet'}
                    onClick={(e) => handleElementClick(e, element)}
                    onMouseDown={(e) => currentTool === 'select' ? startDrag(e, element) : undefined}
                    className={currentTool === 'select' ? "cursor-move" : ""}
                  />
                );
              default:
                return null;
            }
          })}
          
          {/* Render the temporary shape while drawing */}
          {isClient && renderTempShape()}
        </svg>
      </div>
    </div>
  );
};

export default Canvas; 