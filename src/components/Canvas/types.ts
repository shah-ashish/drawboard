import { Camera } from '../../types/canvas';
import { WhiteboardElement, ToolType, ElementStyle } from '../../types/elements';

export interface CanvasProps {
  elements: WhiteboardElement[];
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void;
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  currentStyle: ElementStyle;
  camera: Camera;
  onCameraChange: (camera: Camera) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  onDuplicateSelected?: (specificIds?: string[]) => void;
  onCopySelected?: (specificIds?: string[]) => void;
  onDeleteSelected?: (specificIds?: string[]) => void;
  onBringForward?: (specificIds?: string[]) => void;
  onSendBackward?: (specificIds?: string[]) => void;
  onBringToFront?: (specificIds?: string[]) => void;
  onSendToBack?: (specificIds?: string[]) => void;
  onToggleLock?: (specificIds?: string[]) => void;
  onGroupSelected?: () => void;
  onUngroupSelected?: () => void;
  canPaste?: boolean;
  onPaste?: () => void;
  theme?: 'light' | 'dark';
}
