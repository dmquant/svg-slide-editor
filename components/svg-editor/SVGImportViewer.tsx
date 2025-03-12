'use client';

import React, { useState, useRef, useEffect } from 'react';

interface SVGViewerProps {
  className?: string;
}

const SVGImportViewer: React.FC<SVGViewerProps> = ({ className = '' }) => {
  const [svgCode, setSvgCode] = useState<string>('');
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [exportWidth, setExportWidth] = useState<number>(800);
  const [exportHeight, setExportHeight] = useState<number>(600);
  const [backgroundColor, setBackgroundColor] = useState<string>('#ffffff');
  const [imageType, setImageType] = useState<'png' | 'jpeg'>('png');
  const [viewBox, setViewBox] = useState<string | null>(null);
  const [originalSvgDimensions, setOriginalSvgDimensions] = useState<{width: number, height: number} | null>(null);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Example SVG for easy testing
  const exampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" stroke="black" stroke-width="2" fill="red" />
  <rect x="30" y="30" width="40" height="40" stroke="blue" stroke-width="2" fill="none" />
</svg>`;

  // Update preview when SVG code changes
  useEffect(() => {
    if (svgCode.trim()) {
      try {
        // Basic validation
        if (!svgCode.includes('<svg')) {
          throw new Error('Invalid SVG: Missing <svg> tag');
        }
        
        // Parse the SVG to extract viewBox and dimensions
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgCode, 'image/svg+xml');
        const svgElement = doc.querySelector('svg');
        
        if (svgElement) {
          // Extract viewBox
          const extractedViewBox = svgElement.getAttribute('viewBox');
          if (extractedViewBox) {
            setViewBox(extractedViewBox);
          }
          
          // Extract width and height
          let width = svgElement.getAttribute('width');
          let height = svgElement.getAttribute('height');
          
          // Convert from string to number, handle units like px, em, etc.
          if (width && height) {
            width = width.replace(/[^0-9.]/g, '');
            height = height.replace(/[^0-9.]/g, '');
            
            const numWidth = parseFloat(width);
            const numHeight = parseFloat(height);
            
            if (!isNaN(numWidth) && !isNaN(numHeight)) {
              setOriginalSvgDimensions({
                width: numWidth,
                height: numHeight
              });
              
              // Update export dimensions if they haven't been changed by user
              if (exportWidth === 800 && exportHeight === 600) {
                setExportWidth(numWidth);
                setExportHeight(numHeight);
              }
            }
          }
        }
        
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    }
  }, [svgCode, exportWidth, exportHeight]);

  // Load example SVG
  const loadExample = () => {
    setSvgCode(exampleSvg);
    setFileName('example.svg');
    setSvgFile(null);
  };

  // Clear the input
  const clearSvg = () => {
    setSvgCode('');
    setFileName('');
    setSvgFile(null);
    setViewBox(null);
    setOriginalSvgDimensions(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.includes('svg+xml') && !file.name.endsWith('.svg')) {
      setError('Please select a valid SVG file');
      return;
    }
    
    setSvgFile(file);
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        // Validate content
        if (!content || !content.includes('<svg')) {
          throw new Error('Invalid SVG file: Missing <svg> tag');
        }
        
        setSvgCode(content);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read the file');
    };
    
    reader.readAsText(file);
  };

  // Trigger file input click
  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('bg-blue-50', 'border-blue-300');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('bg-blue-50', 'border-blue-300');
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.includes('svg+xml') && !file.name.endsWith('.svg')) {
      setError('Please drop a valid SVG file');
      return;
    }
    
    setSvgFile(file);
    setFileName(file.name);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        
        // Validate content
        if (!content || !content.includes('<svg')) {
          throw new Error('Invalid SVG file: Missing <svg> tag');
        }
        
        setSvgCode(content);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read the file');
    };
    
    reader.readAsText(file);
  };

  // Export the SVG as an image
  const exportImage = () => {
    if (!svgCode) {
      setError('No SVG to export');
      return;
    }

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        setError('Could not initialize canvas context');
        return;
      }
      
      // Set canvas dimensions
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create a temporary SVG image
      const img = new Image();
      const blob = new Blob([svgCode], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      img.onload = () => {
        // Calculate scaling to fit the canvas while maintaining aspect ratio
        const imgWidth = img.width || (originalSvgDimensions?.width || 300);
        const imgHeight = img.height || (originalSvgDimensions?.height || 200);
        
        const scaleX = canvas.width / imgWidth;
        const scaleY = canvas.height / imgHeight;
        const scale = Math.min(scaleX, scaleY);
        
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;
        
        // Center the image on the canvas
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;
        
        // Draw the SVG on the canvas
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Convert canvas to image
        const imgData = canvas.toDataURL(`image/${imageType}`);
        
        // Create download link
        const link = document.createElement('a');
        const outputFileName = fileName ? 
          fileName.replace('.svg', `.${imageType}`) : 
          `svg-export.${imageType}`;
          
        link.download = outputFileName;
        link.href = imgData;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
      };
      
      img.onerror = (err) => {
        setError(`Failed to load SVG image: ${err}`);
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (err) {
      setError(`Export failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  return (
    <div className={`flex flex-col w-full max-w-4xl mx-auto p-4 gap-6 ${className}`}>
      <h1 className="text-2xl font-bold text-center">SVG Viewer and Exporter</h1>
      
      {/* Import Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Import SVG</h2>
          <div className="flex gap-2">
            <button 
              onClick={openFileInput}
              className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Import SVG File
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              className="hidden"
              onChange={handleFileChange}
            />
            <button 
              onClick={loadExample} 
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Load Example
            </button>
            <button 
              onClick={clearSvg} 
              className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Clear
            </button>
          </div>
        </div>
        
        {/* File name display */}
        {fileName && (
          <div className="text-sm font-medium text-gray-700 mb-2">
            File: {fileName}
            {originalSvgDimensions && (
              <span className="ml-2 text-gray-500">
                ({originalSvgDimensions.width}×{originalSvgDimensions.height})
              </span>
            )}
          </div>
        )}
        
        {/* Drag and drop area */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-colors"
          onClick={openFileInput}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {svgFile ? (
            <div className="text-green-600">
              <p className="font-semibold">{fileName}</p>
              <p className="mt-1 text-sm text-gray-500">SVG file loaded</p>
            </div>
          ) : (
            <div>
              <p className="text-gray-500">Drag & drop an SVG file here or click to upload</p>
            </div>
          )}
        </div>
        
        {/* Error display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>
      
      {/* Code Editor */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">SVG Code</h2>
        <textarea 
          value={svgCode} 
          onChange={(e) => setSvgCode(e.target.value)} 
          className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm"
          placeholder="Paste your SVG code here or import a file..."
        />
      </div>
      
      {/* Preview Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Preview</h2>
        <div 
          ref={previewRef}
          className="w-full h-80 flex items-center justify-center border border-gray-300 rounded bg-white p-4 overflow-auto"
        >
          {svgCode ? (
            <div 
              dangerouslySetInnerHTML={{ __html: svgCode }}
              className="max-w-full max-h-full"
            />
          ) : (
            <p className="text-gray-400">SVG preview will appear here</p>
          )}
        </div>
      </div>
      
      {/* Export Options Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Export Options</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Width (px)</label>
            <input 
              type="number" 
              value={exportWidth}
              onChange={(e) => setExportWidth(Math.max(1, Number(e.target.value)))}
              className="p-2 border border-gray-300 rounded"
              min="1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Height (px)</label>
            <input 
              type="number" 
              value={exportHeight}
              onChange={(e) => setExportHeight(Math.max(1, Number(e.target.value)))}
              className="p-2 border border-gray-300 rounded"
              min="1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Background Color</label>
            <div className="flex gap-2">
              <input 
                type="color" 
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="p-1 border border-gray-300 rounded h-10 w-10"
              />
              <input 
                type="text" 
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="p-2 border border-gray-300 rounded flex-1"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Image Type</label>
            <select 
              value={imageType}
              onChange={(e) => setImageType(e.target.value as 'png' | 'jpeg')}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={exportImage}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!svgCode}
        >
          Export as Image
        </button>
      </div>
      
      {/* Hidden canvas for image export */}
      <canvas 
        ref={canvasRef}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default SVGImportViewer; 