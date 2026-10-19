import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Camera } from '../../types/canvas';
import { WhiteboardElement } from '../../types/elements';
import { HistoryButtons } from './ActionControls/HistoryButtons';
import { ZoomButtons } from './ActionControls/ZoomButtons';

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
  const isDark = resolvedTheme === 'dark';

  const divider = (
    <div
      style={{
        width: '20px',
        height: '1px',
        backgroundColor: isDark ? '#27272a' : '#e5e7eb',
        margin: '2px 0'
      }}
    />
  );

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
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        borderRadius: '10px',
        boxShadow: isDark
          ? '0 4px 16px rgba(0, 0, 0, 0.45), 0 0 0 1px #27272a'
          : '0 4px 16px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.06)'
      }}
    >
      <HistoryButtons canUndo={canUndo} canRedo={canRedo} onUndo={onUndo} onRedo={onRedo} resolvedTheme={resolvedTheme} />
      {divider}
      <ZoomButtons camera={camera} onCameraChange={onCameraChange} resolvedTheme={resolvedTheme} />

      {onCycleTheme && (
        <>
          {divider}
          <button
            title={`Theme: ${themePreference === 'system' ? `System (${resolvedTheme})` : themePreference} (Click to change)`}
            onClick={onCycleTheme}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '32px', height: '32px', borderRadius: '6px', border: 'none',
              backgroundColor: 'transparent', color: isDark ? '#f4f4f5' : '#374151',
              cursor: 'pointer', transition: 'background-color 0.15s ease', outline: 'none'
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f3f4f6'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {themePreference === 'system' ? <Monitor size={15} /> : themePreference === 'dark' ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </>
      )}
    </div>
  );
};
