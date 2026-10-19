import { WhiteboardElement } from '../../types/elements';
import { Camera } from '../../types/canvas';
import { renderCanvas } from '../../components/Canvas/renderer';
import { computeElementBounds, ExportImageOptions } from './exportJson';

export function renderElementsToCanvas(
  elements: WhiteboardElement[],
  options: ExportImageOptions = {}
): HTMLCanvasElement | null {
  if (elements.length === 0) return null;

  const bg = options.background ?? 'white';
  const scale = options.scale ?? 2;
  const padding = 50;

  const bounds = computeElementBounds(elements);
  const rawW = bounds.maxX - bounds.minX + padding * 2;
  const rawH = bounds.maxY - bounds.minY + padding * 2;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(rawW * scale);
  canvas.height = Math.round(rawH * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  if (bg === 'white') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else if (bg === 'dark') {
    ctx.fillStyle = '#121214';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.scale(scale, scale);

  const camera: Camera = {
    x: -bounds.minX + padding,
    y: -bounds.minY + padding,
    zoom: 1
  };

  renderCanvas(
    ctx,
    elements,
    camera,
    rawW,
    rawH,
    [],
    null,
    null,
    'select',
    null,
    null,
    null,
    bg === 'dark' ? 'dark' : 'light'
  );

  return canvas;
}

export function exportToPng(
  elements: WhiteboardElement[],
  filename = 'diagram.png',
  options: ExportImageOptions = {}
) {
  const canvas = renderElementsToCanvas(elements, options);
  if (!canvas) return;

  const dataUrl = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export async function copyPngToClipboard(
  elements: WhiteboardElement[],
  options: ExportImageOptions = {}
): Promise<boolean> {
  const canvas = renderElementsToCanvas(elements, options);
  if (!canvas) return false;

  return new Promise((resolve, reject) => {
    canvas.toBlob(async blob => {
      if (!blob) {
        resolve(false);
        return;
      }
      try {
        if (navigator.clipboard && navigator.clipboard.write) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } else {
          resolve(false);
        }
      } catch (err) {
        reject(err);
      }
    }, 'image/png');
  });
}
