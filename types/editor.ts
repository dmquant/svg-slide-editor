// Basic SVG element properties
export interface BaseSVGElement {
  id: string;
  type: 'rect' | 'circle' | 'path' | 'text' | 'image' | 'line' | 'symbol' | 'use';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity?: number;
  transform?: string;
  originalSvg?: string; // Original SVG markup for preserving structure
  className?: string;   // CSS class name for styling
}

// Rectangle specific properties
export interface RectElement extends BaseSVGElement {
  type: 'rect';
  rx?: number; // corner radius
  ry?: number; // corner radius
}

// Circle specific properties
export interface CircleElement extends BaseSVGElement {
  type: 'circle';
  cx?: number; // center x (optional, can be calculated from x + width/2)
  cy?: number; // center y (optional, can be calculated from y + height/2)
  r?: number;  // radius (optional, can be calculated from width/2)
}

// Path specific properties
export interface PathElement extends BaseSVGElement {
  type: 'path';
  d?: string; // path data
}

// Text specific properties
export interface TextElement extends BaseSVGElement {
  type: 'text';
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAnchor?: 'start' | 'middle' | 'end';
  textClass?: 'title' | 'subtitle' | 'heading' | 'subheading' | 'bullet' | 'subbullet' | 'footer' | 'page-number';
}

// Image specific properties
export interface ImageElement extends BaseSVGElement {
  type: 'image';
  href: string; // image source URL
  preserveAspectRatio?: string;
}

// Line specific properties
export interface LineElement extends BaseSVGElement {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  lineClass?: 'header-line' | 'footer-line';
}

// Symbol definition (for reusable graphics)
export interface SymbolElement extends BaseSVGElement {
  type: 'symbol';
  content: string; // SVG content inside the symbol
  viewBox: string;
}

// Symbol usage
export interface UseElement extends BaseSVGElement {
  type: 'use';
  href: string; // Reference to symbol ID
}

// Union type for all SVG element types
export type SVGElement = 
  | RectElement 
  | CircleElement 
  | PathElement 
  | TextElement 
  | ImageElement 
  | LineElement 
  | SymbolElement 
  | UseElement;

// Slide representation
export interface Slide {
  id: string;
  elements: SVGElement[];
  title?: string;
  background?: string;
  styles?: string; // CSS styles for the slide
}

// Project representation
export interface Project {
  id: string;
  name: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
  globalStyles?: string; // Global CSS styles for the entire project
  symbols?: SymbolElement[]; // Reusable symbols
}

// Tool types for the editor
export type EditorTool = 
  | 'select' 
  | 'rectangle' 
  | 'circle' 
  | 'path' 
  | 'text' 
  | 'image' 
  | 'line' 
  | 'symbol' 
  | 'use' 
  | 'eraser';

// Editor view modes
export type EditorViewMode = 'design' | 'code' | 'preview';

// Predefined text styles
export const TEXT_STYLES = {
  title: {
    fontSize: 48,
    fontWeight: '700',
    fill: '#007856'
  },
  subtitle: {
    fontSize: 32,
    fontWeight: '400',
    fill: '#444444'
  },
  heading: {
    fontSize: 40,
    fontWeight: '700',
    fill: '#007856'
  },
  subheading: {
    fontSize: 30,
    fontWeight: '700',
    fill: '#333333'
  },
  bullet: {
    fontSize: 24,
    fill: '#333333'
  },
  subbullet: {
    fontSize: 20,
    fill: '#555555'
  },
  footer: {
    fontSize: 16,
    fill: '#666666'
  },
  'page-number': {
    fontSize: 24,
    fontWeight: '700',
    fill: '#007856'
  }
}; 