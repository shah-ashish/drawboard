import React from 'react';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Camera } from '../../../types/canvas';
import { DEFAULT_CAMERA, ZOOM_STEP, MIN_ZOOM, MAX_ZOOM } from '../../../constants/canvas';

interface ZoomButtonsProps {
  camera: Camera;
  onCameraChange: (camera: Camera) => void;
  resolvedTheme: 'light' | 'dark';
}

export const ZoomButtons: React.FC<ZoomButtonsProps> = ({
  camera,
  onCameraChange,
  resolvedTheme
}) => {
  const isDark = resolvedTheme === 'dark';

  const handleZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(camera.zoom + delta, MIN_ZOOM), MAX_ZOOM);
    onCameraChange({ ...camera, zoom: Number(newZoom.toFixed(2)) });
  };

  const btnStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: isDark ? '#f4f4f5' : '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    outline: 'none'
  };

  return (
    <>
      <button
        title="Zoom In"
        onClick={() => handleZoom(ZOOM_STEP)}
        style={btnStyle}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f3f4f6'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <ZoomIn size={16} />
      </button>

      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: isDark ? '#a1a1aa' : '#4b5563',
          padding: '2px 0',
          textAlign: 'center',
          userSelect: 'none'
        }}
      >
        {Math.round(camera.zoom * 100)}%
      </span>

      <button
        title="Zoom Out"
        onClick={() => handleZoom(-ZOOM_STEP)}
        style={btnStyle}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f3f4f6'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <ZoomOut size={16} />
      </button>

      <button
        title="Reset View (100%)"
        onClick={() => onCameraChange(DEFAULT_CAMERA)}
        style={btnStyle}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f3f4f6'; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <Maximize2 size={14} />
      </button>
    </>
  );
};
