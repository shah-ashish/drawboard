import { useState } from 'react';
import { Point, Camera } from '../../../types/canvas';
import { WhiteboardElement, ElementStyle } from '../../../types/elements';
import { getElementBounds, isPointInsideElement } from '../../../utils/geometry';
import { wrapTextToLines } from '../renderer/renderText';
import { commitTodoChange } from './handleCommitTodo';

export interface EditingTextState {
  elementId: string;
  todoItemId?: string;
  isPinned?: boolean;
  worldPos: Point;
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  isShapeLabel?: boolean;
  bounds?: { width: number; height: number };
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

export function useCanvasTextEditing(
  elements: WhiteboardElement[],
  currentStyle: ElementStyle,
  camera: Camera,
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void,
  onSelectedIdsChange: (ids: string[]) => void
) {
  const [editingText, setEditingText] = useState<EditingTextState | null>(null);

  const handleDoubleClick = (screenPos: Point, worldPos: Point) => {
    const sorted = [...elements].sort((a, b) => {
      const aPin = Boolean(a.pinnedToScreen);
      const bPin = Boolean(b.pinnedToScreen);
      if (aPin !== bPin) return aPin ? -1 : 1;
      return b.zIndex - a.zIndex;
    });
    const hit = sorted.find(el => isPointInsideElement(el.pinnedToScreen ? screenPos : worldPos, el));
    if (!hit || hit.locked) return;

    if (hit.type === 'todo') {
      const pt = hit.pinnedToScreen ? screenPos : worldPos;
      const bounds = getElementBounds(hit);
      const items = hit.todoItems || [];
      const startY = bounds.minY + 42;
      const rowH = 34;
      const clickedRow = Math.floor((pt.y - startY) / rowH);

      if (clickedRow >= 0 && clickedRow < items.length) {
        const task = items[clickedRow];
        setEditingText({
          elementId: hit.id, todoItemId: task.id, isPinned: Boolean(hit.pinnedToScreen),
          worldPos: { x: bounds.minX + 40, y: startY + clickedRow * rowH + 4 },
          text: task.text || '', fontSize: 13, fontFamily: 'Inter, sans-serif', color: hit.strokeColor,
          isShapeLabel: false, bounds: { width: Math.max(bounds.width - 54, 80), height: 26 },
          textAlign: 'left', verticalAlign: 'middle'
        });
      } else {
        setEditingText({
          elementId: hit.id, isPinned: Boolean(hit.pinnedToScreen),
          worldPos: { x: bounds.minX + 16, y: bounds.minY + 8 },
          text: hit.text || 'To Do List', fontSize: 13, fontFamily: 'Inter, sans-serif', color: hit.strokeColor,
          isShapeLabel: false, bounds: { width: Math.max(bounds.width - 110, 70), height: 26 },
          textAlign: 'left', verticalAlign: 'middle'
        });
      }
      return;
    }

    const isShape = hit.type === 'rectangle' || hit.type === 'ellipse' || hit.type === 'icon' || hit.type === 'frame';
    const bounds = getElementBounds(hit);
    setEditingText({
      elementId: hit.id, worldPos: { x: bounds.minX, y: bounds.minY }, text: hit.text || '',
      fontSize: hit.fontSize || (isShape ? 16 : currentStyle.fontSize),
      fontFamily: hit.fontFamily || (isShape ? 'JetBrains Mono, monospace' : currentStyle.fontFamily),
      color: hit.strokeColor, isShapeLabel: isShape, bounds: { width: bounds.width, height: bounds.height },
      textAlign: hit.textAlign || currentStyle.textAlign, verticalAlign: hit.verticalAlign || currentStyle.verticalAlign
    });
  };

  const handleCommitText = (newText: string, options?: { createNext?: boolean }) => {
    if (!editingText) return;
    const targetEl = elements.find(el => el.id === editingText.elementId);
    if (!targetEl) { setEditingText(null); return; }

    const trimmed = newText.trim();

    if (targetEl.type === 'text') {
      if (!trimmed) {
        onElementsChange(elements.filter(el => el.id !== editingText.elementId), true);
        onSelectedIdsChange([]);
      } else {
        const fontSize = targetEl.fontSize || 18;
        const fontFamily = targetEl.fontFamily || 'Inter, sans-serif';
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const finalWidth = Math.max(targetEl.width || 0, 200);
        const lineCount = ctx ? Math.max(wrapTextToLines(ctx, newText, Math.max(finalWidth - 12, 20)).length, 1) : newText.split('\n').length;
        const requiredHeight = Math.max(targetEl.height || 0, lineCount * (fontSize * 1.35) + 16, 45);
        onElementsChange(elements.map(el => el.id === editingText.elementId ? { ...el, text: newText, width: finalWidth, height: requiredHeight } : el), true);
      }
      setEditingText(null);
    } else if (targetEl.type === 'todo') {
      commitTodoChange(targetEl, editingText, newText, trimmed, options, elements, onElementsChange, setEditingText);
    } else {
      onElementsChange(elements.map(el => el.id === editingText.elementId ? { ...el, text: trimmed ? newText : undefined } : el), true);
      setEditingText(null);
    }
  };

  return { editingText, setEditingText, handleDoubleClick, handleCommitText };
}
