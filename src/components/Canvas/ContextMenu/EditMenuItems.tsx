import React from 'react';
import { Copy, ClipboardPaste, CopyPlus, Trash2 } from 'lucide-react';
import { ContextMenuItem } from './ContextMenuItem';

interface EditMenuItemsProps {
  onCopy: () => void;
  canPaste?: boolean;
  onPaste?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  isAnyLocked: boolean;
  theme: 'light' | 'dark';
  act: (action: () => void) => (e: React.MouseEvent) => void;
}

export const EditMenuItems: React.FC<EditMenuItemsProps> = ({
  onCopy,
  canPaste,
  onPaste,
  onDuplicate,
  onDelete,
  isAnyLocked,
  theme,
  act
}) => (
  <>
    <ContextMenuItem icon={<Copy size={15} />} label="Copy" shortcut="Ctrl+C" onClick={act(onCopy)} theme={theme} />
    {canPaste && onPaste && (
      <ContextMenuItem icon={<ClipboardPaste size={15} />} label="Paste" shortcut="Ctrl+V" onClick={act(onPaste)} theme={theme} />
    )}
    <ContextMenuItem icon={<CopyPlus size={15} />} label="Duplicate" shortcut="Ctrl+D" onClick={act(onDuplicate)} theme={theme} />
    <ContextMenuItem icon={<Trash2 size={15} />} label="Delete" shortcut="Del" disabled={isAnyLocked} destructive onClick={act(onDelete)} theme={theme} />
  </>
);
