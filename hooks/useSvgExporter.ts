import { useCallback } from 'react';

export function useSvgExporter() {
  // Convert SVG to PNG
  const svgToPng = useCallback(async (svgCode: string, width: number = 800, height: number = 600): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        
        if (!context) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Create an SVG Blob
        const blob = new Blob([svgCode], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        // Create an image to render the SVG
        const img = new Image();
        img.onload = () => {
          // Fill white background (optional)
          context.fillStyle = 'white';
          context.fillRect(0, 0, width, height);
          
          // Draw the SVG on the canvas
          context.drawImage(img, 0, 0, width, height);
          
          // Convert to PNG
          const pngUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(pngUrl);
        };
        
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image: ' + e));
        };
        
        // Set the source of the image to the SVG Blob URL
        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  }, []);
  
  // Convert SVG to JPG
  const svgToJpg = useCallback(async (svgCode: string, width: number = 800, height: number = 600, quality: number = 0.9): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Create a canvas element
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');
        
        if (!context) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Create an SVG Blob
        const blob = new Blob([svgCode], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        
        // Create an image to render the SVG
        const img = new Image();
        img.onload = () => {
          // Fill white background
          context.fillStyle = 'white';
          context.fillRect(0, 0, width, height);
          
          // Draw the SVG on the canvas
          context.drawImage(img, 0, 0, width, height);
          
          // Convert to JPG
          const jpgUrl = canvas.toDataURL('image/jpeg', quality);
          URL.revokeObjectURL(url);
          resolve(jpgUrl);
        };
        
        img.onerror = (e) => {
          URL.revokeObjectURL(url);
          reject(new Error('Failed to load SVG image: ' + e));
        };
        
        // Set the source of the image to the SVG Blob URL
        img.src = url;
      } catch (error) {
        reject(error);
      }
    });
  }, []);
  
  // Download a data URL as a file
  const downloadDataUrl = useCallback((dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);
  
  return {
    svgToPng,
    svgToJpg,
    downloadDataUrl,
  };
}

export default useSvgExporter; 