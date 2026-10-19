import { WhiteboardElement } from '../../../types/elements';

export function drawBrowserMockup(
  ctx: CanvasRenderingContext2D,
  el: WhiteboardElement,
  x: number,
  y: number,
  w: number,
  h: number,
  strokeColor: string,
  fillColor: string | undefined,
  theme: 'light' | 'dark'
) {
  const headerH = Math.min(32, h * 0.2);
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8); else ctx.rect(x, y, w, h);
  ctx.fillStyle = fillColor || (theme === 'dark' ? '#18181b' : '#ffffff');
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = el.strokeWidth || 2;
  ctx.stroke();

  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, headerH, [8, 8, 0, 0]); else ctx.rect(x, y, w, headerH);
  ctx.fillStyle = theme === 'dark' ? '#1f2937' : '#f3f4f6';
  ctx.fill();
  ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.stroke();

  const dotY = y + headerH / 2;
  const dotRadius = Math.min(4, headerH * 0.2);
  const dots = [{ x: x + 14, color: '#ef4444' }, { x: x + 25, color: '#f59e0b' }, { x: x + 36, color: '#10b981' }];
  for (const d of dots) {
    ctx.beginPath();
    ctx.arc(d.x, dotY, dotRadius, 0, Math.PI * 2);
    ctx.fillStyle = d.color;
    ctx.fill();
  }

  const addrW = Math.max(w - 100, 60);
  const addrH = Math.min(headerH - 10, 18);
  const addrX = x + 50;
  const addrY = y + (headerH - addrH) / 2;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(addrX, addrY, addrW, addrH, 4); else ctx.rect(addrX, addrY, addrW, addrH);
  ctx.fillStyle = theme === 'dark' ? '#111827' : '#ffffff';
  ctx.fill();
  ctx.strokeStyle = theme === 'dark' ? '#374151' : '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.stroke();

  const labelText = el.text || el.label || 'https://myapp.com';
  ctx.font = `500 ${Math.min(11, Math.max(addrH - 4, 9))}px Inter, sans-serif`;
  ctx.fillStyle = theme === 'dark' ? '#9ca3af' : '#6b7280';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(labelText, addrX + addrW / 2, addrY + addrH / 2);
  ctx.restore();
}

export function drawPhoneMockup(
  ctx: CanvasRenderingContext2D,
  el: WhiteboardElement,
  x: number,
  y: number,
  w: number,
  h: number,
  strokeColor: string,
  fillColor: string | undefined,
  theme: 'light' | 'dark'
) {
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 24);
  else ctx.rect(x, y, w, h);
  ctx.fillStyle = fillColor || (theme === 'dark' ? '#18181b' : '#ffffff');
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = Math.max(el.strokeWidth || 2, 2.5);
  ctx.stroke();

  const notchW = Math.min(w * 0.35, 70);
  const notchH = 12;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x + (w - notchW) / 2, y + 8, notchW, notchH, 6);
  else ctx.rect(x + (w - notchW) / 2, y + 8, notchW, notchH);
  ctx.fillStyle = strokeColor;
  ctx.fill();

  const barW = Math.min(w * 0.4, 80);
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x + (w - barW) / 2, y + h - 10, barW, 4, 2);
  else ctx.rect(x + (w - barW) / 2, y + h - 10, barW, 4);
  ctx.fillStyle = '#9ca3af';
  ctx.fill();
  ctx.restore();
}

export function drawFigureFrame(
  ctx: CanvasRenderingContext2D,
  el: WhiteboardElement,
  x: number,
  y: number,
  w: number,
  h: number,
  strokeColor: string,
  fillColor: string | undefined
) {
  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8);
  else ctx.rect(x, y, w, h);
  if (fillColor && fillColor !== 'transparent') {
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = el.strokeWidth || 2;
  ctx.setLineDash([6, 6]);
  ctx.stroke();
  ctx.setLineDash([]);

  const title = el.label || el.text || 'FIGURE';
  const fontSize = el.fontSize || 13;
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  const textMetrics = ctx.measureText(title);
  const tagW = textMetrics.width + 16;
  const tagH = fontSize + 10;
  const tagX = x + 12;
  const tagY = y - tagH / 2;

  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(tagX, tagY, tagW, tagH, 4);
  else ctx.rect(tagX, tagY, tagW, tagH);
  ctx.fillStyle = strokeColor || '#1e1e1e';
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(title, tagX + tagW / 2, tagY + tagH / 2);
  ctx.restore();
}
