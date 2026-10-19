import { WhiteboardElement } from '../../../types/elements';
import { Camera, Point, BoundingBox } from '../../../types/canvas';
import { getElementBounds, getShapePorts } from '../../../utils/geometry';

export function drawSelectionBox(
  ctx: CanvasRenderingContext2D,
  el: WhiteboardElement,
  camera: Camera,
  isSelected: boolean,
  isHovered: boolean,
  isPinned: boolean
) {
  if (!isSelected && !isHovered) return;

  const bounds = getElementBounds(el);
  const padding = 6;
  const isLocked = Boolean(el.locked);
  const zoomFactor = isPinned ? 1 : camera.zoom;

  ctx.save();
  ctx.strokeStyle = isLocked ? '#f59e0b' : isSelected ? '#3b82f6' : '#93c5fd';
  ctx.lineWidth = 1.5 / zoomFactor;
  ctx.setLineDash(isLocked ? [4, 4] : isSelected ? [] : [4, 4]);

  const selX = bounds.minX - padding;
  const selY = bounds.minY - padding;
  const selW = bounds.width + padding * 2;
  const selH = bounds.height + padding * 2;

  ctx.strokeRect(selX, selY, selW, selH);

  if (isLocked && isSelected) {
    ctx.fillStyle = '#f59e0b';
    const badgeWidth = 60 / zoomFactor;
    const badgeHeight = 18 / zoomFactor;
    const badgeX = selX + selW - badgeWidth;
    const badgeY = selY - badgeHeight - 4 / zoomFactor;

    ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${10 / zoomFactor}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔒 LOCKED', badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
  }

  if (isSelected && !isLocked) {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5 / zoomFactor;
    const handleSize = 8 / zoomFactor;

    const handles = [
      { x: selX, y: selY },
      { x: selX + selW / 2, y: selY },
      { x: selX + selW, y: selY },
      { x: selX + selW, y: selY + selH / 2 },
      { x: selX + selW, y: selY + selH },
      { x: selX + selW / 2, y: selY + selH },
      { x: selX, y: selY + selH },
      { x: selX, y: selY + selH / 2 }
    ];

    for (const h of handles) {
      ctx.fillRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
      ctx.strokeRect(h.x - handleSize / 2, h.y - handleSize / 2, handleSize, handleSize);
    }
  }
  ctx.restore();
}

export function drawConnectionPorts(
  ctx: CanvasRenderingContext2D,
  elements: WhiteboardElement[],
  selectedElementIds: string[],
  hoveredElementId: string | null,
  activeTool: string,
  camera: Camera,
  activeSnapPort: Point | null,
  hoveredPortPoint: Point | null
) {
  const isConnecting = activeTool === 'arrow' || activeTool === 'line' || activeSnapPort !== null;
  const elementsToShowPorts = isConnecting
    ? elements.filter(el => el.type !== 'line' && el.type !== 'arrow' && el.type !== 'draw' && !el.locked && !el.disableConnectors)
    : elements.filter(
        el =>
          (selectedElementIds.includes(el.id) || el.id === hoveredElementId) &&
          el.type !== 'line' &&
          el.type !== 'arrow' &&
          el.type !== 'draw' &&
          !el.locked &&
          !el.disableConnectors
      );

  if (elementsToShowPorts.length > 0 || activeSnapPort || hoveredPortPoint) {
    ctx.save();
    for (const el of elementsToShowPorts) {
      const ports = getShapePorts(el);
      for (const pt of Object.values(ports)) {
        ctx.fillStyle = '#6366f1';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 / camera.zoom;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5 / camera.zoom, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }

    const highlightPt = activeSnapPort || hoveredPortPoint;
    if (highlightPt) {
      ctx.fillStyle = '#4f46e5';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5 / camera.zoom;
      ctx.beginPath();
      ctx.arc(highlightPt.x, highlightPt.y, 7 / camera.zoom, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }
}

export function drawMarqueeBox(
  ctx: CanvasRenderingContext2D,
  selectionBox: BoundingBox | null,
  camera: Camera
) {
  if (!selectionBox) return;
  ctx.save();
  ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 1.5 / camera.zoom;
  ctx.setLineDash([4, 4]);
  ctx.fillRect(selectionBox.minX, selectionBox.minY, selectionBox.width, selectionBox.height);
  ctx.strokeRect(selectionBox.minX, selectionBox.minY, selectionBox.width, selectionBox.height);
  ctx.restore();
}
