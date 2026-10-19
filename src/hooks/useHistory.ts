import { useState, useCallback } from 'react';
import { WhiteboardElement } from '../types/elements';

const MAX_HISTORY = 50;

export function useHistory(initialState: WhiteboardElement[]) {
  const [history, setHistory] = useState<WhiteboardElement[][]>([initialState]);
  const [index, setIndex] = useState(0);

  const pushState = useCallback((newElements: WhiteboardElement[]) => {
    setHistory(prev => {
      const upToCurrent = prev.slice(0, index + 1);
      const updated = [...upToCurrent, newElements];
      if (updated.length > MAX_HISTORY) {
        return updated.slice(updated.length - MAX_HISTORY);
      }
      return updated;
    });
    setIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [index]);

  const undo = useCallback((): WhiteboardElement[] | null => {
    if (index > 0) {
      const newIndex = index - 1;
      setIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [index, history]);

  const redo = useCallback((): WhiteboardElement[] | null => {
    if (index < history.length - 1) {
      const newIndex = index + 1;
      setIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [index, history]);

  return {
    pushState,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
    currentState: history[index] || initialState
  };
}
