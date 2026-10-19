import rough from 'roughjs';
import { WhiteboardElement } from '../../../types/elements';
import { renderAlignedBoxText } from './renderText';

export function drawArrowhead(
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

export function drawRectangle(
  ctx: CanvasRenderingContext2D,
  rc: ReturnType<typeof rough.canvas>,
  el: WhiteboardElement,
  x: number,
  y: number,
  w: number,
  h: number,
  strokeColor: string,
  fillColor?: string
) {
  if (!el.roughness || el.roughness === 0) {
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6);
    else ctx.rect(x, y, w, h);
    if (fillColor) {
      ctx.fillStyle = fillColor;
      ctx.fill();
    }
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = el.strokeWidth || 2;
    ctx.stroke();
  } else {
    rc.rectangle(x, y, w, h, {
      seed: el.seed || 1,
      roughness: el.roughness,
      stroke: strokeColor,
      strokeWidth: el.strokeWidth || 2,
      fill: fillColor,
      fillStyle: 'solid'
    });
  }
}

export function drawEllipse(
  ctx: CanvasRenderingContext2D,
  rc: ReturnType<typeof rough.canvas>,
  el: WhiteboardElement,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  strokeColor: string,
  fillColor?: string
) {
  if (!el.roughness || el.roughness === 0) {
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
    rc.ellipse(cx, cy, rx * 2, ry * 2, {
      seed: el.seed || 1,
      roughness: el.roughness,
      stroke: strokeColor,
      strokeWidth: el.strokeWidth || 2,
      fill: fillColor,
      fillStyle: 'solid'
    });
  }
}

export function drawLineOrArrow(
  ctx: CanvasRenderingContext2D,
  rc: ReturnType<typeof rough.canvas>,
  el: WhiteboardElement,
  strokeColor: string,
  isArrow: boolean
) {
  const toX = el.x + el.width;
  const toY = el.y + el.height;
  if (!el.roughness || el.roughness === 0) {
    ctx.beginPath();
    ctx.moveTo(el.x, el.y);
    ctx.lineTo(toX, toY);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = el.strokeWidth || 2;
    ctx.stroke();
  } else {
    rc.line(el.x, el.y, toX, toY, {
      seed: el.seed || 1,
      roughness: el.roughness,
      stroke: strokeColor,
      strokeWidth: el.strokeWidth || 2
    });
  }
  if (isArrow) {
    drawArrowhead(ctx, el.x, el.y, toX, toY, strokeColor, el.strokeWidth || 2);
  }
}
