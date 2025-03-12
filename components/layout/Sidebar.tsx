'use client';

import React, { useState } from 'react';
import SlidesPanel from '../editor/SlidesPanel';
import LayersPanel from '../editor/LayersPanel';
import ElementProperties from '../editor/ElementProperties';
import { Slide, SVGElement } from '@/types/editor';

interface SidebarProps {
  slides: Slide[];
  currentSlideIndex: number;
  selectedElement: SVGElement | null;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDeleteSlide: (index: number) => void;
  onReorderSlides: (reorderedSlides: Slide[]) => void;
  onSelectElement: (element: SVGElement | null) => void;
  onUpdateElement: (updatedElement: SVGElement) => void;
  onReorderElements: (reorderedElements: SVGElement[]) => void;
  onDeleteElement: (elementId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  slides,
  currentSlideIndex,
  selectedElement,
  onSelectSlide,
  onAddSlide,
  onDeleteSlide,
  onReorderSlides,
  onSelectElement,
  onUpdateElement,
  onReorderElements,
  onDeleteElement,
}) => {
  const [isPropertiesOpen, setIsPropertiesOpen] = useState(true);
  const [isLayersOpen, setIsLayersOpen] = useState(true);
  
  const currentSlide = slides[currentSlideIndex] || { id: '', elements: [] };

  return (
    <div className="w-full h-full flex flex-col bg-white overflow-auto">
      {/* Properties Panel */}
      <div className="border-b">
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer"
          onClick={() => setIsPropertiesOpen(!isPropertiesOpen)}
        >
          <h3 className="font-medium text-gray-700">Properties</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 text-gray-500 transition-transform ${isPropertiesOpen ? 'transform rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path key="properties-arrow" fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        
        {isPropertiesOpen && (
          <div className="p-4">
            {selectedElement ? (
              <ElementProperties
                selectedElement={selectedElement}
                onUpdateElement={onUpdateElement}
              />
            ) : (
              <p className="text-gray-500 text-sm">Select an element to edit its properties</p>
            )}
          </div>
        )}
      </div>
      
      {/* Layers Panel */}
      <div className="border-b">
        <div 
          className="flex items-center justify-between px-4 py-3 cursor-pointer"
          onClick={() => setIsLayersOpen(!isLayersOpen)}
        >
          <h3 className="font-medium text-gray-700">Layers</h3>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-5 w-5 text-gray-500 transition-transform ${isLayersOpen ? 'transform rotate-180' : ''}`} 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path key="layers-arrow" fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
        
        {isLayersOpen && (
          <div className="p-4">
            {currentSlide.elements.length > 0 ? (
              <LayersPanel
                elements={currentSlide.elements}
                selectedElement={selectedElement}
                onSelectElement={onSelectElement}
                onReorderElements={onReorderElements}
                onDeleteElement={onDeleteElement}
              />
            ) : (
              <p className="text-gray-500 text-sm">No elements on this slide</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 