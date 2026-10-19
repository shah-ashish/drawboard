import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Layout,
  X,
  Sparkles,
  Smartphone,
  Loader2,
  Cloud,
  Code2,
  Database
} from 'lucide-react';
import { ICON_CATALOG, IconDefinition } from '../../constants/icons';
import { Camera } from '../../types/canvas';
import { WhiteboardElement } from '../../types/elements';
import { nanoid } from 'nanoid';

interface InsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  camera: Camera;
  elements: WhiteboardElement[];
  onElementsChange: (elements: WhiteboardElement[], recordHistory?: boolean) => void;
  onSelectedIdsChange: (ids: string[]) => void;
  theme?: 'light' | 'dark';
}

type TabType = 'all' | 'cloud' | 'frameworks' | 'databases' | 'frames';

const IconThumbnail: React.FC<{ url: string; name: string; theme: 'light' | 'dark' }> = ({ url, name, theme }) => {
  const [imgSrc, setImgSrc] = useState(url);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    setImgSrc(url);
    setRetries(0);
  }, [url]);

  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '7px',
        backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.03)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <img
        src={imgSrc}
        alt={name}
        style={{
          width: '28px',
          height: '28px',
          objectFit: 'contain'
        }}
        loading="lazy"
        onError={() => {
          if (retries < 3) {
            setTimeout(() => {
              const separator = url.includes('?') ? '&' : '?';
              setImgSrc(`${url}${separator}r=${retries + 1}`);
              setRetries(prev => prev + 1);
            }, 350 * (retries + 1));
          }
        }}
      />
    </div>
  );
};

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
  const [apiIcons, setApiIcons] = useState<IconDefinition[]>([]);
  const [isSearchingApi, setIsSearchingApi] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setActiveTab('all');
      setApiIcons([]);
      setIsSearchingApi(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Live Iconify CDN search when user types a query
  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (!trimmed || trimmed.length < 2) {
      setApiIcons([]);
      setIsSearchingApi(false);
      return;
    }

    setIsSearchingApi(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(trimmed)}&limit=16`,
          { signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.icons)) {
            const mapped: IconDefinition[] = data.icons
              .filter((id: string) => id.includes(':'))
              .map((id: string) => {
                const [prefix, name] = id.split(':');
                const cleanName = name
                  .replace(/-icon$/, '')
                  .replace(/-wordmark$/, '')
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, c => c.toUpperCase());
                const isMultiColor = prefix === 'logos' || prefix === 'skill-icons' || prefix === 'devicon';
                const colorQuery = !isMultiColor
                  ? `?color=${encodeURIComponent(theme === 'dark' ? '#f4f4f5' : '#1e1e1e')}`
                  : '';
                return {
                  key: id,
                  name: cleanName,
                  category: 'cloud',
                  url: `https://api.iconify.design/${prefix}/${name}.svg${colorQuery}`
                };
              });
            setApiIcons(mapped);
          }
        }
      } catch {
        // Ignored aborted or network errors
      } finally {
        setIsSearchingApi(false);
      }
    }, 320);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery, theme]);

  if (!isOpen) return null;

  // Insert coordinates at current screen center mapped to world
  const getCenterWorldPos = () => {
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;
    return {
      x: (screenW / 2 - camera.x) / camera.zoom,
      y: (screenH / 2 - camera.y) / camera.zoom
    };
  };

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
    let w = 420;
    let h = 260;
    let label = 'https://myapp.com';

    if (frameType === 'phone') {
      w = 220;
      h = 380;
      label = 'Mobile App';
    }

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

  // Filter curated icons by active tab
  const tabFilteredCurated = ICON_CATALOG.filter(i => {
    if (activeTab === 'all') return true;
    if (activeTab === 'cloud') return i.category === 'cloud' || i.category === 'system';
    if (activeTab === 'frameworks') return i.category === 'frameworks';
    if (activeTab === 'databases') return i.category === 'databases';
    return false;
  });

  // Filter by search query if any
  const queryFiltered = tabFilteredCurated.filter(
    i =>
      !searchQuery ||
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Merge live Iconify search results with curated list (deduped by key)
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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '80px',
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        backdropFilter: 'blur(4px)'
      }}
      onPointerDown={onClose}
    >
      <div
        style={{
          width: '460px',
          maxHeight: '560px',
          backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
          color: theme === 'dark' ? '#f4f4f5' : '#111827',
          borderRadius: '14px',
          boxShadow: theme === 'dark'
            ? '0 20px 45px rgba(0, 0, 0, 0.45), 0 0 0 1px #27272a'
            : '0 20px 45px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(0, 0, 0, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.15s ease'
        }}
        onPointerDown={e => e.stopPropagation()}
      >
        {/* Header: Search Box */}
        <div
          style={{
            padding: '14px 16px 10px 16px',
            backgroundColor: theme === 'dark' ? '#18181b' : '#ffffff',
            borderBottom: theme === 'dark' ? '1px solid #27272a' : '1px solid #f3f4f6'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 12px',
              backgroundColor: theme === 'dark' ? '#27272a' : '#f9fafb',
              border: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb',
              borderRadius: '9px',
              transition: 'border-color 0.15s ease'
            }}
          >
            {isSearchingApi ? (
              <Loader2 size={18} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Search size={18} color={theme === 'dark' ? '#a1a1aa' : '#6b7280'} />
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder="Search 200,000+ tech icons (Docker, AWS, React, Python)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') onClose();
              }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: theme === 'dark' ? '#ffffff' : '#111827',
                fontSize: '13px'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                <X size={15} />
              </button>
            )}
            <button
              onClick={onClose}
              title="Close (Esc)"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: '4px'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Filter Tabs */}
          {!searchQuery && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginTop: '10px',
                overflowX: 'auto',
                paddingBottom: '2px'
              }}
            >
              {[
                { id: 'all' as TabType, label: 'All', icon: null },
                { id: 'cloud' as TabType, label: 'Cloud & DevOps', icon: <Cloud size={13} /> },
                { id: 'frameworks' as TabType, label: 'Languages', icon: <Code2 size={13} /> },
                { id: 'databases' as TabType, label: 'Databases', icon: <Database size={13} /> },
                { id: 'frames' as TabType, label: 'Device Frames', icon: <Layout size={13} /> }
              ].map(tab => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: isActive
                        ? (theme === 'dark' ? '1px solid #3b82f6' : '1px solid #bfdbfe')
                        : '1px solid transparent',
                      backgroundColor: isActive
                        ? (theme === 'dark' ? '#1e293b' : '#eff6ff')
                        : (theme === 'dark' ? '#27272a' : '#f9fafb'),
                      color: isActive
                        ? (theme === 'dark' ? '#60a5fa' : '#2563eb')
                        : (theme === 'dark' ? '#a1a1aa' : '#4b5563'),
                      fontSize: '12px',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.1s ease'
                    }}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            scrollbarWidth: 'thin'
          }}
        >
          {/* Device Frames Section */}
          {showFrames && (
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: theme === 'dark' ? '#a1a1aa' : '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px'
                }}
              >
                Device Frames
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Browser Mockup */}
                <button
                  onClick={() => handleInsertFrame('browser')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: theme === 'dark' ? '#27272a' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb',
                    color: theme === 'dark' ? '#f4f4f5' : '#111827',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1e293b' : '#eff6ff';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#27272a' : '#ffffff';
                    e.currentTarget.style.borderColor = theme === 'dark' ? '#3f3f46' : '#e5e7eb';
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: theme === 'dark' ? '#064e3b' : '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme === 'dark' ? '#34d399' : '#059669',
                      flexShrink: 0
                    }}
                  >
                    <Layout size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Browser Window</div>
                    <div style={{ fontSize: '11px', color: theme === 'dark' ? '#a1a1aa' : '#6b7280' }}>macOS dots & URL bar</div>
                  </div>
                </button>

                {/* Mobile Phone Mockup */}
                <button
                  onClick={() => handleInsertFrame('phone')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: theme === 'dark' ? '#27272a' : '#ffffff',
                    border: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb',
                    color: theme === 'dark' ? '#f4f4f5' : '#111827',
                    cursor: 'pointer',
                    textAlign: 'left',
                    boxShadow: theme === 'dark' ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1e293b' : '#eff6ff';
                    e.currentTarget.style.borderColor = '#3b82f6';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = theme === 'dark' ? '#27272a' : '#ffffff';
                    e.currentTarget.style.borderColor = theme === 'dark' ? '#3f3f46' : '#e5e7eb';
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: theme === 'dark' ? '#4c1d95' : '#f5f3ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: theme === 'dark' ? '#c084fc' : '#7c3aed',
                      flexShrink: 0
                    }}
                  >
                    <Smartphone size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>Mobile Phone</div>
                    <div style={{ fontSize: '11px', color: theme === 'dark' ? '#a1a1aa' : '#6b7280' }}>Smartphone mockup</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Icons Grid Section */}
          {activeTab !== 'frames' && (
            <div>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: theme === 'dark' ? '#a1a1aa' : '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>Icons & Logos</span>
                <span style={{ fontSize: '11px', fontWeight: 500, color: theme === 'dark' ? '#71717a' : '#9ca3af' }}>
                  {combinedIcons.length} available
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px'
                }}
              >
                {combinedIcons.map(icon => (
                  <button
                    key={icon.key}
                    onClick={() => handleInsertIcon(icon)}
                    title={icon.name}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px 6px',
                      backgroundColor: theme === 'dark' ? '#27272a' : '#ffffff',
                      border: theme === 'dark' ? '1px solid #3f3f46' : '1px solid #e5e7eb',
                      borderRadius: '8px',
                      color: theme === 'dark' ? '#f4f4f5' : '#111827',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      minHeight: '76px',
                      boxShadow: theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1e293b' : '#eff6ff';
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = theme === 'dark'
                        ? '0 4px 10px rgba(0, 0, 0, 0.4)'
                        : '0 4px 10px rgba(37, 99, 235, 0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = theme === 'dark' ? '#27272a' : '#ffffff';
                      e.currentTarget.style.borderColor = theme === 'dark' ? '#3f3f46' : '#e5e7eb';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.2)' : '0 1px 2px rgba(0,0,0,0.03)';
                    }}
                  >
                    <IconThumbnail url={icon.url} name={icon.name} theme={theme} />
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 500,
                        color: theme === 'dark' ? '#e4e4e7' : '#374151',
                        maxWidth: '85px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'center'
                      }}
                    >
                      {icon.name}
                    </span>
                  </button>
                ))}
              </div>

              {combinedIcons.length === 0 && !isSearchingApi && (
                <div style={{ textAlign: 'center', padding: '32px 16px', color: theme === 'dark' ? '#a1a1aa' : '#6b7280', fontSize: '13px' }}>
                  No matching icons found for "{searchQuery}".
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            backgroundColor: theme === 'dark' ? '#18181b' : '#f9fafb',
            borderTop: theme === 'dark' ? '1px solid #27272a' : '1px solid #e5e7eb',
            fontSize: '12px',
            color: theme === 'dark' ? '#a1a1aa' : '#6b7280'
          }}
        >
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
