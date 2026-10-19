import React, { useRef, useEffect, useState, useCallback } from 'react';
import { nanoid } from 'nanoid';
import { Point, Camera, ResizeHandle, BoundingBox } from '../../types/canvas';
import { WhiteboardElement, ToolType, ElementStyle, ActionType } from '../../types/elements';
import { screenToWorld, zoomAroundPoint } from '../../utils/coordinates';
import {
  isPointInsideElement,
  getElementBounds,
  getHandleAtPoint,
  resizeElement,
  findNearestPort,
  updateConnectedConnectors,
  isElementIntersectingBox,
  PortName
} from '../../utils/geometry';
import { renderCanvas } from './renderer';
import { CanvasOverlay } from './CanvasOverlay';
import { ContextMenu } from './ContextMenu';
import { subscribeIconCache } from '../../utils/iconCache';

interface CanvasProps {
  elements: WhiteboardElement[];
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void;
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  currentStyle: ElementStyle;
  camera: Camera;
  onCameraChange: (camera: Camera) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onDuplicateSelected?: (specificIds?: string[]) => void;
  onCopySelected?: (specificIds?: string[]) => void;
  onDeleteSelected?: (specificIds?: string[]) => void;
  onBringForward?: (specificIds?: string[]) => void;
  onSendBackward?: (specificIds?: string[]) => void;
  onBringToFront?: (specificIds?: string[]) => void;
  onSendToBack?: (specificIds?: string[]) => void;
  onToggleLock?: (specificIds?: string[]) => void;
  onGroupSelected?: () => void;
  onUngroupSelected?: () => void;
  canPaste?: boolean;
  onPaste?: () => void;
  theme?: 'light' | 'dark';
}

export const Canvas: React.FC<CanvasProps> = ({
  elements,
  onElementsChange,
  activeTool,
  onToolSelect,
  currentStyle,
  camera,
  onCameraChange,
  selectedIds,
  onSelectedIdsChange,
  onDuplicateSelected,
  onCopySelected,
  onDeleteSelected,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onToggleLock,
  onGroupSelected,
  onUngroupSelected,
  canPaste,
  onPaste,
  theme = 'light'
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; targetIds: string[] } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<ResizeHandle | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{ elementId: string; port: PortName; point: Point } | null>(null);
  const [action, setAction] = useState<ActionType | 'selecting_box'>('none');
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectionBox, setSelectionBox] = useState<BoundingBox | null>(null);
  const [activeSnapPort, setActiveSnapPort] = useState<Point | null>(null);

  // Dragging and resizing references
  const startScreenPointRef = useRef<Point>({ x: 0, y: 0 });
  const startWorldPointRef = useRef<Point>({ x: 0, y: 0 });
  const activeElementIdRef = useRef<string | null>(null);
  const activeHandleRef = useRef<ResizeHandle | null>(null);
  const initialBoundsRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const endPortRef = useRef<{ elementId: string; port: 'top' | 'right' | 'bottom' | 'left' } | null>(null);

  // In-line text editing state
  const [editingText, setEditingText] = useState<{
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
  } | null>(null);

  // 1. High-DPI canvas resizing and rendering loop
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
      theme
    );
    ctx.restore();
  }, [elements, camera, selectedIds, hoveredId, selectionBox, activeTool, activeSnapPort, editingText, hoveredPort, theme]);

  useEffect(() => {
    const frameId = requestAnimationFrame(redraw);
    return () => cancelAnimationFrame(frameId);
  }, [redraw]);

  // Redraw when asynchronously fetched CDN icons finish downloading
  useEffect(() => {
    return subscribeIconCache(redraw);
  }, [redraw]);


  // Window resize observer
  useEffect(() => {
    const handleResize = () => redraw();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redraw]);

  // Spacebar pan toggle listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && document.activeElement?.tagName !== 'TEXTAREA') {
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // 2. Mouse Wheel: Pan or Zoom
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

  const getSingleSelectedElement = (): WhiteboardElement | null => {
    if (selectedIds.length === 1) {
      return elements.find(el => el.id === selectedIds[0]) || null;
    }
    return null;
  };

  // 3. Pointer Down
  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPos: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldPos = screenToWorld(screenPos, camera);

    setContextMenu(null);

    startScreenPointRef.current = screenPos;
    startWorldPointRef.current = worldPos;
    endPortRef.current = null;

    // Pan mode
    if (activeTool === 'pan' || isSpacePressed || e.button === 1) {
      setAction('panning');
      return;
    }

    if (activeTool === 'select') {
      // 1. Drag-to-connect directly from a shape's port handle in Select mode
      if (hoveredPort) {
        const newId = nanoid();
        activeElementIdRef.current = newId;
        const newArrow: WhiteboardElement = {
          id: newId,
          type: 'arrow',
          x: hoveredPort.point.x,
          y: hoveredPort.point.y,
          width: 0,
          height: 0,
          strokeColor: currentStyle.strokeColor,
          fillColor: currentStyle.fillColor,
          strokeWidth: currentStyle.strokeWidth,
          roughness: currentStyle.roughness,
          seed: Math.floor(Math.random() * 2000000),
          zIndex: elements.length,
          startBinding: { elementId: hoveredPort.elementId, port: hoveredPort.port }
        };
        onElementsChange([...elements, newArrow], false);
        onSelectedIdsChange([newId]);
        setAction('drawing');
        setHoveredPort(null);
        return;
      }

      const singleSelected = getSingleSelectedElement();

      // Check resize handle of selected unlocked element
      if (singleSelected && !singleSelected.locked) {
        const bounds = getElementBounds(singleSelected);
        const handle = getHandleAtPoint(worldPos, bounds, camera.zoom);
        if (handle) {
          setAction('resizing');
          activeHandleRef.current = handle;
          activeElementIdRef.current = singleSelected.id;
          initialBoundsRef.current = {
            x: singleSelected.x,
            y: singleSelected.y,
            width: singleSelected.width,
            height: singleSelected.height
          };
          return;
        }
      }

      // Hit-test elements
      const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
      const hit = sorted.find(el => isPointInsideElement(worldPos, el));

      if (hit) {
        let toSelect = [hit.id];
        if (hit.groupIds && hit.groupIds.length > 0) {
          const groupId = hit.groupIds[0];
          toSelect = elements.filter(el => el.groupIds?.includes(groupId)).map(el => el.id);
        }

        onSelectedIdsChange(toSelect);
        activeElementIdRef.current = hit.id;

        const anyLocked = elements.some(el => toSelect.includes(el.id) && el.locked);
        if (anyLocked) {
          setAction('none');
        } else {
          setAction('moving');
        }
      } else {
        // Clicked on empty canvas: Start marquee selection box
        onSelectedIdsChange([]);
        setAction('selecting_box');
        setSelectionBox({
          minX: worldPos.x,
          minY: worldPos.y,
          maxX: worldPos.x,
          maxY: worldPos.y,
          width: 0,
          height: 0
        });
      }
      return;
    }

    if (activeTool === 'text') {
      // 1. Check if user clicked an existing shape with Text tool
      const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
      const hit = sorted.find(el => isPointInsideElement(worldPos, el));

      if (hit && !hit.locked) {
        const isShape =
          hit.type === 'rectangle' ||
          hit.type === 'ellipse' ||
          hit.type === 'icon' ||
          hit.type === 'frame';
        const bounds = getElementBounds(hit);
        onSelectedIdsChange([hit.id]);
        setEditingText({
          elementId: hit.id,
          worldPos: { x: bounds.minX, y: bounds.minY },
          text: hit.text || '',
          fontSize: hit.fontSize || (isShape ? 16 : currentStyle.fontSize),
          fontFamily: hit.fontFamily || (isShape ? 'JetBrains Mono, monospace' : currentStyle.fontFamily),
          color: hit.strokeColor,
          isShapeLabel: isShape,
          bounds: { width: bounds.width, height: bounds.height },
          textAlign: hit.textAlign || currentStyle.textAlign,
          verticalAlign: hit.verticalAlign || currentStyle.verticalAlign
        });
        onToolSelect('select');
        return;
      }

      // 2. Clicked on empty canvas: place new bounded text
      const newId = nanoid();
      const initialW = 200;
      const initialH = 45;
      const newElement: WhiteboardElement = {
        id: newId,
        type: 'text',
        x: worldPos.x,
        y: worldPos.y,
        width: initialW,
        height: initialH,
        strokeColor: currentStyle.strokeColor,
        fillColor: 'transparent',
        strokeWidth: 1,
        roughness: 0,
        seed: Math.floor(Math.random() * 2000000),
        zIndex: elements.length,
        text: '',
        fontSize: currentStyle.fontSize,
        fontFamily: currentStyle.fontFamily,
        textAlign: currentStyle.textAlign || 'left',
        verticalAlign: currentStyle.verticalAlign || 'top'
      };

      onElementsChange([...elements, newElement], false);
      onSelectedIdsChange([newId]);
      setEditingText({
        elementId: newId,
        worldPos: { x: worldPos.x, y: worldPos.y },
        text: '',
        fontSize: currentStyle.fontSize,
        fontFamily: currentStyle.fontFamily,
        color: currentStyle.strokeColor,
        isShapeLabel: false,
        bounds: { width: initialW, height: initialH },
        textAlign: currentStyle.textAlign || 'left',
        verticalAlign: currentStyle.verticalAlign || 'top'
      });
      onToolSelect('select');
      return;
    }


    // Creating arrow, line, or shape
    const newId = nanoid();
    activeElementIdRef.current = newId;

    let startX = worldPos.x;
    let startY = worldPos.y;
    let startBinding: { elementId: string; port: 'top' | 'right' | 'bottom' | 'left' } | undefined = undefined;

    // Magnetic port snapping for arrow and line
    if (activeTool === 'arrow' || activeTool === 'line') {
      const nearest = findNearestPort(worldPos, elements);
      if (nearest) {
        startX = nearest.point.x;
        startY = nearest.point.y;
        startBinding = { elementId: nearest.elementId, port: nearest.port };
      }
    }

    const newElement: WhiteboardElement = {
      id: newId,
      type: activeTool,
      x: startX,
      y: startY,
      width: 0,
      height: 0,
      strokeColor: currentStyle.strokeColor,
      fillColor: currentStyle.fillColor,
      strokeWidth: currentStyle.strokeWidth,
      roughness: currentStyle.roughness,
      seed: Math.floor(Math.random() * 2000000),
      zIndex: elements.length,
      startBinding,
      points: activeTool === 'draw' ? [worldPos] : undefined
    };

    onElementsChange([...elements, newElement], false);
    onSelectedIdsChange([newId]);
    setAction('drawing');
  };

  // 4. Pointer Move
  const handlePointerMove = (e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPos: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldPos = screenToWorld(screenPos, camera);

    if (action === 'panning') {
      const dx = screenPos.x - startScreenPointRef.current.x;
      const dy = screenPos.y - startScreenPointRef.current.y;
      startScreenPointRef.current = screenPos;
      onCameraChange({
        ...camera,
        x: camera.x + dx,
        y: camera.y + dy
      });
      return;
    }

    if (action === 'selecting_box') {
      const minX = Math.min(startWorldPointRef.current.x, worldPos.x);
      const minY = Math.min(startWorldPointRef.current.y, worldPos.y);
      const maxX = Math.max(startWorldPointRef.current.x, worldPos.x);
      const maxY = Math.max(startWorldPointRef.current.y, worldPos.y);

      setSelectionBox({
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
      });
      return;
    }

    if (action === 'resizing' && activeHandleRef.current && initialBoundsRef.current && activeElementIdRef.current) {
      const activeEl = elements.find(el => el.id === activeElementIdRef.current);
      if (activeEl) {
        const updatedElement = resizeElement(
          activeEl,
          activeHandleRef.current,
          worldPos,
          initialBoundsRef.current
        );

        let updatedList = elements.map(el => (el.id === activeEl.id ? updatedElement : el));
        updatedList = updateConnectedConnectors(updatedList);
        onElementsChange(updatedList, false);
      }
      return;
    }

    if (action === 'moving') {
      const dx = worldPos.x - startWorldPointRef.current.x;
      const dy = worldPos.y - startWorldPointRef.current.y;
      startWorldPointRef.current = worldPos;

      let updated = elements.map(el => {
        if (selectedIds.includes(el.id) && !el.locked) {
          if (el.type === 'draw' && el.points) {
            return {
              ...el,
              points: el.points.map(p => ({ x: p.x + dx, y: p.y + dy }))
            };
          }
          return {
            ...el,
            x: el.x + dx,
            y: el.y + dy
          };
        }
        return el;
      });

      // Keep glued arrows moving with shapes
      updated = updateConnectedConnectors(updated);
      onElementsChange(updated, false);
      return;
    }

    if (action === 'drawing' && activeElementIdRef.current) {
      let targetX = worldPos.x;
      let targetY = worldPos.y;

      const activeEl = elements.find(el => el.id === activeElementIdRef.current);
      // Magnetic port snapping for arrow and line endpoints
      if (activeEl?.type === 'arrow' || activeEl?.type === 'line' || activeTool === 'arrow' || activeTool === 'line') {
        const nearest = findNearestPort(worldPos, elements, activeEl?.startBinding?.elementId || activeElementIdRef.current, 24 / camera.zoom);
        if (nearest) {
          targetX = nearest.point.x;
          targetY = nearest.point.y;
          endPortRef.current = { elementId: nearest.elementId, port: nearest.port };
          setActiveSnapPort(nearest.point);
        } else {
          endPortRef.current = null;
          setActiveSnapPort(null);
        }
      }

      const updated = elements.map(el => {
        if (el.id === activeElementIdRef.current) {
          if (el.type === 'draw') {
            return {
              ...el,
              points: [...(el.points || []), worldPos]
            };
          }
          return {
            ...el,
            width: targetX - el.x,
            height: targetY - el.y,
            endBinding: endPortRef.current || undefined
          };
        }
        return el;
      });

      onElementsChange(updated, false);
      return;
    }

    // Hover detection for select tool
    if (activeTool === 'select' && action === 'none') {
      const singleSelected = getSingleSelectedElement();
      if (singleSelected && !singleSelected.locked) {
        const bounds = getElementBounds(singleSelected);
        const handle = getHandleAtPoint(worldPos, bounds, camera.zoom);
        setHoveredHandle(handle);
        if (handle) {
          setHoveredId(null);
          setHoveredPort(null);
          return;
        }
      } else {
        setHoveredHandle(null);
      }

      const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
      const hit = sorted.find(el => isPointInsideElement(worldPos, el));
      setHoveredId(hit ? hit.id : null);

      // Check if mouse is hovering over a port of hovered or selected shapes
      const targetCandidates = elements.filter(
        el => (selectedIds.includes(el.id) || el.id === hit?.id) &&
              el.type !== 'line' && el.type !== 'arrow' && el.type !== 'draw' && !el.locked
      );
      const portHit = findNearestPort(worldPos, targetCandidates, undefined, 14 / camera.zoom);
      setHoveredPort(portHit);
    }
  };

  // 5. Pointer Up
  const handlePointerUp = () => {
    if (action === 'selecting_box' && selectionBox) {
      // Find all elements inside or intersecting selection box
      if (selectionBox.width > 3 || selectionBox.height > 3) {
        const hits = elements.filter(el => isElementIntersectingBox(el, selectionBox));
        onSelectedIdsChange(hits.map(h => h.id));
      }
      setSelectionBox(null);
    }

    if (action === 'drawing' && activeElementIdRef.current) {
      const activeEl = elements.find(el => el.id === activeElementIdRef.current);
      if (activeEl && (activeEl.type === 'arrow' || activeEl.type === 'line')) {
        // Discard accidental clicks that didn't drag
        if (Math.hypot(activeEl.width, activeEl.height) < 10) {
          onElementsChange(elements.filter(el => el.id !== activeEl.id), false);
          onSelectedIdsChange([]);
        } else {
          onElementsChange(elements, true);
        }
      } else {
        onElementsChange(elements, true);
      }

      if (activeTool !== 'draw' && activeTool !== 'select') {
        onToolSelect('select');
      }
    } else if (action === 'moving' || action === 'resizing') {
      onElementsChange(elements, true);
    }

    setAction('none');
    activeElementIdRef.current = null;
    activeHandleRef.current = null;
    initialBoundsRef.current = null;
    setActiveSnapPort(null);
  };

  // 6. Double Click: In-place text editing (safely edits shape or text)
  const handleDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPos: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldPos = screenToWorld(screenPos, camera);

    const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const hit = sorted.find(el => isPointInsideElement(worldPos, el));

    if (hit && !hit.locked) {
      const isShape =
        hit.type === 'rectangle' ||
        hit.type === 'ellipse' ||
        hit.type === 'icon' ||
        hit.type === 'frame';
      const bounds = getElementBounds(hit);

      setEditingText({
        elementId: hit.id,
        worldPos: { x: bounds.minX, y: bounds.minY },
        text: hit.text || '',
        fontSize: hit.fontSize || (isShape ? 16 : currentStyle.fontSize),
        fontFamily: hit.fontFamily || (isShape ? 'JetBrains Mono, monospace' : currentStyle.fontFamily),
        color: hit.strokeColor,
        isShapeLabel: isShape,
        bounds: { width: bounds.width, height: bounds.height },
        textAlign: hit.textAlign || currentStyle.textAlign,
        verticalAlign: hit.verticalAlign || currentStyle.verticalAlign
      });
    }
  };

  // 7. Commit text (guarantees shapes are never deleted!)
  const handleCommitText = (newText: string) => {
    if (!editingText) return;

    const targetEl = elements.find(el => el.id === editingText.elementId);
    if (!targetEl) {
      setEditingText(null);
      return;
    }

    const trimmed = newText.trim();

    if (targetEl.type === 'text') {
      // Standalone text element: delete if empty
      if (!trimmed) {
        onElementsChange(
          elements.filter(el => el.id !== editingText.elementId),
          true
        );
        onSelectedIdsChange([]);
      } else {
        const lines = newText.split('\n');
        const fontSize = targetEl.fontSize || 18;
        const lineHeight = fontSize * 1.35;
        const requiredHeight = Math.max(targetEl.height, lines.length * lineHeight + 12);

        onElementsChange(
          elements.map(el =>
            el.id === editingText.elementId
              ? {
                  ...el,
                  text: newText,
                  height: requiredHeight
                }
              : el
          ),
          true
        );
      }
    } else {
      // Container shape (rectangle, ellipse): NEVER delete the shape!
      onElementsChange(
        elements.map(el =>
          el.id === editingText.elementId ? { ...el, text: trimmed ? newText : undefined } : el
        ),
        true
      );
    }

    setEditingText(null);
  };

  const getCursorStyle = () => {
    if (action === 'panning' || isSpacePressed || activeTool === 'pan') return 'grab';
    if (action === 'resizing' || hoveredHandle) {
      const h = action === 'resizing' ? activeHandleRef.current : hoveredHandle;
      if (h === 'nw' || h === 'se') return 'nwse-resize';
      if (h === 'ne' || h === 'sw') return 'nesw-resize';
      if (h === 'n' || h === 's') return 'ns-resize';
      if (h === 'e' || h === 'w') return 'ew-resize';
    }
    if (action === 'moving') return 'move';
    if (action === 'selecting_box') return 'crosshair';
    if (activeTool === 'select') {
      if (hoveredPort) return 'crosshair';
      return hoveredId ? 'pointer' : 'default';
    }
    if (activeTool === 'text') return 'text';
    return 'crosshair';
  };

  // 8. Right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenPos: Point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldPos = screenToWorld(screenPos, camera);

    const sorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const hit = sorted.find(el => isPointInsideElement(worldPos, el));

    if (hit) {
      const targetIds = selectedIds.includes(hit.id) ? selectedIds : [hit.id];
      if (!selectedIds.includes(hit.id)) {
        onSelectedIdsChange([hit.id]);
      }
      setContextMenu({ x: e.clientX, y: e.clientY, targetIds });
    } else {
      setContextMenu(null);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: theme === 'dark' ? '#121214' : '#fafafa',
        cursor: getCursorStyle(),
        userSelect: 'none'
      }}
      onWheel={handleWheel}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleContextMenu}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100%',
          height: '100%'
        }}
      />

      <CanvasOverlay
        editingText={editingText}
        camera={camera}
        onCommit={handleCommitText}
        onCancel={() => setEditingText(null)}
        theme={theme}
      />

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          selectedElements={elements.filter(el => contextMenu.targetIds.includes(el.id))}
          canPaste={canPaste}
          onClose={() => setContextMenu(null)}
          onCopy={() => onCopySelected?.(contextMenu.targetIds)}
          onPaste={onPaste}
          onDuplicate={() => onDuplicateSelected?.(contextMenu.targetIds)}
          onDelete={() => onDeleteSelected?.(contextMenu.targetIds)}
          onBringForward={() => onBringForward?.(contextMenu.targetIds)}
          onSendBackward={() => onSendBackward?.(contextMenu.targetIds)}
          onBringToFront={() => onBringToFront?.(contextMenu.targetIds)}
          onSendToBack={() => onSendToBack?.(contextMenu.targetIds)}
          onToggleLock={() => onToggleLock?.(contextMenu.targetIds)}
          onGroupSelected={onGroupSelected || (() => {})}
          onUngroupSelected={onUngroupSelected || (() => {})}
          theme={theme}
        />
      )}
    </div>
  );
};
