import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignVerticalJustifyStart, AlignVerticalJustifyCenter, AlignVerticalJustifyEnd } from 'lucide-react';
import { ElementStyle } from '../../../types/elements';
import { FONT_FAMILY_OPTIONS, FONT_SIZE_OPTIONS } from '../../../constants/canvas';

interface TypographySectionProps {
  style: ElementStyle;
  onStyleChange: (newStyle: ElementStyle) => void;
  theme: 'light' | 'dark';
}

export const TypographySection: React.FC<TypographySectionProps> = ({ style, onStyleChange, theme }) => {
  const isDark = theme === 'dark';

  const getBtnStyle = (isSelected: boolean, extra?: React.CSSProperties) => ({
    flex: 1,
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: isSelected ? (isDark ? '1.5px solid #3b82f6' : '1.5px solid #2563eb') : (isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb'),
    backgroundColor: isSelected ? (isDark ? '#1e293b' : '#eff6ff') : (isDark ? '#27272a' : '#f9fafb'),
    color: isSelected ? (isDark ? '#60a5fa' : '#2563eb') : (isDark ? '#d4d4d8' : '#4b5563'),
    fontSize: '11px',
    fontWeight: isSelected ? 600 : 400,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    ...extra
  });

  return (
    <>
      <div style={{ height: '1px', backgroundColor: isDark ? '#27272a' : '#f3f4f6', margin: '2px 0' }} />

      <div>
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Font</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {FONT_FAMILY_OPTIONS.map(opt => (
            <button key={opt.label} title={opt.label} onClick={() => onStyleChange({ ...style, fontFamily: opt.value })} style={getBtnStyle(style.fontFamily === opt.value, { fontFamily: opt.value })}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Font Size</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {FONT_SIZE_OPTIONS.map(opt => (
            <button key={opt.label} title={`${opt.value}px`} onClick={() => onStyleChange({ ...style, fontSize: opt.value })} style={getBtnStyle(style.fontSize === opt.value)}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Align (H)</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { align: 'left' as const, icon: <AlignLeft size={16} />, title: 'Align Left' },
            { align: 'center' as const, icon: <AlignCenter size={16} />, title: 'Align Center' },
            { align: 'right' as const, icon: <AlignRight size={16} />, title: 'Align Right' }
          ].map(item => (
            <button key={item.align} title={item.title} onClick={() => onStyleChange({ ...style, textAlign: item.align })} style={getBtnStyle((style.textAlign || 'center') === item.align)}>
              {item.icon}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Align (V)</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[
            { align: 'top' as const, icon: <AlignVerticalJustifyStart size={16} />, title: 'Align Top' },
            { align: 'middle' as const, icon: <AlignVerticalJustifyCenter size={16} />, title: 'Align Middle' },
            { align: 'bottom' as const, icon: <AlignVerticalJustifyEnd size={16} />, title: 'Align Bottom' }
          ].map(item => (
            <button key={item.align} title={item.title} onClick={() => onStyleChange({ ...style, verticalAlign: item.align })} style={getBtnStyle((style.verticalAlign || 'middle') === item.align)}>
              {item.icon}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
