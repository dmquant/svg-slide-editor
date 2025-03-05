'use client';

import React from 'react';
import { SVGElement } from '@/types/editor';
import ColorPicker from '../ui/ColorPicker';
import Dropdown from '../ui/Dropdown';

interface ElementPropertiesProps {
  selectedElement: SVGElement | null;
  onUpdateElement: (updatedElement: SVGElement) => void;
}

const ElementProperties: React.FC<ElementPropertiesProps> = ({
  selectedElement,
  onUpdateElement,
}) => {
  if (!selectedElement) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 italic p-4 text-center">
        Select an element to edit its properties
      </div>
    );
  }

  const handleChange = (property: string, value: any) => {
    onUpdateElement({
      ...selectedElement,
      [property]: value,
    });
  };

  const renderCommonProperties = () => (
    <>
      <div className="space-y-4 mb-6">
        <h3 className="font-medium border-b pb-1">Position & Size</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">X</label>
            <input
              type="number"
              value={selectedElement.x}
              onChange={(e) => handleChange('x', Number(e.target.value))}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Y</label>
            <input
              type="number"
              value={selectedElement.y}
              onChange={(e) => handleChange('y', Number(e.target.value))}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="number"
              value={selectedElement.width}
              onChange={(e) => handleChange('width', Number(e.target.value))}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Height</label>
            <input
              type="number"
              value={selectedElement.height}
              onChange={(e) => handleChange('height', Number(e.target.value))}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="font-medium border-b pb-1">Style</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Fill</label>
            <ColorPicker
              color={selectedElement.fill}
              onChange={(color) => handleChange('fill', color)}
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Stroke</label>
            <ColorPicker
              color={selectedElement.stroke}
              onChange={(color) => handleChange('stroke', color)}
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Stroke Width</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={selectedElement.strokeWidth}
              onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
              className="w-full p-1 border rounded text-sm"
            />
          </div>
        </div>
      </div>
    </>
  );

  const renderSpecificProperties = () => {
    switch (selectedElement.type) {
      case 'text':
        return (
          <div className="space-y-4 mb-6">
            <h3 className="font-medium border-b pb-1">Text Properties</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Text Content</label>
                <input
                  type="text"
                  value={selectedElement.text || ''}
                  onChange={(e) => handleChange('text', e.target.value)}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                <input
                  type="number"
                  min="8"
                  value={selectedElement.fontSize || 16}
                  onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                  className="w-full p-1 border rounded text-sm"
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-600 mb-1">Font Family</label>
                <Dropdown
                  options={[
                    { value: 'Arial', label: 'Arial' },
                    { value: 'Helvetica', label: 'Helvetica' },
                    { value: 'Times New Roman', label: 'Times New Roman' },
                    { value: 'Courier New', label: 'Courier New' },
                    { value: 'Georgia', label: 'Georgia' },
                  ]}
                  value={selectedElement.fontFamily || 'Arial'}
                  onChange={(value) => handleChange('fontFamily', value)}
                />
              </div>
            </div>
          </div>
        );
      case 'path':
        return (
          <div className="space-y-4 mb-6">
            <h3 className="font-medium border-b pb-1">Path Properties</h3>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Path Data</label>
              <textarea
                value={selectedElement.d || ''}
                onChange={(e) => handleChange('d', e.target.value)}
                className="w-full p-1 border rounded text-sm font-mono h-24"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold">
          {selectedElement.type.charAt(0).toUpperCase() + selectedElement.type.slice(1)} Properties
        </h2>
        <span className="text-xs bg-gray-200 px-2 py-1 rounded">ID: {selectedElement.id}</span>
      </div>
      
      {renderCommonProperties()}
      {renderSpecificProperties()}
    </div>
  );
};

export default ElementProperties; 