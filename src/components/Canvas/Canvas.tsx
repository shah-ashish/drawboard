import React, { useRef, useState } from 'react';
import { screenToWorld } from '../../utils/coordinates';
import { isPointInsideElement } from '../../utils/geometry';
import { CanvasProps } from './types';
import { CanvasOverlay } from './CanvasOverlay';
import { CanvasContextMenuWrapper } from './CanvasContextMenuWrapper';
import { useCanvasPanZoom } from './hooks/useCanvasPanZoom';
import { useCanvasTextEditing } from './hooks/useCanvasTextEditing';
import { usePointerInteractions } from './hooks/usePointerInteractions';
import { useCanvasRedraw } from './hooks/useCanvasRedraw';

export const Canvas: React.FC<CanvasProps> = (props) => {
  const {
    elements, onElementsChange, activeTool, onToolSelect, currentStyle,
    camera, onCameraChange, selectedIds, onSelectedIdsChange, theme = 'light'
  } = props;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetIds: string[] } | null>(null);

  const { editingText, setEditingText, handleDoubleClick, handleCommitText } = useCanvasTextEditing(
    elements, currentStyle, camera, onElementsChange, onSelectedIdsChange
  );

  const pointer = usePointerInteractions(
    elements, onElementsChange, activeTool, onToolSelect, currentStyle, camera,
    onCameraChange, selectedIds, onSelectedIdsChange, false, setEditingText, theme
  );

  const { isSpacePressed, handleWheel, getCursorStyle } = useCanvasPanZoom({
    camera, onCameraChange, canvasRef,
    action: pointer.action,
    activeTool,
    hoveredHandle: pointer.hoveredHandle,
    activeHandle: pointer.activeHandle,
    hoveredPort: pointer.hoveredPort,
    hoveredId: pointer.hoveredId
  });

  useCanvasRedraw(
    canvasRef, elements, camera, selectedIds, pointer.hoveredId, pointer.selectionBox,
    activeTool, pointer.activeSnapPort, editingText, pointer.hoveredPort, theme
  );

  const getPos = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    return { screenPos, worldPos: screenToWorld(screenPos, camera) };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    const pos = getPos(e);
    if (!pos) return;
    setContextMenu(null);
    pointer.handlePointerDown(pos.screenPos, pos.worldPos, e.button, isSpacePressed);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const pos = getPos(e);
    if (pos) pointer.handlePointerMove(pos.screenPos, pos.worldPos);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    const pos = getPos(e);
    if (pos) handleDoubleClick(pos.screenPos, pos.worldPos);
  };

  const onContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getPos(e);
    if (!pos) return;
    const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const hit = sorted.find(el => isPointInsideElement(pos.worldPos, el));
    if (hit) {
      const targetIds = selectedIds.includes(hit.id) ? selectedIds : [hit.id];
      if (!selectedIds.includes(hit.id)) onSelectedIdsChange([hit.id]);
      setContextMenu({ x: e.clientX, y: e.clientY, targetIds });
    } else {
      setContextMenu(null);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
        backgroundColor: theme === 'dark' ? '#121214' : '#fafafa',
        cursor: getCursorStyle(), userSelect: 'none'
      }}
      onWheel={handleWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={pointer.handlePointerUp}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
    >
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      <CanvasOverlay editingText={editingText} camera={camera} onCommit={handleCommitText} onCancel={() => setEditingText(null)} theme={theme} />
      <CanvasContextMenuWrapper contextMenu={contextMenu} onClose={() => setContextMenu(null)} {...props} />
    </div>
  );
};
