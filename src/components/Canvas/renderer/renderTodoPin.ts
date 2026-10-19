export function drawTodoPin(
  ctx: CanvasRenderingContext2D,
  pinX: number,
  pinY: number,
  pinW: number,
  pinH: number,
  isPinned: boolean,
  isDark: boolean
) {
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(pinX, pinY, pinW, pinH, 6);
  else ctx.rect(pinX, pinY, pinW, pinH);

  if (isPinned) {
    ctx.fillStyle = isDark ? 'rgba(59, 130, 246, 0.25)' : '#eff6ff';
    ctx.fill();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else {
    ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = isDark ? '#3f3f46' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  const pinCenterX = pinX + pinW / 2;
  const pinCenterY = pinY + pinH / 2;
  ctx.save();
  ctx.translate(pinCenterX, pinCenterY);
  const pinColor = isPinned ? '#3b82f6' : (isDark ? '#a1a1aa' : '#64748b');
  ctx.strokeStyle = pinColor;
  ctx.fillStyle = isPinned ? '#3b82f6' : 'transparent';
  ctx.lineWidth = 1.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(-4, -4);
  ctx.lineTo(4, -4);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-2.5, -4);
  ctx.lineTo(-3, 1);
  ctx.lineTo(3, 1);
  ctx.lineTo(2.5, -4);
  ctx.closePath();
  if (isPinned) ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-4.5, 1);
  ctx.lineTo(4.5, 1);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(0, 1);
  ctx.lineTo(0, 6.5);
  ctx.stroke();
  ctx.restore();
}
