import { WhiteboardElement } from '../../types/elements';
import { computeElementBounds, ExportImageOptions } from './exportJson';
import { escapeXml, renderTodoToSvg } from './svgTodo';

export function exportToSvg(
  elements: WhiteboardElement[],
  filename = 'diagram.svg',
  options: ExportImageOptions = {}
) {
  if (elements.length === 0) return;

  const bg = options.background ?? 'white';
  const padding = 50;
  const bounds = computeElementBounds(elements);
  const width = Math.round(bounds.maxX - bounds.minX + padding * 2);
  const height = Math.round(bounds.maxY - bounds.minY + padding * 2);
  const dx = -bounds.minX + padding;
  const dy = -bounds.minY + padding;

  const bgColor = bg === 'dark' ? '#121214' : bg === 'white' ? '#ffffff' : 'none';

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n`;
  if (bgColor !== 'none') {
    svgContent += `  <rect width="${width}" height="${height}" fill="${bgColor}" />\n`;
  }

  const sorted = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  for (const el of sorted) {
    const x = el.x + dx;
    const y = el.y + dy;
    const w = el.width;
    const h = el.height;
    const stroke = el.strokeColor || '#1e1e1e';
    const fill = el.fillColor && el.fillColor !== 'transparent' ? el.fillColor : 'none';
    const strokeWidth = el.strokeWidth || 2;

    switch (el.type) {
      case 'rectangle': {
        const rx = Math.min(x, x + w);
        const ry = Math.min(y, y + h);
        const rw = Math.abs(w);
        const rh = Math.abs(h);
        svgContent += `  <rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />\n`;
        if (el.text) {
          svgContent += `  <text x="${rx + rw / 2}" y="${ry + rh / 2}" font-family="${el.fontFamily || 'sans-serif'}" font-size="${el.fontSize || 16}" fill="${stroke}" text-anchor="middle" dominant-baseline="middle">${escapeXml(el.text)}</text>\n`;
        }
        break;
      }
      case 'ellipse': {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const rx = Math.abs(w) / 2;
        const ry = Math.abs(h) / 2;
        svgContent += `  <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />\n`;
        if (el.text) {
          svgContent += `  <text x="${cx}" y="${cy}" font-family="${el.fontFamily || 'sans-serif'}" font-size="${el.fontSize || 16}" fill="${stroke}" text-anchor="middle" dominant-baseline="middle">${escapeXml(el.text)}</text>\n`;
        }
        break;
      }
      case 'line': {
        svgContent += `  <line x1="${x}" y1="${y}" x2="${x + w}" y2="${y + h}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" />\n`;
        break;
      }
      case 'arrow': {
        const x2 = x + w;
        const y2 = y + h;
        const angle = Math.atan2(h, w);
        const headLen = Math.max(12, strokeWidth * 4);
        const a1x = x2 - headLen * Math.cos(angle - Math.PI / 6);
        const a1y = y2 - headLen * Math.sin(angle - Math.PI / 6);
        const a2x = x2 - headLen * Math.cos(angle + Math.PI / 6);
        const a2y = y2 - headLen * Math.sin(angle + Math.PI / 6);

        svgContent += `  <line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" />\n`;
        svgContent += `  <polygon points="${x2},${y2} ${a1x},${a1y} ${a2x},${a2y}" fill="${stroke}" />\n`;
        break;
      }
      case 'draw': {
        if (el.points && el.points.length > 0) {
          const d = el.points.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x + dx} ${pt.y + dy}`).join(' ');
          svgContent += `  <path d="${d}" fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" />\n`;
        }
        break;
      }
      case 'text': {
        if (el.text) {
          const tx = Math.min(x, x + w) + 6;
          const ty = Math.min(y, y + h) + (el.fontSize || 18);
          svgContent += `  <text x="${tx}" y="${ty}" font-family="${el.fontFamily || 'sans-serif'}" font-size="${el.fontSize || 18}" fill="${stroke}">${escapeXml(el.text)}</text>\n`;
        }
        break;
      }
      case 'todo': {
        svgContent += renderTodoToSvg(el, x, y, w, h, bg);
        break;
      }
    }
  }

  svgContent += `</svg>`;
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
