import { useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SVGElement } from '@/types/editor';

export function useSvgParser() {
  // Parse SVG code and convert to our internal elements format
  const parseSvgCode = useCallback((svgCode: string): SVGElement[] => {
    try {
      // Check for empty SVG content
      if (!svgCode || svgCode.trim() === '') {
        console.error('Empty SVG content provided');
        throw new Error('SVG content is empty');
      }

      // Log only the first part of SVG for debugging
      console.log('Parsing SVG content length:', svgCode.length);
      console.log('SVG content preview:', svgCode.substring(0, 100).replace(/</g, '&lt;') + '...');
      
      const elements: SVGElement[] = [];
      
      // Create a temporary DOM element to parse the SVG
      const parser = new DOMParser();
      let doc;
      
      try {
        doc = parser.parseFromString(svgCode, 'image/svg+xml');
      } catch (parseError) {
        console.error('SVG parsing failed:', parseError);
        throw new Error('Failed to parse SVG: ' + String(parseError));
      }
      
      // Check for parsing errors
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        const errorMessage = parserError.textContent || 'Unknown parsing error';
        console.error('SVG parsing error:', errorMessage);
        throw new Error('Invalid SVG: ' + errorMessage);
      }
      
      // Get the root SVG element
      const svgElement = doc.querySelector('svg');
      if (!svgElement) {
        console.error('No SVG element found in the document');
        throw new Error('No SVG element found');
      }
      
      console.log('SVG element found, extracting child elements');
      
      // Process rect elements
      const rects = svgElement.querySelectorAll('rect');
      console.log(`Found ${rects.length} rect elements`);
      rects.forEach(rect => {
        try {
          // Skip background rect
          if (rect.getAttribute('width') === '100%' && rect.getAttribute('height') === '100%') {
            return;
          }
          
          // Get original SVG element as string
          const originalSvg = new XMLSerializer().serializeToString(rect);
          
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
            originalSvg: originalSvg, // Store original SVG element
          } as SVGElement);
        } catch (rectError) {
          console.warn('Error processing rect element:', rectError);
          // Continue with next element, don't break the entire import
        }
      });
      
      // Process circle elements
      const circles = svgElement.querySelectorAll('circle');
      console.log(`Found ${circles.length} circle elements`);
      circles.forEach(circle => {
        try {
          const cx = parseFloat(circle.getAttribute('cx') || '0');
          const cy = parseFloat(circle.getAttribute('cy') || '0');
          const r = parseFloat(circle.getAttribute('r') || '0');
          
          // Get original SVG element as string
          const originalSvg = new XMLSerializer().serializeToString(circle);
          
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
            originalSvg: originalSvg, // Store original SVG element
          } as SVGElement);
        } catch (circleError) {
          console.warn('Error processing circle element:', circleError);
          // Continue with next element
        }
      });
      
      // Process path elements
      const paths = svgElement.querySelectorAll('path');
      console.log(`Found ${paths.length} path elements`);
      paths.forEach(path => {
        try {
          const d = path.getAttribute('d') || '';
          
          // For paths, we need to manually calculate bounding box
          // since getBBox() only works in browser environment with rendered elements
          // Default values if we can't calculate
          let x = 0;
          let y = 0;
          let width = 100;
          let height = 100;
          
          try {
            // Try to get bbox if the element is in the DOM
            const bbox = path.getBBox();
            x = bbox.x;
            y = bbox.y;
            width = bbox.width || 100;
            height = bbox.height || 100;
          } catch (bboxErr) {
            console.warn('Could not get path bounding box, using default values', bboxErr);
          }
          
          // Get original SVG element as string
          const originalSvg = new XMLSerializer().serializeToString(path);
          
          elements.push({
            id: path.id || uuidv4(),
            type: 'path',
            x: x,
            y: y,
            width: width,
            height: height,
            d: d,
            fill: path.getAttribute('fill') || '#ffffff',
            stroke: path.getAttribute('stroke') || '#000000',
            strokeWidth: parseFloat(path.getAttribute('stroke-width') || '1'),
            opacity: parseFloat(path.getAttribute('opacity') || '1'),
            transform: path.getAttribute('transform') || undefined,
            originalSvg: originalSvg, // Store original SVG element
          } as SVGElement);
        } catch (pathError) {
          console.warn('Error processing path element:', pathError);
          // Continue with next element
        }
      });
      
      // Process text elements
      const texts = svgElement.querySelectorAll('text');
      console.log(`Found ${texts.length} text elements`);
      texts.forEach(text => {
        try {
          const fontSizeAttr = text.getAttribute('font-size');
          const fontSize = fontSizeAttr 
            ? parseInt(fontSizeAttr.replace('px', '')) 
            : 16;
          
          // Get original SVG element as string
          const originalSvg = new XMLSerializer().serializeToString(text);
          
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
            originalSvg: originalSvg, // Store original SVG element
          } as SVGElement);
        } catch (textError) {
          console.warn('Error processing text element:', textError);
          // Continue with next element
        }
      });
      
      console.log(`Successfully extracted ${elements.length} elements from SVG`);
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