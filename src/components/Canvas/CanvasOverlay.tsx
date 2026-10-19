import React, { useEffect, useRef } from 'react';
import { Point, Camera } from '../../types/canvas';
import { worldToScreen } from '../../utils/coordinates';

interface CanvasOverlayProps {
  editingText: {
    elementId: string;
    worldPos: Point;
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    isShapeLabel?: boolean;
    bounds?: { width: number; height: number };
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
  } | null;
  camera: Camera;
  onCommit: (text: string) => void;
  onCancel: () => void;
  theme?: 'light' | 'dark';
}

export const CanvasOverlay: React.FC<CanvasOverlayProps> = ({
  editingText,
  camera,
  onCommit,
  onCancel,
  theme = 'light'
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isSettledRef = useRef(false);

  useEffect(() => {
    isSettledRef.current = false;
    if (editingText && textareaRef.current) {
      const textarea = textareaRef.current;
      const timer = setTimeout(() => {
        textarea.focus();
        textarea.select();
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.max(textarea.scrollHeight, 28)}px`;
        isSettledRef.current = true;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [editingText]);

  if (!editingText) return null;

  const screenPos = worldToScreen(editingText.worldPos, camera);
  const scaledFontSize = Math.max(Math.round(editingText.fontSize * camera.zoom), 13);
  const isShape = Boolean(editingText.isShapeLabel);

  const defaultW = isShape ? 120 : 180;
  const defaultH = isShape ? 60 : 45;
  const boxW = Math.max((editingText.bounds?.width || defaultW) * camera.zoom, 50);
  const boxH = Math.max((editingText.bounds?.height || defaultH) * camera.zoom, 32);

  const hAlign = editingText.textAlign || (isShape ? 'center' : 'left');
  const vAlign = editingText.verticalAlign || (isShape ? 'middle' : 'top');

  // In flexDirection 'column', justifyContent aligns along the vertical axis
  const vJustify =
    vAlign === 'top' ? 'flex-start' : vAlign === 'bottom' ? 'flex-end' : 'center';

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: screenPos.x,
        top: screenPos.y,
        width: `${boxW}px`,
        minHeight: `${boxH}px`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: vJustify,
        zIndex: 100,
        pointerEvents: 'none',
        boxSizing: 'border-box'
      }}
      onPointerDown={e => e.stopPropagation()}
      onMouseDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <textarea
        ref={textareaRef}
        defaultValue={editingText.text}
        placeholder={isShape ? 'Type label...' : 'Type text...'}
        onInput={handleInput}
        style={{
          pointerEvents: 'auto',
          width: '100%',
          boxSizing: 'border-box',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          padding: isShape ? '6px 12px' : '4px 6px',
          margin: 0,
          textAlign: hAlign,
          fontSize: `${scaledFontSize}px`,
          fontFamily: editingText.fontFamily,
          fontWeight: isShape ? 600 : 500,
          color: (!editingText.color || editingText.color === '#1e1e1e' || editingText.color === '#000000')
            ? (theme === 'dark' ? '#f4f4f5' : '#1e1e1e')
            : editingText.color,
          caretColor: '#3b82f6',
          resize: 'none',
          lineHeight: 1.35,
          overflow: 'hidden'
        }}
        onBlur={e => {
          if (!isSettledRef.current) return;
          onCommit(e.target.value);
        }}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            onCancel();
          } else if (e.key === 'Enter') {
            if (isShape) {
              if (!e.shiftKey) {
                e.preventDefault();
                onCommit(e.currentTarget.value);
              }
            } else {
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                onCommit(e.currentTarget.value);
              }
            }
          }
        }}
      />
    </div>
  );
};
