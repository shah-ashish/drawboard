import React from 'react';
import { Lock, Unlock, Layers, Trash2 } from 'lucide-react';
import { WhiteboardElement } from '../../../types/elements';

interface SelectionActionButtonsProps {
  selectedElements: WhiteboardElement[];
  onToggleLock: () => void;
  onGroupSelected: () => void;
  onUngroupSelected: () => void;
  onDeleteSelected: () => void;
  theme: 'light' | 'dark';
}

export const SelectionActionButtons: React.FC<SelectionActionButtonsProps> = ({
  selectedElements,
  onToggleLock,
  onGroupSelected,
  onUngroupSelected,
  onDeleteSelected,
  theme
}) => {
  if (selectedElements.length === 0) return null;

  const isDark = theme === 'dark';
  const isAnyLocked = selectedElements.some(el => el.locked);
  const canGroup = selectedElements.length > 1;
  const isGrouped = selectedElements.some(el => el.groupIds && el.groupIds.length > 0);

  return (
    <>
      <div style={{ width: '1px', height: '22px', backgroundColor: isDark ? '#27272a' : '#e5e7eb', margin: '0 4px' }} />

      {/* Lock / Unlock Toggle */}
      <button
        title={isAnyLocked ? 'Unlock Selected (L)' : 'Lock Selected from edits/moves (L)'}
        onClick={onToggleLock}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '38px', height: '38px', borderRadius: '7px', border: 'none', cursor: 'pointer',
          backgroundColor: isAnyLocked ? (isDark ? '#78350f' : '#fef3c7') : (isDark ? '#27272a' : '#f3f4f6'),
          color: isAnyLocked ? (isDark ? '#fbbf24' : '#d97706') : (isDark ? '#d4d4d8' : '#4b5563'),
          transition: 'all 0.15s ease'
        }}
      >
        {isAnyLocked ? <Lock size={18} /> : <Unlock size={18} />}
      </button>

      {/* Group / Ungroup */}
      <button
        title={isGrouped ? 'Ungroup Shapes (Ctrl+Shift+G)' : canGroup ? 'Group Shapes Together (Ctrl+G)' : 'Group Shapes (Select 2+ shapes to group)'}
        disabled={!canGroup && !isGrouped}
        onClick={() => (isGrouped ? onUngroupSelected() : onGroupSelected())}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '38px', height: '38px', borderRadius: '7px', border: 'none',
          cursor: (!canGroup && !isGrouped) ? 'not-allowed' : 'pointer',
          backgroundColor: isGrouped ? (isDark ? '#1e293b' : '#eff6ff') : (isDark ? '#27272a' : '#f3f4f6'),
          color: isGrouped ? (isDark ? '#60a5fa' : '#2563eb') : (!canGroup ? (isDark ? '#52525b' : '#9ca3af') : (isDark ? '#d4d4d8' : '#4b5563')),
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
        onClick={onDeleteSelected}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '38px', height: '38px', borderRadius: '7px', border: 'none',
          cursor: isAnyLocked ? 'not-allowed' : 'pointer',
          backgroundColor: isAnyLocked ? (isDark ? '#27272a' : '#f3f4f6') : (isDark ? '#450a0a' : '#fee2e2'),
          color: isAnyLocked ? (isDark ? '#52525b' : '#9ca3af') : (isDark ? '#f87171' : '#ef4444'),
          transition: 'all 0.15s ease'
        }}
      >
        <Trash2 size={18} />
      </button>
    </>
  );
};
