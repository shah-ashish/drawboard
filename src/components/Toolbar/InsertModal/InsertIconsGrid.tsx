import React from 'react';
import { IconDefinition } from '../../../constants/icons';
import { IconThumbnail } from './IconThumbnail';

interface IconsGridProps {
  icons: IconDefinition[];
  onInsertIcon: (icon: IconDefinition) => void;
  searchQuery: string;
  isSearchingApi: boolean;
  theme: 'light' | 'dark';
}

export const InsertIconsGrid: React.FC<IconsGridProps> = ({
  icons,
  onInsertIcon,
  searchQuery,
  isSearchingApi,
  theme
}) => {
  const isDark = theme === 'dark';

  return (
    <div>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: isDark ? '#a1a1aa' : '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <span>Icons & Logos</span>
        <span style={{ fontSize: '11px', fontWeight: 500, color: isDark ? '#71717a' : '#9ca3af' }}>
          {icons.length} available
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
        {icons.map(icon => (
          <button
            key={icon.key}
            onClick={() => onInsertIcon(icon)}
            title={icon.name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px 6px',
              backgroundColor: isDark ? '#27272a' : '#ffffff',
              border: isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb',
              borderRadius: '8px',
              color: isDark ? '#f4f4f5' : '#111827',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              minHeight: '76px',
              boxShadow: isDark ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#eff6ff';
              e.currentTarget.style.borderColor = '#3b82f6';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = isDark
                ? '0 4px 10px rgba(0, 0, 0, 0.4)'
                : '0 4px 10px rgba(37, 99, 235, 0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#ffffff';
              e.currentTarget.style.borderColor = isDark ? '#3f3f46' : '#e5e7eb';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = isDark ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.03)';
            }}
          >
            <IconThumbnail url={icon.url} name={icon.name} theme={theme} />
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: isDark ? '#e4e4e7' : '#374151',
                maxWidth: '85px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                textAlign: 'center'
              }}
            >
              {icon.name}
            </span>
          </button>
        ))}
      </div>

      {icons.length === 0 && !isSearchingApi && (
        <div style={{ textAlign: 'center', padding: '32px 16px', color: isDark ? '#a1a1aa' : '#6b7280', fontSize: '13px' }}>
          No matching icons found for "{searchQuery}".
        </div>
      )}
    </div>
  );
};
