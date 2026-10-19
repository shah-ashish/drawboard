import { useEffect, useCallback } from 'react';
import { Camera } from '../../../types/canvas';
import { WhiteboardElement, ToolType } from '../../../types/elements';
import { renderCanvas } from '../renderer';
import { subscribeIconCache } from '../../../utils/iconCache';

export function useCanvasRedraw(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  elements: WhiteboardElement[],
  camera: Camera,
  selectedIds: string[],
  hoveredId: string | null,
  selectionBox: any,
  activeTool: ToolType,
  activeSnapPort: any,
  editingText: any,
  hoveredPort: any,
  theme: 'light' | 'dark'
) {
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    renderCanvas(
      ctx,
      elements,
      camera,
      width,
      height,
      selectedIds,
      hoveredId,
      selectionBox,
      activeTool,
      activeSnapPort,
      editingText?.elementId || null,
      hoveredPort?.point || null,
      theme,
      editingText?.todoItemId || null
    );
    ctx.restore();
  }, [canvasRef, elements, camera, selectedIds, hoveredId, selectionBox, activeTool, activeSnapPort, editingText, hoveredPort, theme]);

  useEffect(() => {
    const frameId = requestAnimationFrame(redraw);
    return () => cancelAnimationFrame(frameId);
  }, [redraw]);

  useEffect(() => subscribeIconCache(redraw), [redraw]);

  useEffect(() => {
    const handleResize = () => redraw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  return { redraw };
}
