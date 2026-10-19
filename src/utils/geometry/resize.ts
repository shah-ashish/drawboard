import { Point, ResizeHandle } from '../../types/canvas';
import { WhiteboardElement } from '../../types/elements';

export function resizeElement(
  element: WhiteboardElement,
  handle: ResizeHandle,
  currentWorld: Point,
  initialBounds: { x: number; y: number; width: number; height: number },
  minSize = 15
): WhiteboardElement {
  let { x, y, width, height } = initialBounds;
  const right = x + width;
  const bottom = y + height;

  let minW = minSize;
  let minH = minSize;

  if (element.type === 'todo') {
    const itemCount = element.todoItems?.length || 1;
    minW = 200;
    minH = 42 + itemCount * 34 + 32;
  } else if (element.type === 'text') {
    minW = 60;
    minH = 30;
  }

  switch (handle) {
    case 'se': {
      width = Math.max(currentWorld.x - x, minW);
      height = Math.max(currentWorld.y - y, minH);
      break;
    }
    case 'e': {
      width = Math.max(currentWorld.x - x, minW);
      break;
    }
    case 's': {
      height = Math.max(currentWorld.y - y, minH);
      break;
    }
    case 'nw': {
      const newX = Math.min(currentWorld.x, right - minW);
      const newY = Math.min(currentWorld.y, bottom - minH);
      width = right - newX;
      height = bottom - newY;
      x = newX;
      y = newY;
      break;
    }
    case 'w': {
      const newX = Math.min(currentWorld.x, right - minW);
      width = right - newX;
      x = newX;
      break;
    }
    case 'n': {
      const newY = Math.min(currentWorld.y, bottom - minH);
      height = bottom - newY;
      y = newY;
      break;
    }
    case 'ne': {
      const newY = Math.min(currentWorld.y, bottom - minH);
      width = Math.max(currentWorld.x - x, minW);
      height = bottom - newY;
      y = newY;
      break;
    }
    case 'sw': {
      const newX = Math.min(currentWorld.x, right - minW);
      width = right - newX;
      height = Math.max(currentWorld.y - y, minH);
      x = newX;
      break;
    }
  }

  if (element.type === 'draw' && element.points && element.points.length > 0) {
    const origW = initialBounds.width || 1;
    const origH = initialBounds.height || 1;
    const scaleX = width / origW;
    const scaleY = height / origH;
    const newPoints = element.points.map(p => ({
      x: x + (p.x - initialBounds.x) * scaleX,
      y: y + (p.y - initialBounds.y) * scaleY
    }));
    return {
      ...element,
      x,
      y,
      width,
      height,
      points: newPoints
    };
  }

  return {
    ...element,
    x,
    y,
    width,
    height
  };
}
