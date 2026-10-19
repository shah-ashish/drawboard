import React from 'react';
import { Sparkles } from 'lucide-react';
import { ToolType, WhiteboardElement } from '../../types/elements';
import { ExportMenu } from './ExportMenu';
import { ToolButtonList } from './Toolbar/ToolButtonList';
import { SelectionActionButtons } from './Toolbar/SelectionActionButtons';

interface ToolbarProps {
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  selectedElements: WhiteboardElement[];
  allElements?: WhiteboardElement[];
  selectedIds?: string[];
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
  allElements = [],
  selectedIds = [],
  onToggleLock,
  onGroupSelected,
  onUngroupSelected,
  onDeleteSelected,
  onOpenInsertModal,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

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
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        borderRadius: '10px',
        boxShadow: isDark
          ? '0 4px 16px rgba(0, 0, 0, 0.45), 0 0 0 1px #27272a'
          : '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <ToolButtonList activeTool={activeTool} onToolSelect={onToolSelect} theme={theme} />

      <div style={{ width: '1px', height: '22px', backgroundColor: isDark ? '#27272a' : '#e5e7eb', margin: '0 2px' }} />

      <button
        title="Insert Icons & Device Frames (I or /)"
        onClick={() => onOpenInsertModal?.()}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          height: '38px', padding: '0 10px', borderRadius: '7px',
          border: isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb', cursor: 'pointer',
          backgroundColor: isDark ? '#27272a' : '#ffffff',
          color: isDark ? '#f4f4f5' : '#1f2937', fontSize: '13px', fontWeight: 600,
          transition: 'all 0.15s ease', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#eff6ff';
          e.currentTarget.style.borderColor = isDark ? '#3b82f6' : '#93c5fd';
          e.currentTarget.style.color = '#3b82f6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#ffffff';
          e.currentTarget.style.borderColor = isDark ? '#3f3f46' : '#e5e7eb';
          e.currentTarget.style.color = isDark ? '#f4f4f5' : '#1f2937';
        }}
      >
        <Sparkles size={16} color="#3b82f6" />
        <span>Icons</span>
      </button>

      <ExportMenu elements={allElements} selectedIds={selectedIds} theme={theme} />

      <SelectionActionButtons
        selectedElements={selectedElements}
        onToggleLock={onToggleLock}
        onGroupSelected={onGroupSelected}
        onUngroupSelected={onUngroupSelected}
        onDeleteSelected={onDeleteSelected}
        theme={theme}
      />
    </div>
  );
};
