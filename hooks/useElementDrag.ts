import { useState, useEffect, useCallback } from 'react';
import { SVGElement } from '@/types/editor';

interface UseElementDragOptions {
  onDragComplete?: (element: SVGElement) => void;
}

interface ElementDragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  elementX: number;
  elementY: number;
  element: SVGElement | null;
}

export function useElementDrag(options: UseElementDragOptions = {}) {
  const [dragState, setDragState] = useState<ElementDragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    elementX: 0,
    elementY: 0,
    element: null,
  });

  // Start dragging an element
  const startDrag = useCallback((e: React.MouseEvent, element: SVGElement) => {
    e.preventDefault();
    
    // Capture the initial mouse and element positions
    setDragState({
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      elementX: element.x,
      elementY: element.y,
      element,
    });
  }, []);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.element) return;
    
    // Calculate the new position based on the mouse movement
    const dx = e.clientX - dragState.startX;
    const dy = e.clientY - dragState.startY;
    
    // Update the element with the new position
    const updatedElement: SVGElement = {
      ...dragState.element,
      x: dragState.elementX + dx,
      y: dragState.elementY + dy,
    };
    
    setDragState(prev => ({
      ...prev,
      element: updatedElement,
    }));
  }, [dragState]);

  // Handle mouse up to end dragging
  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging || !dragState.element) return;
    
    // Call the onDragComplete callback with the final position
    if (options.onDragComplete && dragState.element) {
      options.onDragComplete(dragState.element);
    }
    
    // Reset the drag state
    setDragState({
      isDragging: false,
      startX: 0,
      startY: 0,
      elementX: 0,
      elementY: 0,
      element: null,
    });
  }, [dragState, options]);

  // Set up event listeners for mouse move and mouse up
  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      // Enable pointer events on the body to capture events outside of the SVG
      document.body.style.pointerEvents = 'none';
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      // Restore pointer events on cleanup
      document.body.style.pointerEvents = '';
    };
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return {
    startDrag,
    isDragging: dragState.isDragging,
    currentElement: dragState.element,
  };
}

export default useElementDrag; 