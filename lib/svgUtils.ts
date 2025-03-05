import { SVGElement } from '@/types/editor';

/**
 * Converts SVG elements to a downloadable SVG file
 */
export function generateSvgFile(elements: SVGElement[], width = 800, height = 600, background = 'white'): string {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  
  // Add background
  if (background && background !== 'transparent' && background !== 'none') {
    svg += `<rect width="100%" height="100%" fill="${background}" />`;
  }
  
  // Add elements
  elements.forEach(element => {
    switch (element.type) {
      case 'rect':
        svg += `<rect x="${element.x}" y="${element.y}" width="${element.width}" height="${element.height}" fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" />`;
        break;
      case 'circle':
        const cx = element.x + (element.width / 2);
        const cy = element.y + (element.height / 2);
        const r = Math.min(element.width, element.height) / 2;
        svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" />`;
        break;
      case 'path':
        svg += `<path d="${element.d || ''}" fill="${element.fill}" stroke="${element.stroke}" stroke-width="${element.strokeWidth}" />`;
        break;
      case 'text':
        svg += `<text x="${element.x}" y="${element.y}" fill="${element.fill}" font-size="${element.fontSize || 16}px" font-family="${element.fontFamily || 'Arial'}">${element.text || 'Text'}</text>`;
        break;
    }
  });
  
  svg += '</svg>';
  return svg;
}

/**
 * Converts SVG to a data URL for download or preview
 */
export function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

/**
 * Converts SVG to PNG using canvas
 * Note: This function must be called in a browser environment
 */
export async function svgToPng(svgString: string, width: number, height: number): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => {
        reject(new Error('Failed to load SVG into image'));
      };
      img.src = svgToDataUrl(svgString);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Calculates the bounding box of multiple elements
 */
export function calculateBoundingBox(elements: SVGElement[]): { x: number; y: number; width: number; height: number } {
  if (elements.length === 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }
  
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  
  elements.forEach(element => {
    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, element.x + element.width);
    maxY = Math.max(maxY, element.y + element.height);
  });
  
  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

/**
 * Checks if a point is inside an element
 */
export function isPointInElement(x: number, y: number, element: SVGElement): boolean {
  // Simple bounding box check
  return (
    x >= element.x &&
    x <= element.x + element.width &&
    y >= element.y &&
    y <= element.y + element.height
  );
}

/**
 * Aligns elements based on the specified alignment
 */
export function alignElements(elements: SVGElement[], alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'): SVGElement[] {
  if (elements.length <= 1) return [...elements];
  
  const bbox = calculateBoundingBox(elements);
  
  return elements.map(element => {
    const newElement = { ...element };
    
    switch (alignment) {
      case 'left':
        newElement.x = bbox.x;
        break;
      case 'center':
        newElement.x = bbox.x + (bbox.width / 2) - (element.width / 2);
        break;
      case 'right':
        newElement.x = bbox.x + bbox.width - element.width;
        break;
      case 'top':
        newElement.y = bbox.y;
        break;
      case 'middle':
        newElement.y = bbox.y + (bbox.height / 2) - (element.height / 2);
        break;
      case 'bottom':
        newElement.y = bbox.y + bbox.height - element.height;
        break;
    }
    
    return newElement;
  });
} 