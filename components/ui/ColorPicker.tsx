import React, { useState, useRef, useEffect } from 'react';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
}

const predefinedColors = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#00ffff', '#ff00ff', '#c0c0c0', '#808080',
  '#800000', '#808000', '#008000', '#800080', '#008080',
  '#000080', '#ffa500', '#a52a2a', '#f08080', '#20b2aa',
];

const ColorPicker: React.FC<ColorPickerProps> = ({ color, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close the color picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handlePredefinedColorClick = (selectedColor: string) => {
    onChange(selectedColor);
    setIsOpen(false);
  };

  // Check if color is transparent or none
  const isTransparent = color === 'transparent' || color === 'none';

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
          style={{ 
            background: isTransparent 
              ? 'repeating-conic-gradient(#CCCCCC 0% 25%, white 0% 50%) 50% / 8px 8px' 
              : color 
          }}
          title={color}
        >
          {isTransparent && <span className="text-red-500 text-xs font-bold">/</span>}
        </button>
        
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 p-1 text-sm border rounded"
        />
        
        <input 
          type="color"
          value={isTransparent ? '#ffffff' : color}
          onChange={handleColorChange}
          className="w-6 h-6 rounded cursor-pointer"
          disabled={isTransparent}
        />
      </div>

      {isOpen && (
        <div 
          ref={popoverRef}
          className="absolute left-0 top-full mt-2 p-2 bg-white rounded shadow-lg z-10 w-48"
        >
          <div className="grid grid-cols-5 gap-2 mb-2">
            {predefinedColors.map((predefColor) => (
              <button
                key={predefColor}
                type="button"
                onClick={() => handlePredefinedColorClick(predefColor)}
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: predefColor }}
                title={predefColor}
              />
            ))}
          </div>
          
          <div className="space-y-2 border-t pt-2">
            <button
              type="button"
              onClick={() => handlePredefinedColorClick('transparent')}
              className="w-full text-xs py-1 text-left"
            >
              Transparent
            </button>
            <button
              type="button"
              onClick={() => handlePredefinedColorClick('none')}
              className="w-full text-xs py-1 text-left"
            >
              None
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPicker; 