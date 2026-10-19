import React, { useState, useEffect, useCallback, useRef } from 'react';
import { nanoid } from 'nanoid';
import { Canvas } from './components/Canvas/Canvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { StylePicker } from './components/Toolbar/StylePicker';
import { ActionControls } from './components/Toolbar/ActionControls';
import { InsertModal } from './components/Toolbar/InsertModal';
import { ToolType, ElementStyle, WhiteboardElement } from './types/elements';
import { Camera } from './types/canvas';
import { DEFAULT_CAMERA, DEFAULT_STYLE } from './constants/canvas';
import { useHistory } from './hooks/useHistory';
import { initDocumentSync, syncDocumentChange, saveDocumentImmediate } from './services/vscode';
import { useTheme } from './hooks/useTheme';

export const App: React.FC = () => {
  const { preference, resolvedTheme, cycleTheme } = useTheme();
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [currentStyle, setCurrentStyle] = useState<ElementStyle>(DEFAULT_STYLE);
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);

  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { pushState, undo, redo, canUndo, canRedo } = useHistory(elements);

  // 1. Document initialization (handles both VS Code custom editor and browser dev mode)
  useEffect(() => {
    return initDocumentSync({
      onLoad: data => {
        if (data.elements) {
          setElements(data.elements);
        }
        if (data.camera) {
          setCamera(data.camera);
        }
      }
    });
  }, []);

  // 2. Debounced asynchronous persistence (sends update to VS Code host or local storage)
  const scheduleSave = useCallback((newElements: WhiteboardElement[]) => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      syncDocumentChange(newElements, camera);
    }, 300);
  }, [camera]);

  const handleElementsChange = useCallback(
    (newElements: WhiteboardElement[], recordHistory = false) => {
      setElements(newElements);
      if (recordHistory) {
        pushState(newElements);
        scheduleSave(newElements);
      }
    },
    [pushState, scheduleSave]
  );

  // Apply style changes to current style and any selected unlocked elements
  const handleStyleChange = useCallback(
    (newStyle: ElementStyle) => {
      setCurrentStyle(newStyle);
      if (selectedIds.length > 0) {
        const updated = elements.map(el => {
          if (selectedIds.includes(el.id) && !el.locked) {
            return {
              ...el,
              strokeColor: newStyle.strokeColor,
              fillColor: newStyle.fillColor,
              strokeWidth: newStyle.strokeWidth,
              roughness: newStyle.roughness,
              fontSize: newStyle.fontSize,
              fontFamily: newStyle.fontFamily,
              textAlign: newStyle.textAlign,
              verticalAlign: newStyle.verticalAlign
            };
          }
          return el;
        });
        handleElementsChange(updated, true);
      }
    },
    [selectedIds, elements, handleElementsChange]
  );

  // Sync style picker values to currently selected element
  useEffect(() => {
    if (selectedIds.length === 1) {
      const selected = elements.find(el => el.id === selectedIds[0]);
      if (selected) {
        setCurrentStyle(prev => ({
          ...prev,
          strokeColor: selected.strokeColor || prev.strokeColor,
          fillColor: selected.fillColor || prev.fillColor,
          strokeWidth: selected.strokeWidth ?? prev.strokeWidth,
          roughness: selected.roughness ?? prev.roughness,
          fontSize: selected.fontSize || prev.fontSize,
          fontFamily: selected.fontFamily || prev.fontFamily,
          textAlign: selected.textAlign || prev.textAlign,
          verticalAlign: selected.verticalAlign || prev.verticalAlign
        }));
      }
    }
  }, [selectedIds, elements]);

  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      setElements(prevState);
      setSelectedIds([]);
      scheduleSave(prevState);
    }
  }, [undo, scheduleSave]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setElements(nextState);
      setSelectedIds([]);
      scheduleSave(nextState);
    }
  }, [redo, scheduleSave]);

  // Lock / Unlock toggle
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

    handleElementsChange(updated, true);
  }, [selectedIds, elements, handleElementsChange]);

  // Group selected items
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

    handleElementsChange(updated, true);
  }, [selectedIds, elements, handleElementsChange]);

  // Ungroup selected items
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

    handleElementsChange(updated, true);
  }, [selectedIds, elements, handleElementsChange]);

  // Delete selected items
  const handleDeleteSelected = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;

    const updated = elements.filter(el => !(ids.includes(el.id) && !el.locked));
    handleElementsChange(updated, true);
    setSelectedIds([]);
  }, [selectedIds, elements, handleElementsChange]);

  // Duplicate selected items
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
    handleElementsChange([...elements, ...newElements], true);
    setSelectedIds(newElements.map(el => el.id));
  }, [selectedIds, elements, handleElementsChange]);

  // Copy & Paste
  const clipboardRef = useRef<WhiteboardElement[]>([]);
  const handleCopySelected = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;
    clipboardRef.current = elements.filter(el => ids.includes(el.id));
  }, [selectedIds, elements]);

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
    handleElementsChange([...elements, ...newElements], true);
    setSelectedIds(newElements.map(el => el.id));
  }, [elements, handleElementsChange]);

  // Layer Reordering (Z-Index / Array Order)
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
    handleElementsChange(reindexed, true);
  }, [selectedIds, elements, handleElementsChange]);

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
    handleElementsChange(reindexed, true);
  }, [selectedIds, elements, handleElementsChange]);

  const handleBringToFront = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const unselected = sorted.filter(el => !ids.includes(el.id));
    const selected = sorted.filter(el => ids.includes(el.id));
    const reindexed = [...unselected, ...selected].map((el, i) => ({ ...el, zIndex: i }));
    handleElementsChange(reindexed, true);
  }, [selectedIds, elements, handleElementsChange]);

  const handleSendToBack = useCallback((specificIds?: string[] | unknown) => {
    const ids = Array.isArray(specificIds) ? specificIds : selectedIds;
    if (ids.length === 0) return;
    const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    const selected = sorted.filter(el => ids.includes(el.id));
    const unselected = sorted.filter(el => !ids.includes(el.id));
    const reindexed = [...selected, ...unselected].map((el, i) => ({ ...el, zIndex: i }));
    handleElementsChange(reindexed, true);
  }, [selectedIds, elements, handleElementsChange]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'TEXTAREA' || document.activeElement?.tagName === 'INPUT') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        // Immediately flush and trigger document save to disk in VS Code
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
          saveTimerRef.current = null;
        }
        saveDocumentImmediate(elements, camera);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        handleDuplicateSelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        handleCopySelected();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePaste();
      } else if ((e.ctrlKey || e.metaKey) && e.key === ']') {
        e.preventDefault();
        handleBringForward();
      } else if ((e.ctrlKey || e.metaKey) && e.key === '[') {
        e.preventDefault();
        handleSendBackward();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault();
        if (e.shiftKey) {
          handleUngroupSelected();
        } else {
          handleGroupSelected();
        }
      } else if (e.key.toLowerCase() === 'l') {
        handleToggleLock();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
      } else if (e.key === '1') {
        setActiveTool('select');
      } else if (e.key === '2') {
        setActiveTool('draw');
      } else if (e.key === '3') {
        setActiveTool('rectangle');
      } else if (e.key === '4') {
        setActiveTool('ellipse');
      } else if (e.key === '5') {
        setActiveTool('arrow');
      } else if (e.key === '6') {
        setActiveTool('line');
      } else if (e.key.toLowerCase() === 't') {
        setActiveTool('text');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveTool('pan');
      } else if (e.key.toLowerCase() === 'i' || e.key === '/') {
        e.preventDefault();
        setIsInsertModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    handleDuplicateSelected,
    handleCopySelected,
    handlePaste,
    handleBringForward,
    handleSendBackward,
    handleToggleLock,
    handleGroupSelected,
    handleUngroupSelected,
    handleDeleteSelected
  ]);

  const selectedElements = elements.filter(el => selectedIds.includes(el.id));

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: resolvedTheme === 'dark' ? '#121214' : '#fafafa',
        transition: 'background-color 0.2s ease'
      }}
    >
      <Toolbar
        activeTool={activeTool}
        onToolSelect={setActiveTool}
        selectedElements={selectedElements}
        onToggleLock={handleToggleLock}
        onGroupSelected={handleGroupSelected}
        onUngroupSelected={handleUngroupSelected}
        onDeleteSelected={handleDeleteSelected}
        onOpenInsertModal={() => setIsInsertModalOpen(true)}
        theme={resolvedTheme}
      />
      <StylePicker style={currentStyle} onStyleChange={handleStyleChange} theme={resolvedTheme} />
      <Canvas
        elements={elements}
        onElementsChange={handleElementsChange}
        activeTool={activeTool}
        onToolSelect={setActiveTool}
        currentStyle={currentStyle}
        camera={camera}
        onCameraChange={setCamera}
        selectedIds={selectedIds}
        onSelectedIdsChange={setSelectedIds}
        onDuplicateSelected={handleDuplicateSelected}
        onCopySelected={handleCopySelected}
        onDeleteSelected={handleDeleteSelected}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onBringToFront={handleBringToFront}
        onSendToBack={handleSendToBack}
        onToggleLock={handleToggleLock}
        onGroupSelected={handleGroupSelected}
        onUngroupSelected={handleUngroupSelected}
        canPaste={clipboardRef.current.length > 0}
        onPaste={handlePaste}
        theme={resolvedTheme}
      />
      <ActionControls
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        camera={camera}
        onCameraChange={setCamera}
        elements={elements}
        onElementsChange={handleElementsChange}
        themePreference={preference}
        resolvedTheme={resolvedTheme}
        onCycleTheme={cycleTheme}
      />
      <InsertModal
        isOpen={isInsertModalOpen}
        onClose={() => setIsInsertModalOpen(false)}
        camera={camera}
        elements={elements}
        onElementsChange={handleElementsChange}
        onSelectedIdsChange={setSelectedIds}
        theme={resolvedTheme}
      />
    </div>
  );
};
