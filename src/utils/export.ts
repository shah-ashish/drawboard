import { WhiteboardElement } from '../types/elements';
import { Camera } from '../types/canvas';
import { renderCanvas } from '../components/Canvas/renderer';

export function exportToJson(elements: WhiteboardElement[], filename = 'whiteboard.json') {
  const data = JSON.stringify(
    {
      version: 1,
      savedAt: new Date().toISOString(),
      elements
    },
    null,
    2
  );

  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function importFromJson(file: File): Promise<WhiteboardElement[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.elements)) {
          resolve(parsed.elements);
        } else if (Array.isArray(parsed)) {
          resolve(parsed);
        } else {
          reject(new Error('Invalid whiteboard JSON structure'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function exportToPng(
  elements: WhiteboardElement[],
  filename = 'diagram.png'
) {
  if (elements.length === 0) return;

  // Compute tight bounds around all elements
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const el of elements) {
    const elMinX = Math.min(el.x, el.x + el.width);
    const elMaxX = Math.max(el.x, el.x + el.width);
    const elMinY = Math.min(el.y, el.y + el.height);
    const elMaxY = Math.max(el.y, el.y + el.height);

    if (elMinX < minX) minX = elMinX;
    if (elMaxX > maxX) maxX = elMaxX;
    if (elMinY < minY) minY = elMinY;
    if (elMaxY > maxY) maxY = elMaxY;
  }

  const padding = 50;
  const width = Math.max(maxX - minX + padding * 2, 200);
  const height = Math.max(maxY - minY + padding * 2, 200);

  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return;

  // Fill white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const camera: Camera = {
    x: -minX + padding,
    y: -minY + padding,
    zoom: 1
  };

  renderCanvas(ctx, elements, camera, offscreen.width, offscreen.height);

  const dataUrl = offscreen.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
