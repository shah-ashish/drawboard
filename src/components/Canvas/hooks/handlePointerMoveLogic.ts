import { Point, Camera, ResizeHandle, BoundingBox } from '../../../types/canvas';
import { WhiteboardElement, ToolType, ActionType } from '../../../types/elements';
import { resizeElement, findNearestPort, updateConnectedConnectors, PortName } from '../../../utils/geometry';
import { detectCanvasHover } from './canvasHover';

interface PointerMoveContext {
  action: ActionType | 'selecting_box';
  startScreenPointRef: React.MutableRefObject<Point>;
  startWorldPointRef: React.MutableRefObject<Point>;
  activeHandleRef: React.MutableRefObject<ResizeHandle | null>;
  initialBoundsRef: React.MutableRefObject<{ x: number; y: number; width: number; height: number } | null>;
  activeElementIdRef: React.MutableRefObject<string | null>;
  endPortRef: React.MutableRefObject<{ elementId: string; port: PortName } | null>;
  elements: WhiteboardElement[];
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void;
  camera: Camera;
  onCameraChange: (camera: Camera) => void;
  selectedIds: string[];
  activeTool: ToolType;
  setSelectionBox: (box: BoundingBox | null) => void;
  setActiveSnapPort: (pt: Point | null) => void;
  setHoveredHandle: (h: ResizeHandle | null) => void;
  setHoveredId: (id: string | null) => void;
  setHoveredPort: (p: any) => void;
}

export function handleCanvasPointerMove(
  screenPos: Point,
  worldPos: Point,
  ctx: PointerMoveContext
) {
  if (ctx.action === 'panning') {
    const dx = screenPos.x - ctx.startScreenPointRef.current.x;
    const dy = screenPos.y - ctx.startScreenPointRef.current.y;
    ctx.startScreenPointRef.current = screenPos;
    ctx.onCameraChange({ ...ctx.camera, x: ctx.camera.x + dx, y: ctx.camera.y + dy });
    return;
  }

  if (ctx.action === 'selecting_box') {
    const minX = Math.min(ctx.startWorldPointRef.current.x, worldPos.x);
    const minY = Math.min(ctx.startWorldPointRef.current.y, worldPos.y);
    const maxX = Math.max(ctx.startWorldPointRef.current.x, worldPos.x);
    const maxY = Math.max(ctx.startWorldPointRef.current.y, worldPos.y);
    ctx.setSelectionBox({ minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY });
    return;
  }

  if (ctx.action === 'resizing' && ctx.activeHandleRef.current && ctx.initialBoundsRef.current && ctx.activeElementIdRef.current) {
    const activeEl = ctx.elements.find(el => el.id === ctx.activeElementIdRef.current);
    if (activeEl) {
      const pt = activeEl.pinnedToScreen ? screenPos : worldPos;
      const resized = resizeElement(activeEl, ctx.activeHandleRef.current, pt, ctx.initialBoundsRef.current);
      ctx.onElementsChange(updateConnectedConnectors(ctx.elements.map(el => (el.id === activeEl.id ? resized : el))), false);
    }
    return;
  }

  if (ctx.action === 'moving') {
    const dxW = worldPos.x - ctx.startWorldPointRef.current.x;
    const dyW = worldPos.y - ctx.startWorldPointRef.current.y;
    const dxS = screenPos.x - ctx.startScreenPointRef.current.x;
    const dyS = screenPos.y - ctx.startScreenPointRef.current.y;
    ctx.startWorldPointRef.current = worldPos;
    ctx.startScreenPointRef.current = screenPos;

    const updated = ctx.elements.map(el => {
      if (!ctx.selectedIds.includes(el.id) || el.locked) return el;
      const dx = el.pinnedToScreen ? dxS : dxW;
      const dy = el.pinnedToScreen ? dyS : dyW;
      if (el.type === 'draw' && el.points) return { ...el, points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy })) };
      return { ...el, x: el.x + dx, y: el.y + dy };
    });
    ctx.onElementsChange(updateConnectedConnectors(updated), false);
    return;
  }

  if (ctx.action === 'drawing' && ctx.activeElementIdRef.current) {
    let targetX = worldPos.x;
    let targetY = worldPos.y;
    const activeEl = ctx.elements.find(el => el.id === ctx.activeElementIdRef.current);

    if (activeEl?.type === 'arrow' || activeEl?.type === 'line') {
      const nearest = findNearestPort(worldPos, ctx.elements, activeEl?.startBinding?.elementId || ctx.activeElementIdRef.current, 24 / ctx.camera.zoom);
      if (nearest) {
        targetX = nearest.point.x;
        targetY = nearest.point.y;
        ctx.endPortRef.current = { elementId: nearest.elementId, port: nearest.port };
        ctx.setActiveSnapPort(nearest.point);
      } else {
        ctx.endPortRef.current = null;
        ctx.setActiveSnapPort(null);
      }
    }

    ctx.onElementsChange(ctx.elements.map(el => {
      if (el.id !== ctx.activeElementIdRef.current) return el;
      if (el.type === 'draw') return { ...el, points: [...(el.points || []), worldPos] };
      return { ...el, width: targetX - el.x, height: targetY - el.y, endBinding: ctx.endPortRef.current || undefined };
    }), false);
    return;
  }

  if (ctx.activeTool === 'select' && ctx.action === 'none') {
    const hoverResult = detectCanvasHover(screenPos, worldPos, ctx.elements, ctx.selectedIds, ctx.camera);
    ctx.setHoveredHandle(hoverResult.hoveredHandle);
    ctx.setHoveredId(hoverResult.hoveredId);
    ctx.setHoveredPort(hoverResult.hoveredPort);
  }
}
