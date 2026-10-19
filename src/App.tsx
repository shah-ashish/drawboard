import React, { useState, useCallback } from 'react';
import { Canvas } from './components/Canvas/Canvas';
import { Toolbar } from './components/Toolbar/Toolbar';
import { StylePicker } from './components/Toolbar/StylePicker';
import { ActionControls } from './components/Toolbar/ActionControls';
import { InsertModal } from './components/Toolbar/InsertModal';
import { ToolType, WhiteboardElement } from './types/elements';
import { Camera } from './types/canvas';
import { DEFAULT_CAMERA } from './constants/canvas';
import { useHistory } from './hooks/useHistory';
import { useTheme } from './hooks/useTheme';
import { useClipboard } from './hooks/useClipboard';
import { useLayering } from './hooks/useLayering';
import { useElementActions } from './hooks/useElementActions';
import { useGlobalShortcuts } from './hooks/useGlobalShortcuts';
import { useElementStyles } from './hooks/useElementStyles';
import { useDocumentPersistence } from './hooks/useDocumentPersistence';

export const App: React.FC = () => {
  const { preference, resolvedTheme, cycleTheme } = useTheme();
  const [elements, setElements] = useState<WhiteboardElement[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const [isInsertModalOpen, setIsInsertModalOpen] = useState(false);

  const { pushState, undo, redo, canUndo, canRedo } = useHistory(elements);
  const { scheduleSave, saveImmediate } = useDocumentPersistence(setElements, setCamera, camera);

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

  const { currentStyle, handleStyleChange } = useElementStyles(elements, selectedIds, handleElementsChange);
  const clipboard = useClipboard(elements, selectedIds, handleElementsChange, setSelectedIds);
  const layering = useLayering(elements, selectedIds, handleElementsChange);
  const actions = useElementActions(elements, selectedIds, handleElementsChange, setSelectedIds);

  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) { setElements(prevState); setSelectedIds([]); scheduleSave(prevState); }
  }, [undo, scheduleSave]);

  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) { setElements(nextState); setSelectedIds([]); scheduleSave(nextState); }
  }, [redo, scheduleSave]);

  useGlobalShortcuts({
    onSave: () => saveImmediate(elements),
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDuplicate: () => clipboard.handleDuplicateSelected(),
    onCopy: () => clipboard.handleCopySelected(),
    onPaste: () => clipboard.handlePaste(),
    onBringForward: () => layering.handleBringForward(),
    onSendBackward: () => layering.handleSendBackward(),
    onGroup: () => actions.handleGroupSelected(),
    onUngroup: () => actions.handleUngroupSelected(),
    onToggleLock: () => actions.handleToggleLock(),
    onDelete: () => actions.handleDeleteSelected(),
    onSelectTool: setActiveTool,
    onOpenInsertModal: () => setIsInsertModalOpen(true)
  });

  const selectedElements = elements.filter(el => selectedIds.includes(el.id));

  return (
    <div
      style={{
        position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden',
        backgroundColor: resolvedTheme === 'dark' ? '#121214' : '#fafafa',
        transition: 'background-color 0.2s ease'
      }}
    >
      <Toolbar
        activeTool={activeTool}
        onToolSelect={setActiveTool}
        selectedElements={selectedElements}
        allElements={elements}
        selectedIds={selectedIds}
        onToggleLock={actions.handleToggleLock}
        onGroupSelected={actions.handleGroupSelected}
        onUngroupSelected={actions.handleUngroupSelected}
        onDeleteSelected={actions.handleDeleteSelected}
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
        onDuplicateSelected={clipboard.handleDuplicateSelected}
        onCopySelected={clipboard.handleCopySelected}
        onDeleteSelected={actions.handleDeleteSelected}
        onBringForward={layering.handleBringForward}
        onSendBackward={layering.handleSendBackward}
        onBringToFront={layering.handleBringToFront}
        onSendToBack={layering.handleSendToBack}
        onToggleLock={actions.handleToggleLock}
        onGroupSelected={actions.handleGroupSelected}
        onUngroupSelected={actions.handleUngroupSelected}
        canPaste={clipboard.canPaste}
        onPaste={clipboard.handlePaste}
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
