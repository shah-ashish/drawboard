import { useRef, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { WhiteboardElement } from '../types/elements';

export function useClipboard(
  elements: WhiteboardElement[],
  selectedIds: string[],
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void,
  onSelectedIdsChange: (ids: string[]) => void
) {
  const clipboardRef = useRef<WhiteboardElement[]>([]);

  const handleCopySelected = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;
    clipboardRef.current = elements.filter(el => ids.includes(el.id));
  }, [selectedIds, elements]);

  const handleDuplicateSelected = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;
    const toDuplicate = elements.filter(el => ids.includes(el.id));
    const newElements: WhiteboardElement[] = toDuplicate.map((el, idx) => {
      const newId = nanoid();
      return {
        ...el,
        id: newId,
        x: el.x + 24,
        y: el.y + 24,
        zIndex: elements.length + idx,
        startBinding: undefined,
        endBinding: undefined,
        points: el.points ? el.points.map(p => ({ x: p.x + 24, y: p.y + 24 })) : undefined
      };
    });
    onElementsChange([...elements, ...newElements], true);
    onSelectedIdsChange(newElements.map(el => el.id));
  }, [selectedIds, elements, onElementsChange, onSelectedIdsChange]);

  const handlePaste = useCallback(() => {
    if (clipboardRef.current.length === 0) return;
    const newElements: WhiteboardElement[] = clipboardRef.current.map((el, idx) => {
      const newId = nanoid();
      return {
        ...el,
        id: newId,
        x: el.x + 24,
        y: el.y + 24,
        zIndex: elements.length + idx,
        startBinding: undefined,
        endBinding: undefined,
        points: el.points ? el.points.map(p => ({ x: p.x + 24, y: p.y + 24 })) : undefined
      };
    });
    onElementsChange([...elements, ...newElements], true);
    onSelectedIdsChange(newElements.map(el => el.id));
  }, [elements, onElementsChange, onSelectedIdsChange]);

  return {
    canPaste: clipboardRef.current.length > 0,
    handleCopySelected,
    handleDuplicateSelected,
    handlePaste
  };
}
