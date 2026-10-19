import { WhiteboardElement } from '../../types/elements';

export interface ExportImageOptions {
  background?: 'white' | 'dark' | 'transparent';
  scale?: number;
}

export function computeElementBounds(elements: WhiteboardElement[]) {
  if (elements.length === 0) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 300, width: 400, height: 300 };
  }

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

  return {
    minX,
    minY,
    maxX,
    maxY,
    width: Math.max(maxX - minX, 100),
    height: Math.max(maxY - minY, 100)
  };
}

export function exportToJson(elements: WhiteboardElement[], filename = 'diagram.json') {
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

export function exportToBd(elements: WhiteboardElement[], filename = 'diagram.bd') {
  exportToJson(elements, filename);
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
