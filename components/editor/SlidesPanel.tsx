import React from 'react';
import { Slide } from '@/types/editor';

interface SlidesPanelProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
  onReorderSlides: (reorderedSlides: Slide[]) => void;
}

const SlidesPanel: React.FC<SlidesPanelProps> = ({
  slides,
  currentSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onReorderSlides,
}) => {
  // Move a slide up in the list
  const moveSlideUp = (index: number) => {
    if (index <= 0) return; // Already first
    
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index - 1];
    newSlides[index - 1] = temp;
    
    onReorderSlides(newSlides);
  };
  
  // Move a slide down in the list
  const moveSlideDown = (index: number) => {
    if (index >= slides.length - 1) return; // Already last
    
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + 1];
    newSlides[index + 1] = temp;
    
    onReorderSlides(newSlides);
  };

  return (
    <div className="h-full flex flex-col bg-white border-r">
      <div className="flex justify-between items-center p-2 border-b">
        <h3 className="font-medium text-sm">Slides</h3>
        <button
          onClick={onAddSlide}
          className="p-1 px-3 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          + Add Slide
        </button>
      </div>
      
      {slides.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4 text-gray-400 text-sm italic">
          No slides yet
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`
                relative group border rounded p-2 cursor-pointer
                ${currentSlideIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
              `}
              onClick={() => onSelectSlide(index)}
            >
              {/* Slide thumbnail */}
              <div className="bg-white border aspect-video flex items-center justify-center text-xs text-gray-400 mb-1">
                {slide.elements.length > 0 ? (
                  <div className="text-xs">Preview</div>
                ) : (
                  <div className="text-xs italic">Empty slide</div>
                )}
              </div>
              
              {/* Slide details */}
              <div className="flex justify-between items-center">
                <div className="text-xs font-medium">Slide {index + 1}</div>
                <div className="text-xs text-gray-500">{slide.elements.length} elements</div>
              </div>
              
              {/* Controls (visible on hover/focus) */}
              <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 bg-white/80 rounded p-1">
                <button
                  disabled={index === 0}
                  onClick={(e) => { e.stopPropagation(); moveSlideUp(index); }}
                  className="p-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30"
                  title="Move Up"
                >
                  ↑
                </button>
                <button
                  disabled={index === slides.length - 1}
                  onClick={(e) => { e.stopPropagation(); moveSlideDown(index); }}
                  className="p-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30"
                  title="Move Down"
                >
                  ↓
                </button>
                <button
                  disabled={slides.length <= 1}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (slides.length > 1) onDeleteSlide(index); 
                  }}
                  className="p-1 text-xs text-gray-500 hover:text-red-500 disabled:opacity-30"
                  title="Delete"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SlidesPanel; 