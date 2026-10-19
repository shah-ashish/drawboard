import React from 'react';
import { Minus, PenTool, Spline } from 'lucide-react';
import { ElementStyle } from '../../../types/elements';
import { ROUGHNESS_OPTIONS, STROKE_WIDTH_OPTIONS } from '../../../constants/canvas';

interface StrokeSectionProps {
  style: ElementStyle;
  onStyleChange: (newStyle: ElementStyle) => void;
  theme: 'light' | 'dark';
}

export const StrokeSection: React.FC<StrokeSectionProps> = ({ style, onStyleChange, theme }) => {
  const isDark = theme === 'dark';

  const getStyleFeelIcon = (val: number) => {
    if (val === 0) return <Minus size={18} strokeWidth={2.5} />;
    if (val === 1) return <PenTool size={16} />;
    return <Spline size={16} />;
  };

  const getBtnStyle = (isSelected: boolean) => ({
    flex: 1,
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: isSelected ? (isDark ? '1.5px solid #3b82f6' : '1.5px solid #2563eb') : (isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb'),
    backgroundColor: isSelected ? (isDark ? '#1e293b' : '#eff6ff') : (isDark ? '#27272a' : '#f9fafb'),
    color: isSelected ? (isDark ? '#60a5fa' : '#2563eb') : (isDark ? '#a1a1aa' : '#6b7280'),
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  });

  return (
    <>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Style Feel</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {ROUGHNESS_OPTIONS.map(opt => (
            <button key={opt.label} title={opt.label} onClick={() => onStyleChange({ ...style, roughness: opt.value })} style={getBtnStyle(style.roughness === opt.value)}>
              {getStyleFeelIcon(opt.value)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: '6px' }}>Thickness</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {STROKE_WIDTH_OPTIONS.map(opt => (
            <button key={opt.label} title={opt.label} onClick={() => onStyleChange({ ...style, strokeWidth: opt.value })} style={getBtnStyle(style.strokeWidth === opt.value)}>
              <div style={{ width: '26px', height: `${Math.max(opt.value, 1.5)}px`, backgroundColor: 'currentColor', borderRadius: '2px' }} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
};
