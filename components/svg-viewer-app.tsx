import React, { useState, useRef, useEffect } from 'react';

const SVGViewer = () => {
  const [svgCode, setSvgCode] = useState('');
  const [previewSvg, setPreviewSvg] = useState('');
  const [error, setError] = useState('');
  const [exportWidth, setExportWidth] = useState(800);
  const [exportHeight, setExportHeight] = useState(600);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [imageType, setImageType] = useState('png');
  const previewRef = useRef(null);
  const canvasRef = useRef(null);

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
        setPreviewSvg(svgCode);
        setError('');
      } catch (err) {
        setError(err.message);
      }
    } else {
      setPreviewSvg('');
    }
  }, [svgCode]);

  // Load example SVG
  const loadExample = () => {
    setSvgCode(exampleSvg);
  };

  // Clear the input
  const clearSvg = () => {
    setSvgCode('');
    setPreviewSvg('');
  };

  // Export the SVG as an image
  const exportImage = () => {
    if (!previewSvg) {
      setError('No SVG to export');
      return;
    }

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions
      canvas.width = exportWidth;
      canvas.height = exportHeight;
      
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Create a temporary SVG image
      const img = new Image();
      const svg = new Blob([previewSvg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svg);
      
      img.onload = () => {
        // Calculate scaling to fit the canvas while maintaining aspect ratio
        const svgWidth = img.width || 300;
        const svgHeight = img.height || 200;
        
        const scale = Math.min(
          canvas.width / svgWidth,
          canvas.height / svgHeight
        );
        
        const scaledWidth = svgWidth * scale;
        const scaledHeight = svgHeight * scale;
        
        // Center the image on the canvas
        const x = (canvas.width - scaledWidth) / 2;
        const y = (canvas.height - scaledHeight) / 2;
        
        // Draw the SVG on the canvas
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Convert canvas to image
        const imgData = canvas.toDataURL(`image/${imageType}`);
        
        // Create download link
        const link = document.createElement('a');
        link.download = `exported-svg.${imageType}`;
        link.href = imgData;
        link.click();
        
        // Clean up
        URL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (err) {
      setError(`Export failed: ${err.message}`);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto p-4 gap-6">
      <h1 className="text-2xl font-bold text-center">SVG Viewer and Exporter</h1>
      
      {/* Input Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">SVG Code</h2>
          <div className="flex gap-2">
            <button 
              onClick={loadExample} 
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Load Example
            </button>
            <button 
              onClick={clearSvg} 
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Clear
            </button>
          </div>
        </div>
        
        <textarea 
          value={svgCode} 
          onChange={(e) => setSvgCode(e.target.value)} 
          className="w-full h-64 p-2 border border-gray-300 rounded font-mono text-sm"
          placeholder="Paste your SVG code here..."
        />
      </div>
      
      {/* Preview Section */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Preview</h2>
        {error && (
          <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <div 
          ref={previewRef}
          className="w-full h-64 flex items-center justify-center border border-gray-300 rounded bg-white overflow-auto"
          dangerouslySetInnerHTML={{ __html: previewSvg }}
        />
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
              onChange={(e) => setExportWidth(Number(e.target.value))}
              className="p-2 border border-gray-300 rounded"
              min="1"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-medium">Height (px)</label>
            <input 
              type="number" 
              value={exportHeight}
              onChange={(e) => setExportHeight(Number(e.target.value))}
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
              onChange={(e) => setImageType(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="png">PNG</option>
              <option value="jpeg">JPEG</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={exportImage}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 font-medium mt-2"
          disabled={!previewSvg}
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

export default SVGViewer;
