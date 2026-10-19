import { WhiteboardElement } from '../types/elements';

let cachedElements: WhiteboardElement[] | null = null;

export async function loadElementsFromFile(): Promise<WhiteboardElement[]> {
  try {
    const res = await fetch('/api/shapes');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.elements) && data.elements.length > 0) {
        cachedElements = data.elements;
        return data.elements;
      }
    }
  } catch (err) {
    console.warn('Could not load from /api/shapes, using fallback:', err);
  }

  // Fallback to memory cache or empty
  return cachedElements || [];
}

export async function saveElementsToFile(elements: WhiteboardElement[]): Promise<void> {
  cachedElements = elements;
  try {
    await fetch('/api/shapes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        version: 1,
        savedAt: new Date().toISOString(),
        elements
      })
    });
  } catch (err) {
    console.error('Failed to save shapes to disk:', err);
  }
}
