export function wrapTextToLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  if (!text) return [];
  if (maxWidth <= 15) return text.split('\n');

  const rawParagraphs = text.split('\n');
  const wrappedLines: string[] = [];

  for (const para of rawParagraphs) {
    if (!para) {
      wrappedLines.push('');
      continue;
    }

    const words = para.split(' ');
    let currentLine = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const testLine = currentLine ? currentLine + ' ' + word : word;
      const testWidth = ctx.measureText(testLine).width;

      if (testWidth <= maxWidth) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          wrappedLines.push(currentLine);
          currentLine = '';
        }

        if (ctx.measureText(word).width > maxWidth) {
          let charChunk = '';
          for (const ch of word) {
            if (ctx.measureText(charChunk + ch).width <= maxWidth) {
              charChunk += ch;
            } else {
              wrappedLines.push(charChunk);
              charChunk = ch;
            }
          }
          currentLine = charChunk;
        } else {
          currentLine = word;
        }
      }
    }

    if (currentLine) {
      wrappedLines.push(currentLine);
    }
  }

  return wrappedLines;
}

export function renderAlignedBoxText(
  ctx: CanvasRenderingContext2D,
  text: string,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  style: {
    fontSize: number;
    fontFamily: string;
    fontWeight?: string | number;
    color: string;
    textAlign?: 'left' | 'center' | 'right';
    verticalAlign?: 'top' | 'middle' | 'bottom';
    padX?: number;
    padY?: number;
  }
) {
  if (!text) return;
  const padX = style.padX ?? 8;
  const padY = style.padY ?? 8;
  const maxContentWidth = Math.max(boxW - padX * 2, 20);

  ctx.save();
  const fontSpec = `${style.fontWeight ? style.fontWeight + ' ' : ''}${style.fontSize}px ${style.fontFamily}`;
  ctx.font = fontSpec;

  const lines = wrapTextToLines(ctx, text, maxContentWidth);
  const fontSize = style.fontSize;
  const lineHeight = fontSize * 1.35;
  const totalTextHeight = lines.length * lineHeight;

  const hAlign = style.textAlign || 'center';
  const vAlign = style.verticalAlign || 'middle';

  let anchorX = boxX + boxW / 2;
  if (hAlign === 'left') {
    anchorX = boxX + padX;
  } else if (hAlign === 'right') {
    anchorX = boxX + boxW - padX;
  }

  let startY = boxY + (boxH - totalTextHeight) / 2;
  if (vAlign === 'top') {
    startY = boxY + padY;
  } else if (vAlign === 'bottom') {
    startY = Math.max(boxY + padY, boxY + boxH - padY - totalTextHeight);
  } else {
    startY = Math.max(boxY + padY, boxY + (boxH - totalTextHeight) / 2);
  }

  ctx.fillStyle = style.color;
  ctx.textAlign = hAlign as CanvasTextAlign;
  ctx.textBaseline = 'top';

  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], anchorX, startY + i * lineHeight);
  }
  ctx.restore();
}
