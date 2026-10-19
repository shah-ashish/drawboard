import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

interface HistoryButtonsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  resolvedTheme: 'light' | 'dark';
}

export const HistoryButtons: React.FC<HistoryButtonsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  resolvedTheme
}) => {
  const isDark = resolvedTheme === 'dark';

  const btnStyle = (enabled: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: enabled ? (isDark ? '#f4f4f5' : '#374151') : (isDark ? '#52525b' : '#d1d5db'),
    cursor: enabled ? 'pointer' : 'not-allowed',
    transition: 'background-color 0.15s ease',
    outline: 'none'
  });

  return (
    <>
      <button
        title="Undo (Ctrl+Z)"
        disabled={!canUndo}
        onClick={onUndo}
        style={btnStyle(canUndo)}
        onMouseEnter={e => { if (canUndo) e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f3f4f6'; }}
        onMouseLeave={e => { if (canUndo) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <Undo2 size={16} />
      </button>

      <button
        title="Redo (Ctrl+Y)"
        disabled={!canRedo}
        onClick={onRedo}
        style={btnStyle(canRedo)}
        onMouseEnter={e => { if (canRedo) e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f3f4f6'; }}
        onMouseLeave={e => { if (canRedo) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <Redo2 size={16} />
      </button>
    </>
  );
};
