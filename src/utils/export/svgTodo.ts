import { WhiteboardElement } from '../../types/elements';

export function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export function renderTodoToSvg(
  el: WhiteboardElement,
  x: number,
  y: number,
  w: number,
  h: number,
  bg: string
): string {
  const tx = Math.min(x, x + w);
  const ty = Math.min(y, y + h);
  const tw = Math.abs(w);
  const th = Math.abs(h);

  const items = el.todoItems && el.todoItems.length > 0
    ? el.todoItems
    : (el.text ? [{ id: '1', text: el.text, checked: Boolean(el.checked) }] : []);

  const isDark = bg === 'dark';
  const fill = el.fillColor && el.fillColor !== 'transparent' ? el.fillColor : (isDark ? '#18181b' : '#ffffff');
  const borderColor = isDark ? '#27272a' : '#e5e7eb';
  const dividerColor = isDark ? '#27272a' : '#f1f5f9';

  let svg = `  <rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="10" fill="${fill}" stroke="${borderColor}" stroke-width="1" />\n`;

  const title = el.text || 'To Do List';
  const titleColor = isDark ? '#f4f4f5' : '#18181b';
  svg += `  <text x="${tx + 16}" y="${ty + 20}" font-family="Inter, sans-serif" font-size="13" font-weight="bold" fill="${titleColor}" dominant-baseline="middle">${escapeXml(title)}</text>\n`;

  const total = items.length;
  const done = items.filter(it => it.checked).length;
  if (total > 0) {
    const badgeText = done === total ? `✓ All ${total} done` : `${done}/${total}`;
    const badgeW = 48;
    const badgeH = 20;
    const badgeX = tx + tw - badgeW - 14;
    const badgeY = ty + 10;
    const badgeBg = done === total ? (isDark ? '#064e3b' : '#dcfce7') : (isDark ? '#27272a' : '#f4f4f5');
    const badgeColor = done === total ? '#10b981' : (isDark ? '#a1a1aa' : '#64748b');

    svg += `  <rect x="${badgeX}" y="${badgeY}" width="${badgeW}" height="${badgeH}" rx="10" fill="${badgeBg}" />\n`;
    svg += `  <text x="${badgeX + badgeW / 2}" y="${badgeY + badgeH / 2}" font-family="Inter, sans-serif" font-size="11" font-weight="600" fill="${badgeColor}" text-anchor="middle" dominant-baseline="middle">${badgeText}</text>\n`;
  }

  svg += `  <line x1="${tx + 12}" y1="${ty + 38}" x2="${tx + tw - 12}" y2="${ty + 38}" stroke="${dividerColor}" stroke-width="1" />\n`;

  const startY = ty + 42;
  const rowH = 34;
  items.forEach((item, idx) => {
    const rowY = startY + idx * rowH;
    const cx = tx + 24;
    const cy = rowY + rowH / 2;

    if (item.checked) {
      svg += `  <circle cx="${cx}" cy="${cy}" r="8.5" fill="#10b981" />\n`;
      svg += `  <path d="M ${cx - 3.8} ${cy - 0.2} L ${cx - 1} ${cy + 2.8} L ${cx + 4} ${cy - 2.8}" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />\n`;
    } else {
      svg += `  <circle cx="${cx}" cy="${cy}" r="8.5" fill="${isDark ? '#27272a' : '#ffffff'}" stroke="${isDark ? '#52525b' : '#9ca3af'}" stroke-width="1.5" />\n`;
    }

    svg += `  <line x1="${tx + 38}" y1="${rowY + rowH}" x2="${tx + tw - 14}" y2="${rowY + rowH}" stroke="${dividerColor}" stroke-width="1" />\n`;

    if (item.text) {
      const textColor = item.checked ? (isDark ? '#71717a' : '#94a3b8') : (isDark ? '#e4e4e7' : '#1e293b');
      const strike = item.checked ? ' text-decoration="line-through"' : '';
      svg += `  <text x="${tx + 40}" y="${cy}" font-family="Inter, sans-serif" font-size="13" fill="${textColor}" dominant-baseline="middle"${strike}>${escapeXml(item.text)}</text>\n`;
    }
  });

  return svg;
}
