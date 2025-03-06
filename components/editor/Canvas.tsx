'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useElementDrag } from '@/hooks/useElementDrag';
import { useSvgGenerator } from '@/hooks/useSvgGenerator';
import { SVGElement, TextElement } from '@/types/editor';
import { v4 as uuidv4 } from 'uuid';
import { Tool } from '@/components/editor/Toolbar';
import QuickColorPalette from '../ui/QuickColorPalette';

interface CanvasProps {
  elements: SVGElement[];
  selectedElement: SVGElement | null;
  onSelectElement: (element: SVGElement | null) => void;
  onUpdateElement: (updatedElement: SVGElement) => void;
  onAddElement: (element: Partial<SVGElement>) => void;
  onDeleteElement?: (elementId: string) => void;
  currentTool: Tool;
}

const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  currentTool,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState('0 0 800 600');
  const [isClient, setIsClient] = useState(false);
  const [drawStartPos, setDrawStartPos] = useState<{ x: number; y: number } | null>(null);
  const [tempShape, setTempShape] = useState<Partial<SVGElement> | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // New state for multi-selection
  const [selectedElements, setSelectedElements] = useState<SVGElement[]>([]);
  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  
  // This effect runs only on the client after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Initialize selectedElements from selectedElement
  useEffect(() => {
    if (selectedElement) {
      setSelectedElements([selectedElement]);
    } else {
      setSelectedElements([]);
    }
  }, [selectedElement]);
  
  const { startDrag } = useElementDrag({
    onDragComplete: onUpdateElement,
  });
  
  // Handle element selection
  const handleElementClick = (e: React.MouseEvent, element: SVGElement) => {
    e.preventDefault(); // Prevent default browser behavior
    e.stopPropagation(); // Prevent event bubbling to the canvas
    
    console.log('Element clicked:', element.id, 'Current tool:', currentTool);
    console.log('Current selectedElements:', selectedElements.map(e => e.id));
    console.log('Currently selected element from props:', selectedElement?.id);
    
    if (currentTool === 'select') {
      // Multi-selection with modifier keys
      if ((e.ctrlKey || e.metaKey || e.shiftKey) && isClient) {
        // If element is already selected, remove it, otherwise add it
        if (selectedElements.some(el => el.id === element.id)) {
          console.log('Removing element from selection:', element.id);
          const newSelection = selectedElements.filter(el => el.id !== element.id);
          setSelectedElements(newSelection);
          // Update context's selected element (primary selection)
          onSelectElement(newSelection.length > 0 ? newSelection[0] : null);
        } else {
          console.log('Adding element to selection:', element.id);
          const newSelection = [...selectedElements, element];
          setSelectedElements(newSelection);
          // Update context's selected element (primary selection)
          onSelectElement(element);
        }
      } else {
        // Single selection (no modifiers)
        console.log('Setting selected element:', element.id);
        // Force update both local and parent state
        const newSelection = [element];
        setSelectedElements(newSelection);
        onSelectElement(element);
        
        // Add a slight delay to ensure state has been updated
        setTimeout(() => {
          console.log('After update - selectedElements:', 
            selectedElements.map(e => e.id),
            'selectedElement:', selectedElement?.id);
        }, 100);
      }
    }
  };
  
  // Handle canvas click (deselect or add text)
  const handleCanvasClick = (e: React.MouseEvent) => {
    // Only process if not coming from selection box end
    if (isSelecting) return;
    
    if (currentTool === 'select') {
      // Clear selection only when clicking directly on canvas (not on elements)
      if (!e.defaultPrevented) {
        setSelectedElements([]);
        onSelectElement(null);
      }
    } else if (currentTool === 'text') {
      // Add text at the clicked position
      const { x, y } = clientToSVGCoordinates(e.clientX, e.clientY);
      const newTextElement: Partial<TextElement> = {
        id: uuidv4(),
        type: 'text',
        x,
        y,
        width: 120,
        height: 40,
        fill: '#000000',
        stroke: 'transparent',
        strokeWidth: 1,
        text: 'Text',
        fontSize: 18,
        fontFamily: 'Arial',
      };
      
      onAddElement(newTextElement);
    }
  };

  // Handle double click on elements to add centered text
  const handleElementDoubleClick = (e: React.MouseEvent, element: SVGElement) => {
    e.stopPropagation();
    
    // Calculate center of the element
    const centerX = element.x + (element.width / 2);
    const centerY = element.y + (element.height / 2);
    
    const newTextElement: Partial<TextElement> = {
      id: uuidv4(),
      type: 'text',
      x: centerX - 50, // Offset to center the text (approximate)
      y: centerY - 9, // Offset to center the text vertically (approximate)
      width: 100,
      height: 30,
      fill: '#000000',
      stroke: 'transparent',
      strokeWidth: 1,
      text: 'Text',
      fontSize: 18,
      fontFamily: 'Arial',
    };
    
    onAddElement(newTextElement);
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
  
  // Handle mouse down for drawing or selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isClient) return; // Only handle events on the client side
    
    console.log('handleMouseDown triggered, currentTool:', currentTool);
    
    if (currentTool === 'select') {
      // Check if the click is on the SVG background or the grid
      const isBackground = e.target === svgRef.current || 
        ((e.target as HTMLElement).tagName === 'rect' && (e.target as HTMLElement).getAttribute('data-grid') === 'true');
      
      console.log('Is click on background?', isBackground);
      
      if (isBackground) {
        e.preventDefault();
        e.stopPropagation();
        
        // Clear existing selection if not using modifier keys
        if (!e.ctrlKey && !e.shiftKey && !e.metaKey) {
          console.log('Clearing selection');
          setSelectedElements([]);
          onSelectElement(null);
        }
        
        const { x, y } = clientToSVGCoordinates(e.clientX, e.clientY);
        console.log('Starting selection box at', x, y);
        
        setIsSelecting(true);
        setSelectionBox({ x, y, width: 0, height: 0 });
        
        // Add global event listeners for selection
        document.addEventListener('mousemove', handleSelectionMove);
        document.addEventListener('mouseup', handleSelectionEnd);
      }
    } 
    // Drawing tools handling (rectangle, circle, text, image)
    else if (!isDrawing) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event bubbling
      
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const { x, y } = clientToSVGCoordinates(e.clientX, e.clientY);
      
      // Only start drawing if coordinates are valid
      if (x >= 0 && y >= 0) {
        setDrawStartPos({ x, y });
        setIsDrawing(true);
        
        // Create a temporary shape based on the current tool
        const shapeType = getCurrentToolType();
        
        // Create the appropriate temporary shape
        setTempShape({
          type: shapeType,
          x,
          y,
          width: 0,
          height: 0,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 1,
        });
        
        // Add event listeners for global events (when the pointer moves outside the SVG)
        document.addEventListener('mousemove', handleGlobalMouseMove);
        document.addEventListener('mouseup', handleGlobalMouseUp);
      }
    }
  };
  
  // Handle selection box moving
  const handleSelectionMove = (e: MouseEvent) => {
    if (isSelecting && selectionBox) {
      e.preventDefault();
      
      console.log('Selection box moving');
      const { x, y } = clientToSVGCoordinates(e.clientX, e.clientY);
      
      // Update selection box
      const width = Math.abs(x - selectionBox.x);
      const height = Math.abs(y - selectionBox.y);
      const newX = Math.min(x, selectionBox.x);
      const newY = Math.min(y, selectionBox.y);
      
      setSelectionBox({
        x: newX,
        y: newY,
        width,
        height
      });
    }
  };
  
  // Finalize selection box
  const handleSelectionEnd = (e: MouseEvent) => {
    if (isSelecting && selectionBox) {
      e.preventDefault();
      
      console.log('Selection box ended, finding elements in box');
      
      // Find elements inside the selection box
      const selectedItems = elements.filter(element => {
        // Check if the element intersects with the selection box
        return (
          element.x < selectionBox.x + selectionBox.width &&
          element.x + element.width > selectionBox.x &&
          element.y < selectionBox.y + selectionBox.height &&
          element.y + element.height > selectionBox.y
        );
      });
      
      console.log('Found elements in selection box:', selectedItems.length);
      
      if (selectedItems.length > 0) {
        // If holding shift or ctrl, add to existing selection
        if (e.shiftKey || e.ctrlKey || e.metaKey) {
          const newSelection = [...selectedElements];
          
          // Add any items not already selected
          selectedItems.forEach(item => {
            if (!newSelection.some(el => el.id === item.id)) {
              newSelection.push(item);
            }
          });
          
          console.log('Adding to selection, new count:', newSelection.length);
          setSelectedElements(newSelection);
          // Update the primary selected element
          onSelectElement(newSelection[0]);
        } else {
          // Replace selection
          console.log('Replacing selection with', selectedItems.length, 'elements');
          setSelectedElements(selectedItems);
          // Update the primary selected element
          onSelectElement(selectedItems[0]);
        }
      }
      
      // Clear selection state
      setIsSelecting(false);
      setSelectionBox(null);
      
      // Remove event listeners
      document.removeEventListener('mousemove', handleSelectionMove);
      document.removeEventListener('mouseup', handleSelectionEnd);
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
      document.removeEventListener('mousemove', handleSelectionMove);
      document.removeEventListener('mouseup', handleSelectionEnd);
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
  
  const handleFillColorChange = (color: string) => {
    if (selectedElement) {
      onUpdateElement({
        ...selectedElement,
        fill: color
      });
    }
  };

  const handleStrokeColorChange = (color: string) => {
    if (selectedElement) {
      onUpdateElement({
        ...selectedElement,
        stroke: color
      });
    }
  };
  
  // This effect syncs selectedElement from props with selectedElements local state
  useEffect(() => {
    if (selectedElement && !selectedElements.some(el => el.id === selectedElement.id)) {
      console.log('Syncing selectedElement from props to local state:', selectedElement.id);
      setSelectedElements([selectedElement, ...selectedElements]);
    } else if (!selectedElement && selectedElements.length > 0) {
      console.log('No selected element in props, but have local selections. Keeping local.');
    }
  }, [selectedElement]);
  
  // Modify the startDrag function to handle multi-element drag
  const startMultiDrag = (e: React.MouseEvent, element: SVGElement) => {
    // Only start drag if in select mode
    if (currentTool !== 'select') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Starting multi-drag for element:', element.id);
    console.log('Selected elements:', selectedElements.map(el => el.id));
    
    // If clicked element is not in selection, clear selection and select just this element
    if (!selectedElements.some(el => el.id === element.id)) {
      console.log('Element not in selection, selecting only this element');
      setSelectedElements([element]);
      onSelectElement(element);
      startDrag(e, element);
      return;
    }
    
    // Store original positions of all selected elements for dragging
    const elementPositions = selectedElements.map(el => ({
      id: el.id,
      startX: el.x,
      startY: el.y
    }));
    
    // Store drag start info
    const startX = e.clientX;
    const startY = e.clientY;
    
    // Setup move handler
    const handleMultiMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      
      // Update all selected elements
      selectedElements.forEach(el => {
        const originalPos = elementPositions.find(pos => pos.id === el.id);
        if (originalPos) {
          const updatedElement = {
            ...el,
            x: originalPos.startX + dx,
            y: originalPos.startY + dy
          };
          
          // Update the element visually (but don't commit yet)
          const elementIndex = elements.findIndex(item => item.id === el.id);
          if (elementIndex !== -1) {
            const newElements = [...elements];
            newElements[elementIndex] = updatedElement;
            // No need to call setElements - we're just updating visual position
          }
        }
      });
    };
    
    // Setup end handler
    const handleMultiUp = (upEvent: MouseEvent) => {
      document.removeEventListener('mousemove', handleMultiMove);
      document.removeEventListener('mouseup', handleMultiUp);
      
      // Finalize the move by updating all elements
      const dx = upEvent.clientX - startX;
      const dy = upEvent.clientY - startY;
      
      selectedElements.forEach(el => {
        const originalPos = elementPositions.find(pos => pos.id === el.id);
        if (originalPos) {
          const updatedElement = {
            ...el,
            x: originalPos.startX + dx,
            y: originalPos.startY + dy
          };
          
          // Commit change
          onUpdateElement(updatedElement);
        }
      });
    };
    
    // Add event listeners
    document.addEventListener('mousemove', handleMultiMove);
    document.addEventListener('mouseup', handleMultiUp);
  };
  
  // Add keyboard event listener for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keydown events when canvas is active and we're in design mode
      if (!isClient || currentTool !== 'select') return;
      
      console.log('Key pressed:', e.key);
      
      // Handle delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        // If we have selected elements and a delete function
        if (selectedElements.length > 0 && onDeleteElement) {
          console.log('Deleting selected elements:', selectedElements.map(el => el.id));
          
          // Delete all selected elements
          selectedElements.forEach(element => {
            onDeleteElement(element.id);
          });
          
          // Clear the selection
          setSelectedElements([]);
        }
      }
    };
    
    // Add event listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElements, onDeleteElement, isClient, currentTool]);
  
  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gray-50 p-4">
      <div className="w-[800px] h-[600px] bg-white rounded-md shadow-md overflow-hidden relative">
        <svg
          ref={svgRef}
          className="w-full h-full"
          viewBox={viewBox}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" data-grid="true" />
          
          {/* Render all elements */}
          {elements.map((element) => {
            const isSelected = selectedElements.some(sel => sel.id === element.id);
            
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
                    strokeDasharray={isSelected ? '5,5' : undefined}
                    onClick={(e) => {
                      console.log('Element clicked (onClick):', element.id);
                      handleElementClick(e, element);
                    }}
                    onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                    onMouseDown={(e) => {
                      // Call click handler first to ensure selection happens before drag
                      if (currentTool === 'select') {
                        if (e.ctrlKey || e.shiftKey || e.metaKey) {
                          // Just handle selection, no dragging
                          handleElementClick(e, element);
                        } else {
                          // If we're not using modifier keys, start multi-drag
                          if (!selectedElements.some(el => el.id === element.id)) {
                            // If element is not selected, select it first
                            handleElementClick(e, element);
                          }
                          startMultiDrag(e, element);
                        }
                      }
                    }}
                    style={{ cursor: currentTool === 'select' ? 'move' : 'default' }}
                  />
                );
              case 'circle':
                return (
                  <circle
                    key={element.id}
                    cx={element.x + element.width / 2}
                    cy={element.y + element.height / 2}
                    r={Math.min(element.width, element.height) / 2}
                    fill={element.fill}
                    stroke={isSelected ? '#3b82f6' : element.stroke}
                    strokeWidth={isSelected ? 2 : element.strokeWidth}
                    strokeDasharray={isSelected ? '5,5' : undefined}
                    onClick={(e) => {
                      console.log('Circle clicked (onClick):', element.id);
                      handleElementClick(e, element);
                    }}
                    onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                    onMouseDown={(e) => {
                      // Call click handler first to ensure selection happens before drag
                      if (currentTool === 'select') {
                        if (e.ctrlKey || e.shiftKey || e.metaKey) {
                          // Just handle selection, no dragging
                          handleElementClick(e, element);
                        } else {
                          // If we're not using modifier keys, start multi-drag
                          if (!selectedElements.some(el => el.id === element.id)) {
                            // If element is not selected, select it first
                            handleElementClick(e, element);
                          }
                          startMultiDrag(e, element);
                        }
                      }
                    }}
                    style={{ cursor: currentTool === 'select' ? 'move' : 'default' }}
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
                    strokeDasharray={isSelected ? '5,5' : undefined}
                    onClick={(e) => {
                      console.log('Path clicked (onClick):', element.id);
                      handleElementClick(e, element);
                    }}
                    onMouseDown={(e) => {
                      // Call click handler first to ensure selection happens before drag
                      if (currentTool === 'select') {
                        if (e.ctrlKey || e.shiftKey || e.metaKey) {
                          // Just handle selection, no dragging
                          handleElementClick(e, element);
                        } else {
                          // If we're not using modifier keys, start multi-drag
                          if (!selectedElements.some(el => el.id === element.id)) {
                            // If element is not selected, select it first
                            handleElementClick(e, element);
                          }
                          startMultiDrag(e, element);
                        }
                      }
                    }}
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
                    stroke={isSelected ? '#3b82f6' : 'none'}
                    strokeWidth={isSelected ? 0.5 : 0}
                    onClick={(e) => {
                      console.log('Text clicked (onClick):', element.id);
                      handleElementClick(e, element);
                    }}
                    onMouseDown={(e) => {
                      // Call click handler first to ensure selection happens before drag
                      if (currentTool === 'select') {
                        if (e.ctrlKey || e.shiftKey || e.metaKey) {
                          // Just handle selection, no dragging
                          handleElementClick(e, element);
                        } else {
                          // If we're not using modifier keys, start multi-drag
                          if (!selectedElements.some(el => el.id === element.id)) {
                            // If element is not selected, select it first
                            handleElementClick(e, element);
                          }
                          startMultiDrag(e, element);
                        }
                      }
                    }}
                    className={currentTool === 'select' ? "cursor-move" : ""}
                  >
                    {(element as TextElement).text || 'Text'}
                  </text>
                );
              case 'image':
                return (
                  <g key={element.id}>
                    <image
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      href={element.href}
                      preserveAspectRatio={element.preserveAspectRatio || 'xMidYMid meet'}
                      onClick={(e) => {
                        console.log('Image clicked (onClick):', element.id);
                        handleElementClick(e, element);
                      }}
                      onMouseDown={(e) => {
                        // Call click handler first to ensure selection happens before drag
                        if (currentTool === 'select') {
                          if (e.ctrlKey || e.shiftKey || e.metaKey) {
                            // Just handle selection, no dragging
                            handleElementClick(e, element);
                          } else {
                            // If we're not using modifier keys, start multi-drag
                            if (!selectedElements.some(el => el.id === element.id)) {
                              // If element is not selected, select it first
                              handleElementClick(e, element);
                            }
                            startMultiDrag(e, element);
                          }
                        }
                      }}
                      className={currentTool === 'select' ? "cursor-move" : ""}
                    />
                    {isSelected && (
                      <rect
                        x={element.x}
                        y={element.y}
                        width={element.width}
                        height={element.height}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="5,5"
                        pointerEvents="none"
                      />
                    )}
                  </g>
                );
              default:
                return null;
            }
          })}
          
          {/* Render selection box */}
          {isSelecting && selectionBox && (
            <rect
              x={selectionBox.x}
              y={selectionBox.y}
              width={selectionBox.width}
              height={selectionBox.height}
              fill="rgba(59, 130, 246, 0.1)"
              stroke="#3b82f6"
              strokeWidth={1}
              strokeDasharray="5,5"
            />
          )}
          
          {/* Render temporary shape while drawing */}
          {isClient && renderTempShape()}
        </svg>
        
        {/* Add the QuickColorPalette component */}
        {selectedElement && (
          <QuickColorPalette
            currentFill={selectedElement.fill}
            currentStroke={selectedElement.stroke}
            onSelectFill={handleFillColorChange}
            onSelectStroke={handleStrokeColorChange}
          />
        )}
        
        {/* Selection info */}
        {selectedElements.length > 1 && (
          <div className="absolute top-2 left-2 bg-white p-2 rounded shadow-md text-xs">
            {selectedElements.length} items selected
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas; 