/**
 * CommandPalette.jsx
 * Global command palette for BlogzzUP.
 * Trigger: Ctrl+K / ⌘+K or via the sidebar cmd-trigger button.
 *
 * Usage:
 *   import CommandPalette from './CommandPalette';
 *   <CommandPalette onNavigate={(sectionId) => showDashboardSection(sectionId)} />
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Icons ────────────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ─── Command Definitions ──────────────────────────────────────────────────────
const COMMANDS = [
  {
    section: 'Navigate',
    items: [
      { id: 'overview',   label: 'Dashboard Overview',   tag: 'Nav',   emoji: '🏠' },
      { id: 'newblog',    label: 'Generate New Blog',    tag: 'Create', emoji: '✍️' },
      { id: 'myblogs',    label: 'My Blogs',             tag: 'Nav',   emoji: '📄' },
      { id: 'serpgap',    label: 'SERP Gap Scanner',     tag: 'SEO',   emoji: '🔍' },
      { id: 'seoscores',  label: 'Live SEO Scorer',      tag: 'SEO',   emoji: '📊' },
      { id: 'publisher',  label: 'Publisher',            tag: 'Nav',   emoji: '📤' },
      { id: 'schedule',   label: 'Content Schedule',     tag: 'Nav',   emoji: '📅' },
      { id: 'analytics',  label: 'Analytics',            tag: 'Nav',   emoji: '📈' },
      { id: 'billing',    label: 'Billing & Plans',      tag: 'Settings', emoji: '💳' },
      { id: 'settings',   label: 'Settings',             tag: 'Settings', emoji: '⚙️' },
    ]
  },
  {
    section: 'Quick Actions',
    items: [
      { id: 'newblog',   label: 'Generate Blog Post',   tag: 'Action', emoji: '⚡', action: 'newblog' },
      { id: 'serpgap',   label: 'Scan SERP Gaps',       tag: 'Action', emoji: '🔎', action: 'serpgap' },
      { id: 'seoscores', label: 'Analyze SEO Score',    tag: 'Action', emoji: '📉', action: 'seoscores' },
    ]
  }
];

// ─── Component ────────────────────────────────────────────────────────────────
const CommandPalette = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // All items flattened for keyboard nav
  const allItems = COMMANDS.flatMap(s => s.items);

  // Filtered results
  const filtered = query.trim()
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.tag.toLowerCase().includes(query.toLowerCase())
      )
    : null; // null means show all grouped

  // Open/close via ⌘K or Ctrl+K
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);

    // Also expose global trigger for sidebar button
    window.openCommandPalette = () => setOpen(true);

    return () => {
      window.removeEventListener('keydown', handleKey);
      delete window.openCommandPalette;
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleSelect = useCallback((item) => {
    setOpen(false);
    if (onNavigate) onNavigate(item.action || item.id);
    if (window.showDashboardSection) window.showDashboardSection(item.action || item.id);
  }, [onNavigate]);

  // Keyboard navigation inside palette
  const handleKeyDown = (e) => {
    const displayItems = filtered || allItems;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => (i + 1) % displayItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => (i - 1 + displayItems.length) % displayItems.length);
    } else if (e.key === 'Enter') {
      if (displayItems[selectedIndex]) handleSelect(displayItems[selectedIndex]);
    }
  };

  if (!open) return null;

  const displayItems = filtered || allItems;
  const sections = filtered
    ? [{ section: `Results for "${query}"`, items: filtered.length ? filtered : [] }]
    : COMMANDS;

  let globalIndex = 0;

  return (
    <div className="cmd-overlay" onClick={() => setOpen(false)}>
      <div
        className="cmd-palette"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-label="Command palette"
        aria-modal="true"
      >
        {/* Search */}
        <div className="cmd-search">
          <span className="cmd-search-icon" aria-hidden="true"><SearchIcon /></span>
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Search commands, pages, or actions..."
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded="true"
            aria-autocomplete="list"
            aria-controls="cmd-listbox"
          />
          <div className="search-kbd">
            <span className="kbd">Esc</span>
          </div>
        </div>

        {/* Results */}
        <div className="cmd-body" id="cmd-listbox" role="listbox" ref={listRef}>
          {sections.map(sec => (
            <div key={sec.section}>
              <div className="cmd-section-label">{sec.section}</div>
              {sec.items.length === 0 && (
                <div className="empty-state" style={{ padding: 'var(--space-8)', gap: 'var(--space-2)' }}>
                  <div className="empty-state-title" style={{ fontSize: 'var(--text-sm)' }}>No results found</div>
                  <div className="empty-state-desc">Try a different search term</div>
                </div>
              )}
              {sec.items.map(item => {
                const itemIndex = displayItems.indexOf(item) !== -1
                  ? displayItems.indexOf(item)
                  : globalIndex++;
                const isSelected = selectedIndex === itemIndex;
                return (
                  <div
                    key={item.id + item.label}
                    className="cmd-item"
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={-1}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                  >
                    <div className="cmd-item-icon" aria-hidden="true">{item.emoji}</div>
                    <span className="cmd-item-label">{item.label}</span>
                    <span className="cmd-item-tag">{item.tag}</span>
                    <span style={{ color: 'var(--text-subtle)', marginLeft: 'var(--space-1)' }}>
                      <ArrowIcon />
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        <div className="cmd-footer">
          <span className="cmd-footer-hint"><span className="kbd">↑↓</span> Navigate</span>
          <span className="cmd-footer-hint"><span className="kbd">↵</span> Open</span>
          <span className="cmd-footer-hint"><span className="kbd">Esc</span> Close</span>
          <span style={{ marginLeft: 'auto', opacity: 0.5 }}>
            <span className="kbd">⌘</span><span className="kbd">K</span> to open
          </span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
