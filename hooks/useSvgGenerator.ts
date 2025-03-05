import { useCallback } from 'react';
import { SVGElement, PathElement, TextElement } from '../types/editor';

interface SvgGeneratorOptions {
  pretty?: boolean;
  width?: number;
  height?: number;
  background?: string;
}

export function useSvgGenerator() {
  // Generate SVG code from elements
  const generateSvgCode = useCallback((elements: SVGElement[], options: SvgGeneratorOptions = {}) => {
    const {
      pretty = false,
      width = 800,
      height = 600,
      background = 'transparent',
    } = options;
    
    // Indentation for pretty printing
    const indent = pretty ? '  ' : '';
    const newline = pretty ? '\n' : '';
    
    // Start the SVG document
    let svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svgCode += newline;
    
    // Add background if not transparent
    if (background !== 'transparent' && background !== 'none') {
      svgCode += `${indent}<rect width="100%" height="100%" fill="${background}" />`;
      svgCode += newline;
    }
    
    // Add all elements
    elements.forEach(element => {
      switch (element.type) {
        case 'rect':
          svgCode += generateRectCode(element, indent);
          break;
        case 'circle':
          svgCode += generateCircleCode(element, indent);
          break;
        case 'path':
          svgCode += generatePathCode(element, indent);
          break;
        case 'text':
          svgCode += generateTextCode(element, indent);
          break;
      }
      svgCode += newline;
    });
    
    // Close the SVG document
    svgCode += '</svg>';
    
    return svgCode;
  }, []);
  
  // Generate rectangle element code
  const generateRectCode = (element: SVGElement, indent: string) => {
    return `${indent}<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" ${generateAdditionalAttributes(element)} />`;
  };
  
  // Generate circle element code
  const generateCircleCode = (element: SVGElement, indent: string) => {
    const cx = element.x + (element.width / 2);
    const cy = element.y + (element.height / 2);
    const r = Math.min(element.width, element.height) / 2;
    
    return `${indent}<circle cx="${cx}" cy="${cy}" r="${r}" fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" ${generateAdditionalAttributes(element)} />`;
  };
  
  // Generate path element code
  const generatePathCode = (element: SVGElement, indent: string) => {
    if (element.type !== 'path') return '';
    
    return `${indent}<path d="${(element as PathElement).d || ''}" fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" ${generateAdditionalAttributes(element)} />`;
  };
  
  // Generate text element code
  const generateTextCode = (element: SVGElement, indent: string) => {
    if (element.type !== 'text') return '';
    
    const textElement = element as TextElement;
    return `${indent}<text x="${element.x}" y="${element.y}" fill="${element.fill}" font-size="${textElement.fontSize || 16}px" font-family="${textElement.fontFamily || 'Arial'}" ${generateAdditionalAttributes(element)}>${textElement.text || 'Text'}</text>`;
  };
  
  // Generate additional attributes (id, transform, etc.)
  const generateAdditionalAttributes = (element: SVGElement) => {
    let attributes = '';
    
    if (element.id) {
      attributes += `id="${element.id}" `;
    }
    
    if (element.opacity !== undefined && element.opacity !== 1) {
      attributes += `opacity="${element.opacity}" `;
    }
    
    if (element.transform) {
      attributes += `transform="${element.transform}" `;
    }
    
    return attributes.trim();
  };
  
  return {
    generateSvgCode,
  };
}

export default useSvgGenerator; 