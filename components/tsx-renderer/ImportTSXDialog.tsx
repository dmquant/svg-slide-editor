'use client';

import React, { useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface ImportTSXDialogProps {
  onClose: () => void;
  onImport: (content: string) => void;
}

const ImportTSXDialog: React.FC<ImportTSXDialogProps> = ({ onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = useCallback((selectedFile: File) => {
    // Check file extension
    if (!selectedFile.name.endsWith('.tsx') && !selectedFile.name.endsWith('.jsx')) {
      setError('Only .tsx or .jsx files are supported');
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Read file content
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
    };
    reader.onerror = () => {
      setError('Failed to read file');
    };
    reader.readAsText(selectedFile);
  }, []);

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  }, [handleFileChange]);

  // Handle file input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  }, [handleFileChange]);

  // Import file content
  const handleImport = useCallback(() => {
    if (fileContent) {
      onImport(fileContent);
    }
  }, [fileContent, onImport]);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-gray-800 text-white p-3 flex justify-between items-center">
          <h3 className="font-medium">Import TSX File</h3>
          <button 
            className="text-gray-300 hover:text-white"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
        
        <div className="p-5">
          {error && (
            <div className="mb-4 p-2 bg-red-100 border-l-4 border-red-500 text-red-700">
              {error}
            </div>
          )}
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 mb-4 text-center ${
              dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="mb-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-gray-600 mb-1">
              <span className="text-sm font-medium">
                Drag & drop a TSX file here
              </span>
            </p>
            <p className="text-gray-500 text-xs mb-3">or</p>
            <button
              type="button"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".tsx,.jsx"
              onChange={handleInputChange}
              className="hidden"
            />
          </div>
          
          {file && (
            <div className="mb-4 py-3 px-4 bg-gray-100 rounded flex justify-between items-center">
              <div>
                <div className="font-medium">{file.name}</div>
                <div className="text-gray-500 text-xs">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => {
                  setFile(null);
                  setFileContent('');
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={handleImport}
              disabled={!fileContent}
            >
              {fileContent ? 'Import' : 'Select a file'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportTSXDialog; 