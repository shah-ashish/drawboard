import { useRef, useState } from 'react';
import { Point, Camera, ResizeHandle, BoundingBox } from '../../../types/canvas';
import { WhiteboardElement, ToolType, ElementStyle, ActionType } from '../../../types/elements';
import { isElementIntersectingBox, PortName } from '../../../utils/geometry';
import { handleCanvasPointerDown } from './handlePointerDownLogic';
import { handleCanvasPointerMove } from './handlePointerMoveLogic';

export function usePointerInteractions(
  elements: WhiteboardElement[],
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void,
  activeTool: ToolType,
  onToolSelect: (tool: ToolType) => void,
  currentStyle: ElementStyle,
  camera: Camera,
  onCameraChange: (camera: Camera) => void,
  selectedIds: string[],
  onSelectedIdsChange: (ids: string[]) => void,
  isSpacePressed: boolean,
  setEditingText: (val: any) => void,
  theme: 'light' | 'dark'
) {
  const [action, setAction] = useState<ActionType | 'selecting_box'>('none');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<ResizeHandle | null>(null);
  const [hoveredPort, setHoveredPort] = useState<{ elementId: string; port: PortName; point: Point } | null>(null);
  const [selectionBox, setSelectionBox] = useState<BoundingBox | null>(null);
  const [activeSnapPort, setActiveSnapPort] = useState<Point | null>(null);

  const startScreenPointRef = useRef<Point>({ x: 0, y: 0 });
  const startWorldPointRef = useRef<Point>({ x: 0, y: 0 });
  const activeElementIdRef = useRef<string | null>(null);
  const activeHandleRef = useRef<ResizeHandle | null>(null);
  const initialBoundsRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null);
  const endPortRef = useRef<{ elementId: string; port: PortName } | null>(null);

  const handlePointerDown = (screenPos: Point, worldPos: Point, eButton: number, overrideSpace?: boolean) => {
    startScreenPointRef.current = screenPos;
    startWorldPointRef.current = worldPos;
    endPortRef.current = null;

    handleCanvasPointerDown(screenPos, worldPos, eButton, {
      elements, onElementsChange, activeTool, onToolSelect, currentStyle, camera,
      selectedIds, onSelectedIdsChange, isSpacePressed: overrideSpace !== undefined ? overrideSpace : isSpacePressed,
      hoveredPort, setEditingText, setAction, setSelectionBox, setHoveredPort, activeElementIdRef,
      activeHandleRef, initialBoundsRef, theme
    });
  };

  const handlePointerMove = (screenPos: Point, worldPos: Point) => {
    handleCanvasPointerMove(screenPos, worldPos, {
      action, startScreenPointRef, startWorldPointRef, activeHandleRef, initialBoundsRef,
      activeElementIdRef, endPortRef, elements, onElementsChange, camera, onCameraChange,
      selectedIds, activeTool, setSelectionBox, setActiveSnapPort, setHoveredHandle,
      setHoveredId, setHoveredPort
    });
  };

  const handlePointerUp = () => {
    if (action === 'selecting_box' && selectionBox) {
      if (selectionBox.width > 3 || selectionBox.height > 3) {
        onSelectedIdsChange(elements.filter(el => isElementIntersectingBox(el, selectionBox)).map(h => h.id));
      }
      setSelectionBox(null);
    }

    if (action === 'drawing' && activeElementIdRef.current) {
      const activeEl = elements.find(el => el.id === activeElementIdRef.current);
      if (activeEl && (activeEl.type === 'arrow' || activeEl.type === 'line') && Math.hypot(activeEl.width, activeEl.height) < 10) {
        onElementsChange(elements.filter(el => el.id !== activeEl.id), false);
        onSelectedIdsChange([]);
      } else {
        onElementsChange(elements, true);
      }
      if (activeTool !== 'draw' && activeTool !== 'select') onToolSelect('select');
    } else if (action === 'moving' || action === 'resizing') {
      onElementsChange(elements, true);
    }

    setAction('none');
    activeElementIdRef.current = null;
    activeHandleRef.current = null;
    initialBoundsRef.current = null;
    setActiveSnapPort(null);
  };

  return {
    action,
    hoveredId,
    hoveredHandle,
    hoveredPort,
    selectionBox,
    activeSnapPort,
    activeHandle: activeHandleRef.current,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp
  };
}
