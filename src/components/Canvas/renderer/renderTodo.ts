import { WhiteboardElement } from '../../../types/elements';
import { drawTodoPin } from './renderTodoPin';

export function drawTodoCard(
  ctx: CanvasRenderingContext2D,
  el: WhiteboardElement,
  x: number,
  y: number,
  w: number,
  h: number,
  fillColor: string | undefined,
  editingElementId: string | null,
  editingTodoItemId: string | null,
  theme: 'light' | 'dark'
) {
  const items = el.todoItems && el.todoItems.length > 0
    ? el.todoItems
    : (el.text ? [{ id: '1', text: el.text, checked: Boolean(el.checked) }] : []);

  const isDark = theme === 'dark';
  const cardBg = fillColor && fillColor !== 'transparent' ? fillColor : (isDark ? '#18181b' : '#ffffff');
  const borderColor = isDark ? '#27272a' : '#e5e7eb';
  const dividerColor = isDark ? '#27272a' : '#f1f5f9';

  ctx.save();
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 10);
  else ctx.rect(x, y, w, h);
  ctx.fillStyle = cardBg;
  ctx.fill();
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  const title = el.text || 'To Do List';
  const totalCount = items.length;
  const doneCount = items.filter(it => it.checked).length;
  const isPinned = Boolean(el.pinnedToScreen);

  const pinW = 24, pinH = 22, pinX = x + w - pinW - 12, pinY = y + 8;
  drawTodoPin(ctx, pinX, pinY, pinW, pinH, isPinned, isDark);

  const isEditingTitle = editingElementId === el.id && !editingTodoItemId;
  if (!isEditingTitle) {
    ctx.font = 'bold 13px Inter, sans-serif';
    ctx.fillStyle = isDark ? '#f4f4f5' : '#18181b';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, x + 16, y + 20);
  }

  if (totalCount > 0) {
    const allDone = doneCount === totalCount;
    const badgeText = allDone ? `✓ All ${totalCount} done` : `${doneCount}/${totalCount}`;
    ctx.font = '600 11px Inter, sans-serif';
    const badgeW = ctx.measureText(badgeText).width + 12, badgeH = 20;
    const badgeX = pinX - badgeW - 8, badgeY = y + 9;

    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 10);
    else ctx.rect(badgeX, badgeY, badgeW, badgeH);
    ctx.fillStyle = allDone ? (isDark ? '#064e3b' : '#dcfce7') : (isDark ? '#27272a' : '#f4f4f5');
    ctx.fill();
    ctx.fillStyle = allDone ? '#10b981' : (isDark ? '#a1a1aa' : '#64748b');
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + badgeW / 2, badgeY + badgeH / 2);
  }

  ctx.strokeStyle = dividerColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x + 12, y + 38);
  ctx.lineTo(x + w - 12, y + 38);
  ctx.stroke();

  const startY = y + 42;
  const rowH = 34;

  items.forEach((item, idx) => {
    const rowY = startY + idx * rowH;
    if (rowY + rowH > y + h) return;
    const cx = x + 24;
    const cy = rowY + rowH / 2;

    ctx.beginPath();
    ctx.arc(cx, cy, 8.5, 0, Math.PI * 2);
    if (item.checked) {
      ctx.fillStyle = '#10b981'; ctx.fill();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 3.8, cy - 0.2); ctx.lineTo(cx - 1, cy + 2.8); ctx.lineTo(cx + 4, cy - 2.8);
      ctx.stroke();
    } else {
      ctx.fillStyle = isDark ? '#27272a' : '#ffffff'; ctx.fill();
      ctx.strokeStyle = isDark ? '#52525b' : '#9ca3af'; ctx.lineWidth = 1.5; ctx.stroke();
    }

    ctx.strokeStyle = dividerColor;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 38, rowY + rowH);
    ctx.lineTo(x + w - 14, rowY + rowH);
    ctx.stroke();

    const isCurrentlyEditing = editingElementId === el.id && editingTodoItemId === item.id;
    if (!isCurrentlyEditing && item.text) {
      const textX = x + 40;
      const textY = cy;
      const textColor = item.checked ? (isDark ? '#71717a' : '#94a3b8') : (isDark ? '#e4e4e7' : '#1e293b');
      ctx.font = '500 13px Inter, sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';

      const maxW = w - 54;
      let displayText = item.text;
      if (ctx.measureText(displayText).width > maxW) {
        while (displayText.length > 0 && ctx.measureText(displayText + '...').width > maxW) {
          displayText = displayText.slice(0, -1);
        }
        displayText += '...';
      }
      ctx.fillText(displayText, textX, textY);

      if (item.checked) {
        const textW = ctx.measureText(displayText).width;
        ctx.strokeStyle = isDark ? '#71717a' : '#94a3b8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(textX, textY);
        ctx.lineTo(textX + textW, textY);
        ctx.stroke();
      }
    }
  });

  const footerY = startY + items.length * rowH;
  if (footerY + 28 <= y + h + 10) {
    ctx.font = '500 12px Inter, sans-serif';
    ctx.fillStyle = isDark ? '#60a5fa' : '#2563eb';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('+ Add task', x + 24, footerY + 16);
  }

  ctx.restore();
}
