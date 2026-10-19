import React, { useState, useRef, useEffect } from 'react';
import { Download, Image as ImageIcon, FileCode2, Copy, Check, FileJson, Sparkles, ChevronDown } from 'lucide-react';
import { WhiteboardElement } from '../../types/elements';
import { exportToPng, exportToSvg, exportToBd, exportToJson, copyPngToClipboard } from '../../utils/export';
import { ExportOptionItem } from './ExportMenu/ExportOptionItem';
import { ExportScopeSelector } from './ExportMenu/ExportScopeSelector';

interface ExportMenuProps {
  elements: WhiteboardElement[];
  selectedIds?: string[];
  theme?: 'light' | 'dark';
}

export const ExportMenu: React.FC<ExportMenuProps> = ({ elements, selectedIds = [], theme = 'light' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportScope, setExportScope] = useState<'all' | 'selected'>('all');
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, [isOpen]);

  const hasSelection = selectedIds.length > 0;
  const target = hasSelection && exportScope === 'selected'
    ? elements.filter(el => selectedIds.includes(el.id))
    : elements;

  const runExport = (action: () => void) => {
    if (target.length === 0) return;
    action();
    setIsOpen(false);
  };

  const handleCopyClipboard = async () => {
    if (target.length === 0) return;
    try {
      const ok = await copyPngToClipboard(target, { background: theme === 'dark' ? 'dark' : 'white', scale: 2 });
      if (ok) {
        setCopied(true);
        setTimeout(() => { setCopied(false); setIsOpen(false); }, 1200);
      }
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div ref={menuRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        title="Download / Export Diagram"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
          height: '38px', padding: '0 10px', borderRadius: '7px',
          border: isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb', cursor: 'pointer',
          backgroundColor: isDark ? '#27272a' : '#ffffff',
          color: isDark ? '#f4f4f5' : '#1f2937', fontSize: '13px', fontWeight: 600,
          transition: 'all 0.15s ease', outline: 'none'
        }}
      >
        <Download size={15} color="#3b82f6" />
        <span>Export</span>
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute', top: '46px', right: 0, width: '260px',
            backgroundColor: isDark ? '#18181b' : '#ffffff', borderRadius: '10px',
            boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.6), 0 0 0 1px #27272a' : '0 10px 25px -5px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.08)',
            padding: '6px', zIndex: 100, display: 'flex', flexDirection: 'column', gap: '2px'
          }}
        >
          {hasSelection && (
            <ExportScopeSelector
              exportScope={exportScope}
              onScopeChange={setExportScope}
              allCount={elements.length}
              selectedCount={selectedIds.length}
              theme={theme}
            />
          )}

          <ExportOptionItem
            icon={<ImageIcon size={15} color="#3b82f6" />}
            title="Export PNG Image"
            subtitle="High-resolution 2x crisp PNG"
            onClick={() => runExport(() => exportToPng(target, 'diagram.png', { background: isDark ? 'dark' : 'white', scale: 2 }))}
            disabled={target.length === 0}
            theme={theme}
          />

          <ExportOptionItem
            icon={<FileCode2 size={15} color="#8b5cf6" />}
            title="Export SVG Vector"
            subtitle="Infinitely scalable vector graphic"
            onClick={() => runExport(() => exportToSvg(target, 'diagram.svg', { background: isDark ? 'dark' : 'white' }))}
            disabled={target.length === 0}
            theme={theme}
          />

          <ExportOptionItem
            icon={copied ? <Check size={15} color="#10b981" /> : <Copy size={15} color="#10b981" />}
            title={copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
            subtitle="Paste directly into chat or docs"
            onClick={handleCopyClipboard}
            disabled={target.length === 0}
            theme={theme}
          />

          <div style={{ height: '1px', backgroundColor: isDark ? '#27272a' : '#f3f4f6', margin: '3px 0' }} />

          <ExportOptionItem
            icon={<Sparkles size={15} color="#f59e0b" />}
            title="Save Drawboard (.bd)"
            subtitle="Native editable whiteboard file"
            onClick={() => runExport(() => exportToBd(target, 'diagram.bd'))}
            disabled={target.length === 0}
            theme={theme}
          />

          <ExportOptionItem
            icon={<FileJson size={15} color="#06b6d4" />}
            title="Export JSON (.json)"
            subtitle="Raw structured elements data"
            onClick={() => runExport(() => exportToJson(target, 'diagram.json'))}
            disabled={target.length === 0}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
};
