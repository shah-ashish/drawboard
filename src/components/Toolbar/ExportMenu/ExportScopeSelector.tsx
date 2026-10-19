import React from 'react';

interface ScopeSelectorProps {
  exportScope: 'all' | 'selected';
  onScopeChange: (scope: 'all' | 'selected') => void;
  allCount: number;
  selectedCount: number;
  theme: 'light' | 'dark';
}

export const ExportScopeSelector: React.FC<ScopeSelectorProps> = ({
  exportScope,
  onScopeChange,
  allCount,
  selectedCount,
  theme
}) => {
  const isDark = theme === 'dark';

  const btnStyle = (isActive: boolean) => ({
    border: 'none',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    backgroundColor: isActive ? (isDark ? '#3b82f6' : '#ffffff') : 'transparent',
    color: isActive ? (isDark ? '#ffffff' : '#1f2937') : (isDark ? '#9ca3af' : '#6b7280'),
    boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '4px 6px 6px 6px',
        borderBottom: isDark ? '1px solid #27272a' : '1px solid #f3f4f6',
        marginBottom: '4px'
      }}
    >
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          color: isDark ? '#a1a1aa' : '#6b7280'
        }}
      >
        Export Scope
      </span>
      <div
        style={{
          display: 'flex',
          backgroundColor: isDark ? '#27272a' : '#f3f4f6',
          borderRadius: '6px',
          padding: '2px'
        }}
      >
        <button onClick={() => onScopeChange('all')} style={btnStyle(exportScope === 'all')}>
          All ({allCount})
        </button>
        <button onClick={() => onScopeChange('selected')} style={btnStyle(exportScope === 'selected')}>
          Selected ({selectedCount})
        </button>
      </div>
    </div>
  );
};
