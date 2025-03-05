import React from 'react';
import Button from '../ui/Button';

interface HeaderProps {
  onSave: () => void;
  onExport: () => void;
  onImport: () => void;
  onNew: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSave,
  onExport,
  onImport,
  onNew,
}) => {
  return (
    <header className="bg-white border-b px-4 py-2 flex items-center justify-between">
      <div className="flex items-center">
        <div className="font-semibold text-lg mr-4">SVG Slide Editor</div>
        
        <nav className="flex space-x-4">
          <button 
            className="text-sm text-gray-700 hover:text-gray-900"
            onClick={onNew}
          >
            New
          </button>
          <button 
            className="text-sm text-gray-700 hover:text-gray-900"
            onClick={onSave}
          >
            Save
          </button>
          <button 
            className="text-sm text-gray-700 hover:text-gray-900"
            onClick={onImport}
          >
            Import
          </button>
          <button 
            className="text-sm text-gray-700 hover:text-gray-900"
            onClick={onExport}
          >
            Export
          </button>
        </nav>
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center text-gray-600">
          <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
        </div>
        
        <Button 
          variant="primary"
          size="sm"
          onClick={onExport}
        >
          Present
        </Button>
      </div>
    </header>
  );
};

export default Header; 