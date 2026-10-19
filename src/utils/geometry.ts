import { Point, BoundingBox, ResizeHandle } from '../types/canvas';
import { WhiteboardElement } from '../types/elements';


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

  // Projection scalar
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
    element.type === 'frame'
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
    return norm <= 1.2; // 1.2 gives slight margin for comfortable selection
  }

  if (element.type === 'line' || element.type === 'arrow') {
    const start = { x: element.x, y: element.y };
    const end = { x: element.x + element.width, y: element.y + element.height };
    return isPointNearLine(point, start, end, 8);
  }

  if (element.type === 'draw' && element.points && element.points.length > 0) {
    // Quick bounding box check
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

  switch (handle) {
    case 'se': {
      width = Math.max(currentWorld.x - x, minSize);
      height = Math.max(currentWorld.y - y, minSize);
      break;
    }
    case 'e': {
      width = Math.max(currentWorld.x - x, minSize);
      break;
    }
    case 's': {
      height = Math.max(currentWorld.y - y, minSize);
      break;
    }
    case 'nw': {
      const newX = Math.min(currentWorld.x, right - minSize);
      const newY = Math.min(currentWorld.y, bottom - minSize);
      width = right - newX;
      height = bottom - newY;
      x = newX;
      y = newY;
      break;
    }
    case 'w': {
      const newX = Math.min(currentWorld.x, right - minSize);
      width = right - newX;
      x = newX;
      break;
    }
    case 'n': {
      const newY = Math.min(currentWorld.y, bottom - minSize);
      height = bottom - newY;
      y = newY;
      break;
    }
    case 'ne': {
      const newY = Math.min(currentWorld.y, bottom - minSize);
      width = Math.max(currentWorld.x - x, minSize);
      height = bottom - newY;
      y = newY;
      break;
    }
    case 'sw': {
      const newX = Math.min(currentWorld.x, right - minSize);
      width = right - newX;
      height = Math.max(currentWorld.y - y, minSize);
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

export type PortName = 'top' | 'right' | 'bottom' | 'left';

/**
 * Computes the 4 connection ports on the perimeter of a shape.
 */
export function getShapePorts(element: WhiteboardElement): Record<PortName, Point> {
  const bounds = getElementBounds(element);
  return {
    top: { x: bounds.minX + bounds.width / 2, y: bounds.minY },
    right: { x: bounds.maxX, y: bounds.minY + bounds.height / 2 },
    bottom: { x: bounds.minX + bounds.width / 2, y: bounds.maxY },
    left: { x: bounds.minX, y: bounds.minY + bounds.height / 2 }
  };
}

/**
 * Finds the nearest shape connection port within snap radius.
 */
export function findNearestPort(
  point: Point,
  elements: WhiteboardElement[],
  excludeId?: string,
  snapRadius = 24
): { elementId: string; port: PortName; point: Point } | null {
  let closest: { elementId: string; port: PortName; point: Point } | null = null;
  let minDist = snapRadius;

  for (const el of elements) {
    if (el.id === excludeId || el.type === 'line' || el.type === 'arrow' || el.type === 'draw') {
      continue;
    }

    const ports = getShapePorts(el);
    for (const [portName, portPt] of Object.entries(ports)) {
      const d = distanceBetweenPoints(point, portPt);
      if (d < minDist) {
        minDist = d;
        closest = {
          elementId: el.id,
          port: portName as PortName,
          point: portPt
        };
      }
    }
  }

  return closest;
}

/**
 * Updates positions of all arrows/lines connected to moved shapes.
 */
export function updateConnectedConnectors(
  elements: WhiteboardElement[]
): WhiteboardElement[] {
  const elementMap = new Map<string, WhiteboardElement>();
  elements.forEach(el => elementMap.set(el.id, el));

  return elements.map(el => {
    if (el.type !== 'arrow' && el.type !== 'line') return el;
    let updated = { ...el };

    if (el.startBinding) {
      const target = elementMap.get(el.startBinding.elementId);
      if (target) {
        const ports = getShapePorts(target);
        const portPt = ports[el.startBinding.port];
        if (portPt) {
          const currentEnd = { x: el.x + el.width, y: el.y + el.height };
          updated.x = portPt.x;
          updated.y = portPt.y;
          updated.width = currentEnd.x - portPt.x;
          updated.height = currentEnd.y - portPt.y;
        }
      }
    }

    if (el.endBinding) {
      const target = elementMap.get(el.endBinding.elementId);
      if (target) {
        const ports = getShapePorts(target);
        const portPt = ports[el.endBinding.port];
        if (portPt) {
          updated.width = portPt.x - updated.x;
          updated.height = portPt.y - updated.y;
        }
      }
    }

    return updated;
  });
}

/**
 * Tests if an element intersects or is inside a marquee selection box.
 */
export function isElementIntersectingBox(element: WhiteboardElement, box: BoundingBox): boolean {
  const elBounds = getElementBounds(element);
  return !(
    elBounds.maxX < box.minX ||
    elBounds.minX > box.maxX ||
    elBounds.maxY < box.minY ||
    elBounds.minY > box.maxY
  );
}



