import { useEffect, useRef, useCallback } from 'react';
import { Camera } from '../types/canvas';
import { WhiteboardElement } from '../types/elements';
import { initDocumentSync, syncDocumentChange, saveDocumentImmediate } from '../services/vscode';

export function useDocumentPersistence(
  setElements: (elements: WhiteboardElement[]) => void,
  setCamera: (camera: Camera) => void,
  camera: Camera
) {
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return initDocumentSync({
      onLoad: data => {
        if (data.elements) setElements(data.elements);
        if (data.camera) setCamera(data.camera);
      }
    });
  }, [setElements, setCamera]);

  const scheduleSave = useCallback(
    (newElements: WhiteboardElement[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        syncDocumentChange(newElements, camera);
      }, 300);
    },
    [camera]
  );

  const saveImmediate = useCallback(
    (elements: WhiteboardElement[]) => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      saveDocumentImmediate(elements, camera);
    },
    [camera]
  );

  return { scheduleSave, saveImmediate };
}
