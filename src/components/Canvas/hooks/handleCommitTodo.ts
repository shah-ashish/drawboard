import { nanoid } from 'nanoid';
import { WhiteboardElement } from '../../../types/elements';
import { getElementBounds } from '../../../utils/geometry';
import { EditingTextState } from './useCanvasTextEditing';

export function commitTodoChange(
  targetEl: WhiteboardElement,
  editingText: EditingTextState,
  newText: string,
  trimmed: string,
  options: { createNext?: boolean } | undefined,
  elements: WhiteboardElement[],
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void,
  setEditingText: (val: EditingTextState | null) => void
) {
  const updatedItems = [...(targetEl.todoItems || [])];
  let nextTodoIdToEdit: string | null = null;
  let nextIndex = 0;

  if (editingText.todoItemId) {
    const idx = updatedItems.findIndex(it => it.id === editingText.todoItemId);
    if (idx >= 0) {
      if (!trimmed && options?.createNext) options.createNext = false;
      if (!trimmed && !options?.createNext && updatedItems.length > 1) {
        updatedItems.splice(idx, 1);
      } else {
        updatedItems[idx] = { ...updatedItems[idx], text: newText };
        nextIndex = idx + 1;
      }
    }
  } else {
    targetEl.text = trimmed ? newText : 'To Do List';
  }

  if (options?.createNext && trimmed) {
    const newTaskId = nanoid();
    nextTodoIdToEdit = newTaskId;
    updatedItems.splice(nextIndex, 0, { id: newTaskId, text: '', checked: false });
  }

  const rowH = 34;
  const requiredH = 42 + updatedItems.length * rowH + 34;
  const updatedEl = { ...targetEl, todoItems: updatedItems, height: Math.max(targetEl.height, requiredH) };
  onElementsChange(elements.map(el => (el.id === targetEl.id ? updatedEl : el)), true);

  if (nextTodoIdToEdit) {
    const b = getElementBounds(updatedEl);
    setEditingText({
      elementId: targetEl.id,
      todoItemId: nextTodoIdToEdit,
      isPinned: Boolean(updatedEl.pinnedToScreen),
      worldPos: { x: b.minX + 40, y: b.minY + 42 + nextIndex * rowH + 4 },
      text: '',
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
      color: targetEl.strokeColor,
      isShapeLabel: false,
      bounds: { width: Math.max(b.width - 54, 80), height: 26 },
      textAlign: 'left',
      verticalAlign: 'middle'
    });
    return;
  }

  setEditingText(null);
}
