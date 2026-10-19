import React from 'react';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { Camera } from '../../types/canvas';
import { WhiteboardElement } from '../../types/elements';
import { DEFAULT_CAMERA, ZOOM_STEP, MIN_ZOOM, MAX_ZOOM } from '../../constants/canvas';

interface ActionControlsProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  camera: Camera;
  onCameraChange: (camera: Camera) => void;
  elements?: WhiteboardElement[];
  onElementsChange?: (elements: WhiteboardElement[], recordHistory?: boolean) => void;
  themePreference?: 'system' | 'light' | 'dark';
  resolvedTheme?: 'light' | 'dark';
  onCycleTheme?: () => void;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  camera,
  onCameraChange,
  themePreference = 'system',
  resolvedTheme = 'light',
  onCycleTheme
}) => {
  const handleZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(camera.zoom + delta, MIN_ZOOM), MAX_ZOOM);
    onCameraChange({ ...camera, zoom: Number(newZoom.toFixed(2)) });
  };

  const handleResetView = () => {
    onCameraChange(DEFAULT_CAMERA);
  };

  const dividerStyle: React.CSSProperties = {
    width: '20px',
    height: '1px',
    backgroundColor: resolvedTheme === 'dark' ? '#27272a' : '#e5e7eb',
    margin: '2px 0'
  };

  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: resolvedTheme === 'dark' ? '#f4f4f5' : '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
    outline: 'none'
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '2px',
        padding: '5px 4px',
        backgroundColor: resolvedTheme === 'dark' ? '#18181b' : '#ffffff',
        borderRadius: '10px',
        boxShadow: resolvedTheme === 'dark'
          ? '0 4px 16px rgba(0, 0, 0, 0.45), 0 0 0 1px #27272a'
          : '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)'
      }}
    >
      {/* Undo */}
      <button
        title="Undo (Ctrl+Z)"
        disabled={!canUndo}
        onClick={onUndo}
        style={{
          ...buttonStyle,
          color: canUndo
            ? (resolvedTheme === 'dark' ? '#f4f4f5' : '#374151')
            : (resolvedTheme === 'dark' ? '#52525b' : '#d1d5db'),
          cursor: canUndo ? 'pointer' : 'not-allowed'
        }}
        onMouseEnter={e => {
          if (canUndo) e.currentTarget.style.backgroundColor = resolvedTheme === 'dark' ? '#27272a' : '#f3f4f6';
        }}
        onMouseLeave={e => {
          if (canUndo) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Undo2 size={16} />
      </button>

      {/* Redo */}
      <button
        title="Redo (Ctrl+Y)"
        disabled={!canRedo}
        onClick={onRedo}
        style={{
          ...buttonStyle,
          color: canRedo
            ? (resolvedTheme === 'dark' ? '#f4f4f5' : '#374151')
            : (resolvedTheme === 'dark' ? '#52525b' : '#d1d5db'),
          cursor: canRedo ? 'pointer' : 'not-allowed'
        }}
        onMouseEnter={e => {
          if (canRedo) e.currentTarget.style.backgroundColor = resolvedTheme === 'dark' ? '#27272a' : '#f3f4f6';
        }}
        onMouseLeave={e => {
          if (canRedo) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Redo2 size={16} />
      </button>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Zoom In */}
      <button
        title="Zoom In"
        onClick={() => handleZoom(ZOOM_STEP)}
        style={buttonStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = resolvedTheme === 'dark' ? '#27272a' : '#f3f4f6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <ZoomIn size={16} />
      </button>

      {/* Zoom Level Label */}
      <span
        style={{
          fontSize: '11px',
          fontWeight: 600,
          color: resolvedTheme === 'dark' ? '#a1a1aa' : '#4b5563',
          padding: '2px 0',
          textAlign: 'center',
          userSelect: 'none'
        }}
      >
        {Math.round(camera.zoom * 100)}%
      </span>

      {/* Zoom Out */}
      <button
        title="Zoom Out"
        onClick={() => handleZoom(-ZOOM_STEP)}
        style={buttonStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = resolvedTheme === 'dark' ? '#27272a' : '#f3f4f6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <ZoomOut size={16} />
      </button>

      {/* Reset View (100%) */}
      <button
        title="Reset View (100%)"
        onClick={handleResetView}
        style={buttonStyle}
        onMouseEnter={e => {
          e.currentTarget.style.backgroundColor = resolvedTheme === 'dark' ? '#27272a' : '#f3f4f6';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Maximize2 size={14} />
      </button>

      {/* Theme Appearance Mode Toggle */}
      {onCycleTheme && (
        <>
          <div style={dividerStyle} />
          <button
            title={`Theme: ${themePreference === 'system' ? `System (${resolvedTheme})` : themePreference} (Click to change)`}
            onClick={onCycleTheme}
            style={buttonStyle}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = resolvedTheme === 'dark' ? '#27272a' : '#f3f4f6';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {themePreference === 'system' ? (
              <Monitor size={15} />
            ) : themePreference === 'dark' ? (
              <Moon size={15} />
            ) : (
              <Sun size={15} />
            )}
          </button>
        </>
      )}
    </div>
  );
};
