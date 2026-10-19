import React from 'react';
import { Layout, Smartphone } from 'lucide-react';

interface FramesSectionProps {
  onInsertFrame: (frameType: 'browser' | 'phone') => void;
  theme: 'light' | 'dark';
}

export const InsertFramesSection: React.FC<FramesSectionProps> = ({ onInsertFrame, theme }) => {
  const isDark = theme === 'dark';
  const cardBg = isDark ? '#27272a' : '#ffffff';
  const cardBorder = isDark ? '#3f3f46' : '#e5e7eb';
  const hoverBg = isDark ? '#1e293b' : '#eff6ff';

  return (
    <div style={{ marginBottom: '16px' }}>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: isDark ? '#a1a1aa' : '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '8px'
        }}
      >
        Device Frames
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <button
          onClick={() => onInsertFrame('browser')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
            color: isDark ? '#f4f4f5' : '#111827',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = hoverBg;
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = cardBg;
            e.currentTarget.style.borderColor = cardBorder;
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: isDark ? '#064e3b' : '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#34d399' : '#059669',
              flexShrink: 0
            }}
          >
            <Layout size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>Browser Window</div>
            <div style={{ fontSize: '11px', color: isDark ? '#a1a1aa' : '#6b7280' }}>macOS dots & URL bar</div>
          </div>
        </button>

        <button
          onClick={() => onInsertFrame('phone')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 12px',
            borderRadius: '8px',
            backgroundColor: cardBg,
            border: `1px solid ${cardBorder}`,
            color: isDark ? '#f4f4f5' : '#111827',
            cursor: 'pointer',
            textAlign: 'left',
            boxShadow: isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = hoverBg;
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = cardBg;
            e.currentTarget.style.borderColor = cardBorder;
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: isDark ? '#4c1d95' : '#f5f3ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isDark ? '#c084fc' : '#7c3aed',
              flexShrink: 0
            }}
          >
            <Smartphone size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '13px' }}>Mobile Phone</div>
            <div style={{ fontSize: '11px', color: isDark ? '#a1a1aa' : '#6b7280' }}>Smartphone mockup</div>
          </div>
        </button>
      </div>
    </div>
  );
};
