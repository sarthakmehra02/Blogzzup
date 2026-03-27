/**
 * BlogEditor.jsx — Redesigned blog generation/editor workflow
 * Replaces NewBlogSection in Dashboard.jsx.
 *
 * UX improvements:
 *  - 3-stage wizard: Configure → Generating → Review & Edit
 *  - Side-by-side layout with sticky action bar
 *  - Prompt input with examples, character count, validation
 *  - Granular AI progress steps with animated stepper
 *  - Inline autosave indicator + version/draft history
 *  - Full keyboard shortcuts (⌘+Enter to generate, ⌘+S to save, ⌘+C to copy)
 *  - Inline error with recovery action
 *  - Mobile-first responsive layout
 *  - No business logic changes — same callGemini, same localStorage schema
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Icons (inline SVG to avoid extra deps) ────────────────────────────────
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.75"
    strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d={d} />
  </svg>
);

const Icons = {
  Sparkles:  () => <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M12 3l1.68 5.17H19l-4.41 3.2 1.68 5.17L12 13.34l-4.27 3.2 1.68-5.17L5 8.17h5.32z"/></svg>,
  Zap:       () => <Icon d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>,
  Copy:      () => <Icon d="M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2M8 4a2 2 0 012-2h4a2 2 0 012 2M8 4h8"/>,
  Save:      () => <Icon d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2zM17 21v-8H7v8M7 3v5h8"/>,
  Check:     () => <Icon d="M20 6L9 17l-5-5"/>,
  X:         () => <Icon d="M18 6L6 18M6 6l12 12"/>,
  RotateCcw: () => <Icon d="M1 4v6h6M3.51 15a9 9 0 102.13-9.36L1 10"/>,
  History:   () => <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>,
  Send:      () => <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>,
  Eye:       () => <Icon d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z"/>,
  Edit:      () => <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>,
  ChevronDown: () => <Icon d="M6 9l6 6 6-6"/>,
  AlertCircle: () => <Icon d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zM12 8v4M12 16h.01"/>,
  Globe:     () => <Icon d="M12 2a10 10 0 100 20A10 10 0 0012 2zM2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>,
  Trash2:    () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>,
  Clock:     () => <Icon d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>,
};

// ─── Keyword example prompts ────────────────────────────────────────────────
const KEYWORD_EXAMPLES = [
  'AI tools for Indian startups',
  'how to rank on Google India 2025',
  'best CRM software for small businesses',
  'content marketing strategy for SaaS',
  'GST filing tips for freelancers',
];

const TONE_OPTIONS = [
  { value: 'professional',    label: 'Professional',    desc: 'Formal, trusted, authoritative' },
  { value: 'conversational',  label: 'Conversational',  desc: 'Friendly, readable, approachable' },
  { value: 'authoritative',   label: 'Authoritative',   desc: 'Expert-led, confident, credible' },
  { value: 'educational',     label: 'Educational',     desc: 'Structured, clear, informative' },
];

const GENERATION_STEPS = [
  { text: 'Analyzing keyword intent',         pct: 12 },
  { text: 'Scanning SERP gaps',              pct: 25 },
  { text: 'Building content brief',          pct: 40 },
  { text: 'Drafting blog content',           pct: 60 },
  { text: 'Running SEO optimization pass',   pct: 76 },
  { text: 'Humanizing content',              pct: 88 },
  { text: 'Structuring featured snippets',   pct: 95 },
];

// ─── Helper ─────────────────────────────────────────────────────────────────
const fmtDate = iso =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Animated step-based progress indicator */
const GenerationStepper = ({ steps, currentPct, currentText }) => (
  <div className="be-stepper">
    {steps.map((step, i) => {
      const done = currentPct > step.pct;
      const active = !done && currentPct >= (steps[i - 1]?.pct ?? 0);
      return (
        <div key={step.text} className={`be-step${done ? ' done' : active ? ' active' : ''}`}>
          <div className="be-step-dot">
            {done ? <Icons.Check /> : active ? <span className="be-pulse" /> : null}
          </div>
          <div className="be-step-label">{step.text}</div>
          {active && <div className="be-step-pct">{currentPct}%</div>}
        </div>
      );
    })}
  </div>
);

/** Version history drawer */
const HistoryDrawer = ({ versions, onRestore, onClose }) => (
  <div className="be-history-overlay" onClick={onClose}>
    <div className="be-history-panel" onClick={e => e.stopPropagation()}>
      <div className="be-history-header">
        <span><Icons.History /> Version History</span>
        <button className="be-icon-btn" onClick={onClose} aria-label="Close"><Icons.X /></button>
      </div>
      {versions.length === 0 ? (
        <div className="be-history-empty">No previous versions yet. Versions are saved each time you generate.</div>
      ) : (
        <div className="be-history-list">
          {versions.map((v, i) => (
            <div key={v.savedAt} className="be-history-item">
              <div className="be-history-meta">
                <span className="be-history-idx">v{versions.length - i}</span>
                <span className="be-history-kw">{v.keyword}</span>
                <span className="be-history-date">{fmtDate(v.savedAt)}</span>
              </div>
              <div className="be-history-title">{v.title}</div>
              <div className="be-history-stats">
                <span className="badge-success">SEO {v.seoScore}/100</span>
                <span className="badge-secondary">{v.wordCountActual?.toLocaleString?.()} words</span>
              </div>
              <button className="btn btn-sm btn-outline be-history-restore" onClick={() => onRestore(v)}>
                Restore this version
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

/** Save confirmation toast (self-contained) */
const SaveBanner = ({ message, type = 'success', onDismiss }) => (
  <div className={`be-save-banner be-save-banner--${type}`} role="status">
    {type === 'success' ? <Icons.Check /> : <Icons.AlertCircle />}
    <span>{message}</span>
    <button className="be-icon-btn" onClick={onDismiss} aria-label="Dismiss"><Icons.X /></button>
  </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const BlogEditor = ({ callGemini, publishBlog }) => {
  // ── Form state ──
  const [keyword, setKeyword]         = useState('');
  const [tone, setTone]               = useState('professional');
  const [wordCount, setWordCount]     = useState(1500);
  const [geo, setGeo]                 = useState('');
  const [instructions, setInstructions] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  // ── Generation state ──
  const [stage, setStage]             = useState('configure'); // configure | generating | review
  const [progress, setProgress]       = useState({ pct: 0, text: '' });
  const [error, setError]             = useState(null);
  const [output, setOutput]           = useState(null);

  // ── Editor/review state ──
  const [editableTitle, setEditableTitle]     = useState('');
  const [editableBody, setEditableBody]       = useState('');
  const [editableMeta, setEditableMeta]       = useState('');
  const [previewMode, setPreviewMode]         = useState(false); // false = edit, true = preview
  const [autoSaveStatus, setAutoSaveStatus]   = useState(null); // null | 'saving' | 'saved'
  const [saveBanner, setSaveBanner]           = useState(null); // { message, type }

  // ── History state ──
  const [isPreparingPub, setIsPreparingPub]   = useState(false);
  const [preparedBlog, setPreparedBlog]       = useState(null);
  const [showPubModal, setShowPubModal]       = useState(false);
  const [pubPlatform, setPubPlatform]         = useState('');
  const [pubStatus, setPubStatus]             = useState('');
  const [isScheduled, setIsScheduled]         = useState(false);
  const [scheduledAt, setScheduledAt]         = useState('');
  const [historyOpen, setHistoryOpen]   = useState(false);
  const [versions, setVersions]         = useState([]);

  const keywordRef   = useRef(null);
  const bodyRef      = useRef(null);
  const progressRef  = useRef(null);

  // ── Load version history from localStorage ──
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('bf_versions') || '[]');
    setVersions(saved);
  }, []);

  // ── Auto-save body edits ──
  useEffect(() => {
    if (stage !== 'review' || !output) return;
    setAutoSaveStatus('saving');
    const t = setTimeout(() => {
      // Persist edits to draft in localStorage
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const idx = blogs.findIndex(b => b.id === output.id);
      if (idx !== -1) {
        blogs[idx] = { ...blogs[idx], title: editableTitle, body: editableBody, metaDescription: editableMeta };
        localStorage.setItem('bf_blogs', JSON.stringify(blogs));
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus(null), 2200);
      } else {
        setAutoSaveStatus(null);
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [editableTitle, editableBody, editableMeta]);

  // ── Global keyboard shortcuts ──
  useEffect(() => {
    const handleKey = e => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'Enter' && stage === 'configure') {
        e.preventDefault(); generateBlog();
      }
      if (mod && e.key === 's' && stage === 'review') {
        e.preventDefault(); handleSaveDraft();
      }
      if (mod && e.key === 'c' && stage === 'review' && e.shiftKey) {
        e.preventDefault(); handleCopy();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [stage, output, editableTitle, editableBody, editableMeta]);

  // ── Validate ──
  const [kwError, setKwError] = useState('');
  const validate = () => {
    if (!keyword.trim()) { setKwError('Please enter a target keyword.'); keywordRef.current?.focus(); return false; }
    if (keyword.trim().length < 3) { setKwError('Keyword must be at least 3 characters.'); return false; }
    setKwError('');
    return true;
  };

  // ── Generate ────────────────────────────────────────────────────────────
  const generateBlog = async () => {
    if (!validate()) return;
    setError(null);
    setStage('generating');
    setProgress({ pct: 0, text: 'Starting...' });

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < GENERATION_STEPS.length) {
        setProgress({ pct: GENERATION_STEPS[stepIndex].pct, text: GENERATION_STEPS[stepIndex].text });
        stepIndex++;
      }
    }, 700);

    const geoText   = geo ? `Target location: ${geo}. Include local entities and city-specific examples.` : '';
    const extraText = instructions ? `Additional requirements: ${instructions}` : '';

    const prompt = `You are an expert SEO content writer for Indian startups and businesses.

Write a comprehensive, SEO-optimized blog post with these specifications:
- Primary keyword: "${keyword}"
- Tone: ${tone}
- Target word count: ${wordCount} words
- ${geoText}
- ${extraText}

Format your response as valid JSON with exactly these fields:
{
  "title": "SEO-optimized blog title with keyword, under 60 chars",
  "metaDescription": "Meta description under 155 chars with keyword and CTA",
  "seoScore": 92,
  "body": "Full blog content here"
}

STRICT RULES for the body field:
- Use \\n for line breaks inside the JSON string
- Do NOT use actual newlines inside the JSON string
- Do NOT use unescaped double quotes inside the body
- Keep body under 3000 words to stay within token limits
- Use ## for H2 headings, ### for H3 headings
- Return ONLY the raw JSON object, nothing else before or after`;

    try {
      const cleaned  = await callGemini(prompt, 8192);
      clearInterval(interval);
      setProgress({ pct: 100, text: 'Complete! ✓' });

      let blogData;
      try {
        blogData = JSON.parse(cleaned);
      } catch (parseErr) {
        // Gemini truncated the JSON — extract fields manually
        const extractField = (text, field) => {
          const regex = new RegExp('"' + field + '"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)');
          const match = text.match(regex);
          return match ? match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"') : '';
        };
        
        const titleMatch = cleaned.match(/"title"\s*:\s*"([^"]+)"/);
        const metaMatch = cleaned.match(/"metaDescription"\s*:\s*"([^"]+)"/);
        const seoMatch = cleaned.match(/"seoScore"\s*:\s*(\d+)/);
        
        // For body — extract everything between "body": " and the truncation point
        const bodyStart = cleaned.indexOf('"body"');
        let body = '';
        if (bodyStart !== -1) {
          const afterBody = cleaned.substring(bodyStart + 8);
          const firstQuote = afterBody.indexOf('"');
          if (firstQuote !== -1) {
            body = afterBody.substring(firstQuote + 1)
              .replace(/\\n/g, '\n')
              .replace(/\\"/g, '"')
              .replace(/\\"$/, '')
              .replace(/\\$/, '');
            // Clean truncated end
            const lastGoodSentence = body.lastIndexOf('.');
            if (lastGoodSentence > body.length * 0.7) {
              body = body.substring(0, lastGoodSentence + 1);
            }
          }
        }
        
        blogData = {
          title: titleMatch ? titleMatch[1] : 'Generated Blog',
          metaDescription: metaMatch ? metaMatch[1] : '',
          seoScore: seoMatch ? parseInt(seoMatch[1]) : 82,
          body: body || 'Content was generated but could not be fully parsed. Please try again.'
        };
      }
      const wordCountActual = blogData.body.split(' ').length;
      const readTime        = Math.ceil(wordCountActual / 200);
      const id              = Date.now();
      const createdAt       = new Date().toISOString();

      const sanitizedKeyword = keyword.trim().replace(/\s+/g, '');
      setKeyword(sanitizedKeyword);
      
      const full = { ...blogData, id, keyword: sanitizedKeyword, tone, geo, wordCountActual, readTime, createdAt };

      // Save version snapshot
      const versionEntry = { ...full, savedAt: createdAt };
      const newVersions = [versionEntry, ...versions].slice(0, 10);
      localStorage.setItem('bf_versions', JSON.stringify(newVersions));
      setVersions(newVersions);

      setTimeout(() => {
        setOutput(full);
        setEditableTitle(full.title);
        setEditableBody(full.body);
        setEditableMeta(full.metaDescription);
        setStage('review');
      }, 400);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || 'Generation failed. Please try again.');
      setStage('configure');
    }
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleSaveDraft = useCallback(() => {
    if (!output) return;
    const blogs  = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
    const exists = blogs.findIndex(b => b.id === output.id);
    const entry  = {
      id: output.id, title: editableTitle, metaDescription: editableMeta,
      body: editableBody, seoScore: output.seoScore, keyword: output.keyword,
      status: 'draft', createdAt: output.createdAt,
    };
    if (exists !== -1) blogs[exists] = entry; else blogs.unshift(entry);
    localStorage.setItem('bf_blogs', JSON.stringify(blogs));
    if (window.updateOverviewStats) window.updateOverviewStats();
    if (window.loadMyBlogs) window.loadMyBlogs();
    setSaveBanner({ message: 'Draft saved to My Blogs!', type: 'success' });
    setTimeout(() => setSaveBanner(null), 3500);
  }, [output, editableTitle, editableMeta, editableBody]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    const text = `${editableTitle}\n\n${editableMeta}\n\n${editableBody}`;
    navigator.clipboard.writeText(text).then(() => {
      setSaveBanner({ message: 'Copied to clipboard!', type: 'success' });
      setTimeout(() => setSaveBanner(null), 2500);
    });
  }, [output, editableTitle, editableMeta, editableBody]);

  const handlePublish = async () => {
    if (!output) return;
    
    // Preparation is now skipped for a faster experience per user request
    setPreparedBlog({
      title: editableTitle,
      content: editableBody,
      meta_description: editableMeta,
      tags: [output.keyword].filter(Boolean)
    });
    setError(null);
    setShowPubModal(true);
  };

  const executePublish = async () => {
    if (!pubPlatform || !preparedBlog) return;
    
    const credsStr = localStorage.getItem('bf_credentials');
    if (!credsStr) {
      setPubStatus('Error: Credentials not found. Setup in Settings.');
      return;
    }
    const creds = JSON.parse(credsStr)[pubPlatform];
    if (!creds || Object.keys(creds).length === 0 || !Object.values(creds).some(val => val.length > 0)) {
      setPubStatus('Error: Invalid API keys for ' + pubPlatform);
      return;
    }

    if (isScheduled) {
      if (!scheduledAt) {
        setPubStatus('Error: Please select a date and time.');
        return;
      }
      setPubStatus('Scheduling for ' + scheduledAt + '...');
      
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const bIdx = blogs.findIndex(b => b.id === output.id);
      const entry = {
        id: output.id, title: editableTitle, metaDescription: editableMeta,
        body: editableBody, seoScore: output.seoScore, keyword: output.keyword,
        status: 'scheduled', scheduledAt, createdAt: output.createdAt,
        platform: pubPlatform
      };

      if (bIdx !== -1) blogs[bIdx] = entry; else blogs.unshift(entry);
      localStorage.setItem('bf_blogs', JSON.stringify(blogs));
      
      setPubStatus('✓ Blog scheduled!');
      if (window.loadMyBlogs) window.loadMyBlogs();
      if (window.updateOverviewStats) window.updateOverviewStats();

      setTimeout(() => {
        setShowPubModal(false);
        setPubStatus('');
      }, 2000);
      return;
    }

    setPubStatus('Publishing to ' + pubPlatform + '...');
    try {
      await publishBlog(pubPlatform, {
        title: preparedBlog.title,
        content: preparedBlog.content,
        tags: preparedBlog.tags,
        credentials: creds
      });
      setPubStatus('✓ Published successfully!');
      
      // Update status to published in localStorage
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const bIdx = blogs.findIndex(b => b.id === output.id);
      if (bIdx !== -1) {
        blogs[bIdx].status = 'published';
        localStorage.setItem('bf_blogs', JSON.stringify(blogs));
        if (window.loadMyBlogs) window.loadMyBlogs();
      }

      setTimeout(() => {
        setShowPubModal(false);
        setPubStatus('');
      }, 2000);
    } catch (err) {
      setPubStatus('Error: ' + err.message);
    }
  };

  const handleRestoreVersion = useCallback((v) => {
    setOutput(v);
    setEditableTitle(v.title);
    setEditableBody(v.body);
    setEditableMeta(v.metaDescription);
    setHistoryOpen(false);
    setStage('review');
    setSaveBanner({ message: 'Version restored — review your content below.', type: 'success' });
    setTimeout(() => setSaveBanner(null), 3500);
  }, []);

  const handleReset = () => {
    setStage('configure');
    setOutput(null);
    setError(null);
    setProgress({ pct: 0, text: '' });
  };

  // ── Char counts ──
  const kwCharCount = keyword.length;
  const metaCharCount = editableMeta.length;

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div id="dash-newblog" className="dash-section be-root" style={{ display: 'none' }}>

      {/* ── Global save banner ── */}
      {saveBanner && (
        <SaveBanner message={saveBanner.message} type={saveBanner.type} onDismiss={() => setSaveBanner(null)} />
      )}

      {/* ── History Drawer ── */}
      {historyOpen && (
        <HistoryDrawer versions={versions} onRestore={handleRestoreVersion} onClose={() => setHistoryOpen(false)} />
      )}

      {/* ── Preparing for Publication Overlay ── */}
      {isPreparingPub && (
        <div className="be-history-overlay" style={{zIndex: 1000, display:'flex', alignItems:'center', justifyContent:'center'}}>
           <div className="be-gen-card" style={{maxWidth:'400px', textAlign:'center', position:'relative'}}>
              {/* Close button in case it hangs */}
              <button 
                className="be-icon-btn" 
                style={{position:'absolute', top:'10px', right:'10px'}}
                onClick={() => setIsPreparingPub(false)}
              >
                <Icons.X />
              </button>

              {!pubStatus.startsWith('Error') ? (
                <>
                  <div className="be-pulse" style={{width:'48px', height:'48px', margin:'0 auto 16px'}} />
                  <h3>AI Assistant preparing your blog...</h3>
                  <p style={{color:'var(--text-subtle)', fontSize:'13px', marginTop:'8px'}}>Optimizing tags, fixing grammar, and formatting for cross-platform safety.</p>
                </>
              ) : (
                <>
                  <Icons.AlertCircle size={48} style={{color:'var(--color-warning-400)', marginBottom:'16px'}} />
                  <h3 style={{color:'var(--color-warning-400)'}}>Preparation Failed</h3>
                  <p style={{color:'var(--text-subtle)', fontSize:'13px', marginTop:'8px'}}>{pubStatus}</p>
                  <button className="btn btn-primary mt-4" onClick={() => { setIsPreparingPub(false); setPubStatus(''); }}>Back to Editor</button>
                </>
              )}
           </div>
        </div>
      )}

      {/* ── Platform Selection Modal ── */}
      {showPubModal && (
        <div className="be-history-overlay" onClick={() => !pubStatus.includes('...') && setShowPubModal(false)} style={{zIndex: 1001}}>
          <div className="be-history-panel" onClick={e => e.stopPropagation()} style={{maxWidth:'500px', height:'auto', padding:'24px'}}>
             <div className="be-history-header" style={{marginBottom:'20px'}}>
                <span><Icons.Send /> Select Platform</span>
                <button className="be-icon-btn" onClick={() => setShowPubModal(false)}><Icons.X /></button>
             </div>
             
             <div className="be-tone-grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'12px'}}>
                {['wordpress', 'blogger', 'devto', 'hashnode', 'tumblr'].map(p => (
                   <label key={p} className={`be-tone-card${pubPlatform === p ? ' selected' : ''}`} style={{padding:'16px', textAlign:'center'}}>
                      <input type="radio" className="sr-only" name="pubPlatform" value={p} onChange={() => setPubPlatform(p)} />
                      <div style={{fontSize:'24px', marginBottom:'8px'}}>
                        {p === 'wordpress' && '📝'}
                        {p === 'blogger' && '🍊'}
                        {p === 'devto' && '📑'}
                        {p === 'hashnode' && '⚡'}
                        {p === 'tumblr' && '🔵'}
                      </div>
                      <span style={{textTransform:'capitalize', fontWeight:600}}>{p}</span>
                   </label>
                ))}
             </div>

             {/* Scheduling Options */}
             <div style={{marginTop:'24px', padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.05)'}}>
                <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', marginBottom: isScheduled ? '12px' : '0'}}>
                   <input type="checkbox" checked={isScheduled} onChange={e => setIsScheduled(e.target.checked)} style={{width:'18px', height:'18px', accentColor:'var(--color-primary-500)'}} />
                   <span style={{fontSize:'14px', fontWeight:500, color:'white'}}>Schedule for later</span>
                </label>
                
                {isScheduled && (
                   <div style={{display:'flex', flexDirection:'column', gap:'8px'}}>
                      <label style={{fontSize:'12px', color:'#64748B'}}>Select Date & Time</label>
                      <input 
                        type="datetime-local" 
                        value={scheduledAt} 
                        onChange={e => setScheduledAt(e.target.value)}
                        style={{background:'#0D1526', border:'1px solid rgba(255,255,255,0.1)', color:'white', padding:'10px', borderRadius:'8px', outline:'none', width:'100%', boxSizing:'border-box'}}
                      />
                   </div>
                )}
             </div>

             {pubStatus && (
                <div style={{marginTop:'20px', padding:'12px', borderRadius:'8px', background:pubStatus.startsWith('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color:pubStatus.startsWith('Error') ? 'var(--color-warning-400)' : 'var(--color-success-400)', fontSize:'13px', display:'flex', alignItems:'center', gap:'8px'}}>
                   {pubStatus.includes('...') ? <span className="be-pulse" style={{width:'12px', height:'12px'}} /> : <Icons.Check />}
                   {pubStatus}
                </div>
             )}

             <div style={{marginTop:'24px', display:'flex', gap:'12px'}}>
                <button className="btn btn-primary" style={{flex:1}} onClick={executePublish} disabled={!pubPlatform || pubStatus.includes('...')}>
                   {isScheduled ? 'Schedule Blog' : 'Publish Now'}
                </button>
             </div>
          </div>
        </div>
      )}

      {/* ══ HEADER ══ */}
      <div className="be-header">
        <div className="be-header-left">
          <div className="be-stage-pills">
            <span className={`be-stage-pill${stage === 'configure' || stage === 'generating' || stage === 'review' ? ' reached' : ''}`}>
              {stage === 'review' ? <Icons.Check /> : '1'} Configure
            </span>
            <span className="be-stage-sep" />
            <span className={`be-stage-pill${stage === 'generating' || stage === 'review' ? ' reached' : ''}`}>
              {stage === 'review' ? <Icons.Check /> : '2'} Generate
            </span>
            <span className="be-stage-sep" />
            <span className={`be-stage-pill${stage === 'review' ? ' active' : ''}`}>
              3 Review
            </span>
          </div>
          <h1 className="be-title">
            {stage === 'configure' ? 'New Blog Post' : stage === 'generating' ? 'Generating…' : 'Review & Edit'}
          </h1>
          <p className="be-subtitle">
            {stage === 'configure' && 'Configure your blog parameters and let AI do the heavy lifting.'}
            {stage === 'generating' && 'Your blog is being generated. Sit tight — this takes about 15–30 seconds.'}
            {stage === 'review' && `Generated for "${output?.keyword}" · ${output?.wordCountActual?.toLocaleString()} words · ${output?.readTime} min read`}
          </p>
        </div>
        <div className="be-header-right">
          {stage === 'review' && (
            <>
              {autoSaveStatus && (
                <span className={`be-autosave${autoSaveStatus === 'saved' ? ' saved' : ''}`}>
                  {autoSaveStatus === 'saving' ? '⟳ Saving…' : '✓ Autosaved'}
                </span>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setHistoryOpen(true)} title="Version history">
                <Icons.History /> History
              </button>
              <button className="btn btn-ghost btn-sm" onClick={handleReset} title="Start over">
                <Icons.RotateCcw /> New
              </button>
            </>
          )}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className={`be-body${stage === 'review' ? ' be-body--review' : ''}`}>

        {/* ── STAGE: Configure ── */}
        {stage === 'configure' && (
          <div className="be-configure">
            {/* Left: form */}
            <div className="be-form-panel">

              {/* Keyword */}
              <div className={`form-group${kwError ? ' has-error' : ''}`}>
                <label className="form-label form-label-required" htmlFor="be-keyword">Target Keyword</label>
                <div className="search-input-wrapper">
                  <input
                    ref={keywordRef}
                    id="be-keyword"
                    className={`form-input${kwError ? ' is-invalid' : ''}`}
                    placeholder="e.g. AI tools for Indian startups"
                    value={keyword}
                    onChange={e => { setKeyword(e.target.value); if (kwError) setKwError(''); }}
                    onKeyDown={e => e.key === 'Enter' && generateBlog()}
                    maxLength={120}
                    aria-describedby="be-kw-hint be-kw-error"
                    autoFocus
                  />
                  <span className="be-charcount" style={{ position: 'absolute', right: '12px', fontSize: '11px', color: kwCharCount > 100 ? 'var(--color-warning-400)' : 'var(--text-subtle)', pointerEvents: 'none' }}>
                    {kwCharCount}/120
                  </span>
                </div>
                {kwError && (
                  <div className="form-error" id="be-kw-error" role="alert">
                    <Icons.AlertCircle /> {kwError}
                  </div>
                )}
                <div className="form-hint" id="be-kw-hint">
                  This becomes your primary SEO target — be as specific as possible.{' '}
                  <button
                    type="button"
                    className="be-examples-toggle"
                    onClick={() => setShowExamples(v => !v)}
                    aria-expanded={showExamples}
                  >
                    {showExamples ? 'Hide' : 'See'} examples <Icons.ChevronDown />
                  </button>
                </div>
                {showExamples && (
                  <div className="be-examples" role="listbox" aria-label="Keyword examples">
                    {KEYWORD_EXAMPLES.map(ex => (
                      <button
                        key={ex}
                        type="button"
                        role="option"
                        className="be-example-chip"
                        onClick={() => { setKeyword(ex); setShowExamples(false); setKwError(''); keywordRef.current?.focus(); }}
                      >
                        {ex}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tone */}
              <div className="form-group">
                <label className="form-label" htmlFor="be-tone">Writing Tone</label>
                <div className="be-tone-grid" role="radiogroup" aria-labelledby="be-tone">
                  {TONE_OPTIONS.map(t => (
                    <label
                      key={t.value}
                      className={`be-tone-card${tone === t.value ? ' selected' : ''}`}
                    >
                      <input
                        type="radio" name="tone" value={t.value}
                        checked={tone === t.value}
                        onChange={() => setTone(t.value)}
                        className="sr-only"
                      />
                      <span className="be-tone-label">{t.label}</span>
                      <span className="be-tone-desc">{t.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Word count */}
              <div className="form-group">
                <label className="form-label" htmlFor="be-wordcount">
                  Word Count — <span style={{ color: 'var(--color-primary-400)', fontWeight: 700 }}>{wordCount.toLocaleString()} words</span>
                  <span style={{ color: 'var(--text-subtle)', fontWeight: 400, marginLeft: '8px' }}>
                    (~{Math.ceil(wordCount / 200)} min read)
                  </span>
                </label>
                <div className="be-range-wrapper">
                  <span className="be-range-label">800</span>
                  <input
                    id="be-wordcount"
                    type="range" min={800} max={3000} step={100}
                    value={wordCount}
                    onChange={e => setWordCount(Number(e.target.value))}
                    className="be-range"
                    aria-valuemin={800} aria-valuemax={3000}
                    aria-valuenow={wordCount}
                    aria-valuetext={`${wordCount} words`}
                  />
                  <span className="be-range-label">3,000</span>
                </div>
                <div className="be-range-marks">
                  {[800, 1500, 2000, 2500, 3000].map(v => (
                    <button
                      key={v} type="button"
                      className={`be-range-mark${wordCount === v ? ' active' : ''}`}
                      onClick={() => setWordCount(v)}
                    >{v.toLocaleString()}</button>
                  ))}
                </div>
              </div>

              {/* GEO */}
              <div className="form-group">
                <label className="form-label" htmlFor="be-geo">
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <Icons.Globe /> GEO Target <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>(optional)</span>
                  </span>
                </label>
                <input
                  id="be-geo"
                  className="form-input"
                  placeholder="e.g. Delhi, Bangalore, Pan India"
                  value={geo}
                  onChange={e => setGeo(e.target.value)}
                />
                <div className="form-hint">Adds location-specific context and local SEO signals.</div>
              </div>

              {/* Instructions */}
              <div className="form-group">
                <label className="form-label" htmlFor="be-instructions">
                  Additional Instructions <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  id="be-instructions"
                  className="form-textarea"
                  rows={3}
                  placeholder="e.g. Include stats, mention competitor names, focus on B2B audience, add FAQ section…"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  style={{ minHeight: '80px' }}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="be-error-block" role="alert">
                  <Icons.AlertCircle />
                  <div className="be-error-content">
                    <div className="be-error-title">Generation failed</div>
                    <div className="be-error-msg">{error}</div>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => setError(null)}>Dismiss</button>
                </div>
              )}

              {/* ── Sticky action bar ── */}
              <div className="be-action-bar">
                <div className="be-shortcuts-hint">
                  <span className="kbd">⌘</span><span className="kbd">↵</span> to generate
                </div>
                <button
                  className="btn btn-primary btn-lg be-generate-btn"
                  onClick={generateBlog}
                  aria-label="Generate blog post"
                >
                  <Icons.Zap />
                  Generate Blog
                </button>
              </div>
            </div>

            {/* Right: preview placeholder */}
            <div className="be-preview-placeholder">
              <div className="be-placeholder-icon">✍️</div>
              <div className="be-placeholder-title">Your blog will appear here</div>
              <div className="be-placeholder-desc">Configure the details on the left, then click Generate Blog.</div>
              <div className="be-placeholder-tips">
                <div className="be-tip"><Icons.Check /> SEO-optimized title + meta description</div>
                <div className="be-tip"><Icons.Check /> Full-length blog with H2s, H3s &amp; bullet points</div>
                <div className="be-tip"><Icons.Check /> SEO score, word count &amp; read time</div>
                <div className="be-tip"><Icons.Check /> Inline editor with autosave</div>
                <div className="be-tip"><Icons.Check /> Version history (up to 10 drafts)</div>
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE: Generating ── */}
        {stage === 'generating' && (
          <div className="be-generating">
            <div className="be-gen-card">
              {/* Progress bar */}
              <div className="be-progress-bar" role="progressbar" aria-valuenow={progress.pct} aria-valuemin={0} aria-valuemax={100}>
                <div className="be-progress-fill" style={{ width: `${progress.pct}%` }} />
              </div>
              <div className="be-progress-label">{progress.text}</div>
              <div className="be-progress-pct">{progress.pct}%</div>

              {/* Step stepper */}
              <GenerationStepper steps={GENERATION_STEPS} currentPct={progress.pct} currentText={progress.text} />

              {/* Keyword context */}
              <div className="be-gen-context">
                Generating for <span className="keyword-badge">{keyword}</span>
                {geo && <> · <span className="keyword-badge">{geo}</span></>}
                <span style={{ marginLeft: '8px', color: 'var(--text-subtle)' }}>· {wordCount.toLocaleString()} words · {tone}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── STAGE: Review & Edit ── */}
        {stage === 'review' && output && (
          <div className="be-review">

            {/* Left: editable form */}
            <div className="be-editor-panel">
              {/* Metrics bar */}
              <div className="be-metrics-row">
                <div className="be-metric">
                  <span className="be-metric-label">SEO Score</span>
                  <span className="be-metric-val" style={{ color: 'var(--color-success-400)' }}>{output.seoScore}/100</span>
                </div>
                <div className="be-metric-sep" />
                <div className="be-metric">
                  <span className="be-metric-label">Words</span>
                  <span className="be-metric-val" style={{ color: 'var(--color-primary-400)' }}>{output.wordCountActual?.toLocaleString()}</span>
                </div>
                <div className="be-metric-sep" />
                <div className="be-metric">
                  <span className="be-metric-label">Read time</span>
                  <span className="be-metric-val" style={{ color: 'var(--color-secondary-400)' }}>{output.readTime} min</span>
                </div>
                <div className="be-metric-sep" />
                <div className="be-metric">
                  <span className="be-metric-label">Keyword</span>
                  <span className="be-metric-val" style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)' }}>{output.keyword}</span>
                </div>
              </div>

              {/* Title editor */}
              <div className="form-group" style={{ marginTop: 'var(--space-5)' }}>
                <label className="form-label" htmlFor="be-edit-title">
                  Title <span style={{ color: 'var(--text-subtle)', fontWeight: 400 }}>({editableTitle.length}/60 chars)</span>
                  {editableTitle.length > 60 && <span style={{ color: 'var(--color-warning-400)', marginLeft: '6px' }}>⚠ Over limit</span>}
                </label>
                <input
                  id="be-edit-title"
                  className="form-input be-title-input"
                  value={editableTitle}
                  onChange={e => setEditableTitle(e.target.value)}
                  style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)' }}
                />
              </div>

              {/* Meta description editor */}
              <div className="form-group">
                <label className="form-label" htmlFor="be-edit-meta">
                  Meta Description
                  <span style={{ color: metaCharCount > 155 ? 'var(--color-warning-400)' : 'var(--text-subtle)', marginLeft: '6px', fontWeight: 400 }}>
                    ({metaCharCount}/155)
                  </span>
                </label>
                <textarea
                  id="be-edit-meta"
                  className="form-textarea"
                  rows={2}
                  value={editableMeta}
                  onChange={e => setEditableMeta(e.target.value)}
                  style={{ minHeight: '64px', fontStyle: 'italic', fontSize: 'var(--text-sm)' }}
                />
              </div>

              {/* Body editor */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                  <label className="form-label" htmlFor="be-edit-body">Body Content</label>
                  <div className="be-view-toggle">
                    <button
                      className={`be-view-btn${!previewMode ? ' active' : ''}`}
                      onClick={() => setPreviewMode(false)}
                      title="Edit mode"
                    ><Icons.Edit /> Edit</button>
                    <button
                      className={`be-view-btn${previewMode ? ' active' : ''}`}
                      onClick={() => setPreviewMode(true)}
                      title="Preview mode"
                    ><Icons.Eye /> Preview</button>
                  </div>
                </div>

                {previewMode ? (
                  <div className="be-preview-body" dangerouslySetInnerHTML={{
                    __html: editableBody
                      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                      .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
                      .replace(/^\*\*(.+)\*\*$/gm, '<strong>$1</strong>')
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^- (.+)$/gm, '<li>$1</li>')
                      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
                      .replace(/\n\n/g, '</p><p>')
                      .replace(/^(?!<[hul])/gm, '')
                  }} />
                ) : (
                  <textarea
                    id="be-edit-body"
                    ref={bodyRef}
                    className="form-textarea be-body-textarea"
                    value={editableBody}
                    onChange={e => setEditableBody(e.target.value)}
                    rows={28}
                    spellCheck
                  />
                )}
              </div>
            </div>

            {/* Right: sticky action panel */}
            <div className="be-action-panel">
              <div className="be-action-panel-inner">
                <div className="be-action-section-title">Actions</div>

                <button
                  className="btn btn-primary be-full-btn"
                  onClick={handleSaveDraft}
                  title="Save draft (⌘S)"
                >
                  <Icons.Save /> Save Draft
                  <span className="be-kbd-badge"><span className="kbd">⌘S</span></span>
                </button>

                <button
                  className="btn btn-secondary be-full-btn"
                  onClick={handleCopy}
                  title="Copy all (⌘⇧C)"
                >
                  <Icons.Copy /> Copy All
                  <span className="be-kbd-badge"><span className="kbd">⌘⇧C</span></span>
                </button>

                <button
                  className="btn btn-outline be-full-btn"
                  onClick={handlePublish}
                >
                  <Icons.Send /> Publish →
                </button>

                <div className="be-action-divider" />

                <button
                  className="btn btn-ghost be-full-btn"
                  onClick={() => setHistoryOpen(true)}
                >
                  <Icons.History /> Version History
                  {versions.length > 0 && <span className="nav-item-badge">{versions.length}</span>}
                </button>

                <button
                  className="btn btn-ghost be-full-btn"
                  onClick={handleReset}
                >
                  <Icons.RotateCcw /> Generate Another
                </button>

                <div className="be-action-divider" />

                {/* SEO score card */}
                <div className="be-seo-card">
                  <div className="be-seo-ring" style={{ '--seo-pct': `${(output.seoScore / 100) * 251}px` }}>
                    <span className="be-seo-val">{output.seoScore}</span>
                    <span className="be-seo-unit">/100</span>
                  </div>
                  <div className="be-seo-label">SEO Score</div>
                  <div className="be-seo-desc">
                    {output.seoScore >= 90 ? '🟢 Excellent' : output.seoScore >= 75 ? '🟡 Good' : '🔴 Needs work'}
                  </div>
                </div>

                <div className="be-action-section-title" style={{ marginTop: 'var(--space-4)' }}>Shortcuts</div>
                <div className="be-shortcut-list">
                  <div className="be-shortcut"><span><span className="kbd">⌘</span><span className="kbd">S</span></span> Save draft</div>
                  <div className="be-shortcut"><span><span className="kbd">⌘</span><span className="kbd">⇧</span><span className="kbd">C</span></span> Copy</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogEditor;
