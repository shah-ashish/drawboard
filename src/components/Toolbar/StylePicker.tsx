import React, { useState, useEffect, useRef } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { ElementStyle } from '../../types/elements';
import { ColorSection } from './StylePicker/ColorSection';
import { StrokeSection } from './StylePicker/StrokeSection';
import { TypographySection } from './StylePicker/TypographySection';

interface StylePickerProps {
  style: ElementStyle;
  onStyleChange: (newStyle: ElementStyle) => void;
  theme?: 'light' | 'dark';
}

export const StylePicker: React.FC<StylePickerProps> = ({ style, onStyleChange, theme = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | PointerEvent) => {
      if (
        isOpen &&
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      } else if (
        (e.key === 's' || e.key === 'S') && !e.ctrlKey && !e.metaKey && !e.altKey &&
        document.activeElement?.tagName !== 'TEXTAREA' && document.activeElement?.tagName !== 'INPUT'
      ) {
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('pointerdown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('pointerdown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isDark = theme === 'dark';

  return (
    <>
      <button
        ref={buttonRef}
        title={isOpen ? 'Close Style Panel (S)' : 'Open Style Panel (S)'}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute', top: '16px', left: '16px', zIndex: 42,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: '38px', height: '38px', borderRadius: '9px',
          border: isDark ? '1px solid #3f3f46' : 'none',
          backgroundColor: isOpen ? (isDark ? '#1e293b' : '#eff6ff') : (isDark ? '#18181b' : '#ffffff'),
          color: isOpen ? '#3b82f6' : (isDark ? '#f4f4f5' : '#4b5563'),
          boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.45), 0 0 0 1px #27272a' : '0 4px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)',
          cursor: 'pointer', transition: 'all 0.15s ease', outline: 'none'
        }}
      >
        <SlidersHorizontal size={18} />
      </button>

      <div
        ref={panelRef}
        onPointerDown={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute', top: '16px', left: '62px', zIndex: 41, width: '196px',
          maxHeight: 'calc(100vh - 32px)',
          backgroundColor: isDark ? '#18181b' : '#ffffff',
          borderRadius: '12px',
          boxShadow: isDark ? '0 10px 28px rgba(0,0,0,0.5), 0 0 0 1px #27272a' : '0 10px 28px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden', fontSize: '12px',
          color: isDark ? '#f4f4f5' : '#4b5563', boxSizing: 'border-box',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateX(0) scale(1)' : 'translateX(-8px) scale(0.96)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px 10px 14px', borderBottom: isDark ? '1px solid #27272a' : '1px solid #f3f4f6', userSelect: 'none' }}>
          <span style={{ fontWeight: 600, color: isDark ? '#f4f4f5' : '#111827', fontSize: '13px' }}>Styles</span>
          <button title="Close panel (Esc)" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', borderRadius: '6px', border: 'none', backgroundColor: 'transparent', color: isDark ? '#71717a' : '#9ca3af', cursor: 'pointer' }}>
            <X size={15} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px 14px 16px 14px', overflowY: 'auto', scrollbarWidth: 'thin' }}>
          <ColorSection style={style} onStyleChange={onStyleChange} theme={theme} />
          <StrokeSection style={style} onStyleChange={onStyleChange} theme={theme} />
          <TypographySection style={style} onStyleChange={onStyleChange} theme={theme} />
        </div>
      </div>
    </>
  );
};
