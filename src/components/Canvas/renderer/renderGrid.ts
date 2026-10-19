import { Camera } from '../../../types/canvas';

/**
 * High-performance batched dot grid rendering using a single Path2D.
 */
export function drawDotGrid(
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

  const gridPath = new Path2D();
  for (let x = startX; x <= endX; x += gridSize) {
    for (let y = startY; y <= endY; y += gridSize) {
      gridPath.rect(x - dotSize / 2, y - dotSize / 2, dotSize, dotSize);
    }
  }

  ctx.fillStyle = theme === 'dark' ? '#334155' : '#cbd5e1';
  ctx.fill(gridPath);
}
