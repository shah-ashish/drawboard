import { getStroke } from 'perfect-freehand';
import { Point } from '../types/canvas';

/**
 * Turns points into smooth SVG path data using perfect-freehand.
 */
export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
}

/**
 * Computes the stroke outline from a list of points.
 */
export function getFreehandStroke(points: Point[], size: number): number[][] {
  return getStroke(
    points.map(p => [p.x, p.y]),
    {
      size: size * 3,
      thinning: 0.5,
      smoothing: 0.5,
      streamline: 0.55,
      easing: t => t,
      start: {
        taper: 0,
        easing: t => t,
        cap: true
      },
      end: {
        taper: 0,
        easing: t => t,
        cap: true
      }
    }
  );
}

/**
 * Renders the stroke outline directly onto an HTML5 Canvas 2D context.
 */
export function renderFreehandOnContext(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  color: string,
  size: number
) {
  if (!points || points.length === 0) return;
  const stroke = getFreehandStroke(points, size);
  if (!stroke.length) return;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(stroke[0][0], stroke[0][1]);
  for (let i = 1; i < stroke.length; i++) {
    ctx.lineTo(stroke[i][0], stroke[i][1]);
  }
  ctx.closePath();
  ctx.fill();
}
