import { useState, useCallback, useEffect } from 'react';
import { ElementStyle, WhiteboardElement } from '../types/elements';
import { DEFAULT_STYLE } from '../constants/canvas';

export function useElementStyles(
  elements: WhiteboardElement[],
  selectedIds: string[],
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void
) {
  const [currentStyle, setCurrentStyle] = useState<ElementStyle>(DEFAULT_STYLE);

  const handleStyleChange = useCallback(
    (newStyle: ElementStyle) => {
      setCurrentStyle(newStyle);
      if (selectedIds.length > 0) {
        const updated = elements.map(el => {
          if (selectedIds.includes(el.id) && !el.locked) {
            return {
              ...el,
              strokeColor: newStyle.strokeColor,
              fillColor: newStyle.fillColor,
              strokeWidth: newStyle.strokeWidth,
              roughness: newStyle.roughness,
              fontSize: newStyle.fontSize,
              fontFamily: newStyle.fontFamily,
              textAlign: newStyle.textAlign,
              verticalAlign: newStyle.verticalAlign
            };
          }
          return el;
        });
        onElementsChange(updated, true);
      }
    },
    [selectedIds, elements, onElementsChange]
  );

  useEffect(() => {
    if (selectedIds.length === 1) {
      const selected = elements.find(el => el.id === selectedIds[0]);
      if (selected) {
        setCurrentStyle(prev => ({
          ...prev,
          strokeColor: selected.strokeColor || prev.strokeColor,
          fillColor: selected.fillColor || prev.fillColor,
          strokeWidth: selected.strokeWidth ?? prev.strokeWidth,
          roughness: selected.roughness ?? prev.roughness,
          fontSize: selected.fontSize || prev.fontSize,
          fontFamily: selected.fontFamily || prev.fontFamily,
          textAlign: selected.textAlign || prev.textAlign,
          verticalAlign: selected.verticalAlign || prev.verticalAlign
        }));
      }
    }
  }, [selectedIds, elements]);

  return { currentStyle, setCurrentStyle, handleStyleChange };
}
