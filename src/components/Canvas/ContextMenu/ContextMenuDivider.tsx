import React from 'react';

export const ContextMenuDivider: React.FC<{ theme?: 'light' | 'dark' }> = ({ theme = 'light' }) => (
  <div
    style={{
      height: '1px',
      backgroundColor: theme === 'dark' ? '#27272a' : '#f3f4f6',
      margin: '3px 0'
    }}
  />
);
