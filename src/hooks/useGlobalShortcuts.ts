import { useEffect } from 'react';
import { ToolType } from '../types/elements';

interface ShortcutActions {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onDuplicate: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onGroup: () => void;
  onUngroup: () => void;
  onToggleLock: () => void;
  onDelete: () => void;
  onSelectTool: (tool: ToolType) => void;
  onOpenInsertModal: () => void;
}

export function useGlobalShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        actions.onSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) actions.onRedo();
        else actions.onUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        actions.onRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        actions.onDuplicate();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        actions.onCopy();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        actions.onPaste();
      } else if ((e.ctrlKey || e.metaKey) && e.key === ']') {
        e.preventDefault();
        actions.onBringForward();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        actions.onSendBackward();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) actions.onUngroup();
        else actions.onGroup();
      } else if (e.key.toLowerCase() === 'l') {
        actions.onToggleLock();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        actions.onDelete();
      } else if (e.key === '1') actions.onSelectTool('select');
      else if (e.key === '2') actions.onSelectTool('draw');
      else if (e.key === '3') actions.onSelectTool('rectangle');
      else if (e.key === '4') actions.onSelectTool('ellipse');
      else if (e.key === '5') actions.onSelectTool('arrow');
      else if (e.key === '6') actions.onSelectTool('line');
      else if (e.key.toLowerCase() === 't') actions.onSelectTool('text');
      else if (e.key === '8') actions.onSelectTool('todo');
      else if (e.key.toLowerCase() === 'h') actions.onSelectTool('pan');
      else if (e.key.toLowerCase() === 'i' || e.key === '/') {
        e.preventDefault();
        actions.onOpenInsertModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [actions]);
}
