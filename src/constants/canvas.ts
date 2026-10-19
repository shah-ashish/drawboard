import { Camera } from '../types/canvas';
import { ElementStyle } from '../types/elements';

export const DEFAULT_CAMERA: Camera = {
  x: 0,
  y: 0,
  zoom: 1
};

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 0.1;

export const DEFAULT_STYLE: ElementStyle = {
  strokeColor: '#1e1e1e',
  fillColor: '#ffffff',
  strokeWidth: 2,
  roughness: 0, // Default crisp architecture look like Eraser diagram
  fontSize: 18,
  fontFamily: 'Inter, sans-serif',
  textAlign: 'center',
  verticalAlign: 'middle'
};

export const FONT_FAMILY_OPTIONS = [
  { label: 'Sans', value: 'Inter, sans-serif' },
  { label: 'Mono', value: 'JetBrains Mono, monospace' },
  { label: 'Serif', value: 'Georgia, serif' }
];

export const FONT_SIZE_OPTIONS = [
  { label: 'S', value: 14 },
  { label: 'M', value: 18 },
  { label: 'L', value: 24 },
  { label: 'XL', value: 32 }
];

export const PRESET_COLORS = [
  '#1e1e1e', // Dark Gray / Charcoal
  '#e03131', // Red
  '#2f9e44', // Green
  '#1971c2', // Blue
  '#f08c00', // Orange / Amber
  '#9c36b5', // Purple
  '#868e96'  // Slate Gray
];

export const PRESET_FILLS = [
  'transparent',
  '#ffffff',
  '#f8f9fa',
  '#ffe3e3',
  '#d3f9d8',
  '#d0ebff',
  '#fff3bf',
  '#f3d9fa'
];

export const ROUGHNESS_OPTIONS = [
  { label: 'Crisp', value: 0 },
  { label: 'Architect', value: 1 },
  { label: 'Hand-drawn', value: 1.8 }
];

export const STROKE_WIDTH_OPTIONS = [
  { label: 'Thin', value: 1.5 },
  { label: 'Medium', value: 2.5 },
  { label: 'Bold', value: 4 }
];
