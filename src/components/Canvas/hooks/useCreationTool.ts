import { nanoid } from 'nanoid';
import { Point } from '../../../types/canvas';
import { WhiteboardElement, ElementStyle, ToolType } from '../../../types/elements';
import { findNearestPort } from '../../../utils/geometry';

export function createNewElementForTool(
  tool: ToolType,
  worldPos: Point,
  currentStyle: ElementStyle,
  elementsCount: number,
  elements: WhiteboardElement[],
  theme: 'light' | 'dark'
): { element: WhiteboardElement; todoTaskId?: string } {
  const newId = nanoid();

  if (tool === 'todo') {
    const firstTaskId = nanoid();
    const initialItems = [{ id: firstTaskId, text: '', checked: false }];
    const initialW = 240;
    const initialH = 42 + initialItems.length * 34 + 34;

    return {
      element: {
        id: newId,
        type: 'todo',
        x: worldPos.x,
        y: worldPos.y,
        width: initialW,
        height: initialH,
        strokeColor: currentStyle.strokeColor,
        fillColor: currentStyle.fillColor !== 'transparent' ? currentStyle.fillColor : (theme === 'dark' ? '#18181b' : '#ffffff'),
        strokeWidth: 1,
        roughness: 0,
        seed: Math.floor(Math.random() * 2000000),
        zIndex: elementsCount,
        text: 'To Do List',
        todoItems: initialItems,
        fontSize: 13,
        fontFamily: 'Inter, sans-serif',
        disableConnectors: true
      },
      todoTaskId: firstTaskId
    };
  }

  let startX = worldPos.x;
  let startY = worldPos.y;
  let startBinding: { elementId: string; port: 'top' | 'right' | 'bottom' | 'left' } | undefined;

  if (tool === 'arrow' || tool === 'line') {
    const nearest = findNearestPort(worldPos, elements);
    if (nearest) {
      startX = nearest.point.x;
      startY = nearest.point.y;
      startBinding = { elementId: nearest.elementId, port: nearest.port };
    }
  }

  return {
    element: {
      id: newId,
      type: tool,
      x: startX,
      y: startY,
      width: tool === 'text' ? 200 : 0,
      height: tool === 'text' ? 45 : 0,
      strokeColor: currentStyle.strokeColor,
      fillColor: currentStyle.fillColor,
      strokeWidth: currentStyle.strokeWidth,
      roughness: currentStyle.roughness,
      seed: Math.floor(Math.random() * 2000000),
      zIndex: elementsCount,
      startBinding,
      points: tool === 'draw' ? [worldPos] : undefined,
      disableConnectors: tool === 'text' ? true : undefined
    }
  };
}
