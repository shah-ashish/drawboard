import { BoundingBox } from '../../types/canvas';
import { WhiteboardElement } from '../../types/elements';

export function getElementBounds(element: WhiteboardElement): BoundingBox {
  if (element.type === 'draw' && element.points && element.points.length > 0) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const p of element.points) {
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(maxX - minX, 10),
      height: Math.max(maxY - minY, 10)
    };
  }

  const minX = Math.min(element.x, element.x + element.width);
  const maxX = Math.max(element.x, element.x + element.width);
  const minY = Math.min(element.y, element.y + element.height);
  const maxY = Math.max(element.y, element.y + element.height);

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: maxX - minX,
    height: maxY - minY
  };
}

export function isElementIntersectingBox(element: WhiteboardElement, box: BoundingBox): boolean {
  const elBounds = getElementBounds(element);
  return !(
    elBounds.maxX < box.minX ||
    elBounds.minX > box.maxX ||
    elBounds.maxY < box.minY ||
    elBounds.minY > box.maxY
  );
}
