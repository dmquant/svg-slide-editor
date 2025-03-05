import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SVGElement } from '@/types/editor';

export function useSvgParser() {
  // Parse SVG code and convert to our internal elements format
  const parseSvgCode = useCallback((svgCode: string): SVGElement[] => {
    try {
      const elements: SVGElement[] = [];
      
      // Create a temporary DOM element to parse the SVG
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgCode, 'image/svg+xml');
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid SVG: ' + parserError.textContent);
      }
      
      // Get the root SVG element
      const svgElement = doc.querySelector('svg');
      if (!svgElement) {
        throw new Error('No SVG element found');
      }
      
      // Process rect elements
      const rects = svgElement.querySelectorAll('rect');
      rects.forEach(rect => {
        // Skip background rect
        if (rect.getAttribute('width') === '100%' && rect.getAttribute('height') === '100%') {
          return;
        }
        
        elements.push({
          id: rect.id || uuidv4(),
          type: 'rect',
          x: parseFloat(rect.getAttribute('x') || '0'),
          y: parseFloat(rect.getAttribute('y') || '0'),
          width: parseFloat(rect.getAttribute('width') || '0'),
          height: parseFloat(rect.getAttribute('height') || '0'),
          fill: rect.getAttribute('fill') || '#ffffff',
          stroke: rect.getAttribute('stroke') || '#000000',
          strokeWidth: parseFloat(rect.getAttribute('stroke-width') || '1'),
          opacity: parseFloat(rect.getAttribute('opacity') || '1'),
          transform: rect.getAttribute('transform') || undefined,
        });
      });
      
      // Process circle elements
      const circles = svgElement.querySelectorAll('circle');
      circles.forEach(circle => {
        const cx = parseFloat(circle.getAttribute('cx') || '0');
        const cy = parseFloat(circle.getAttribute('cy') || '0');
        const r = parseFloat(circle.getAttribute('r') || '0');
        
        elements.push({
          id: circle.id || uuidv4(),
          type: 'circle',
          // Convert center coordinates to top-left for our internal format
          x: cx - r,
          y: cy - r,
          // Convert radius to width/height for our internal format
          width: r * 2,
          height: r * 2,
          fill: circle.getAttribute('fill') || '#ffffff',
          stroke: circle.getAttribute('stroke') || '#000000',
          strokeWidth: parseFloat(circle.getAttribute('stroke-width') || '1'),
          opacity: parseFloat(circle.getAttribute('opacity') || '1'),
          transform: circle.getAttribute('transform') || undefined,
        });
      });
      
      // Process path elements
      const paths = svgElement.querySelectorAll('path');
      paths.forEach(path => {
        // For paths, we need to calculate bounding box
        // This is simplified and not perfect for all paths
        const d = path.getAttribute('d') || '';
        const bbox = path.getBBox(); // Will only work in browser environment
        
        elements.push({
          id: path.id || uuidv4(),
          type: 'path',
          x: bbox.x,
          y: bbox.y,
          width: bbox.width,
          height: bbox.height,
          d: d,
          fill: path.getAttribute('fill') || '#ffffff',
          stroke: path.getAttribute('stroke') || '#000000',
          strokeWidth: parseFloat(path.getAttribute('stroke-width') || '1'),
          opacity: parseFloat(path.getAttribute('opacity') || '1'),
          transform: path.getAttribute('transform') || undefined,
        });
      });
      
      // Process text elements
      const texts = svgElement.querySelectorAll('text');
      texts.forEach(text => {
        const fontSizeAttr = text.getAttribute('font-size');
        const fontSize = fontSizeAttr 
          ? parseInt(fontSizeAttr.replace('px', '')) 
          : 16;
        
        elements.push({
          id: text.id || uuidv4(),
          type: 'text',
          x: parseFloat(text.getAttribute('x') || '0'),
          y: parseFloat(text.getAttribute('y') || '0'),
          width: 100, // Placeholder, as text doesn't have explicit width/height
          height: fontSize * 1.2, // Rough height estimate based on font size
          text: text.textContent || '',
          fill: text.getAttribute('fill') || '#000000',
          stroke: text.getAttribute('stroke') || 'none',
          strokeWidth: parseFloat(text.getAttribute('stroke-width') || '0'),
          fontSize: fontSize,
          fontFamily: text.getAttribute('font-family') || 'Arial',
          opacity: parseFloat(text.getAttribute('opacity') || '1'),
          transform: text.getAttribute('transform') || undefined,
        });
      });
      
      return elements;
    } catch (error) {
      console.error('Error parsing SVG:', error);
      throw error;
    }
  }, []);
  
  return {
    parseSvgCode,
  };
}

export default useSvgParser; 