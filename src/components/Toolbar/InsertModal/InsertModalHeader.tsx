import React from 'react';
import { Search, Layout, X, Loader2, Cloud, Code2, Database } from 'lucide-react';

export type TabType = 'all' | 'cloud' | 'frameworks' | 'databases' | 'frames';

interface ModalHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeTab: TabType;
  onTabChange: (t: TabType) => void;
  isSearchingApi: boolean;
  onClose: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  theme: 'light' | 'dark';
}

export const InsertModalHeader: React.FC<ModalHeaderProps> = ({
  searchQuery,
  onSearchChange,
  activeTab,
  onTabChange,
  isSearchingApi,
  onClose,
  inputRef,
  theme
}) => {
  const isDark = theme === 'dark';

  return (
    <div
      style={{
        padding: '14px 16px 10px 16px',
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        borderBottom: isDark ? '1px solid #27272a' : '1px solid #f3f4f6'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          backgroundColor: isDark ? '#27272a' : '#f9fafb',
          border: isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb',
          borderRadius: '9px'
        }}
      >
        {isSearchingApi ? (
          <Loader2 size={18} color="#2563eb" style={{ animation: 'spin 1s linear infinite' }} />
        ) : (
          <Search size={18} color={isDark ? '#a1a1aa' : '#6b7280'} />
        )}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search 200,000+ tech icons (Docker, AWS, React, Python)..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Escape') onClose(); }}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: isDark ? '#ffffff' : '#111827', fontSize: '13px' }}
        />
        {searchQuery && (
          <button onClick={() => onSearchChange('')} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 0 }}>
            <X size={15} />
          </button>
        )}
        <button onClick={onClose} title="Close (Esc)" style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px', borderRadius: '4px' }}>
          <X size={16} />
        </button>
      </div>

      {!searchQuery && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', overflowX: 'auto', paddingBottom: '2px' }}>
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
                onClick={() => onTabChange(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: isActive ? (isDark ? '1px solid #3b82f6' : '1px solid #bfdbfe') : '1px solid transparent',
                  backgroundColor: isActive ? (isDark ? '#1e293b' : '#eff6ff') : (isDark ? '#27272a' : '#f9fafb'),
                  color: isActive ? (isDark ? '#60a5fa' : '#2563eb') : (isDark ? '#a1a1aa' : '#4b5563'),
                  fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap'
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
  );
};
