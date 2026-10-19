import React from 'react';
import { MousePointer, Pencil, Square, Circle, ArrowRight, Minus, Type, Hand, CheckSquare } from 'lucide-react';
import { ToolType } from '../../../types/elements';

interface ToolButtonListProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  theme: 'light' | 'dark';
}

const TOOLS: { type: ToolType; icon: React.ReactNode; label: string; shortcut: string }[] = [
  { type: 'select', icon: <MousePointer size={18} />, label: 'Select', shortcut: '1' },
  { type: 'draw', icon: <Pencil size={18} />, label: 'Draw Freehand', shortcut: '2' },
  { type: 'rectangle', icon: <Square size={18} />, label: 'Rectangle', shortcut: '3' },
  { type: 'ellipse', icon: <Circle size={18} />, label: 'Ellipse', shortcut: '4' },
  { type: 'arrow', icon: <ArrowRight size={18} />, label: 'Arrow', shortcut: '5' },
  { type: 'line', icon: <Minus size={18} />, label: 'Line', shortcut: '6' },
  { type: 'text', icon: <Type size={18} />, label: 'Text', shortcut: 'T' },
  { type: 'todo', icon: <CheckSquare size={18} />, label: 'To-Do Task', shortcut: '8' },
  { type: 'pan', icon: <Hand size={18} />, label: 'Pan Canvas', shortcut: 'H' }
];

export const ToolButtonList: React.FC<ToolButtonListProps> = ({ activeTool, onToolSelect, theme }) => {
  const isDark = theme === 'dark';

  return (
    <>
      {TOOLS.map(t => {
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
              backgroundColor: isActive ? (isDark ? '#1e293b' : '#eff6ff') : 'transparent',
              color: isActive ? (isDark ? '#60a5fa' : '#2563eb') : (isDark ? '#9ca3af' : '#4b5563'),
              transition: 'all 0.15s ease',
              outline: 'none'
            }}
          >
            {t.icon}
          </button>
        );
      })}
    </>
  );
};
