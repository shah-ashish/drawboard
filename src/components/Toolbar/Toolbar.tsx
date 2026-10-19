import React from 'react';
import {
  MousePointer,
  Pencil,
  Square,
  Circle,
  ArrowRight,
  Minus,
  Type,
  Hand,
  Lock,
  Unlock,
  Layers,
  Trash2,
  Sparkles
} from 'lucide-react';
import { ToolType, WhiteboardElement } from '../../types/elements';

interface ToolbarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  selectedElements: WhiteboardElement[];
  onToggleLock: () => void;
  onGroupSelected: () => void;
  onUngroupSelected: () => void;
  onDeleteSelected: () => void;
  onOpenInsertModal?: () => void;
  theme?: 'light' | 'dark';
}

export const Toolbar: React.FC<ToolbarProps> = ({
  activeTool,
  onToolSelect,
  selectedElements,
  onToggleLock,
  onGroupSelected,
  onUngroupSelected,
  onDeleteSelected,
  onOpenInsertModal,
  theme = 'light'
}) => {
  const tools: { type: ToolType; icon: React.ReactNode; label: string; shortcut: string }[] = [
    { type: 'select', icon: <MousePointer size={18} />, label: 'Select', shortcut: '1' },
    { type: 'draw', icon: <Pencil size={18} />, label: 'Draw Freehand', shortcut: '2' },
    { type: 'rectangle', icon: <Square size={18} />, label: 'Rectangle', shortcut: '3' },
    { type: 'ellipse', icon: <Circle size={18} />, label: 'Ellipse', shortcut: '4' },
    { type: 'arrow', icon: <ArrowRight size={18} />, label: 'Arrow', shortcut: '5' },
    { type: 'line', icon: <Minus size={18} />, label: 'Line', shortcut: '6' },
    { type: 'text', icon: <Type size={18} />, label: 'Text', shortcut: 'T' },
    { type: 'pan', icon: <Hand size={18} />, label: 'Pan Canvas', shortcut: 'H' }
  ];

  const hasSelection = selectedElements.length > 0;
  const isAnyLocked = selectedElements.some(el => el.locked);
  const canGroup = selectedElements.length > 1;
  const isGrouped = selectedElements.some(el => el.groupIds && el.groupIds.length > 0);

  return (
    <div
      style={{
        position: 'absolute',
        top: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '5px 8px',
        backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
        borderRadius: '10px',
        boxShadow: theme === 'dark'
          ? '0 4px 16px rgba(0, 0, 0, 0.45), 0 0 0 1px #27272a'
          : '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(8px)'
      }}
    >
      {tools.map(t => {
        const isActive = activeTool === t.type;
        return (
          <button
            key={t.type}
            title={`${t.label} (${t.shortcut})`}
            onClick={() => onToolSelect(t.type)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isActive
                ? (theme === 'dark' ? '#1e293b' : '#eff6ff')
                : 'transparent',
              color: isActive
                ? (theme === 'dark' ? '#60a5fa' : '#2563eb')
                : (theme === 'dark' ? '#9ca3af' : '#4b5563'),
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
          >
            {t.icon}
          </button>
        );
      })}

      {/* Insert Icons Tool Button */}
      <div style={{ width: '1px', height: '22px', backgroundColor: theme === 'dark' ? '#27272a' : '#e5e7eb', margin: '0 2px' }} />
      <button
        title="Insert Icons & Device Frames (I or /)"
        onClick={() => onOpenInsertModal?.()}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          height: '38px',
          padding: '0 10px',
          borderRadius: '7px',
          border: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb',
          cursor: 'pointer',
          backgroundColor: theme === 'dark' ? '#27272a' : '#ffffff',
          color: theme === 'dark' ? '#f4f4f5' : '#1f2937',
          fontSize: '13px',
          fontWeight: 600,
          transition: 'all 0.15s ease',
          outline: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1e293b' : '#eff6ff';
          e.currentTarget.style.borderColor = theme === 'dark' ? '#3b82f6' : '#93c5fd';
          e.currentTarget.style.color = '#3b82f6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = theme === 'dark' ? '#27272a' : '#ffffff';
          e.currentTarget.style.borderColor = theme === 'dark' ? '#3f3f46' : '#e5e7eb';
          e.currentTarget.style.color = theme === 'dark' ? '#f4f4f5' : '#1f2937';
        }}
      >
        <Sparkles size={16} color="#3b82f6" />
        <span>Icons</span>
      </button>

      {hasSelection && (
        <>
          <div style={{ width: '1px', height: '22px', backgroundColor: theme === 'dark' ? '#27272a' : '#e5e7eb', margin: '0 4px' }} />

          {/* Lock / Unlock Toggle */}
          <button
            title={isAnyLocked ? 'Unlock Selected (L)' : 'Lock Selected from edits/moves (L)'}
            onClick={() => onToggleLock?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '7px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: isAnyLocked
                ? (theme === 'dark' ? '#78350f' : '#fef3c7')
                : (theme === 'dark' ? '#27272a' : '#f3f4f6'),
              color: isAnyLocked
                ? (theme === 'dark' ? '#fbbf24' : '#d97706')
                : (theme === 'dark' ? '#d4d4d8' : '#4b5563'),
              transition: 'all 0.15s ease'
            }}
          >
            {isAnyLocked ? <Lock size={18} /> : <Unlock size={18} />}
          </button>

          {/* Group / Ungroup */}
          <button
            title={
              isGrouped
                ? 'Ungroup Shapes (Ctrl+Shift+G)'
                : canGroup
                ? 'Group Shapes Together (Ctrl+G)'
                : 'Group Shapes (Select 2+ shapes to group)'
            }
            disabled={!canGroup && !isGrouped}
            onClick={() => (isGrouped ? onUngroupSelected?.() : onGroupSelected?.())}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '7px',
              border: 'none',
              cursor: (!canGroup && !isGrouped) ? 'not-allowed' : 'pointer',
              backgroundColor: isGrouped
                ? (theme === 'dark' ? '#1e293b' : '#eff6ff')
                : (theme === 'dark' ? '#27272a' : '#f3f4f6'),
              color: isGrouped
                ? (theme === 'dark' ? '#60a5fa' : '#2563eb')
                : (!canGroup ? (theme === 'dark' ? '#52525b' : '#9ca3af') : (theme === 'dark' ? '#d4d4d8' : '#4b5563')),
              opacity: (!canGroup && !isGrouped) ? 0.45 : 1,
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={18} />
          </button>

          {/* Delete */}
          <button
            title="Delete Selected (Del)"
            disabled={isAnyLocked}
            onClick={() => onDeleteSelected?.()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: '7px',
              border: 'none',
              cursor: isAnyLocked ? 'not-allowed' : 'pointer',
              backgroundColor: isAnyLocked
                ? (theme === 'dark' ? '#27272a' : '#f3f4f6')
                : (theme === 'dark' ? '#450a0a' : '#fee2e2'),
              color: isAnyLocked
                ? (theme === 'dark' ? '#52525b' : '#9ca3af')
                : (theme === 'dark' ? '#f87171' : '#ef4444'),
              transition: 'all 0.15s ease'
            }}
          >
            <Trash2 size={18} />
          </button>
        </>
      )}
    </div>
  );
};
