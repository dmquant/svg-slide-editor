'use client';

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Slide, SVGElement } from '@/types/editor';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface EditorContextProps {
  slides: Slide[];
  currentSlideIndex: number;
  selectedElement: SVGElement | null;
  setSlides: (slides: Slide[]) => void;
  setCurrentSlideIndex: (index: number) => void;
  setSelectedElement: (element: SVGElement | null) => void;
  addSlide: () => void;
  deleteSlide: (index: number) => void;
  reorderSlides: (reorderedSlides: Slide[]) => void;
  addElement: (element: Partial<SVGElement>) => void;
  updateElement: (updatedElement: SVGElement) => void;
  deleteElement: (elementId: string) => void;
  reorderElements: (reorderedElements: SVGElement[]) => void;
  clearProject: () => void;
  saveProject: () => void;
  loadProject: (projectData: string) => void;
}

const EditorContext = createContext<EditorContextProps | undefined>(undefined);

// Initial state with one empty slide
const createInitialState = (): Slide[] => [
  {
    id: uuidv4(),
    elements: [],
  },
];

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use regular useState for initial state to avoid hydration mismatch
  const [slides, setLocalSlides] = useState<Slide[]>(createInitialState());
  const [currentSlideIndex, setLocalCurrentSlideIndex] = useState<number>(0);
  const [selectedElement, setSelectedElement] = useState<SVGElement | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Load from localStorage only after hydration
  useEffect(() => {
    setIsClient(true);
    const savedSlides = localStorage.getItem('svg-editor-slides');
    const savedCurrentSlide = localStorage.getItem('svg-editor-current-slide');
    
    if (savedSlides) {
      try {
        setLocalSlides(JSON.parse(savedSlides));
      } catch (e) {
        console.error("Failed to parse slides from localStorage", e);
      }
    }
    
    if (savedCurrentSlide) {
      try {
        setLocalCurrentSlideIndex(JSON.parse(savedCurrentSlide));
      } catch (e) {
        console.error("Failed to parse current slide from localStorage", e);
      }
    }
  }, []);
  
  // Save to localStorage whenever state changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('svg-editor-slides', JSON.stringify(slides));
    }
  }, [slides, isClient]);
  
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('svg-editor-current-slide', JSON.stringify(currentSlideIndex));
    }
  }, [currentSlideIndex, isClient]);
  
  // State setter functions that also update localStorage
  const setSlides = useCallback((newSlides: Slide[]) => {
    setLocalSlides(newSlides);
  }, []);
  
  const setCurrentSlideIndex = useCallback((index: number) => {
    setLocalCurrentSlideIndex(index);
  }, []);
  
  // Add a new slide
  const addSlide = useCallback(() => {
    const newSlide: Slide = {
      id: uuidv4(),
      elements: [],
    };
    
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
    setSelectedElement(null);
  }, [slides, setSlides, setCurrentSlideIndex]);
  
  // Delete a slide
  const deleteSlide = useCallback((index: number) => {
    if (slides.length <= 1) return; // Prevent deleting the last slide
    
    const newSlides = [...slides];
    newSlides.splice(index, 1);
    
    setSlides(newSlides);
    
    // Adjust current slide index if needed
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    } else if (currentSlideIndex === index) {
      setCurrentSlideIndex(Math.max(0, index - 1));
    }
    
    setSelectedElement(null);
  }, [slides, setSlides, currentSlideIndex, setCurrentSlideIndex]);
  
  // Reorder slides
  const reorderSlides = useCallback((reorderedSlides: Slide[]) => {
    setSlides(reorderedSlides);
  }, [setSlides]);
  
  // Add a new element to the current slide
  const addElement = useCallback((element: Partial<SVGElement>) => {
    if (currentSlideIndex < 0 || currentSlideIndex >= slides.length) return;
    
    // Create a base element with default values
    const baseElement = {
      id: uuidv4(),
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      fill: '#ffffff',
      stroke: '#000000',
      strokeWidth: 1,
      ...element,
    };
    
    // Create the appropriate element based on the type
    let newElement: SVGElement;
    
    switch (element.type) {
      case 'rect':
        newElement = {
          ...baseElement,
          type: 'rect',
        } as SVGElement;
        break;
      case 'circle':
        newElement = {
          ...baseElement,
          type: 'circle',
        } as SVGElement;
        break;
      case 'path':
        newElement = {
          ...baseElement,
          type: 'path',
          d: element.d || 'M 0,0 L 100,100',
        } as SVGElement;
        break;
      case 'text':
        newElement = {
          ...baseElement,
          type: 'text',
          text: element.text || 'Text',
          fontSize: (element as any).fontSize || 18,
          fontFamily: (element as any).fontFamily || 'Arial',
        } as SVGElement;
        break;
      case 'image':
        newElement = {
          ...baseElement,
          type: 'image',
          href: (element as any).href || 'https://via.placeholder.com/100',
        } as SVGElement;
        break;
      default:
        // Default to rectangle if type is not specified
        newElement = {
          ...baseElement,
          type: 'rect',
        } as SVGElement;
    }
    
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: [...newSlides[currentSlideIndex].elements, newElement],
    };
    
    setSlides(newSlides);
    setSelectedElement(newElement);
  }, [slides, setSlides, currentSlideIndex]);
  
  // Update an existing element
  const updateElement = useCallback((updatedElement: SVGElement) => {
    if (currentSlideIndex < 0 || currentSlideIndex >= slides.length) return;
    
    const currentElements = slides[currentSlideIndex].elements;
    const elementIndex = currentElements.findIndex(el => el.id === updatedElement.id);
    
    if (elementIndex === -1) return;
    
    const newSlides = [...slides];
    const newElements = [...currentElements];
    newElements[elementIndex] = updatedElement;
    
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: newElements,
    };
    
    setSlides(newSlides);
    
    // Update selected element if it's the one being modified
    if (selectedElement && selectedElement.id === updatedElement.id) {
      setSelectedElement(updatedElement);
    }
  }, [slides, setSlides, currentSlideIndex, selectedElement]);
  
  // Delete an element
  const deleteElement = useCallback((elementId: string) => {
    if (currentSlideIndex < 0 || currentSlideIndex >= slides.length) return;
    
    const currentElements = slides[currentSlideIndex].elements;
    const newElements = currentElements.filter(el => el.id !== elementId);
    
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: newElements,
    };
    
    setSlides(newSlides);
    
    // Deselect if the deleted element was selected
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
  }, [slides, setSlides, currentSlideIndex, selectedElement]);
  
  // Reorder elements in the current slide
  const reorderElements = useCallback((reorderedElements: SVGElement[]) => {
    if (currentSlideIndex < 0 || currentSlideIndex >= slides.length) return;
    
    const newSlides = [...slides];
    newSlides[currentSlideIndex] = {
      ...newSlides[currentSlideIndex],
      elements: reorderedElements,
    };
    
    setSlides(newSlides);
  }, [slides, setSlides, currentSlideIndex]);
  
  // Clear the entire project
  const clearProject = useCallback(() => {
    setSlides(createInitialState());
    setCurrentSlideIndex(0);
    setSelectedElement(null);
  }, [setSlides, setCurrentSlideIndex]);
  
  // Save the project
  const saveProject = useCallback(() => {
    // Already using localStorage via the useLocalStorage hook
    return JSON.stringify({ slides, currentSlideIndex });
  }, [slides, currentSlideIndex]);
  
  // Load a project
  const loadProject = useCallback((projectData: string) => {
    try {
      const { slides: loadedSlides, currentSlideIndex: loadedIndex } = JSON.parse(projectData);
      setSlides(loadedSlides);
      setCurrentSlideIndex(loadedIndex);
      setSelectedElement(null);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  }, [setSlides, setCurrentSlideIndex]);
  
  const contextValue: EditorContextProps = {
    slides,
    currentSlideIndex,
    selectedElement,
    setSlides,
    setCurrentSlideIndex,
    setSelectedElement,
    addSlide,
    deleteSlide,
    reorderSlides,
    addElement,
    updateElement,
    deleteElement,
    reorderElements,
    clearProject,
    saveProject,
    loadProject,
  };
  
  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextProps => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};

export default EditorContext; 