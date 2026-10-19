import React, { useState, useEffect, useRef } from 'react';
import {
  Minus,
  PenTool,
  Spline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { ElementStyle } from '../../types/elements';
import {
  PRESET_COLORS,
  PRESET_FILLS,
  ROUGHNESS_OPTIONS,
  STROKE_WIDTH_OPTIONS,
  FONT_FAMILY_OPTIONS,
  FONT_SIZE_OPTIONS
} from '../../constants/canvas';

interface StylePickerProps {
  style: ElementStyle;
  onStyleChange: (newStyle: ElementStyle) => void;
  theme?: 'light' | 'dark';
}

export const StylePicker: React.FC<StylePickerProps> = ({ style, onStyleChange, theme = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on outside click or Escape key (modern popover pattern)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | PointerEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      } else if (
        (e.key === 's' || e.key === 'S') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'INPUT'
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

  const getStyleFeelIcon = (val: number) => {
    if (val === 0) return <Minus size={18} strokeWidth={2.5} />;
    if (val === 1) return <PenTool size={16} />;
    return <Spline size={16} />;
  };

  return (
    <>
      {/* 1. Stationary Icon Toggle Button: perfectly stable, never shifts */}
      <button
        ref={buttonRef}
        title={isOpen ? 'Close Style Panel (S)' : 'Open Style Panel (S)'}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 42,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: '9px',
          border: theme === 'dark' ? '1px solid #3f3f46' : 'none',
          backgroundColor: isOpen
            ? (theme === 'dark' ? '#1e293b' : '#eff6ff')
            : (theme === 'dark' ? '#18181b' : '#ffffff'),
          color: isOpen ? '#3b82f6' : (theme === 'dark' ? '#f4f4f5' : '#4b5563'),
          boxShadow: theme === 'dark'
            ? '0 4px 16px rgba(0, 0, 0, 0.45), 0 0 0 1px #27272a'
            : '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          outline: 'none'
        }}
        onMouseEnter={e => {
          if (!isOpen) e.currentTarget.style.backgroundColor = theme === 'dark' ? '#27272a' : '#f9fafb';
        }}
        onMouseLeave={e => {
          if (!isOpen) e.currentTarget.style.backgroundColor = theme === 'dark' ? '#18181b' : '#ffffff';
        }}
      >
        <SlidersHorizontal size={18} />
      </button>

      {/* 2. Floating Popover Style Panel: docked cleanly to the right of the button */}
      <div
        ref={panelRef}
        onPointerDown={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
        onClick={e => e.stopPropagation()}
        style={{
          position: 'absolute',
          top: '16px',
          left: '62px',
          zIndex: 41,
          width: '196px',
          maxHeight: 'calc(100vh - 32px)',
          backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
          borderRadius: '12px',
          boxShadow: theme === 'dark'
            ? '0 10px 28px rgba(0, 0, 0, 0.5), 0 0 0 1px #27272a'
            : '0 10px 28px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontSize: '12px',
          color: theme === 'dark' ? '#f4f4f5' : '#4b5563',
          boxSizing: 'border-box',
          // Silky smooth entrance/exit transition
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateX(0) scale(1)' : 'translateX(-8px) scale(0.96)',
          pointerEvents: isOpen ? 'auto' : 'none',
          transition:
            'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header with Title and Close Button */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 12px 10px 14px',
            borderBottom: theme === 'dark' ? '1px solid #27272a' : '1px solid #f3f4f6',
            userSelect: 'none'
          }}
        >
          <span style={{ fontWeight: 600, color: theme === 'dark' ? '#f4f4f5' : '#111827', fontSize: '13px' }}>Styles</span>
          <button
            title="Close panel (Esc)"
            onClick={() => setIsOpen(false)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: 'transparent',
              color: theme === 'dark' ? '#71717a' : '#9ca3af',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#27272a' : '#f3f4f6';
              e.currentTarget.style.color = theme === 'dark' ? '#f4f4f5' : '#374151';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme === 'dark' ? '#71717a' : '#9ca3af';
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Scrollable controls body */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            padding: '12px 14px 16px 14px',
            overflowY: 'auto',
            scrollbarWidth: 'thin'
          }}
        >
          {/* Stroke Color */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '6px', color: theme === 'dark' ? '#d4d4d8' : '#374151' }}>Stroke Color</div>
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
                    border: style.strokeColor === c ? '2px solid #2563eb' : (theme === 'dark' ? '1px solid #3f3f46' : '1px solid #d1d5db'),
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Fill Color */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '6px', color: theme === 'dark' ? '#d4d4d8' : '#374151' }}>Fill Color</div>
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
                    backgroundColor: f === 'transparent' ? (theme === 'dark' ? '#18181b' : '#ffffff') : f,
                    border: style.fillColor === f ? '2px solid #2563eb' : (theme === 'dark' ? '1px solid #3f3f46' : '1px solid #d1d5db'),
                    backgroundImage:
                      f === 'transparent'
                        ? 'linear-gradient(45deg, #ef4444 1px, transparent 1px)'
                        : 'none',
                    backgroundSize: '20px 20px',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Roughness / Draw Style */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Style Feel</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {ROUGHNESS_OPTIONS.map(opt => {
                const isSelected = style.roughness === opt.value;
                return (
                  <button
                    key={opt.label}
                    title={opt.label}
                    onClick={() => onStyleChange({ ...style, roughness: opt.value })}
                    style={{
                      flex: 1,
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      border: isSelected
                        ? (theme === 'dark' ? '1.5px solid #3b82f6' : '1.5px solid #2563eb')
                        : (theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb'),
                      backgroundColor: isSelected
                        ? (theme === 'dark' ? '#1e293b' : '#eff6ff')
                        : (theme === 'dark' ? '#27272a' : '#f9fafb'),
                      color: isSelected
                        ? (theme === 'dark' ? '#60a5fa' : '#2563eb')
                        : (theme === 'dark' ? '#a1a1aa' : '#6b7280'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {getStyleFeelIcon(opt.value)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stroke Width */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Thickness</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {STROKE_WIDTH_OPTIONS.map(opt => {
                const isSelected = style.strokeWidth === opt.value;
                return (
                  <button
                    key={opt.label}
                    title={opt.label}
                    onClick={() => onStyleChange({ ...style, strokeWidth: opt.value })}
                    style={{
                      flex: 1,
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      border: isSelected
                        ? (theme === 'dark' ? '1.5px solid #3b82f6' : '1.5px solid #2563eb')
                        : (theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb'),
                      backgroundColor: isSelected
                        ? (theme === 'dark' ? '#1e293b' : '#eff6ff')
                        : (theme === 'dark' ? '#27272a' : '#f9fafb'),
                      color: isSelected
                        ? (theme === 'dark' ? '#60a5fa' : '#2563eb')
                        : (theme === 'dark' ? '#a1a1aa' : '#6b7280'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '26px',
                        height: `${Math.max(opt.value, 1.5)}px`,
                        backgroundColor: 'currentColor',
                        borderRadius: '2px'
                      }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Text Settings Divider */}
          <div style={{ height: '1px', backgroundColor: theme === 'dark' ? '#27272a' : '#f3f4f6', margin: '2px 0' }} />

          {/* Font Family */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Font</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {FONT_FAMILY_OPTIONS.map(opt => {
                const isSelected = style.fontFamily === opt.value;
                return (
                  <button
                    key={opt.label}
                    title={opt.label}
                    onClick={() => onStyleChange({ ...style, fontFamily: opt.value })}
                    style={{
                      flex: 1,
                      height: '30px',
                      borderRadius: '6px',
                      border: isSelected
                        ? (theme === 'dark' ? '1.5px solid #3b82f6' : '1.5px solid #2563eb')
                        : (theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb'),
                      backgroundColor: isSelected
                        ? (theme === 'dark' ? '#1e293b' : '#eff6ff')
                        : (theme === 'dark' ? '#27272a' : '#f9fafb'),
                      color: isSelected
                        ? (theme === 'dark' ? '#60a5fa' : '#2563eb')
                        : (theme === 'dark' ? '#d4d4d8' : '#4b5563'),
                      fontSize: '11px',
                      fontFamily: opt.value,
                      fontWeight: isSelected ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Font Size */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Font Size</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {FONT_SIZE_OPTIONS.map(opt => {
                const isSelected = style.fontSize === opt.value;
                return (
                  <button
                    key={opt.label}
                    title={`${opt.value}px`}
                    onClick={() => onStyleChange({ ...style, fontSize: opt.value })}
                    style={{
                      flex: 1,
                      height: '30px',
                      borderRadius: '6px',
                      border: isSelected
                        ? (theme === 'dark' ? '1.5px solid #3b82f6' : '1.5px solid #2563eb')
                        : (theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb'),
                      backgroundColor: isSelected
                        ? (theme === 'dark' ? '#1e293b' : '#eff6ff')
                        : (theme === 'dark' ? '#27272a' : '#f9fafb'),
                      color: isSelected
                        ? (theme === 'dark' ? '#60a5fa' : '#2563eb')
                        : (theme === 'dark' ? '#d4d4d8' : '#4b5563'),
                      fontSize: '11px',
                      fontWeight: isSelected ? 600 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Horizontal Alignment */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Align (H)</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { align: 'left' as const, icon: <AlignLeft size={16} />, title: 'Align Left' },
                { align: 'center' as const, icon: <AlignCenter size={16} />, title: 'Align Center' },
                { align: 'right' as const, icon: <AlignRight size={16} />, title: 'Align Right' }
              ].map(item => {
                const isSelected = (style.textAlign || 'center') === item.align;
                return (
                  <button
                    key={item.align}
                    title={item.title}
                    onClick={() => onStyleChange({ ...style, textAlign: item.align })}
                    style={{
                      flex: 1,
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      border: isSelected
                        ? (theme === 'dark' ? '1.5px solid #3b82f6' : '1.5px solid #2563eb')
                        : (theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb'),
                      backgroundColor: isSelected
                        ? (theme === 'dark' ? '#1e293b' : '#eff6ff')
                        : (theme === 'dark' ? '#27272a' : '#f9fafb'),
                      color: isSelected
                        ? (theme === 'dark' ? '#60a5fa' : '#2563eb')
                        : (theme === 'dark' ? '#a1a1aa' : '#6b7280'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.icon}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Vertical Alignment */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>Align (V)</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                {
                  align: 'top' as const,
                  icon: <AlignVerticalJustifyStart size={16} />,
                  title: 'Align Top'
                },
                {
                  align: 'middle' as const,
                  icon: <AlignVerticalJustifyCenter size={16} />,
                  title: 'Align Middle'
                },
                {
                  align: 'bottom' as const,
                  icon: <AlignVerticalJustifyEnd size={16} />,
                  title: 'Align Bottom'
                }
              ].map(item => {
                const isSelected = (style.verticalAlign || 'middle') === item.align;
                return (
                  <button
                    key={item.align}
                    title={item.title}
                    onClick={() => onStyleChange({ ...style, verticalAlign: item.align })}
                    style={{
                      flex: 1,
                      height: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '6px',
                      border: isSelected
                        ? (theme === 'dark' ? '1.5px solid #3b82f6' : '1.5px solid #2563eb')
                        : (theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb'),
                      backgroundColor: isSelected
                        ? (theme === 'dark' ? '#1e293b' : '#eff6ff')
                        : (theme === 'dark' ? '#27272a' : '#f9fafb'),
                      color: isSelected
                        ? (theme === 'dark' ? '#60a5fa' : '#2563eb')
                        : (theme === 'dark' ? '#a1a1aa' : '#6b7280'),
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.icon}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
