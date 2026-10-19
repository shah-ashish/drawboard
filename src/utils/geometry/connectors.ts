import { Point } from '../../types/canvas';
import { WhiteboardElement } from '../../types/elements';
import { getElementBounds } from './bounds';
import { distanceBetweenPoints } from './hitTest';

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
    if (el.id === excludeId || el.type === 'line' || el.type === 'arrow' || el.type === 'draw' || el.disableConnectors) {
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
