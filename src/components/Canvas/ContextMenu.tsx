import React, { useEffect, useRef } from 'react';
import {
  Copy,
  ClipboardPaste,
  CopyPlus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronsUp,
  ChevronsDown,
  Lock,
  Unlock,
  Layers
} from 'lucide-react';
import { WhiteboardElement } from '../../types/elements';

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
  theme?: 'light' | 'dark';
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  selectedElements,
  canPaste = false,
  onClose,
  onCopy,
  onPaste,
  onDuplicate,
  onDelete,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onGroupSelected,
  onUngroupSelected,
  theme = 'light'
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Delay attaching listener so the triggering right-click event does not immediately dismiss
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

  // Viewport clamping
  const menuWidth = 210;
  const menuHeight = 350;
  const clampedX = Math.min(Math.max(x, 12), window.innerWidth - menuWidth - 12);
  const clampedY = Math.min(Math.max(y, 12), window.innerHeight - menuHeight - 12);

  const hoverBg = theme === 'dark' ? '#27272a' : '#f3f4f6';
  const dividerColor = theme === 'dark' ? '#27272a' : '#f3f4f6';
  const deleteHoverBg = theme === 'dark' ? '#3f1d1d' : '#fef2f2';

  const menuItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '7px 12px',
    fontSize: '13px',
    color: theme === 'dark' ? '#f4f4f5' : '#374151',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.1s ease',
    outline: 'none'
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        left: clampedX,
        top: clampedY,
        zIndex: 1000,
        width: `${menuWidth}px`,
        backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
        borderRadius: '10px',
        padding: '6px',
        boxShadow: theme === 'dark'
          ? '0 10px 28px rgba(0, 0, 0, 0.5), 0 0 0 1px #27272a'
          : '0 10px 28px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        userSelect: 'none'
      }}
      onPointerDown={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
      onContextMenu={e => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Copy */}
      <button
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={e => handleAction(e, onCopy)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Copy size={15} /> Copy
        </span>
        <span style={{ fontSize: '11px', color: theme === 'dark' ? '#71717a' : '#9ca3af' }}>Ctrl+C</span>
      </button>

      {/* Paste (if clipboard has content) */}
      {canPaste && onPaste && (
        <button
          style={menuItemStyle}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          onClick={e => handleAction(e, onPaste)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardPaste size={15} /> Paste
          </span>
          <span style={{ fontSize: '11px', color: theme === 'dark' ? '#71717a' : '#9ca3af' }}>Ctrl+V</span>
        </button>
      )}

      {/* Duplicate */}
      <button
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={e => handleAction(e, onDuplicate)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CopyPlus size={15} /> Duplicate
        </span>
        <span style={{ fontSize: '11px', color: theme === 'dark' ? '#71717a' : '#9ca3af' }}>Ctrl+D</span>
      </button>

      {/* Delete */}
      <button
        disabled={isAnyLocked}
        style={{
          ...menuItemStyle,
          color: isAnyLocked ? (theme === 'dark' ? '#52525b' : '#9ca3af') : '#dc2626',
          cursor: isAnyLocked ? 'not-allowed' : 'pointer'
        }}
        onMouseEnter={e => {
          if (!isAnyLocked) e.currentTarget.style.backgroundColor = deleteHoverBg;
        }}
        onMouseLeave={e => {
          if (!isAnyLocked) e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onClick={e => handleAction(e, onDelete)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={15} /> Delete
        </span>
        <span style={{ fontSize: '11px', color: isAnyLocked ? (theme === 'dark' ? '#3f3f46' : '#d1d5db') : '#f87171' }}>Del</span>
      </button>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: dividerColor, margin: '4px 0' }} />

      {/* Bring Forward */}
      <button
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={e => handleAction(e, onBringForward)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronUp size={15} /> Bring Forward
        </span>
        <span style={{ fontSize: '11px', color: theme === 'dark' ? '#71717a' : '#9ca3af' }}>Ctrl+]</span>
      </button>

      {/* Send Backward */}
      <button
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={e => handleAction(e, onSendBackward)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronDown size={15} /> Send Backward
        </span>
        <span style={{ fontSize: '11px', color: theme === 'dark' ? '#71717a' : '#9ca3af' }}>Ctrl+[</span>
      </button>

      {/* Bring to Front */}
      <button
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={e => handleAction(e, onBringToFront)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronsUp size={15} /> Bring to Front
        </span>
      </button>

      {/* Send to Back */}
      <button
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={e => handleAction(e, onSendToBack)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ChevronsDown size={15} /> Send to Back
        </span>
      </button>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: dividerColor, margin: '4px 0' }} />

      {/* Group / Ungroup (Layers) */}
      {(canGroup || isGrouped) && (
        <button
          style={menuItemStyle}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          onClick={e => handleAction(e, isGrouped ? onUngroupSelected : onGroupSelected)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={15} /> {isGrouped ? 'Ungroup' : 'Group'}
          </span>
          <span style={{ fontSize: '11px', color: theme === 'dark' ? '#71717a' : '#9ca3af' }}>Ctrl+G</span>
        </button>
      )}

      {/* Lock / Unlock */}
      <button
        style={menuItemStyle}
        onMouseEnter={e => (e.currentTarget.style.backgroundColor = hoverBg)}
        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        onClick={e => handleAction(e, onToggleLock)}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isAnyLocked ? <Unlock size={15} /> : <Lock size={15} />}
          {isAnyLocked ? 'Unlock' : 'Lock'}
        </span>
        <span style={{ fontSize: '11px', color: theme === 'dark' ? '#71717a' : '#9ca3af' }}>L</span>
      </button>
    </div>
  );
};
