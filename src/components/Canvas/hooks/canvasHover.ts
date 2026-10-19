import { Point, Camera, ResizeHandle } from '../../../types/canvas';
import { WhiteboardElement } from '../../../types/elements';
import { getElementBounds, getHandleAtPoint, isPointInsideElement, findNearestPort, PortName } from '../../../utils/geometry';

export function detectCanvasHover(
  screenPos: Point,
  worldPos: Point,
  elements: WhiteboardElement[],
  selectedIds: string[],
  camera: Camera
): {
  hoveredHandle: ResizeHandle | null;
  hoveredId: string | null;
  hoveredPort: { elementId: string; port: PortName; point: Point } | null;
} {
  if (selectedIds.length === 1) {
    const single = elements.find(el => el.id === selectedIds[0]);
    if (single && !single.locked) {
      const bounds = getElementBounds(single);
      const pt = single.pinnedToScreen ? screenPos : worldPos;
      const zoomFactor = single.pinnedToScreen ? 1 : camera.zoom;
      const handle = getHandleAtPoint(pt, bounds, zoomFactor);
      if (handle) {
        return { hoveredHandle: handle, hoveredId: null, hoveredPort: null };
      }
    }
  }

  const sorted = [...elements].sort((a, b) => {
    const aPin = Boolean(a.pinnedToScreen);
    const bPin = Boolean(b.pinnedToScreen);
    if (aPin !== bPin) return aPin ? -1 : 1;
    return b.zIndex - a.zIndex;
  });

  const hit = sorted.find(el => isPointInsideElement(el.pinnedToScreen ? screenPos : worldPos, el));
  const hoveredId = hit ? hit.id : null;

  const targetCandidates = elements.filter(
    el => (selectedIds.includes(el.id) || el.id === hit?.id) &&
          el.type !== 'line' && el.type !== 'arrow' && el.type !== 'draw' && !el.locked && !el.pinnedToScreen && !el.disableConnectors
  );
  const hoveredPort = findNearestPort(worldPos, targetCandidates, undefined, 14 / camera.zoom);

  return { hoveredHandle: null, hoveredId, hoveredPort };
}
