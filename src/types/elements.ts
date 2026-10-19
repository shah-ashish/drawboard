import { Point } from './canvas';

export type ElementType = 'rectangle' | 'ellipse' | 'arrow' | 'line' | 'draw' | 'text' | 'icon' | 'frame';

export type ToolType = 'select' | 'pan' | ElementType;

export interface ElementStyle {
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughness: number; // 0 = clean/crisp (like architecture cards), 1-2 = hand-drawn sketch
  fontSize: number;
  fontFamily: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export interface WhiteboardElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  roughness: number;
  seed: number;
  zIndex: number;
  points?: Point[]; // For freehand pencil strokes and multi-point arrows
  text?: string;    // For textboxes and embedded labels
  fontSize?: number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  groupIds?: string[];
  lockedGroupId?: string;
  locked?: boolean;
  startBinding?: { elementId: string; port: 'top' | 'right' | 'bottom' | 'left' };
  endBinding?: { elementId: string; port: 'top' | 'right' | 'bottom' | 'left' };
  // Icon and Frame extensions
  iconKey?: string;
  iconUrl?: string;
  frameType?: 'browser' | 'phone' | 'figure';
  label?: string;
}



export type ActionType = 'none' | 'drawing' | 'moving' | 'resizing' | 'panning' | 'editing_text';
