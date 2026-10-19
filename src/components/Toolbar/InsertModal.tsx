import React, { useState, useEffect, useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { ICON_CATALOG, IconDefinition } from '../../constants/icons';
import { Camera } from '../../types/canvas';
import { WhiteboardElement } from '../../types/elements';
import { nanoid } from 'nanoid';
import { useIconSearch } from './InsertModal/useIconSearch';
import { InsertModalHeader, TabType } from './InsertModal/InsertModalHeader';
import { InsertFramesSection } from './InsertModal/InsertFramesSection';
import { InsertIconsGrid } from './InsertModal/InsertIconsGrid';

interface InsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  camera: Camera;
  elements: WhiteboardElement[];
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void;
  onSelectedIdsChange: (ids: string[]) => void;
  theme?: 'light' | 'dark';
}

export const InsertModal: React.FC<InsertModalProps> = ({
  isOpen,
  onClose,
  camera,
  elements,
  onElementsChange,
  onSelectedIdsChange,
  theme = 'light'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  const { apiIcons, isSearchingApi } = useIconSearch(searchQuery, theme);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveTab('all');
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCenterWorldPos = () => ({
    x: (window.innerWidth / 2 - camera.x) / camera.zoom,
    y: (window.innerHeight / 2 - camera.y) / camera.zoom
  });

  const handleInsertIcon = (icon: { key: string; name: string; url: string }) => {
    const center = getCenterWorldPos();
    const size = 64;
    const newId = nanoid();
    const newElement: WhiteboardElement = {
      id: newId,
      type: 'icon',
      x: center.x - size / 2,
      y: center.y - size / 2,
      width: size,
      height: size,
      strokeColor: '#1e1e1e',
      fillColor: 'transparent',
      strokeWidth: 2,
      roughness: 0,
      seed: Math.floor(Math.random() * 2000000),
      zIndex: elements.length,
      iconKey: icon.key,
      iconUrl: icon.url,
      text: icon.name
    };
    onElementsChange([...elements, newElement], true);
    onSelectedIdsChange([newId]);
    onClose();
  };

  const handleInsertFrame = (frameType: 'browser' | 'phone') => {
    const center = getCenterWorldPos();
    const newId = nanoid();
    const isPhone = frameType === 'phone';
    const w = isPhone ? 220 : 420;
    const h = isPhone ? 380 : 260;
    const label = isPhone ? 'Mobile App' : 'https://myapp.com';

    const newElement: WhiteboardElement = {
      id: newId,
      type: 'frame',
      x: center.x - w / 2,
      y: center.y - h / 2,
      width: w,
      height: h,
      strokeColor: '#1e1e1e',
      fillColor: '#ffffff',
      strokeWidth: 2,
      roughness: 0,
      seed: Math.floor(Math.random() * 2000000),
      zIndex: elements.length,
      frameType,
      label,
      text: label
    };
    onElementsChange([...elements, newElement], true);
    onSelectedIdsChange([newId]);
    onClose();
  };

  const tabFiltered = ICON_CATALOG.filter(i => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cloud') return i.category === 'cloud' || i.category === 'system';
    if (activeTab === 'frameworks') return i.category === 'frameworks';
    if (activeTab === 'databases') return i.category === 'databases';
    return false;
  });

  const queryFiltered = tabFiltered.filter(i => !searchQuery || i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.key.toLowerCase().includes(searchQuery.toLowerCase()));
  const seenKeys = new Set(queryFiltered.map(i => i.key));
  const combinedIcons = [...queryFiltered];
  if (activeTab !== 'frames') {
    for (const apiIcon of apiIcons) {
      if (!seenKeys.has(apiIcon.key)) {
        seenKeys.add(apiIcon.key);
        combinedIcons.push(apiIcon);
      }
    }
  }

  const showFrames = (activeTab === 'all' && !searchQuery) || activeTab === 'frames';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '80px', backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }} onPointerDown={onClose}>
      <div style={{ width: '460px', maxHeight: '560px', backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff', color: theme === 'dark' ? '#f4f4f5' : '#111827', borderRadius: '14px', boxShadow: theme === 'dark' ? '0 20px 45px rgba(0,0,0,0.45), 0 0 0 1px #27272a' : '0 20px 45px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }} onPointerDown={e => e.stopPropagation()}>
        <InsertModalHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} activeTab={activeTab} onTabChange={setActiveTab} isSearchingApi={isSearchingApi} onClose={onClose} inputRef={inputRef} theme={theme} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', scrollbarWidth: 'thin' }}>
          {showFrames && <InsertFramesSection onInsertFrame={handleInsertFrame} theme={theme} />}
          {activeTab !== 'frames' && <InsertIconsGrid icons={combinedIcons} onInsertIcon={handleInsertIcon} searchQuery={searchQuery} isSearchingApi={isSearchingApi} theme={theme} />}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: theme === 'dark' ? '#18181b' : '#f9fafb', borderTop: theme === 'dark' ? '1px solid #27272a' : '1px solid #e5e7eb', fontSize: '12px', color: theme === 'dark' ? '#a1a1aa' : '#6b7280' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Sparkles size={14} color="#3b82f6" />
            <span>Click any icon or frame to insert onto whiteboard</span>
          </div>
          <div>Press Esc to dismiss</div>
        </div>
      </div>
    </div>
  );
};
