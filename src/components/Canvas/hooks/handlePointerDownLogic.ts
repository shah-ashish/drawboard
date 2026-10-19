import { nanoid } from 'nanoid';
import { Point, Camera, ResizeHandle, BoundingBox } from '../../../types/canvas';
import { WhiteboardElement, ToolType, ElementStyle, ActionType } from '../../../types/elements';
import { getElementBounds, getHandleAtPoint, isPointInsideElement, PortName } from '../../../utils/geometry';
import { handleTodoInteractions } from './useTodoItemClicks';
import { createNewElementForTool } from './useCreationTool';

interface PointerDownContext {
  elements: WhiteboardElement[];
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void;
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  currentStyle: ElementStyle;
  camera: Camera;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  isSpacePressed: boolean;
  hoveredPort: { elementId: string; port: PortName; point: Point } | null;
  setEditingText: (val: any) => void;
  setAction: (act: ActionType | 'selecting_box') => void;
  setSelectionBox: (box: BoundingBox | null) => void;
  setHoveredPort: (port: any) => void;
  activeElementIdRef: React.MutableRefObject<string | null>;
  activeHandleRef: React.MutableRefObject<ResizeHandle | null>;
  initialBoundsRef: React.MutableRefObject<{ x: number; y: number; width: number; height: number } | null>;
  theme: 'light' | 'dark';
}

export function handleCanvasPointerDown(
  screenPos: Point,
  worldPos: Point,
  eButton: number,
  ctx: PointerDownContext
) {
  if (ctx.activeTool === 'pan' || ctx.isSpacePressed || eButton === 1) {
    ctx.setAction('panning');
    return;
  }

  if (ctx.activeTool === 'select') {
    if (ctx.hoveredPort) {
      const newId = nanoid();
      ctx.activeElementIdRef.current = newId;
      const newArrow: WhiteboardElement = {
        id: newId, type: 'arrow', x: ctx.hoveredPort.point.x, y: ctx.hoveredPort.point.y,
        width: 0, height: 0, strokeColor: ctx.currentStyle.strokeColor, fillColor: ctx.currentStyle.fillColor,
        strokeWidth: ctx.currentStyle.strokeWidth, roughness: ctx.currentStyle.roughness,
        seed: Math.floor(Math.random() * 2000000), zIndex: ctx.elements.length,
        startBinding: { elementId: ctx.hoveredPort.elementId, port: ctx.hoveredPort.port }
      };
      ctx.onElementsChange([...ctx.elements, newArrow], false);
      ctx.onSelectedIdsChange([newId]);
      ctx.setAction('drawing');
      ctx.setHoveredPort(null);
      return;
    }

    if (ctx.selectedIds.length === 1) {
      const single = ctx.elements.find(el => el.id === ctx.selectedIds[0]);
      if (single && !single.locked) {
        const pt = single.pinnedToScreen ? screenPos : worldPos;
        const handle = getHandleAtPoint(pt, getElementBounds(single), single.pinnedToScreen ? 1 : ctx.camera.zoom);
        if (handle) {
          ctx.setAction('resizing');
          ctx.activeHandleRef.current = handle;
          ctx.activeElementIdRef.current = single.id;
          ctx.initialBoundsRef.current = { x: single.x, y: single.y, width: single.width, height: single.height };
          return;
        }
      }
    }

    const sorted = [...ctx.elements].sort((a, b) => {
      const aPin = Boolean(a.pinnedToScreen);
      const bPin = Boolean(b.pinnedToScreen);
      if (aPin !== bPin) return aPin ? -1 : 1;
      return b.zIndex - a.zIndex;
    });
    const hit = sorted.find(el => isPointInsideElement(el.pinnedToScreen ? screenPos : worldPos, el));

    if (hit) {
      if (hit.type === 'todo') {
        const pt = hit.pinnedToScreen ? screenPos : worldPos;
        if (handleTodoInteractions(hit, pt, ctx.camera, ctx.elements, ctx.onElementsChange, ctx.onSelectedIdsChange, ctx.setEditingText)) {
          return;
        }
      }
      let toSelect = [hit.id];
      if (hit.groupIds && hit.groupIds.length > 0) {
        const gid = hit.groupIds[0];
        toSelect = ctx.elements.filter(el => el.groupIds?.includes(gid)).map(el => el.id);
      }
      ctx.onSelectedIdsChange(toSelect);
      ctx.activeElementIdRef.current = hit.id;
      ctx.setAction(ctx.elements.some(el => toSelect.includes(el.id) && el.locked) ? 'none' : 'moving');
    } else {
      ctx.onSelectedIdsChange([]);
      ctx.setAction('selecting_box');
      ctx.setSelectionBox({ minX: worldPos.x, minY: worldPos.y, maxX: worldPos.x, maxY: worldPos.y, width: 0, height: 0 });
    }
    return;
  }

  const { element, todoTaskId } = createNewElementForTool(ctx.activeTool, worldPos, ctx.currentStyle, ctx.elements.length, ctx.elements, ctx.theme);
  ctx.activeElementIdRef.current = element.id;

  if (ctx.activeTool === 'todo') {
    ctx.onElementsChange([...ctx.elements, element], true);
    ctx.onSelectedIdsChange([element.id]);
    ctx.setEditingText({
      elementId: element.id, todoItemId: todoTaskId, worldPos: { x: worldPos.x + 40, y: worldPos.y + 46 },
      text: '', fontSize: 13, fontFamily: 'Inter, sans-serif', color: ctx.currentStyle.strokeColor,
      isShapeLabel: false, bounds: { width: element.width - 54, height: 26 }, textAlign: 'left', verticalAlign: 'middle'
    });
    ctx.onToolSelect('select');
    return;
  }

  if (ctx.activeTool === 'text') {
    ctx.onElementsChange([...ctx.elements, element], false);
    ctx.onSelectedIdsChange([element.id]);
    ctx.setEditingText({
      elementId: element.id, worldPos: { x: worldPos.x, y: worldPos.y }, text: '',
      fontSize: ctx.currentStyle.fontSize, fontFamily: ctx.currentStyle.fontFamily, color: ctx.currentStyle.strokeColor,
      isShapeLabel: false, bounds: { width: 200, height: 45 }, textAlign: ctx.currentStyle.textAlign || 'left', verticalAlign: ctx.currentStyle.verticalAlign || 'top'
    });
    ctx.onToolSelect('select');
    return;
  }

  ctx.onElementsChange([...ctx.elements, element], false);
  ctx.onSelectedIdsChange([element.id]);
  ctx.setAction('drawing');
}
