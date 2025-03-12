'use client';

import { useState, useRef, useEffect } from 'react';
import { useSvgParser } from '@/hooks/useSvgParser';

interface ImportSvgDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (svgElements: any[]) => void;
}

const ImportSvgDialog: React.FC<ImportSvgDialogProps> = ({ 
  isOpen, 
  onClose, 
  onImport 
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parseSvgCode } = useSvgParser();

  // Reset state when dialog is opened/closed
  useEffect(() => {
    if (isOpen) {
      // Reset state when dialog opens
      setError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Reset previous errors
      setError(null);
      
      // Validate file type
      if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
        setError('Selected file is not a valid SVG. Please select a .svg file.');
        return;
      }
      
      setFileName(file.name);
      readSvgFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate file type
      if (file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg')) {
        setError('Dropped file is not a valid SVG. Please drop a .svg file.');
        return;
      }
      
      setFileName(file.name);
      readSvgFile(file);
    } else {
      setError('Please drop a valid SVG file.');
    }
  };

  const readSvgFile = (file: File) => {
    setIsLoading(true);
    setError(null);
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const svgContent = e.target?.result as string;
        
        // Validate the SVG content is not empty
        if (!svgContent || svgContent.trim() === '') {
          setError('The SVG file appears to be empty. Please select a valid SVG file.');
          setIsLoading(false);
          return;
        }
        
        // Basic validation to check if it looks like an SVG
        if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
          setError('The file does not appear to be a valid SVG. Please select a valid SVG file.');
          setIsLoading(false);
          return;
        }
        
        console.log('SVG content loaded, length:', svgContent.length);
        setFileContent(svgContent);
        setIsLoading(false);
      } catch (err) {
        console.error('Error reading file:', err);
        setError('Failed to read the file: ' + (err instanceof Error ? err.message : String(err)));
        setIsLoading(false);
      }
    };
    
    reader.onerror = (e) => {
      console.error('FileReader error:', e);
      setError('Failed to read the file. The file might be corrupted.');
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!fileContent) {
      setError('No SVG content to import.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Use a timeout to prevent UI freeze and allow state updates
    setTimeout(() => {
      try {
        console.log('Parsing SVG content for import...');
        
        // Pre-process the SVG content to ensure it's valid
        let processedContent = fileContent.trim();
        
        // Parse SVG
        const elements = parseSvgCode(processedContent);
        console.log('Successfully parsed SVG, element count:', elements.length);
        
        if (elements.length === 0) {
          setError('No elements found in the SVG file. The file might be empty or not contain supported elements (rect, circle, path, text).');
          setIsLoading(false);
          return;
        }
        
        // Call the import handler
        onImport(elements);
        
        // Reset state and close dialog
        setFileName(null);
        setFileContent(null);
        setIsLoading(false);
        onClose();
      } catch (err) {
        console.error('Error parsing SVG:', err);
        setError('Failed to parse SVG: ' + (err instanceof Error ? err.message : String(err)));
        setIsLoading(false);
      }
    }, 100); // Small delay to allow UI to update
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Import SVG</h2>
        
        <div 
          className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {fileName ? (
            <div className="text-green-600">
              <p className="mb-2 font-medium">Selected File:</p>
              <p>{fileName}</p>
              {fileContent && (
                <p className="mt-2 text-sm text-gray-600">
                  SVG content loaded ({fileContent.length} bytes)
                </p>
              )}
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-2">
                Drag and drop your SVG file here, or
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={isLoading}
              >
                Browse Files
              </button>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".svg,image/svg+xml"
            onChange={handleFileChange}
          />
        </div>
        
        {error && (
          <div className="text-red-500 mb-4 p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 rounded hover:bg-gray-100 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
          {fileName && fileContent && !isLoading && (
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Import
            </button>
          )}
          {isLoading && (
            <button
              disabled
              className="px-4 py-2 bg-blue-400 text-white rounded cursor-not-allowed"
            >
              <span className="inline-block mr-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Importing...
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportSvgDialog; 