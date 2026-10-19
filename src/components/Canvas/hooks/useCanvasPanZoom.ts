import { useState, useEffect } from 'react';
import { Camera, Point, ResizeHandle } from '../../../types/canvas';
import { ActionType, ToolType } from '../../../types/elements';
import { zoomAroundPoint } from '../../../utils/coordinates';

interface PanZoomProps {
  camera: Camera;
  onCameraChange: (camera: Camera) => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  action: ActionType | 'selecting_box';
  activeTool: ToolType;
  hoveredHandle: ResizeHandle | null;
  activeHandle: ResizeHandle | null;
  hoveredPort: unknown;
  hoveredId: string | null;
  isSpacePressed?: boolean;
}

export function useCanvasPanZoom({
  camera,
  onCameraChange,
  canvasRef,
  action,
  activeTool,
  hoveredHandle,
  activeHandle,
  hoveredPort,
  hoveredId,
  isSpacePressed: externalSpacePressed
}: PanZoomProps) {
  const [internalSpacePressed, setInternalSpacePressed] = useState(false);
  const isSpace = externalSpacePressed !== undefined ? externalSpacePressed : internalSpacePressed;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'TEXTAREA') {
        setInternalSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setInternalSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const cursorScreen: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (e.ctrlKey || e.metaKey) {
      const deltaZoom = -e.deltaY * 0.003;
      const newCamera = zoomAroundPoint(cursorScreen, camera, deltaZoom);
      onCameraChange(newCamera);
    } else {
      onCameraChange({
        ...camera,
        x: camera.x - e.deltaX,
        y: camera.y - e.deltaY
      });
    }
  };

  const getCursorStyle = (): string => {
    if (action === 'panning') return 'grabbing';
    if (isSpace || activeTool === 'pan') return 'grab';
    if (action === 'resizing' || hoveredHandle) {
      const h = action === 'resizing' ? activeHandle : hoveredHandle;
      if (h === 'nw' || h === 'se') return 'nwse-resize';
      if (h === 'ne' || h === 'sw') return 'nesw-resize';
      if (h === 'n' || h === 's') return 'ns-resize';
      if (h === 'e' || h === 'w') return 'ew-resize';
    }
    if (action === 'moving') return 'move';
    if (action === 'selecting_box') return 'crosshair';
    if (hoveredPort) return 'crosshair';
    if (activeTool === 'select') return hoveredId ? 'move' : 'default';
    if (activeTool === 'text') return 'text';
    if (activeTool === 'draw') return 'crosshair';
    if (activeTool === 'arrow' || activeTool === 'line') return 'crosshair';
    if (activeTool === 'rectangle' || activeTool === 'ellipse' || activeTool === 'todo') return 'crosshair';
    return 'default';
  };

  return {
    isSpacePressed: isSpace,
    handleWheel,
    getCursorStyle
  };
}
