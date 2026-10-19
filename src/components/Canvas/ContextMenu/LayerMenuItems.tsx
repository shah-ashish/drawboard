import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUp, ChevronsDown } from 'lucide-react';
import { ContextMenuItem } from './ContextMenuItem';

interface LayerMenuItemsProps {
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  theme: 'light' | 'dark';
  act: (action: () => void) => (e: React.MouseEvent) => void;
}

export const LayerMenuItems: React.FC<LayerMenuItemsProps> = ({
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  theme,
  act
}) => (
  <>
    <ContextMenuItem icon={<ChevronUp size={15} />} label="Bring Forward" shortcut="Ctrl+]" onClick={act(onBringForward)} theme={theme} />
    <ContextMenuItem icon={<ChevronDown size={15} />} label="Send Backward" shortcut="Ctrl+[" onClick={act(onSendBackward)} theme={theme} />
    <ContextMenuItem icon={<ChevronsUp size={15} />} label="Bring to Front" onClick={act(onBringToFront)} theme={theme} />
    <ContextMenuItem icon={<ChevronsDown size={15} />} label="Send to Back" onClick={act(onSendToBack)} theme={theme} />
  </>
);
