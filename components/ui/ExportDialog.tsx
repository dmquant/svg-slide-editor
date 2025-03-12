'use client';

import { useState } from 'react';
import { useSvgGenerator } from '@/hooks/useSvgGenerator';
import { useSvgExporter } from '@/hooks/useSvgExporter';
import { SVGElement } from '@/types/editor';

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  elements: SVGElement[];
  title?: string;
}

const ExportDialog: React.FC<ExportDialogProps> = ({ 
  isOpen, 
  onClose, 
  elements,
  title = 'Slide'
}) => {
  const [format, setFormat] = useState<'svg' | 'png' | 'jpg'>('svg');
  const [quality, setQuality] = useState(90);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [exportStatus, setExportStatus] = useState<'idle' | 'exporting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  
  const { generateSvgCode } = useSvgGenerator();
  const { svgToPng, svgToJpg, downloadDataUrl } = useSvgExporter();

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setExportStatus('exporting');
      setError(null);
      
      // Generate SVG code
      const svgCode = generateSvgCode(elements, {
        pretty: true,
        width,
        height,
        background: 'white',
      });
      
      let dataUrl: string;
      let filename: string;
      
      // Export in selected format
      switch (format) {
        case 'svg':
          dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgCode);
          filename = `${title.replace(/\s+/g, '-').toLowerCase()}.svg`;
          break;
          
        case 'png':
          dataUrl = await svgToPng(svgCode, width, height);
          filename = `${title.replace(/\s+/g, '-').toLowerCase()}.png`;
          break;
          
        case 'jpg':
          dataUrl = await svgToJpg(svgCode, width, height, quality / 100);
          filename = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
          break;
          
        default:
          throw new Error(`Unsupported format: ${format}`);
      }
      
      // Download the file
      downloadDataUrl(dataUrl, filename);
      setExportStatus('success');
      
      // Auto-close after successful export
      setTimeout(() => {
        onClose();
        setExportStatus('idle');
      }, 1500);
      
    } catch (err) {
      setError('Export failed: ' + (err instanceof Error ? err.message : String(err)));
      setExportStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Export SVG</h2>
        
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Export Format
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  value="svg"
                  checked={format === 'svg'}
                  onChange={() => setFormat('svg')}
                />
                <span className="ml-2">SVG</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  value="png"
                  checked={format === 'png'}
                  onChange={() => setFormat('png')}
                />
                <span className="ml-2">PNG</span>
              </label>
              
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  value="jpg"
                  checked={format === 'jpg'}
                  onChange={() => setFormat('jpg')}
                />
                <span className="ml-2">JPG</span>
              </label>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Width (px)
              </label>
              <input
                type="number"
                min="1"
                value={width}
                onChange={(e) => setWidth(Math.max(1, parseInt(e.target.value) || 1))}
                className="block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Height (px)
              </label>
              <input
                type="number"
                min="1"
                value={height}
                onChange={(e) => setHeight(Math.max(1, parseInt(e.target.value) || 1))}
                className="block w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
          </div>
          
          {format === 'jpg' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="block w-full"
              />
            </div>
          )}
        </div>
        
        {error && (
          <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        {exportStatus === 'success' && (
          <div className="text-green-500 mb-4 p-2 bg-green-50 rounded flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Export completed successfully!
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            disabled={exportStatus === 'exporting'}
          >
            Cancel
          </button>
          
          <button
            onClick={handleExport}
            disabled={exportStatus === 'exporting'}
            className={`px-4 py-2 rounded transition-colors ${
              exportStatus === 'exporting'
                ? 'bg-blue-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {exportStatus === 'exporting' ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportDialog; 