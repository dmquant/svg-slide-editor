import React, { useState } from 'react';
import ColorPicker from './ColorPicker';

interface EnhancedColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const predefinedColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#00ffff', '#ff00ff', '#ffa500', '#800080',
  '#008080', '#a52a2a', '#808080', '#f08080', '#20b2aa',
  '#4682b4', '#32cd32', '#fa8072', '#6a5acd', '#7b68ee',
];

const EnhancedColorPicker: React.FC<EnhancedColorPickerProps> = ({ color, onChange, label }) => {
  const [showPalette, setShowPalette] = useState(false);

  const handleColorSelect = (selectedColor: string) => {
    onChange(selectedColor);
    // Keep palette open for better user experience
  };

  const isTransparent = (color: string) => color === 'transparent' || color === 'none';

  return (
    <div className="relative space-y-2">
      {label && <label className="block text-xs text-gray-600 mb-1">{label}</label>}
      
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="w-6 h-6 rounded border border-gray-300 flex-shrink-0"
          style={{ 
            background: isTransparent(color) 
              ? 'repeating-conic-gradient(#CCCCCC 0% 25%, white 0% 50%) 50% / 8px 8px' 
              : color 
          }}
          title={color}
        />
        <ColorPicker color={color} onChange={onChange} />
      </div>
      
      <button
        type="button"
        onClick={() => setShowPalette(!showPalette)}
        className="text-xs font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
      >
        {showPalette ? 'Hide Color Palette' : 'Show Color Palette'}
      </button>
      
      {showPalette && (
        <div className="border p-3 rounded bg-white shadow-lg mt-2 z-10">
          <div className="grid grid-cols-5 gap-2 mb-2">
            {predefinedColors.map((predefColor) => (
              <button
                key={predefColor}
                type="button"
                onClick={() => handleColorSelect(predefColor)}
                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center"
                style={{ 
                  backgroundColor: predefColor,
                  outline: color === predefColor ? '2px solid #3b82f6' : 'none',
                  outlineOffset: '2px'
                }}
                title={predefColor}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleColorSelect('transparent')}
              className="w-full h-8 rounded border border-gray-300 text-xs flex items-center justify-center"
              style={{ 
                background: 'repeating-conic-gradient(#CCCCCC 0% 25%, white 0% 50%) 50% / 8px 8px',
                outline: color === 'transparent' ? '2px solid #3b82f6' : 'none',
                outlineOffset: '2px'
              }}
              title="Transparent"
            >
              Transparent
            </button>
            <button
              type="button"
              onClick={() => handleColorSelect('none')}
              className="w-full h-8 rounded border border-gray-300 text-xs flex items-center justify-center"
              style={{ 
                background: 'white',
                outline: color === 'none' ? '2px solid #3b82f6' : 'none',
                outlineOffset: '2px'
              }}
              title="None"
            >
              None
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedColorPicker; 