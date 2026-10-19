import React from 'react';

interface ExportOptionItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  disabled?: boolean;
  theme: 'light' | 'dark';
}

export const ExportOptionItem: React.FC<ExportOptionItemProps> = ({
  icon,
  title,
  subtitle,
  onClick,
  disabled = false,
  theme
}) => {
  const isDark = theme === 'dark';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '7px 8px',
        borderRadius: '7px',
        border: 'none',
        backgroundColor: 'transparent',
        color: disabled ? (isDark ? '#52525b' : '#9ca3af') : (isDark ? '#f4f4f5' : '#1f2937'),
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'background-color 0.12s ease',
        outline: 'none'
      }}
      onMouseEnter={e => {
        if (!disabled) e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f3f4f6';
      }}
      onMouseLeave={e => {
        if (!disabled) e.currentTarget.style.backgroundColor = 'transparent';
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          backgroundColor: isDark ? '#27272a' : '#f3f4f6',
          flexShrink: 0
        }}
      >
        {icon}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '13px', fontWeight: 600 }}>{title}</span>
        <span style={{ fontSize: '11px', color: isDark ? '#71717a' : '#9ca3af' }}>{subtitle}</span>
      </div>
    </button>
  );
};
