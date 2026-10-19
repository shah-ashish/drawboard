import React from 'react';

interface ContextMenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: (e: React.MouseEvent) => void;
  disabled?: boolean;
  destructive?: boolean;
  accent?: boolean;
  theme?: 'light' | 'dark';
}

export const ContextMenuItem: React.FC<ContextMenuItemProps> = ({
  icon,
  label,
  shortcut,
  onClick,
  disabled = false,
  destructive = false,
  accent = false,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const defaultColor = isDark ? '#f4f4f5' : '#374151';
  const destructiveColor = '#dc2626';
  const accentColor = '#10b981';

  let textColor = defaultColor;
  if (disabled) textColor = isDark ? '#52525b' : '#9ca3af';
  else if (destructive) textColor = destructiveColor;
  else if (accent) textColor = accentColor;

  const hoverBg = disabled
    ? 'transparent'
    : destructive
    ? (isDark ? '#3f1d1d' : '#fef2f2')
    : (isDark ? '#27272a' : '#f3f4f6');

  return (
    <button
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '7px 12px',
        fontSize: '13px',
        color: textColor,
        backgroundColor: 'transparent',
        border: 'none',
        borderRadius: '6px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        transition: 'background-color 0.1s ease',
        outline: 'none',
        fontWeight: accent ? 600 : 400
      }}
      onMouseEnter={e => {
        if (!disabled) e.currentTarget.style.backgroundColor = hoverBg;
      }}
      onMouseLeave={e => {
        if (!disabled) e.currentTarget.style.backgroundColor = 'transparent';
      }}
      onClick={onClick}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon}
        <span>{label}</span>
      </span>
      {shortcut && (
        <span style={{ fontSize: '11px', color: isDark ? '#71717a' : '#9ca3af' }}>
          {shortcut}
        </span>
      )}
    </button>
  );
};
