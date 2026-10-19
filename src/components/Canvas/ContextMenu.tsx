import React, { useEffect, useRef } from 'react';
import { Lock, Unlock, Layers, CheckSquare, Pin, PinOff } from 'lucide-react';
import { WhiteboardElement } from '../../types/elements';
import { ContextMenuItem } from './ContextMenu/ContextMenuItem';
import { ContextMenuDivider } from './ContextMenu/ContextMenuDivider';
import { EditMenuItems } from './ContextMenu/EditMenuItems';
import { LayerMenuItems } from './ContextMenu/LayerMenuItems';

interface ContextMenuProps {
  x: number;
  y: number;
  selectedElements: WhiteboardElement[];
  canPaste?: boolean;
  onClose: () => void;
  onCopy: () => void;
  onPaste?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onToggleLock: () => void;
  onGroupSelected: () => void;
  onUngroupSelected: () => void;
  onToggleChecked?: () => void;
  onTogglePin?: () => void;
  theme?: 'light' | 'dark';
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x, y, selectedElements, canPaste = false, onClose,
  onCopy, onPaste, onDuplicate, onDelete,
  onBringForward, onSendBackward, onBringToFront, onSendToBack,
  onToggleLock, onGroupSelected, onUngroupSelected,
  onToggleChecked, onTogglePin, theme = 'light'
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const timer = setTimeout(() => {
      window.addEventListener('pointerdown', handleOutsideClick);
      window.addEventListener('keydown', handleKeyDown);
    }, 10);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('pointerdown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const isAnyLocked = selectedElements.some(el => el.locked);
  const isGrouped = selectedElements.some(el => el.groupIds && el.groupIds.length > 0);
  const canGroup = selectedElements.length > 1;

  const clampedX = Math.min(Math.max(x, 12), window.innerWidth - 222);
  const clampedY = Math.min(Math.max(y, 12), window.innerHeight - 362);

  const act = (action: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed', left: clampedX, top: clampedY, zIndex: 1000, width: '210px',
        backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', borderRadius: '10px', padding: '6px',
        boxShadow: theme === 'dark' ? '0 10px 28px rgba(0,0,0,0.5), 0 0 0 1px #27272a' : '0 10px 28px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.08)',
        display: 'flex', flexDirection: 'column', gap: '2px', userSelect: 'none'
      }}
      onPointerDown={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}
    >
      {selectedElements.length === 1 && selectedElements[0].type === 'todo' && onToggleChecked && (
        <>
          <ContextMenuItem
            icon={<CheckSquare size={15} color="#10b981" />}
            label={selectedElements[0].checked ? 'Mark Incomplete' : 'Mark Completed'}
            shortcut="Click Box"
            onClick={act(onToggleChecked)}
            accent
            theme={theme}
          />
          <ContextMenuDivider theme={theme} />
        </>
      )}

      <EditMenuItems onCopy={onCopy} canPaste={canPaste} onPaste={onPaste} onDuplicate={onDuplicate} onDelete={onDelete} isAnyLocked={isAnyLocked} theme={theme} act={act} />
      <ContextMenuDivider theme={theme} />
      <LayerMenuItems onBringForward={onBringForward} onSendBackward={onSendBackward} onBringToFront={onBringToFront} onSendToBack={onSendToBack} theme={theme} act={act} />
      <ContextMenuDivider theme={theme} />

      {(canGroup || isGrouped) && (
        <ContextMenuItem
          icon={<Layers size={15} />}
          label={isGrouped ? 'Ungroup' : 'Group'}
          shortcut="Ctrl+G"
          onClick={act(isGrouped ? onUngroupSelected : onGroupSelected)}
          theme={theme}
        />
      )}

      {selectedElements.length === 1 && selectedElements[0].type === 'todo' && onTogglePin && (
        <ContextMenuItem
          icon={selectedElements[0].pinnedToScreen ? <PinOff size={15} /> : <Pin size={15} />}
          label={selectedElements[0].pinnedToScreen ? 'Unpin from Screen' : 'Pin to Screen'}
          shortcut="P"
          onClick={act(onTogglePin)}
          theme={theme}
        />
      )}

      <ContextMenuItem
        icon={isAnyLocked ? <Unlock size={15} /> : <Lock size={15} />}
        label={isAnyLocked ? 'Unlock' : 'Lock'}
        shortcut="L"
        onClick={act(onToggleLock)}
        theme={theme}
      />
    </div>
  );
};
