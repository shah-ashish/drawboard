import { WhiteboardElement } from '../../../types/elements';
import { resolveIconUrl } from '../../../constants/icons';
import { getLoadedIconImage } from '../../../utils/iconCache';

export function drawIconElement(
  ctx: CanvasRenderingContext2D,
  el: WhiteboardElement,
  x: number,
  y: number,
  w: number,
  h: number,
  strokeColor: string,
  fillColor: string | undefined,
  editingElementId: string | null,
  theme: 'light' | 'dark'
) {
  if (fillColor && fillColor !== 'transparent') {
    ctx.save();
    ctx.fillStyle = fillColor;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8);
    else ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.restore();
  }

  const iconUrl = resolveIconUrl(el, theme);
  const img = getLoadedIconImage(iconUrl);
  if (img) {
    ctx.drawImage(img, x, y, w, h);
  } else {
    ctx.save();
    ctx.fillStyle = '#f3f4f6';
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8);
    else ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  if (el.text && el.id !== editingElementId) {
    const fontSize = el.fontSize || 13;
    const fontFamily = el.fontFamily || 'Inter, sans-serif';
    ctx.font = `600 ${fontSize}px ${fontFamily}`;
    ctx.fillStyle = strokeColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(el.text, x + w / 2, y + h + 6);
  }
}
