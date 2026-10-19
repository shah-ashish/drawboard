import { Point, BoundingBox, ResizeHandle } from '../../types/canvas';
import { WhiteboardElement } from '../../types/elements';
import { getElementBounds } from './bounds';

export function isPointInsideBounds(point: Point, bounds: BoundingBox, padding = 6): boolean {
  return (
    point.x >= bounds.minX - padding &&
    point.x <= bounds.maxX + padding &&
    point.y >= bounds.minY - padding &&
    point.y <= bounds.maxY + padding
  );
}

export function distanceBetweenPoints(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

export function isPointNearLine(
  point: Point,
  start: Point,
  end: Point,
  tolerance = 8
): boolean {
  const lineLen = distanceBetweenPoints(start, end);
  if (lineLen === 0) return distanceBetweenPoints(point, start) <= tolerance;

  const t = Math.max(
    0,
    Math.min(
      1,
      ((point.x - start.x) * (end.x - start.x) + (point.y - start.y) * (end.y - start.y)) /
        (lineLen * lineLen)
    )
  );

  const projection = {
    x: start.x + t * (end.x - start.x),
    y: start.y + t * (end.y - start.y)
  };

  return distanceBetweenPoints(point, projection) <= tolerance;
}

export function isPointInsideElement(point: Point, element: WhiteboardElement): boolean {
  const bounds = getElementBounds(element);

  if (
    element.type === 'rectangle' ||
    element.type === 'text' ||
    element.type === 'icon' ||
    element.type === 'frame' ||
    element.type === 'todo'
  ) {
    return isPointInsideBounds(point, bounds);
  }

  if (element.type === 'ellipse') {
    if (!isPointInsideBounds(point, bounds)) return false;
    const rx = bounds.width / 2;
    const ry = bounds.height / 2;
    const cx = bounds.minX + rx;
    const cy = bounds.minY + ry;
    if (rx === 0 || ry === 0) return false;
    const norm = Math.pow(point.x - cx, 2) / Math.pow(rx, 2) + Math.pow(point.y - cy, 2) / Math.pow(ry, 2);
    return norm <= 1.2;
  }

  if (element.type === 'line' || element.type === 'arrow') {
    const start = { x: element.x, y: element.y };
    const end = { x: element.x + element.width, y: element.y + element.height };
    return isPointNearLine(point, start, end, 8);
  }

  if (element.type === 'draw' && element.points && element.points.length > 0) {
    if (!isPointInsideBounds(point, bounds, 12)) return false;
    for (let i = 0; i < element.points.length - 1; i++) {
      if (isPointNearLine(point, element.points[i], element.points[i + 1], 10)) {
        return true;
      }
    }
  }

  return false;
}

export function getResizeHandles(bounds: BoundingBox, padding = 6): Record<ResizeHandle, Point> {
  const minX = bounds.minX - padding;
  const minY = bounds.minY - padding;
  const maxX = bounds.maxX + padding;
  const maxY = bounds.maxY + padding;
  const midX = (minX + maxX) / 2;
  const midY = (minY + maxY) / 2;

  return {
    nw: { x: minX, y: minY },
    n:  { x: midX, y: minY },
    ne: { x: maxX, y: minY },
    e:  { x: maxX, y: midY },
    se: { x: maxX, y: maxY },
    s:  { x: midX, y: maxY },
    sw: { x: minX, y: maxY },
    w:  { x: minX, y: midY }
  };
}

export function getHandleAtPoint(
  point: Point,
  bounds: BoundingBox,
  zoom: number,
  padding = 6
): ResizeHandle | null {
  const handles = getResizeHandles(bounds, padding);
  const handleRadius = 9 / zoom;

  for (const [key, p] of Object.entries(handles)) {
    if (distanceBetweenPoints(point, p) <= handleRadius) {
      return key as ResizeHandle;
    }
  }

  return null;
}
