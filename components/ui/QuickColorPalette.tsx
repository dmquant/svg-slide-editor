import React, { useState, useRef, useEffect } from 'react';

interface QuickColorPaletteProps {
  onSelectFill: (color: string) => void;
  onSelectStroke: (color: string) => void;
  currentFill: string;
  currentStroke: string;
}

const colorOptions = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#00ffff', '#ff00ff', '#ffa500', '#800080',
  '#008080', '#a52a2a', '#808080', '#f08080', '#20b2aa',
  '#4682b4', '#32cd32', '#fa8072', '#6a5acd', '#7b68ee',
  'transparent'
];

const QuickColorPalette: React.FC<QuickColorPaletteProps> = ({
  onSelectFill,
  onSelectStroke,
  currentFill,
  currentStroke
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'fill' | 'stroke'>('fill');
  const paletteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(event.target as Node)) {
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

  const handleColorSelect = (color: string) => {
    if (activeTab === 'fill') {
      onSelectFill(color);
    } else {
      onSelectStroke(color);
    }
  };

  const isTransparent = (color: string) => color === 'transparent' || color === 'none';

  return (
    <div className="absolute bottom-4 right-4 z-10" ref={paletteRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
        title="Color Palette"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-12 right-0 bg-white rounded-lg shadow-xl p-3 w-64">
          <div className="flex border-b mb-2">
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'fill' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('fill')}
            >
              Fill
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${activeTab === 'stroke' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
              onClick={() => setActiveTab('stroke')}
            >
              Stroke
            </button>
          </div>

          <div className="mb-2 flex items-center">
            <span className="text-sm mr-2">Current:</span>
            <div 
              className="w-6 h-6 rounded border border-gray-300"
              style={{ 
                background: isTransparent(activeTab === 'fill' ? currentFill : currentStroke) 
                  ? 'repeating-conic-gradient(#CCCCCC 0% 25%, white 0% 50%) 50% / 8px 8px' 
                  : (activeTab === 'fill' ? currentFill : currentStroke) 
              }}
            />
            <span className="ml-2 text-xs text-gray-500">
              {activeTab === 'fill' ? currentFill : currentStroke}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {colorOptions.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center overflow-hidden"
                style={{ 
                  background: isTransparent(color) 
                    ? 'repeating-conic-gradient(#CCCCCC 0% 25%, white 0% 50%) 50% / 8px 8px' 
                    : color,
                  outline: (activeTab === 'fill' && color === currentFill) || 
                          (activeTab === 'stroke' && color === currentStroke) 
                            ? '2px solid #3b82f6' : 'none',
                  outlineOffset: '2px'
                }}
                title={color}
              >
                {isTransparent(color) && <span className="text-red-500 text-xs font-bold">/</span>}
              </button>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t">
            <div className="flex items-center">
              <input
                type="text"
                value={activeTab === 'fill' ? currentFill : currentStroke}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="flex-1 p-1 text-sm border rounded mr-2"
              />
              <input 
                type="color"
                value={isTransparent(activeTab === 'fill' ? currentFill : currentStroke) ? '#ffffff' : (activeTab === 'fill' ? currentFill : currentStroke)}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
                disabled={isTransparent(activeTab === 'fill' ? currentFill : currentStroke)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickColorPalette; 