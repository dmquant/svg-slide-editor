// Basic SVG element properties
export interface BaseSVGElement {
  id: string;
  type: 'rect' | 'circle' | 'path' | 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  opacity?: number;
  transform?: string;
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
}

// Image specific properties
export interface ImageElement extends BaseSVGElement {
  type: 'image';
  href: string; // image source URL
  preserveAspectRatio?: string;
}

// Union type for all SVG element types
export type SVGElement = RectElement | CircleElement | PathElement | TextElement | ImageElement;

// Slide representation
export interface Slide {
  id: string;
  elements: SVGElement[];
  title?: string;
  background?: string;
}

// Project representation
export interface Project {
  id: string;
  name: string;
  slides: Slide[];
  createdAt: string;
  updatedAt: string;
}

// Tool types for the editor
export type EditorTool = 'select' | 'rectangle' | 'circle' | 'path' | 'text' | 'image' | 'eraser';

// Editor view modes
export type EditorViewMode = 'design' | 'code' | 'preview'; 