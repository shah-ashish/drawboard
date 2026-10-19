import React from 'react';
import { ElementStyle } from '../../../types/elements';
import { PRESET_COLORS, PRESET_FILLS } from '../../../constants/canvas';

interface ColorSectionProps {
  style: ElementStyle;
  onStyleChange: (newStyle: ElementStyle) => void;
  theme: 'light' | 'dark';
}

export const ColorSection: React.FC<ColorSectionProps> = ({ style, onStyleChange, theme }) => {
  const isDark = theme === 'dark';

  return (
    <>
      <div>
        <div style={{ fontWeight: 600, marginBottom: '6px', color: isDark ? '#d4d4d8' : '#374151' }}>Stroke Color</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => onStyleChange({ ...style, strokeColor: c })}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: c,
                border: style.strokeColor === c ? '2px solid #2563eb' : (isDark ? '1px solid #3f3f46' : '1px solid #d1d5db'),
                cursor: 'pointer',
                outline: 'none'
              }}
            />
          ))}
        </div>
      </div>

      <div>
        <div style={{ fontWeight: 600, marginBottom: '6px', color: isDark ? '#d4d4d8' : '#374151' }}>Fill Color</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {PRESET_FILLS.map(f => (
            <button
              key={f}
              onClick={() => onStyleChange({ ...style, fillColor: f })}
              title={f === 'transparent' ? 'None' : f}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                backgroundColor: f === 'transparent' ? (isDark ? '#18181b' : '#ffffff') : f,
                border: style.fillColor === f ? '2px solid #2563eb' : (isDark ? '1px solid #3f3f46' : '1px solid #d1d5db'),
                backgroundImage: f === 'transparent' ? 'linear-gradient(45deg, #ef4444 1px, transparent 1px)' : 'none',
                backgroundSize: '20px 20px',
                cursor: 'pointer',
                outline: 'none'
              }}
            />
          ))}
        </div>
      </div>
    </>
  );
};
