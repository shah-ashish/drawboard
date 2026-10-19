import React from 'react';
import { Camera } from '../../types/canvas';
import { WhiteboardElement } from '../../types/elements';
import { screenToWorld, worldToScreen } from '../../utils/coordinates';
import { ContextMenu } from './ContextMenu';

interface MenuWrapperProps {
  contextMenu: { x: number; y: number; targetIds: string[] } | null;
  onClose: () => void;
  elements: WhiteboardElement[];
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void;
  camera: Camera;
  canPaste?: boolean;
  onPaste?: () => void;
  onCopySelected?: (ids?: string[]) => void;
  onDuplicateSelected?: (ids?: string[]) => void;
  onDeleteSelected?: (ids?: string[]) => void;
  onBringForward?: (ids?: string[]) => void;
  onSendBackward?: (ids?: string[]) => void;
  onBringToFront?: (ids?: string[]) => void;
  onSendToBack?: (ids?: string[]) => void;
  onToggleLock?: (ids?: string[]) => void;
  onGroupSelected?: () => void;
  onUngroupSelected?: () => void;
  theme?: 'light' | 'dark';
}

export const CanvasContextMenuWrapper: React.FC<MenuWrapperProps> = ({
  contextMenu,
  onClose,
  elements,
  onElementsChange,
  camera,
  canPaste,
  onPaste,
  onCopySelected,
  onDuplicateSelected,
  onDeleteSelected,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onGroupSelected,
  onUngroupSelected,
  theme
}) => {
  if (!contextMenu) return null;

  const targetId = contextMenu.targetIds[0];

  const handleToggleChecked = () => {
    onElementsChange(elements.map(el => (el.id === targetId ? { ...el, checked: !el.checked } : el)), true);
  };

  const handleTogglePin = () => {
    const targetEl = elements.find(el => el.id === targetId);
    if (!targetEl) return;
    const isPinned = Boolean(targetEl.pinnedToScreen);
    const pos = isPinned ? screenToWorld({ x: targetEl.x, y: targetEl.y }, camera) : worldToScreen({ x: targetEl.x, y: targetEl.y }, camera);
    onElementsChange(elements.map(el => (el.id === targetId ? { ...el, x: Math.round(pos.x), y: Math.round(pos.y), pinnedToScreen: !isPinned } : el)), true);
  };

  return (
    <ContextMenu
      x={contextMenu.x}
      y={contextMenu.y}
      selectedElements={elements.filter(el => contextMenu.targetIds.includes(el.id))}
      canPaste={canPaste}
      onClose={onClose}
      onCopy={() => onCopySelected?.(contextMenu.targetIds)}
      onPaste={onPaste}
      onDuplicate={() => onDuplicateSelected?.(contextMenu.targetIds)}
      onDelete={() => onDeleteSelected?.(contextMenu.targetIds)}
      onBringForward={() => onBringForward?.(contextMenu.targetIds)}
      onSendBackward={() => onSendBackward?.(contextMenu.targetIds)}
      onBringToFront={() => onBringToFront?.(contextMenu.targetIds)}
      onSendToBack={() => onSendToBack?.(contextMenu.targetIds)}
      onToggleLock={() => onToggleLock?.(contextMenu.targetIds)}
      onGroupSelected={onGroupSelected || (() => {})}
      onUngroupSelected={onUngroupSelected || (() => {})}
      onToggleChecked={handleToggleChecked}
      onTogglePin={handleTogglePin}
      theme={theme}
    />
  );
};
