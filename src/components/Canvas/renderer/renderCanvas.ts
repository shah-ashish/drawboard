import rough from 'roughjs';
import { WhiteboardElement } from '../../../types/elements';
import { Camera, Point, BoundingBox } from '../../../types/canvas';
import { renderFreehandOnContext } from '../../../utils/freehand';
import { drawDotGrid } from './renderGrid';
import { renderAlignedBoxText } from './renderText';
import { drawRectangle, drawEllipse, drawLineOrArrow } from './renderPrimitives';
import { drawBrowserMockup, drawPhoneMockup, drawFigureFrame } from './renderFrames';
import { drawTodoCard } from './renderTodo';
import { drawIconElement } from './renderIcons';
import { drawSelectionBox, drawConnectionPorts, drawMarqueeBox } from './renderOverlays';

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  elements: WhiteboardElement[],
  camera: Camera,
  viewportWidth: number,
  viewportHeight: number,
  selectedElementIds: string[] = [],
  hoveredElementId: string | null = null,
  selectionBox: BoundingBox | null = null,
  activeTool: string = 'select',
  activeSnapPort: Point | null = null,
  editingElementId: string | null = null,
  hoveredPortPoint: Point | null = null,
  theme: 'light' | 'dark' = 'light',
  editingTodoItemId: string | null = null
) {
  ctx.save();
  ctx.fillStyle = theme === 'dark' ? '#121214' : '#fafafa';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);
  ctx.restore();

  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  drawDotGrid(ctx, camera, viewportWidth, viewportHeight, theme);

  let rc: ReturnType<typeof rough.canvas> | null = null;
  const sorted = [...elements].sort((a, b) => {
    const aPin = Boolean(a.pinnedToScreen);
    const bPin = Boolean(b.pinnedToScreen);
    if (aPin !== bPin) return aPin ? 1 : -1;
    return a.zIndex - b.zIndex;
  });

  for (const el of sorted) {
    const isSelected = selectedElementIds.includes(el.id);
    const isHovered = hoveredElementId === el.id;
    const isPinned = Boolean(el.pinnedToScreen);

    if (isPinned) {
      ctx.save();
      ctx.scale(1 / camera.zoom, 1 / camera.zoom);
      ctx.translate(-camera.x, -camera.y);
    }

    const defaultDarkStroke = theme === 'dark' ? '#f4f4f5' : '#1e1e1e';
    const strokeColor = (!el.strokeColor || el.strokeColor === '#1e1e1e' || el.strokeColor === '#000000')
      ? defaultDarkStroke
      : el.strokeColor;
    const fillColor = el.fillColor && el.fillColor !== 'transparent'
      ? (theme === 'dark' && (el.fillColor === '#ffffff' || el.fillColor === '#fff') ? '#1e1e24' : el.fillColor)
      : undefined;

    const x = Math.min(el.x, el.x + el.width);
    const y = Math.min(el.y, el.y + el.height);
    const w = Math.abs(el.width);
    const h = Math.abs(el.height);

    if (el.type === 'rectangle') {
      if (!rc) rc = rough.canvas(ctx.canvas);
      drawRectangle(ctx, rc, el, x, y, w, h, strokeColor, fillColor);
      if (el.text && el.id !== editingElementId) {
        renderAlignedBoxText(ctx, el.text, x, y, w, h, {
          fontSize: el.fontSize || 16,
          fontFamily: el.fontFamily || 'JetBrains Mono, monospace',
          fontWeight: 600,
          color: strokeColor,
          textAlign: el.textAlign || 'center',
          verticalAlign: el.verticalAlign || 'middle',
          padX: 12,
          padY: 10
        });
      }
    } else if (el.type === 'ellipse') {
      if (!rc) rc = rough.canvas(ctx.canvas);
      const cx = el.x + el.width / 2;
      const cy = el.y + el.height / 2;
      const rx = Math.abs(el.width) / 2;
      const ry = Math.abs(el.height) / 2;
      drawEllipse(ctx, rc, el, cx, cy, rx, ry, strokeColor, fillColor);
      if (el.text && el.id !== editingElementId) {
        renderAlignedBoxText(ctx, el.text, cx - rx, cy - ry, rx * 2, ry * 2, {
          fontSize: el.fontSize || 16,
          fontFamily: el.fontFamily || 'JetBrains Mono, monospace',
          fontWeight: 600,
          color: strokeColor,
          textAlign: el.textAlign || 'center',
          verticalAlign: el.verticalAlign || 'middle',
          padX: Math.max(rx * 0.22, 12),
          padY: Math.max(ry * 0.22, 10)
        });
      }
    } else if (el.type === 'line' || el.type === 'arrow') {
      if (!rc) rc = rough.canvas(ctx.canvas);
      drawLineOrArrow(ctx, rc, el, strokeColor, el.type === 'arrow');
    } else if (el.type === 'draw' && el.points && el.points.length > 0) {
      renderFreehandOnContext(ctx, el.points, strokeColor, el.strokeWidth || 2);
    } else if (el.type === 'text') {
      if (el.id !== editingElementId && el.text) {
        if (fillColor) {
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          if (ctx.roundRect) ctx.roundRect(x, y, Math.max(w, 40), Math.max(h, 20), 4);
          else ctx.rect(x, y, Math.max(w, 40), Math.max(h, 20));
          ctx.fill();
        }
        renderAlignedBoxText(ctx, el.text, x, y, Math.max(w, 40), Math.max(h, 20), {
          fontSize: el.fontSize || 18,
          fontFamily: el.fontFamily || 'Inter, sans-serif',
          fontWeight: 500,
          color: strokeColor,
          textAlign: el.textAlign || 'left',
          verticalAlign: el.verticalAlign || 'top',
          padX: 6,
          padY: 4
        });
      }
    } else if (el.type === 'todo') {
      drawTodoCard(ctx, el, x, y, Math.max(w, 160), Math.max(h, 48), fillColor, editingElementId, editingTodoItemId, theme);
    } else if (el.type === 'icon') {
      drawIconElement(ctx, el, x, y, w, h, strokeColor, fillColor, editingElementId, theme);
    } else if (el.type === 'frame') {
      if (el.frameType === 'browser') drawBrowserMockup(ctx, el, x, y, w, h, strokeColor, fillColor, theme);
      else if (el.frameType === 'phone') drawPhoneMockup(ctx, el, x, y, w, h, strokeColor, fillColor, theme);
      else drawFigureFrame(ctx, el, x, y, w, h, strokeColor, fillColor);
    }

    drawSelectionBox(ctx, el, camera, isSelected, isHovered, isPinned);
    if (isPinned) ctx.restore();
  }

  drawConnectionPorts(ctx, elements, selectedElementIds, hoveredElementId, activeTool, camera, activeSnapPort, hoveredPortPoint);
  drawMarqueeBox(ctx, selectionBox, camera);
  ctx.restore();
}
