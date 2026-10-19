import rough from 'roughjs';
import { WhiteboardElement } from '../../types/elements';
import { Camera, Point, BoundingBox } from '../../types/canvas';
import { renderFreehandOnContext } from '../../utils/freehand';
import { getElementBounds, getShapePorts } from '../../utils/geometry';
import { resolveIconUrl } from '../../constants/icons';
import { getLoadedIconImage } from '../../utils/iconCache';

/**
 * High-performance batched dot grid rendering using a single Path2D.
 */
function drawDotGrid(
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  viewportWidth: number,
  viewportHeight: number,
  theme: 'light' | 'dark' = 'light'
) {
  const gridSize = 25;
  const dotSize = Math.max(1.2 / camera.zoom, 0.8);

  const startX = Math.floor((-camera.x / camera.zoom) / gridSize) * gridSize;
  const endX = Math.ceil(((viewportWidth - camera.x) / camera.zoom) / gridSize) * gridSize;
  const startY = Math.floor((-camera.y / camera.zoom) / gridSize) * gridSize;
  const endY = Math.ceil(((viewportHeight - camera.y) / camera.zoom) / gridSize) * gridSize;

  // Single Path2D batches all dot coordinates in one GPU draw call
  const gridPath = new Path2D();
  for (let x = startX; x <= endX; x += gridSize) {
    for (let y = startY; y <= endY; y += gridSize) {
      gridPath.rect(x - dotSize / 2, y - dotSize / 2, dotSize, dotSize);
    }
  }

  ctx.fillStyle = theme === 'dark' ? '#334155' : '#cbd5e1';
  ctx.fill(gridPath);
}

function drawArrowhead(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  width: number
) {
  const headLen = Math.max(12, width * 4);
  const angle = Math.atan2(toY - fromY, toX - fromX);

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle - Math.PI / 6),
    toY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLen * Math.cos(angle + Math.PI / 6),
    toY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();
}

/**
 * Robust multi-line text rendering with 2D alignment (Horizontal + Vertical)
 * inside any bounding box (rectangle, ellipse, or text box).
 */
function renderAlignedBoxText(
  ctx: CanvasRenderingContext2D,
  text: string,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  style: {
    fontSize: number;
    fontFamily: string;
    fontWeight?: string | number;
    color: string;
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    padX?: number;
    padY?: number;
  }
) {
  if (!text) return;
  const lines = text.split('\n');
  const fontSize = style.fontSize;
  const lineHeight = fontSize * 1.35;
  const totalTextHeight = lines.length * lineHeight;
  const padX = style.padX ?? 8;
  const padY = style.padY ?? 8;

  const hAlign = style.textAlign || 'center';
  const vAlign = style.verticalAlign || 'middle';

  let anchorX = boxX + boxW / 2;
  if (hAlign === 'left') {
    anchorX = boxX + padX;
  } else if (hAlign === 'right') {
    anchorX = boxX + boxW - padX;
  }

  let startY = boxY + (boxH - totalTextHeight) / 2;
  if (vAlign === 'top') {
    startY = boxY + padY;
  } else if (vAlign === 'bottom') {
    startY = Math.max(boxY + padY, boxY + boxH - padY - totalTextHeight);
  } else {
    startY = Math.max(boxY + padY, boxY + (boxH - totalTextHeight) / 2);
  }

  ctx.save();
  ctx.font = `${style.fontWeight ? style.fontWeight + ' ' : ''}${fontSize}px ${style.fontFamily}`;
  ctx.fillStyle = style.color;
  ctx.textAlign = hAlign as CanvasTextAlign;
  ctx.textBaseline = 'top';

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], anchorX, startY + i * lineHeight);
  }
  ctx.restore();
}

/**
 * Main rendering loop that draws all elements onto canvas context.
 */
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
  theme: 'light' | 'dark' = 'light'
) {
  // Clear and fill canvas background for theme
  ctx.save();
  ctx.fillStyle = theme === 'dark' ? '#121214' : '#fafafa';
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);
  ctx.restore();

  ctx.save();
  ctx.translate(camera.x, camera.y);
  ctx.scale(camera.zoom, camera.zoom);

  // 1. Draw batched dot grid
  drawDotGrid(ctx, camera, viewportWidth, viewportHeight, theme);

  // 2. Initialize Rough.js instance only once
  let rc: ReturnType<typeof rough.canvas> | null = null;

  // 3. Sort elements by zIndex
  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    const isSelected = selectedElementIds.includes(el.id);
    const isHovered = hoveredElementId === el.id;

    const defaultDarkStroke = theme === 'dark' ? '#f4f4f5' : '#1e1e1e';
    const strokeColor = (!el.strokeColor || el.strokeColor === '#1e1e1e' || el.strokeColor === '#000000')
      ? defaultDarkStroke
      : el.strokeColor;
    const fillColor = el.fillColor && el.fillColor !== 'transparent'
      ? (theme === 'dark' && (el.fillColor === '#ffffff' || el.fillColor === '#fff') ? '#1e1e24' : el.fillColor)
      : undefined;
    const isCrisp = !el.roughness || el.roughness === 0;

    switch (el.type) {
      case 'rectangle': {
        const x = Math.min(el.x, el.x + el.width);
        const y = Math.min(el.y, el.y + el.height);
        const w = Math.abs(el.width);
        const h = Math.abs(el.height);

        if (isCrisp) {
          // Native GPU-accelerated rounded rectangle (0.01ms)
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, w, h, 6);
          } else {
            ctx.rect(x, y, w, h);
          }
          if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
          }
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = el.strokeWidth || 2;
          ctx.stroke();
        } else {
          // Sketchy Rough.js rendering
          if (!rc) rc = rough.canvas(ctx.canvas);
          rc.rectangle(x, y, w, h, {
            seed: el.seed || 1,
            roughness: el.roughness,
            stroke: strokeColor,
            strokeWidth: el.strokeWidth || 2,
            fill: fillColor,
            fillStyle: 'solid'
          });
        }

        // Render 2D-aligned label (suppressed when actively editing this element)
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
        break;
      }

      case 'ellipse': {
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;
        const rx = Math.abs(el.width) / 2;
        const ry = Math.abs(el.height) / 2;

        if (isCrisp) {
          ctx.beginPath();
          ctx.ellipse(cx, cy, Math.max(rx, 1), Math.max(ry, 1), 0, 0, Math.PI * 2);
          if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill();
          }
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = el.strokeWidth || 2;
          ctx.stroke();
        } else {
          if (!rc) rc = rough.canvas(ctx.canvas);
          rc.ellipse(cx, cy, rx * 2, ry * 2, {
            seed: el.seed || 1,
            roughness: el.roughness,
            stroke: strokeColor,
            strokeWidth: el.strokeWidth || 2,
            fill: fillColor,
            fillStyle: 'solid'
          });
        }

        if (el.text && el.id !== editingElementId) {
          const left = cx - rx;
          const top = cy - ry;
          const w = rx * 2;
          const h = ry * 2;

          renderAlignedBoxText(ctx, el.text, left, top, w, h, {
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
        break;
      }

      case 'line': {
        if (isCrisp) {
          ctx.beginPath();
          ctx.moveTo(el.x, el.y);
          ctx.lineTo(el.x + el.width, el.y + el.height);
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = el.strokeWidth || 2;
          ctx.stroke();
        } else {
          if (!rc) rc = rough.canvas(ctx.canvas);
          rc.line(el.x, el.y, el.x + el.width, el.y + el.height, {
            seed: el.seed || 1,
            roughness: el.roughness,
            stroke: strokeColor,
            strokeWidth: el.strokeWidth || 2
          });
        }
        break;
      }

      case 'arrow': {
        const toX = el.x + el.width;
        const toY = el.y + el.height;
        if (isCrisp) {
          ctx.beginPath();
          ctx.moveTo(el.x, el.y);
          ctx.lineTo(toX, toY);
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = el.strokeWidth || 2;
          ctx.stroke();
        } else {
          if (!rc) rc = rough.canvas(ctx.canvas);
          rc.line(el.x, el.y, toX, toY, {
            seed: el.seed || 1,
            roughness: el.roughness,
            stroke: strokeColor,
            strokeWidth: el.strokeWidth || 2
          });
        }
        drawArrowhead(ctx, el.x, el.y, toX, toY, strokeColor, el.strokeWidth || 2);
        break;
      }

      case 'draw': {
        if (el.points && el.points.length > 0) {
          renderFreehandOnContext(ctx, el.points, strokeColor, el.strokeWidth || 2);
        }
        break;
      }

      case 'text': {
        if (el.id !== editingElementId && el.text) {
          const x = Math.min(el.x, el.x + el.width);
          const y = Math.min(el.y, el.y + el.height);
          const w = Math.max(Math.abs(el.width), 40);
          const h = Math.max(Math.abs(el.height), 20);

          if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            if (ctx.roundRect) {
              ctx.roundRect(x, y, w, h, 4);
            } else {
              ctx.rect(x, y, w, h);
            }
            ctx.fill();
          }

          renderAlignedBoxText(ctx, el.text, x, y, w, h, {
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
        break;
      }

      case 'icon': {
        const x = Math.min(el.x, el.x + el.width);
        const y = Math.min(el.y, el.y + el.height);
        const w = Math.abs(el.width);
        const h = Math.abs(el.height);

        // Optional background card if fillColor specified
        if (fillColor && fillColor !== 'transparent') {
          ctx.save();
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, w, h, 8);
          } else {
            ctx.rect(x, y, w, h);
          }
          ctx.fill();
          ctx.restore();
        }

        const iconUrl = resolveIconUrl(el, theme);
        const img = getLoadedIconImage(iconUrl);
        if (img) {
          ctx.drawImage(img, x, y, w, h);
        } else {
          // Placeholder while CDN image is fetching asynchronously
          ctx.save();
          ctx.fillStyle = '#f3f4f6';
          ctx.strokeStyle = '#e5e7eb';
          ctx.lineWidth = 1;
          if (ctx.roundRect) {
            ctx.roundRect(x, y, w, h, 8);
          } else {
            ctx.rect(x, y, w, h);
          }
          ctx.fill();
          ctx.stroke();
          ctx.restore();
        }

        // Render label below icon if present
        if (el.text && el.id !== editingElementId) {
          const fontSize = el.fontSize || 13;
          const fontFamily = el.fontFamily || 'Inter, sans-serif';
          ctx.font = `600 ${fontSize}px ${fontFamily}`;
          ctx.fillStyle = strokeColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(el.text, x + w / 2, y + h + 6);
        }
        break;
      }

      case 'frame': {
        const x = Math.min(el.x, el.x + el.width);
        const y = Math.min(el.y, el.y + el.height);
        const w = Math.abs(el.width);
        const h = Math.abs(el.height);
        const frameType = el.frameType || 'figure';

        if (frameType === 'browser') {
          // 1. Browser Window Frame Mockup
          const headerH = Math.min(32, h * 0.2);
          ctx.save();
          // Window background & border
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, w, h, 8);
          } else {
            ctx.rect(x, y, w, h);
          }
          ctx.fillStyle = fillColor || (theme === 'dark' ? '#18181b' : '#ffffff');
          ctx.fill();
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = el.strokeWidth || 2;
          ctx.stroke();

          // Header titlebar
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, w, headerH, [8, 8, 0, 0]);
          } else {
            ctx.rect(x, y, w, headerH);
          }
          ctx.fillStyle = theme === 'dark' ? '#1f2937' : '#f3f4f6';
          ctx.fill();
          ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb';
          ctx.lineWidth = 1;
          ctx.stroke();

          // 3 macOS window control dots
          const dotY = y + headerH / 2;
          const dotRadius = Math.min(4, headerH * 0.2);
          const dots = [
            { x: x + 14, color: '#ef4444' },
            { x: x + 25, color: '#f59e0b' },
            { x: x + 36, color: '#10b981' }
          ];
          for (const d of dots) {
            ctx.beginPath();
            ctx.arc(d.x, dotY, dotRadius, 0, Math.PI * 2);
            ctx.fillStyle = d.color;
            ctx.fill();
          }

          // Address bar capsule
          const addrW = Math.max(w - 100, 60);
          const addrH = Math.min(headerH - 10, 18);
          const addrX = x + 50;
          const addrY = y + (headerH - addrH) / 2;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(addrX, addrY, addrW, addrH, 4);
          } else {
            ctx.rect(addrX, addrY, addrW, addrH);
          }
          ctx.fillStyle = theme === 'dark' ? '#111827' : '#ffffff';
          ctx.fill();
          ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Address text / label
          const labelText = el.text || el.label || 'https://myapp.com';
          ctx.font = `500 ${Math.min(11, Math.max(addrH - 4, 9))}px Inter, sans-serif`;
          ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(labelText, addrX + addrW / 2, addrY + addrH / 2);

          ctx.restore();
        } else if (frameType === 'phone') {
          // 2. Mobile Phone Mockup
          ctx.save();
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, w, h, 24);
          } else {
            ctx.rect(x, y, w, h);
          }
          ctx.fillStyle = fillColor || (theme === 'dark' ? '#18181b' : '#ffffff');
          ctx.fill();
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = Math.max(el.strokeWidth || 2, 2.5);
          ctx.stroke();

          // Top Dynamic Island / Notch
          const notchW = Math.min(w * 0.35, 70);
          const notchH = 12;
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x + (w - notchW) / 2, y + 8, notchW, notchH, 6);
          } else {
            ctx.rect(x + (w - notchW) / 2, y + 8, notchW, notchH);
          }
          ctx.fillStyle = strokeColor;
          ctx.fill();

          // Bottom Home indicator bar
          const barW = Math.min(w * 0.4, 80);
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x + (w - barW) / 2, y + h - 10, barW, 4, 2);
          } else {
            ctx.rect(x + (w - barW) / 2, y + h - 10, barW, 4);
          }
          ctx.fillStyle = '#9ca3af';
          ctx.fill();

          ctx.restore();
        } else {
          // 3. Figure Architecture Grouping Frame (e.g. "FRONTEND" in image.png)
          ctx.save();
          // Frame container border & fill
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(x, y, w, h, 8);
          } else {
            ctx.rect(x, y, w, h);
          }
          if (fillColor && fillColor !== 'transparent') {
            ctx.fillStyle = fillColor;
            ctx.fill();
          }
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = el.strokeWidth || 2;
          ctx.setLineDash([6, 6]); // Dashed architecture boundary
          ctx.stroke();
          ctx.setLineDash([]);

          // Header label tag (like "FRONTEND" in image.png)
          const title = el.label || el.text || 'FIGURE';
          const fontSize = el.fontSize || 13;
          ctx.font = `bold ${fontSize}px Inter, sans-serif`;
          const textMetrics = ctx.measureText(title);
          const tagW = textMetrics.width + 16;
          const tagH = fontSize + 10;
          const tagX = x + 12;
          const tagY = y - tagH / 2;

          // Tag background badge
          ctx.beginPath();
          if (ctx.roundRect) {
            ctx.roundRect(tagX, tagY, tagW, tagH, 4);
          } else {
            ctx.rect(tagX, tagY, tagW, tagH);
          }
          ctx.fillStyle = strokeColor || '#1e1e1e';
          ctx.fill();

          // Tag text
          ctx.fillStyle = '#ffffff';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(title, tagX + tagW / 2, tagY + tagH / 2);

          ctx.restore();
        }
        break;
      }
    }

    // 4. Draw selection or hover bounding box
    if (isSelected || isHovered) {
      const bounds = getElementBounds(el);
      const padding = 6;
      const isLocked = Boolean(el.locked);

      ctx.save();
      ctx.strokeStyle = isLocked ? '#f59e0b' : isSelected ? '#3b82f6' : '#93c5fd';
      ctx.lineWidth = 1.5 / camera.zoom;
      ctx.setLineDash(isLocked ? [4, 4] : isSelected ? [] : [4, 4]);

      const selX = bounds.minX - padding;
      const selY = bounds.minY - padding;
      const selW = bounds.width + padding * 2;
      const selH = bounds.height + padding * 2;

      ctx.strokeRect(selX, selY, selW, selH);

      // Draw locked indicator badge
      if (isLocked && isSelected) {
        ctx.fillStyle = '#f59e0b';
        const badgeWidth = 60 / camera.zoom;
        const badgeHeight = 18 / camera.zoom;
        const badgeX = selX + selW - badgeWidth;
        const badgeY = selY - badgeHeight - 4 / camera.zoom;

        ctx.fillRect(badgeX, badgeY, badgeWidth, badgeHeight);
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${10 / camera.zoom}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔒 LOCKED', badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
      }

      // Draw 8 interactive handles if selected and NOT locked
      if (isSelected && !isLocked) {
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 1.5 / camera.zoom;
        const handleSize = 8 / camera.zoom;

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
  }

  // 5. Draw connection snap ports (in arrow/line mode OR on hovered/selected shapes in select mode)
  const isConnecting = activeTool === 'arrow' || activeTool === 'line' || activeSnapPort !== null;
  const elementsToShowPorts = isConnecting
    ? elements.filter(el => el.type !== 'line' && el.type !== 'arrow' && el.type !== 'draw' && !el.locked)
    : elements.filter(
        el =>
          (selectedElementIds.includes(el.id) || el.id === hoveredElementId) &&
          el.type !== 'line' &&
          el.type !== 'arrow' &&
          el.type !== 'draw' &&
          !el.locked
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

  // 6. Draw Marquee Selection Box
  if (selectionBox) {
    ctx.save();
    ctx.fillStyle = 'rgba(59, 130, 246, 0.08)';
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5 / camera.zoom;
    ctx.setLineDash([4, 4]);
    ctx.fillRect(selectionBox.minX, selectionBox.minY, selectionBox.width, selectionBox.height);
    ctx.strokeRect(selectionBox.minX, selectionBox.minY, selectionBox.width, selectionBox.height);
    ctx.restore();
  }

  ctx.restore();
}
