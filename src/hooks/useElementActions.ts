import { useCallback } from 'react';
import { nanoid } from 'nanoid';
import { WhiteboardElement } from '../types/elements';

export function useElementActions(
  elements: WhiteboardElement[],
  selectedIds: string[],
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void,
  onSelectedIdsChange: (ids: string[]) => void
) {
  const handleToggleLock = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;

    const anyLocked = elements.some(el => ids.includes(el.id) && el.locked);
    const targetLockState = !anyLocked;

    const updated = elements.map(el => {
      if (ids.includes(el.id)) {
        return {
          ...el,
          locked: targetLockState
        };
      }
      return el;
    });

    onElementsChange(updated, true);
  }, [selectedIds, elements, onElementsChange]);

  const handleGroupSelected = useCallback(() => {
    if (selectedIds.length < 2) return;

    const newGroupId = nanoid();
    const updated = elements.map(el => {
      if (selectedIds.includes(el.id)) {
        return {
          ...el,
          groupIds: [newGroupId, ...(el.groupIds || [])]
        };
      }
      return el;
    });

    onElementsChange(updated, true);
  }, [selectedIds, elements, onElementsChange]);

  const handleUngroupSelected = useCallback(() => {
    if (selectedIds.length === 0) return;

    const updated = elements.map(el => {
      if (selectedIds.includes(el.id)) {
        return {
          ...el,
          groupIds: undefined,
          lockedGroupId: undefined
        };
      }
      return el;
    });

    onElementsChange(updated, true);
  }, [selectedIds, elements, onElementsChange]);

  const handleDeleteSelected = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;

    const updated = elements.filter(el => !(ids.includes(el.id) && !el.locked));
    onElementsChange(updated, true);
    onSelectedIdsChange([]);
  }, [selectedIds, elements, onElementsChange, onSelectedIdsChange]);

  return {
    handleToggleLock,
    handleGroupSelected,
    handleUngroupSelected,
    handleDeleteSelected
  };
}
