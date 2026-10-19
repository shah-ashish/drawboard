import { nanoid } from 'nanoid';
import { Point, Camera } from '../../../types/canvas';
import { WhiteboardElement } from '../../../types/elements';
import { getElementBounds } from '../../../utils/geometry';
import { screenToWorld, worldToScreen } from '../../../utils/coordinates';

export function handleTodoInteractions(
  hit: WhiteboardElement,
  pt: Point,
  camera: Camera,
  elements: WhiteboardElement[],
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void,
  onSelectedIdsChange: (ids: string[]) => void,
  setEditingText: (val: any) => void
): boolean {
  if (hit.type !== 'todo') return false;

  const bounds = getElementBounds(hit);
  const isPinned = Boolean(hit.pinnedToScreen);

  // 1. Pin button
  const pinW = 24;
  const pinH = 22;
  const pinX = bounds.maxX - pinW - 12;
  const pinY = bounds.minY + 8;

  if (pt.x >= pinX && pt.x <= pinX + pinW && pt.y >= pinY && pt.y <= pinY + pinH) {
    let updatedX = hit.x;
    let updatedY = hit.y;
    if (isPinned) {
      const world = screenToWorld({ x: hit.x, y: hit.y }, camera);
      updatedX = Math.round(world.x);
      updatedY = Math.round(world.y);
    } else {
      const screen = worldToScreen({ x: hit.x, y: hit.y }, camera);
      updatedX = Math.round(screen.x);
      updatedY = Math.round(screen.y);
    }
    const updatedEl: WhiteboardElement = {
      ...hit,
      x: updatedX,
      y: updatedY,
      pinnedToScreen: !isPinned
    };
    onElementsChange(elements.map(el => (el.id === hit.id ? updatedEl : el)), true);
    onSelectedIdsChange([hit.id]);
    return true;
  }

  // 2. Checkbox circle
  const items = hit.todoItems || [];
  const startY = bounds.minY + 42;
  const rowH = 34;

  for (let i = 0; i < items.length; i++) {
    const rowY = startY + i * rowH;
    const cx = bounds.minX + 24;
    const cy = rowY + rowH / 2;
    if (Math.hypot(pt.x - cx, pt.y - cy) <= 14) {
      const updatedItems = items.map((it, idx) =>
        idx === i ? { ...it, checked: !it.checked } : it
      );
      onElementsChange(
        elements.map(el => (el.id === hit.id ? { ...el, todoItems: updatedItems } : el)),
        true
      );
      return true;
    }
  }

  // 3. "+ Add task" row
  const footerY = startY + items.length * rowH;
  if (pt.y >= footerY && pt.y <= footerY + 30 && pt.x >= bounds.minX && pt.x <= bounds.maxX) {
    const newTaskId = nanoid();
    const newItem = { id: newTaskId, text: '', checked: false };
    const updatedItems = [...items, newItem];
    const requiredH = 42 + updatedItems.length * rowH + 34;
    const updatedEl = {
      ...hit,
      todoItems: updatedItems,
      height: Math.max(hit.height, requiredH)
    };
    onElementsChange(elements.map(el => (el.id === hit.id ? updatedEl : el)), true);
    onSelectedIdsChange([hit.id]);
    setEditingText({
      elementId: hit.id,
      todoItemId: newTaskId,
      isPinned: Boolean(hit.pinnedToScreen),
      worldPos: { x: bounds.minX + 40, y: footerY + 4 },
      text: '',
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
      color: hit.strokeColor,
      isShapeLabel: false,
      bounds: { width: Math.max(bounds.width - 54, 80), height: 26 },
      textAlign: 'left',
      verticalAlign: 'middle'
    });
    return true;
  }

  return false;
}
