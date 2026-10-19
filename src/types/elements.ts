import { Point } from './canvas';

export type ElementType = 'rectangle' | 'ellipse' | 'arrow' | 'line' | 'draw' | 'text' | 'icon' | 'frame' | 'todo';

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

export interface TodoItem {
  id: string;
  text: string;
  checked: boolean;
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
  checked?: boolean; // For single todo / checklist items
  todoItems?: TodoItem[]; // For multi-item sticky todo lists
  pinnedToScreen?: boolean; // When true, fixed in viewport/screen space while canvas pans/zooms
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
  disableConnectors?: boolean; // When true, disables connection port dots and snapping
}



export type ActionType = 'none' | 'drawing' | 'moving' | 'resizing' | 'panning' | 'editing_text';
