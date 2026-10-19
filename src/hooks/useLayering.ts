import { useCallback } from 'react';
import { WhiteboardElement } from '../types/elements';

export function useLayering(
  elements: WhiteboardElement[],
  selectedIds: string[],
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void
) {
  const handleBringForward = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    for (let i = sorted.length - 2; i >= 0; i--) {
      if (ids.includes(sorted[i].id) && !ids.includes(sorted[i + 1].id)) {
        const temp = sorted[i];
        sorted[i] = sorted[i + 1];
        sorted[i + 1] = temp;
      }
    }
    const reindexed = sorted.map((el, i) => ({ ...el, zIndex: i }));
    onElementsChange(reindexed, true);
  }, [selectedIds, elements, onElementsChange]);

  const handleSendBackward = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    for (let i = 1; i < sorted.length; i++) {
      if (ids.includes(sorted[i].id) && !ids.includes(sorted[i - 1].id)) {
        const temp = sorted[i];
        sorted[i] = sorted[i - 1];
        sorted[i - 1] = temp;
      }
    }
    const reindexed = sorted.map((el, i) => ({ ...el, zIndex: i }));
    onElementsChange(reindexed, true);
  }, [selectedIds, elements, onElementsChange]);

  const handleBringToFront = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const unselected = sorted.filter(el => !ids.includes(el.id));
    const selected = sorted.filter(el => ids.includes(el.id));
    const reindexed = [...unselected, ...selected].map((el, i) => ({ ...el, zIndex: i }));
    onElementsChange(reindexed, true);
  }, [selectedIds, elements, onElementsChange]);

  const handleSendToBack = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const selected = sorted.filter(el => ids.includes(el.id));
    const unselected = sorted.filter(el => !ids.includes(el.id));
    const reindexed = [...selected, ...unselected].map((el, i) => ({ ...el, zIndex: i }));
    onElementsChange(reindexed, true);
  }, [selectedIds, elements, onElementsChange]);

  return {
    handleBringForward,
    handleSendBackward,
    handleBringToFront,
    handleSendToBack
  };
}
