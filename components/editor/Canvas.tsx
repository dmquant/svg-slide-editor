'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
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
  isPreviewMode?: boolean;
}

const Canvas: React.FC<CanvasProps> = ({
  elements,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  currentTool,
  isPreviewMode = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState('0 0 1200 800');
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
  
  // Calculate accurate text dimensions
  const getTextDimensions = (text: string, fontSize: number, fontWeight: string): { width: number, height: number } => {
    if (!text || !svgRef.current || !isClient) {
      // Fallback estimation if we can't measure
      return {
        width: text ? text.length * (fontSize * 0.6) : 20,
        height: fontSize * 1.2
      };
    }
    
    try {
      // Create a temporary SVG text element to measure
      const svgNS = "http://www.w3.org/2000/svg";
      const temp = document.createElementNS(svgNS, "text");
      temp.setAttribute('font-size', `${fontSize}px`);
      temp.setAttribute('font-family', 'Noto Sans SC, sans-serif');
      temp.setAttribute('font-weight', fontWeight || 'normal');
      temp.textContent = text;
      
      // Append to the SVG temporarily
      svgRef.current.appendChild(temp);
      
      // Get dimensions - this needs to be wrapped in try/catch
      // because getBBox can fail if the element is not visible
      let width = 0;
      let height = 0;
      
      try {
        const bbox = temp.getBBox();
        width = bbox.width;
        height = bbox.height;
      } catch (e) {
        console.warn('Failed to get text dimensions using getBBox, using fallback', e);
        width = text.length * (fontSize * 0.6);
        height = fontSize * 1.2;
      }
      
      // Remove temporary element
      svgRef.current.removeChild(temp);
      
      return { 
        width: Math.max(width, 20), // Ensure minimum width
        height: Math.max(height, fontSize * 1.2) // Ensure minimum height
      };
    } catch (e) {
      console.warn('Error measuring text dimensions:', e);
      return {
        width: text.length * (fontSize * 0.6),
        height: fontSize * 1.2
      };
    }
  };

  // Update text dimensions when rendering - memoized to prevent re-renders
  const updateTextDimensions = useCallback((element: any) => {
    if (element.type === 'text' && element.text && svgRef.current) {
      const fontSize = element.fontSize || 16;
      const fontWeight = element.fontWeight || 'normal';
      
      // Get accurate dimensions
      const { width, height } = getTextDimensions(element.text, fontSize, fontWeight);
      
      // Update element if dimensions are significantly different
      if (Math.abs(element.width - width) > 5 || Math.abs(element.height - height) > 5) {
        onUpdateElement({
          ...element,
          width: width,
          height: height
        });
      }
      
      // Return actual dimensions for rendering selection box
      return { width, height };
    }
    
    return { width: element.width, height: element.height };
  }, [onUpdateElement]);
  
  // Handle mouse down for drawing or selection
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isClient || isPreviewMode) return; // Skip in preview mode or if not client
    
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
  
  // Load CSS styles from the imported SVG
  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;700&display=swap');
    
    text {
      font-family: 'Noto Sans SC', sans-serif;
      fill: #333333;
    }
    .title {
      font-size: 48px;
      font-weight: 700;
      fill: #007856;
    }
    .subtitle {
      font-size: 32px;
      font-weight: 400;
      fill: #444444;
    }
    .heading {
      font-size: 40px;
      font-weight: 700;
      fill: #007856;
    }
    .subheading {
      font-size: 30px;
      font-weight: 700;
      fill: #333333;
    }
    .bullet {
      font-size: 24px;
      fill: #333333;
    }
    .subbullet {
      font-size: 20px;
      fill: #555555;
    }
    .bullet-point {
      fill: #007856;
    }
    .footer {
      font-size: 16px;
      fill: #666666;
    }
    .slide-bg {
      fill: #ffffff;
    }
    .header-line {
      stroke: #007856;
      stroke-width: 4;
    }
    .footer-line {
      stroke: #cccccc;
      stroke-width: 2;
    }
    .highlight-box {
      fill: #f0f9f6;
      stroke: #007856;
      stroke-width: 2;
      rx: 8;
      ry: 8;
    }
    .nvidia-green {
      fill: #76B900;
    }
    .page-number {
      font-size: 24px;
      font-weight: 700;
      fill: #007856;
    }
  `;

  // Effect to update text dimensions when an element is selected
  useEffect(() => {
    if (selectedElement && selectedElement.type === 'text') {
      updateTextDimensions(selectedElement);
    }
  }, [selectedElement, updateTextDimensions]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative flex-1 overflow-auto">
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox={viewBox}
          className={`bg-white ${isPreviewMode ? '' : 'border border-gray-200'}`}
          onMouseDown={isPreviewMode ? undefined : handleMouseDown}
          onMouseMove={isPreviewMode ? undefined : handleMouseMove}
          onMouseUp={isPreviewMode ? undefined : handleMouseUp}
          onMouseLeave={isPreviewMode ? undefined : handleMouseUp}
          onClick={isPreviewMode ? undefined : handleCanvasClick}
        >
          {/* Define global styles */}
          <defs>
            {/* Grid pattern */}
            {!isPreviewMode && (
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse" key="grid-pattern">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1" key="grid-path"/>
              </pattern>
            )}
            
            {/* Global styles */}
            <style type="text/css">
              {globalStyles}
            </style>
            
            {/* NVIDIA icon symbol */}
            <symbol id="nvidia-icon" viewBox="0 0 100 100">
              <path className="nvidia-green" d="M95,50c0,24.85-20.15,45-45,45S5,74.85,5,50S25.15,5,50,5S95,25.15,95,50z"/>
              <path fill="#ffffff" d="M84,55.5c0,0-9.5,17-34,17c-22,0-33.5-17-33.5-17s11.5-17,33.5-17C74.5,38.5,84,55.5,84,55.5z"/>
              <path className="nvidia-green" d="M76,55.5c0,0-7.5,10.5-26,10.5c-16.5,0-25.5-10.5-25.5-10.5s9-10.5,25.5-10.5C68.5,45,76,55.5,76,55.5z"/>
            </symbol>
          </defs>
          {!isPreviewMode && <rect width="100%" height="100%" fill="url(#grid)" data-grid="true" key="grid-bg" />}
          
          {/* Render all elements */}
          {elements.map((element) => {
            const isSelected = !isPreviewMode && selectedElements.some(sel => sel.id === element.id);
            
            // If the element has originalSvg, render it directly using a foreignObject
            if (element.originalSvg) {
              // Create a wrapper for the original SVG to allow selection and interaction
              return (
                <g key={`element-${element.id}`}>
                  <foreignObject
                    x={element.x}
                    y={element.y}
                    width={element.width}
                    height={element.height}
                    dangerouslySetInnerHTML={{ 
                      __html: element.originalSvg 
                    }}
                    onClick={(e) => {
                      console.log('Element clicked (onClick):', element.id);
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
                    style={{ cursor: currentTool === 'select' ? 'move' : 'default' }}
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
            }
            
            // Render different element types
            switch (element.type) {
              case 'rect':
                return (
                  <g key={`element-${element.id}`}>
                    <rect
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      fill={element.fill}
                      stroke={isSelected ? '#3b82f6' : element.stroke}
                      strokeWidth={isSelected ? 2 : element.strokeWidth}
                      strokeDasharray={isSelected ? '5,5' : undefined}
                      rx={(element as any).rx}
                      ry={(element as any).ry}
                      className={element.className}
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
                    {isSelected && (
                      <rect
                        x={element.x - 2}
                        y={element.y - 2}
                        width={element.width + 4}
                        height={element.height + 4}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="5,5"
                        pointerEvents="none"
                      />
                    )}
                  </g>
                );
              case 'circle':
                const cx = element.x + element.width / 2;
                const cy = element.y + element.height / 2;
                const r = Math.min(element.width, element.height) / 2;
                
                return (
                  <g key={`element-${element.id}`}>
                    <circle
                      cx={cx}
                      cy={cy}
                      r={r}
                      fill={element.fill}
                      stroke={isSelected ? '#3b82f6' : element.stroke}
                      strokeWidth={isSelected ? 2 : element.strokeWidth}
                      strokeDasharray={isSelected ? '5,5' : undefined}
                      className={element.className}
                      onClick={(e) => handleElementClick(e, element)}
                      onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                      onMouseDown={(e) => {
                        if (currentTool === 'select') {
                          if (e.ctrlKey || e.shiftKey || e.metaKey) {
                            handleElementClick(e, element);
                          } else {
                            if (!selectedElements.some(el => el.id === element.id)) {
                              handleElementClick(e, element);
                            }
                            startMultiDrag(e, element);
                          }
                        }
                      }}
                      style={{ cursor: currentTool === 'select' ? 'move' : 'default' }}
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
              case 'line':
                const lineElement = element as any;
                return (
                  <g key={`element-${element.id}`}>
                    <line
                      x1={lineElement.x1}
                      y1={lineElement.y1}
                      x2={lineElement.x2}
                      y2={lineElement.y2}
                      stroke={isSelected ? '#3b82f6' : element.stroke}
                      strokeWidth={isSelected ? 2 : element.strokeWidth}
                      strokeDasharray={isSelected ? '5,5' : undefined}
                      className={element.className || lineElement.lineClass}
                      onClick={(e) => handleElementClick(e, element)}
                      onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                      onMouseDown={(e) => {
                        if (currentTool === 'select') {
                          if (e.ctrlKey || e.shiftKey || e.metaKey) {
                            handleElementClick(e, element);
                          } else {
                            if (!selectedElements.some(el => el.id === element.id)) {
                              handleElementClick(e, element);
                            }
                            startMultiDrag(e, element);
                          }
                        }
                      }}
                      style={{ cursor: currentTool === 'select' ? 'move' : 'default' }}
                    />
                    {isSelected && (
                      <>
                        <rect
                          x={Math.min(lineElement.x1, lineElement.x2) - 5}
                          y={Math.min(lineElement.y1, lineElement.y2) - 5}
                          width={Math.abs(lineElement.x2 - lineElement.x1) + 10}
                          height={Math.abs(lineElement.y2 - lineElement.y1) + 10}
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth={2}
                          strokeDasharray="5,5"
                          pointerEvents="none"
                        />
                        {/* Control points for line endpoints */}
                        <circle cx={lineElement.x1} cy={lineElement.y1} r={5} fill="#3b82f6" />
                        <circle cx={lineElement.x2} cy={lineElement.y2} r={5} fill="#3b82f6" />
                      </>
                    )}
                  </g>
                );
              case 'text':
                const textElement = element as any;
                const classStyle = textElement.textClass || '';
                
                // Get accurate text dimensions 
                const { width: textWidth, height: textHeight } = updateTextDimensions(textElement);
                
                return (
                  <g key={`element-${element.id}`}>
                    <text
                      x={element.x}
                      y={element.y + (textElement.fontSize || 16)}
                      fill={element.fill}
                      fontSize={textElement.fontSize || 16}
                      fontFamily={textElement.fontFamily || 'Noto Sans SC, sans-serif'}
                      fontWeight={textElement.fontWeight || 'normal'}
                      textAnchor={textElement.textAnchor || 'start'}
                      className={classStyle || element.className}
                      onClick={(e) => handleElementClick(e, element)}
                      onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                      onMouseDown={(e) => {
                        if (currentTool === 'select') {
                          if (e.ctrlKey || e.shiftKey || e.metaKey) {
                            handleElementClick(e, element);
                          } else {
                            if (!selectedElements.some(el => el.id === element.id)) {
                              handleElementClick(e, element);
                            }
                            startMultiDrag(e, element);
                          }
                        }
                      }}
                      style={{ cursor: currentTool === 'select' ? 'move' : 'default' }}
                    >
                      {(textElement.text || 'Text').split('\n').map((line: string, i: number) => (
                        <tspan key={i} x={element.x} dy={i === 0 ? 0 : textElement.fontSize || 16}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                    {isSelected && (
                      <rect
                        x={element.x - 2}
                        y={element.y - 2}
                        width={textWidth + 4}
                        height={textHeight + 4}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        strokeDasharray="5,5"
                        pointerEvents="none"
                      />
                    )}
                  </g>
                );
              case 'symbol':
                const symbolElement = element as any;
                // For symbols, we need to render the content within a symbol tag
                return (
                  <g key={`element-${element.id}`}>
                    <symbol
                      id={element.id}
                      viewBox={symbolElement.viewBox || "0 0 100 100"}
                      preserveAspectRatio="xMidYMid meet"
                      dangerouslySetInnerHTML={{ __html: symbolElement.content }}
                    />
                    {/* Preview of the symbol */}
                    <use
                      href={`#${element.id}`}
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      onClick={(e) => handleElementClick(e, element)}
                      onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                      onMouseDown={(e) => {
                        if (currentTool === 'select') {
                          if (e.ctrlKey || e.shiftKey || e.metaKey) {
                            handleElementClick(e, element);
                          } else {
                            if (!selectedElements.some(el => el.id === element.id)) {
                              handleElementClick(e, element);
                            }
                            startMultiDrag(e, element);
                          }
                        }
                      }}
                      style={{ cursor: currentTool === 'select' ? 'move' : 'default' }}
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
              case 'use':
                const useElement = element as any;
                return (
                  <g key={`element-${element.id}`}>
                    <use
                      href={useElement.href}
                      x={element.x}
                      y={element.y}
                      width={element.width}
                      height={element.height}
                      onClick={(e) => handleElementClick(e, element)}
                      onDoubleClick={(e) => handleElementDoubleClick(e, element)}
                      onMouseDown={(e) => {
                        if (currentTool === 'select') {
                          if (e.ctrlKey || e.shiftKey || e.metaKey) {
                            handleElementClick(e, element);
                          } else {
                            if (!selectedElements.some(el => el.id === element.id)) {
                              handleElementClick(e, element);
                            }
                            startMultiDrag(e, element);
                          }
                        }
                      }}
                      style={{ cursor: currentTool === 'select' ? 'move' : 'default' }}
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
              key="selection-box"
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
          {isClient && isDrawing && tempShape && (
            tempShape.type === 'rect' ? (
              <rect
                key="temp-rect"
                x={tempShape.x}
                y={tempShape.y}
                width={tempShape.width}
                height={tempShape.height}
                fill={tempShape.fill || '#ffffff'}
                stroke={tempShape.stroke || '#000000'}
                strokeWidth={tempShape.strokeWidth || 1}
                strokeDasharray="4 4"
              />
            ) : tempShape.type === 'circle' ? (
              <circle
                key="temp-circle"
                cx={(tempShape.x || 0) + (tempShape.width || 0) / 2}
                cy={(tempShape.y || 0) + (tempShape.height || 0) / 2}
                r={Math.min(tempShape.width || 0, tempShape.height || 0) / 2}
                fill={tempShape.fill || '#ffffff'}
                stroke={tempShape.stroke || '#000000'}
                strokeWidth={tempShape.strokeWidth || 1}
                strokeDasharray="4 4"
              />
            ) : null
          )}
        </svg>
        
        {/* Add the QuickColorPalette component */}
        {!isPreviewMode && selectedElement && (
          <QuickColorPalette
            currentFill={selectedElement.fill}
            currentStroke={selectedElement.stroke}
            onSelectFill={handleFillColorChange}
            onSelectStroke={handleStrokeColorChange}
          />
        )}
        
        {/* Selection info */}
        {!isPreviewMode && selectedElements.length > 1 && (
          <div className="absolute top-2 left-2 bg-white p-2 rounded shadow-md text-xs">
            {selectedElements.length} items selected
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas; 