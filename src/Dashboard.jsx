import React, { useEffect, useState, useRef } from 'react';
import {
  Home, Plus, FileText, Calendar, Network, Search, Key, Target,
  UploadCloud, Link as LinkIcon, List, BarChart3, TrendingUp, PieChart,
  Settings, Users, CreditCard, Sparkles, MoreVertical, LogOut, Mic, MicOff
} from 'lucide-react';
import './Dashboard.css';
import './BlogEditor.css';
import { publishBlog } from './utils/publishBlog';
import { fetchUserBlogs, createBlog, updateBlog, deleteBlog, saveCredentials, fetchCredentials, verifyAndClaimCredential } from './utils/blogStorage';
import BlogEditor from './BlogEditor';
import { useAuth } from './AuthContext';
import { callGemini } from './utils/gemini';
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { initializeRazorpayPayment } from './utils/razorpay';

const MyBlogsSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalBlog, setModalBlog] = useState(null);

  const loadMyBlogs = () => {
    let saved = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
    setBlogs(saved);
  };

  useEffect(() => {
    loadMyBlogs();
    window.loadMyBlogs = loadMyBlogs;
    return () => {
      if (window.loadMyBlogs === loadMyBlogs) {
        delete window.loadMyBlogs;
      }
    };
  }, []);

  const copyBlogFromModal = (blog, e) => {
    const text = blog.title + '\n\n' + blog.metaDescription + '\n\n' + blog.body;
    navigator.clipboard.writeText(text).then(() => {
      const btn = e.target;
      const oldText = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.style.color = '#10B981';
      setTimeout(() => { btn.textContent = oldText; btn.style.color = 'var(--text-muted)'; }, 2000);
    });
  };

  const filteredBlogs = blogs.filter(b => {
    const matchSearch = String(b.title || '').toLowerCase().includes(search.toLowerCase()) || String(b.keyword || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || b.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div id="dash-myblogs" className="dash-section" style={{ display: 'none', padding: '40px', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>My Blogs</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>All your generated and saved blog posts</p>
        </div>
        <button onClick={() => window.showDashboardSection && window.showDashboardSection('newblog')} style={{ background: 'var(--color-accent-gradient)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>+ New Blog</button>
      </div>

      {/* Filter/Search */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <input type="text" placeholder="Search blogs..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: '200px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '10px 16px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none' }} />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '10px 16px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', cursor: 'pointer' }}>
          <option value="all">All Status</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-surface)' }}>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>TITLE</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>SEO SCORE</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>STATUS</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>DATE</th>
              <th style={{ textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No blogs found. {blogs.length === 0 ? <span style={{ color: 'var(--color-accent)', cursor: 'pointer' }} onClick={() => window.showDashboardSection && window.showDashboardSection('newblog')}>Generate your first blog →</span> : ''}
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => {
                const scoreColor = blog.seoScore >= 90 ? 'var(--color-success-500)' : blog.seoScore >= 75 ? 'var(--color-warning-500)' : 'var(--color-error-500)';
                const statusStyle = blog.status === 'published' ? { background: 'var(--color-success-border)', color: 'var(--color-success-500)' } : blog.status === 'scheduled' ? { background: 'var(--color-warning-border)', color: 'var(--color-warning-500)' } : { background: 'var(--bg-card-hover)', color: 'var(--text-muted)' };
                const displayDate = blog.status === 'scheduled' ? (blog.scheduledAt || blog.createdAt) : blog.createdAt;
                const date = displayDate ? new Date(displayDate).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No date';
                return (
                  <tr key={blog.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--color-bg-hover)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td onClick={() => setModalBlog(blog)} style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500, maxWidth: '280px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {blog.title}
                    </td>
                    <td style={{ padding: '14px 20px' }}><span style={{ color: scoreColor, fontWeight: 700, fontSize: '14px' }}>● {blog.seoScore}/100</span></td>
                    <td style={{ padding: '14px 20px' }}><span style={{ ...statusStyle, borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 600 }}>{String(blog.status).charAt(0).toUpperCase() + String(blog.status).slice(1)}</span></td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>{date}</td>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => window.viewBlog && window.viewBlog(blog.id)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--color-accent-border)', color: 'var(--color-accent)', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}>View</button>
                        <button onClick={() => window.showPublishModal && window.showPublishModal(blog.id)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--color-success-border)', color: 'var(--color-success-500)', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}>Publish</button>
                        <button onClick={() => window.confirmDeleteBlog && window.confirmDeleteBlog(blog.id)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--color-danger-border)', color: 'var(--color-danger-500)', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalBlog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, overflowY: 'auto', padding: '40px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '800px', width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '32px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <button onClick={() => setModalBlog(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{modalBlog.title}</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px', border: '1px solid var(--border-default)' }}>{modalBlog.metaDescription}</p>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <span style={{ background: 'var(--color-success-border)', color: 'var(--color-success-500)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}>SEO: {modalBlog.seoScore}/100</span>
              <span style={{ background: 'rgba(124,58,237,0.1)', color: '#A78BFA', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600 }}>🔑 {modalBlog.keyword}</span>
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto', paddingRight: '12px', borderTop: '1px solid var(--border-default)', paddingTop: '20px' }}>{modalBlog.body}</div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={(e) => copyBlogFromModal(modalBlog, e)} style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', borderRadius: '10px', padding: '12px', fontSize: '14px', cursor: 'pointer', fontWeight: 600 }}>Copy Content</button>
              <button onClick={() => setModalBlog(null)} style={{ flex: 1, background: 'var(--color-accent-gradient)', border: 'none', color: 'white', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// NewBlogSection replaced by BlogEditor component (see BlogEditor.jsx)
// BlogEditor is rendered directly in the Dashboard JSX below


const VoiceToBlogSection = () => {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [seoResult, setSeoResult] = useState(null);
  const [seoError, setSeoError] = useState(null);
  const [saveStatus, setSaveStatus] = useState('');
  const [savedBlogId, setSavedBlogId] = useState(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef('');

  const wordCount = (transcript + ' ' + interimText).trim().split(/\s+/).filter(w => w).length;

  const startRecording = () => {
    if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      alert('Sorry, your browser does not support speech recognition. Please use Chrome or Edge.');
      return;
    }
    if (!title.trim()) {
      const el = document.getElementById('vtb-title-input');
      if (el) { el.style.borderColor = '#EF4444'; el.focus(); }
      return;
    }
    setSeoResult(null);
    setSeoError(null);
    setSaveStatus('');
    setSavedBlogId(null);
    setTranscript('');
    setInterimText('');
    transcriptRef.current = '';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += text + ' ';
        } else {
          interimTranscript += text;
        }
      }
      if (finalTranscript) {
        transcriptRef.current += finalTranscript;
        setTranscript(transcriptRef.current);
      }
      setInterimText(interimTranscript);
    };

    recognition.onerror = (event) => {
      if (event.error !== 'aborted') {
        setSeoError('Microphone error: ' + event.error);
        setIsRecording(false);
        setInterimText('');
      }
    };

    recognition.onend = () => {
      if (isRecording) {
        // Auto-restart if still supposed to be recording (browser timeout)
        try { recognition.start(); } catch (e) { }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    setIsRecording(false);
    setInterimText('');
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
      recognitionRef.current = null;
    }
    // After stopping, auto-trigger SEO analysis if there's content
    const finalText = transcriptRef.current.trim();
    if (finalText) {
      setTimeout(() => runSeoAnalysis(finalText), 400);
    }
  };
  const resetToDefault = () => {
    if (isRecording) stopRecording();
    setTitle('');
    setTranscript('');
    setInterimText('');
    setSeoResult(null);
    setSeoError(null);
    setSaveStatus('');
    setSavedBlogId(null);
    transcriptRef.current = '';
    const titleEl = document.getElementById('vtb-title-input');
    if (titleEl) titleEl.style.borderColor = 'var(--border-default)';
  };

  const runSeoAnalysis = async (text) => {
    setIsAnalyzing(true);
    setSeoResult(null);
    setSeoError(null);

    // Compute metrics locally — do NOT send raw transcript to Gemini
    const words = text.trim().split(/\s+/).filter(w => w);
    const wordCount = words.length;
    const sentenceCount = (text.match(/[.!?]+/g) || []).length || 1;
    const avgSentLen = Math.round(wordCount / sentenceCount);
    const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))).size;
    const vocabRichness = Math.round((uniqueWords / Math.max(wordCount, 1)) * 100);
    const safeTitle = title.trim().replace(/[^\w\s-]/g, ' ').substring(0, 100);

    // Tiny prompt — only metadata, no transcript content
    const prompt = `SEO audit for a voice-recorded blog post. Return compact JSON only, no extra text.

Title: ${safeTitle}
Word count: ${wordCount}
Avg sentence length: ${avgSentLen} words
Vocabulary richness: ${vocabRichness}%

JSON schema (all numbers 0-100, recommendations max 60 chars each):
{"overallScore":0,"titleOptimization":0,"contentDepth":0,"readabilityScore":0,"keywordDensityScore":0,"snippetEligibility":0,"aiDetectionRisk":0,"suggestedKeyword":"","rec1":"","rec2":"","rec3":""}`;

    try {
      const raw = await callGemini(prompt, 600);

      // Robust JSON repair before parsing
      const repairJSON = (str) => {
        // Strip markdown fences
        let s = str.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        // Extract {...} block
        const m = s.match(/\{[\s\S]*\}/);
        s = m ? m[0] : s;
        // Remove literal control chars inside strings (newlines, tabs)
        s = s.replace(/[\x00-\x1F\x7F]/g, ' ');
        // Try to close an unterminated string by finding unmatched "
        // Count unescaped quotes to detect odd count
        const quoteCount = (s.match(/(?<!\\)"/g) || []).length;
        if (quoteCount % 2 !== 0) s = s + '"';
        // Try to close unterminated array/object
        const opens = (s.match(/[\[{]/g) || []).length;
        const closes = (s.match(/[\]\}]/g) || []).length;
        for (let i = closes; i < opens; i++) s = s + (s.lastIndexOf('[') > s.lastIndexOf('{') ? ']' : '}');
        return s;
      };

      const jsonStr = repairJSON(raw);
      const res = JSON.parse(jsonStr);

      // Normalise flat rec1/rec2/rec3 → recommendations array
      if (!res.recommendations) {
        res.recommendations = [res.rec1, res.rec2, res.rec3].filter(Boolean);
        delete res.rec1; delete res.rec2; delete res.rec3;
      }
      setSeoResult(res);
    } catch (err) {
      setSeoError('SEO analysis failed: ' + err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    const body = transcriptRef.current.trim();
    if (!body || !title.trim()) return;
    setSaveStatus('Saving...');
    const blogData = {
      id: Date.now().toString(),
      title: title.trim(),
      keyword: seoResult?.suggestedKeyword || '',
      body,
      metaDescription: body.substring(0, 160),
      seoScore: seoResult?.overallScore || 0,
      status: 'draft',
      source: 'voice',
      createdAt: new Date().toISOString()
    };
    // Save to localStorage
    const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
    blogs.unshift(blogData);
    localStorage.setItem('bf_blogs', JSON.stringify(blogs));
    // Save to Firestore
    if (uid) {
      try { await createBlog(uid, blogData); } catch (e) { console.error(e); }
    }
    setSavedBlogId(blogData.id);
    setSaveStatus('✓ Saved as draft!');
    if (window.loadMyBlogs) window.loadMyBlogs();
    if (window.updateOverviewStats) window.updateOverviewStats();
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const handlePublish = async () => {
    const body = transcriptRef.current.trim();
    if (!body || !title.trim()) return;
    // Save first if not already saved
    if (!savedBlogId) {
      const blogData = {
        id: Date.now().toString(),
        title: title.trim(),
        keyword: seoResult?.suggestedKeyword || '',
        body,
        metaDescription: body.substring(0, 160),
        seoScore: seoResult?.overallScore || 0,
        status: 'draft',
        source: 'voice',
        createdAt: new Date().toISOString()
      };
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      blogs.unshift(blogData);
      localStorage.setItem('bf_blogs', JSON.stringify(blogs));
      if (uid) {
        try { await createBlog(uid, blogData); } catch (e) { console.error(e); }
      }
      setSavedBlogId(blogData.id);
      if (window.loadMyBlogs) window.loadMyBlogs();
      if (window.updateOverviewStats) window.updateOverviewStats();
      if (window.showPublishModal) window.showPublishModal(blogData.id);
    } else {
      if (window.showPublishModal) window.showPublishModal(savedBlogId);
    }
  };

  const sc = (s) => s >= 85 ? '#10B981' : s >= 65 ? '#F59E0B' : '#EF4444';
  const seoMetrics = seoResult ? [
    { label: 'Title Optimization', key: 'titleOptimization', icon: '📌' },
    { label: 'Content Depth', key: 'contentDepth', icon: '📖' },
    { label: 'Readability', key: 'readabilityScore', icon: '👁️' },
    { label: 'Keyword Density', key: 'keywordDensityScore', icon: '🔑' },
    { label: 'Snippet Eligibility', key: 'snippetEligibility', icon: '⭐' },
    { label: 'Human-like Score', key: 'aiDetectionRisk', icon: '🤖' },
  ] : [];

  return (
    <div id="dash-voicetoblog" className="dash-section" style={{ display: 'none', padding: '40px', color: 'var(--text-primary)' }}>
      <style>{`
        @keyframes voicePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.12); opacity: 0.8; }
        }
        @keyframes waveBar {
          0%, 100% { height: 6px; }
          50% { height: 22px; }
        }
        .vtb-wave-bar { display: inline-block; width: 4px; background: #A78BFA; border-radius: 2px; margin: 0 2px; animation: waveBar 0.7s ease-in-out infinite; }
        .vtb-wave-bar:nth-child(2) { animation-delay: 0.1s; }
        .vtb-wave-bar:nth-child(3) { animation-delay: 0.2s; }
        .vtb-wave-bar:nth-child(4) { animation-delay: 0.3s; }
        .vtb-wave-bar:nth-child(5) { animation-delay: 0.15s; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', padding: '8px', borderRadius: '12px', display: 'flex' }}><Mic size={22} color="white" /></span>
            Voice to Blog
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '6px' }}>Speak your ideas — we'll transcribe, analyze SEO, and save your blog instantly.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* LEFT COLUMN */}
        <div>
          {/* Title Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>Blog Title *</label>
            <input
              id="vtb-title-input"
              type="text"
              placeholder="Enter your blog title before recording..."
              value={title}
              onChange={e => { setTitle(e.target.value); e.target.style.borderColor = 'var(--border-default)'; }}
              disabled={isRecording}
              style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '14px 16px', color: 'var(--text-primary)', fontSize: '15px', outline: 'none', boxSizing: 'border-box', fontWeight: 500, opacity: isRecording ? 0.6 : 1 }}
              onFocus={e => e.target.style.borderColor = '#7C3AED'}
              onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
            />
          </div>

          {/* Recording Controls */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '28px', marginBottom: '20px', textAlign: 'center' }}>
            {!isRecording ? (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 0 0 0 rgba(124,58,237,0)' }}
                    onClick={startRecording}
                    onMouseOver={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 0 8px rgba(124,58,237,0.15)'; }}
                    onMouseOut={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 0 0 rgba(124,58,237,0)'; }}
                  >
                    <Mic size={28} color="white" />
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>{transcript ? 'Click to continue recording' : 'Click the mic to start recording'}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={startRecording} style={{ background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 28px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseOver={e => e.target.style.opacity = '0.9'} onMouseOut={e => e.target.style.opacity = '1'}>
                    <Mic size={18} /> {transcript ? 'Resume' : 'Start'}
                  </button>
                  <button onClick={resetToDefault} style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '12px 20px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onMouseOver={e => e.target.style.background = 'var(--bg-card-hover)'} onMouseOut={e => e.target.style.background = 'var(--bg-elevated)'}>
                    <Plus size={18} style={{ transform: 'rotate(45deg)' }} /> Reset
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#EF4444,#DC2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', animation: 'voicePulse 1.5s ease-in-out infinite', boxShadow: '0 0 0 12px rgba(239,68,68,0.15)' }}>
                    <MicOff size={28} color="white" />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', height: '28px', marginBottom: '8px' }}>
                    <span className="vtb-wave-bar" /><span className="vtb-wave-bar" /><span className="vtb-wave-bar" /><span className="vtb-wave-bar" /><span className="vtb-wave-bar" />
                  </div>
                  <p style={{ fontSize: '13px', color: '#EF4444', fontWeight: 600, margin: 0 }}>● Recording in progress...</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>{wordCount} words captured</p>
                </div>
                <button onClick={stopRecording} style={{ background: 'rgba(239,68,68,0.15)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 32px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                  onMouseOver={e => { e.target.style.background = 'rgba(239,68,68,0.25)'; }} onMouseOut={e => { e.target.style.background = 'rgba(239,68,68,0.15)'; }}>
                  <MicOff size={18} /> Stop Recording
                </button>
              </div>
            )}
          </div>

          {/* Live Transcript */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📝 Live Transcript</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{wordCount} words</span>
            </div>
            <div style={{ padding: '20px', minHeight: '200px', maxHeight: '320px', overflowY: 'auto' }}>
              {!transcript && !interimText ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎤</div>
                  <div style={{ fontSize: '14px' }}>Your spoken words will appear here in real-time...</div>
                </div>
              ) : (
                <div style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{transcript}</span>
                  {interimText && <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{interimText}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — SEO Results */}
        <div>
          {/* SEO Analysis Panel */}
          {(isAnalyzing || seoResult || seoError) ? (
            <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-default)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📊 SEO Analysis</h3>
              </div>
              <div style={{ padding: '24px' }}>
                {isAnalyzing && (
                  <div style={{ textAlign: 'center', padding: '32px 0' }}>
                    <div style={{ width: '44px', height: '44px', border: '3px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }} />
                    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Analyzing SEO for your spoken content...</div>
                  </div>
                )}
                {seoError && (
                  <div style={{ color: '#EF4444', fontSize: '14px', padding: '16px', background: 'rgba(239,68,68,0.1)', borderRadius: '10px' }}>❌ {seoError}</div>
                )}
                {seoResult && !isAnalyzing && (
                  <div>
                    {/* Score Ring */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-default)' }}>
                      <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: `conic-gradient(${sc(seoResult.overallScore)} 0% ${seoResult.overallScore}%, var(--border-default) ${seoResult.overallScore}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: '68px', height: '68px', background: 'var(--bg-surface)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{seoResult.overallScore}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span>
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                          {seoResult.overallScore >= 90 ? '🏆 Excellent' : seoResult.overallScore >= 80 ? '✅ Great' : seoResult.overallScore >= 70 ? '👍 Good' : seoResult.overallScore >= 55 ? '⚠️ Needs Work' : '❌ Poor'}
                        </div>
                        {seoResult.suggestedKeyword && (
                          <div style={{ fontSize: '12px', color: '#A78BFA', background: 'rgba(124,58,237,0.1)', padding: '4px 10px', borderRadius: '999px', display: 'inline-block' }}>🔑 {seoResult.suggestedKeyword}</div>
                        )}
                      </div>
                    </div>

                    {/* Metric Bars */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                      {seoMetrics.map((m, i) => (
                        <div key={i} style={{ background: 'var(--bg-elevated)', borderRadius: '10px', padding: '12px 14px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.icon} {m.label}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: sc(seoResult[m.key]) }}>{seoResult[m.key]}</span>
                          </div>
                          <div style={{ background: 'var(--bg-surface)', borderRadius: '999px', height: '4px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: sc(seoResult[m.key]), width: seoResult[m.key] + '%', borderRadius: '999px' }} />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Recommendations */}
                    <div style={{ background: 'var(--bg-base)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>💡 Recommendations</h4>
                      {seoResult.recommendations.map((r, i) => (
                        <div key={i} style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '7px 0', borderBottom: i < seoResult.recommendations.length - 1 ? '1px solid var(--border-default)' : 'none', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <span style={{ color: '#7C3AED', flexShrink: 0 }}>→</span>{r}
                        </div>
                      ))}
                    </div>

                    {/* Save / Publish Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button onClick={handleSave} style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border-strong)', color: 'var(--text-muted)', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.color = '#A78BFA'; }}
                        onMouseOut={e => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.color = 'var(--text-muted)'; }}>
                        💾 Save as Draft
                      </button>
                      <button onClick={handlePublish} style={{ flex: 1, background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                        onMouseOver={e => e.target.style.opacity = '0.9'} onMouseOut={e => e.target.style.opacity = '1'}>
                        🚀 Publish
                      </button>
                    </div>
                    {saveStatus && (
                      <div style={{ marginTop: '12px', fontSize: '13px', color: '#10B981', textAlign: 'center', fontWeight: 500 }}>{saveStatus}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Placeholder before recording */
            <div style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-default)', borderRadius: '16px', padding: '60px 32px', textAlign: 'center', color: 'var(--text-muted)', marginBottom: '20px' }}>
              <div style={{ fontSize: '52px', marginBottom: '16px' }}>🎙️</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#64748B', marginBottom: '8px' }}>SEO Analysis Awaits</div>
              <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.6 }}>Enter a title, start speaking, and click <strong style={{ color: '#94A3B8' }}>End Recording</strong> to get your instant SEO score and recommendations.</div>
            </div>
          )}

          {/* Tips Card */}
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '20px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: '#A78BFA', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>✨ Tips for Better Voice Blogs</h4>
            {[
              'Speak naturally — the AI handles formatting.',
              'Start with your main point, then elaborate.',
              'Mention your target keyword naturally 2-3 times.',
              'Aim for 300+ words for better SEO depth.',
              'Pause briefly between sentences for accuracy.',
            ].map((tip, i) => (
              <div key={i} style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '6px 0', borderBottom: i < 4 ? '1px solid var(--border-default)' : 'none', display: 'flex', gap: '8px' }}>
                <span style={{ color: '#7C3AED', flexShrink: 0 }}>•</span>{tip}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};



const SerpGapSection = () => {
  const [keyword, setKeyword] = useState('');
  const [domain, setDomain] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const runSerpScan = async () => {
    if (!keyword.trim()) {
      const el = document.getElementById('serp-keyword');
      if (el) el.style.borderColor = '#EF4444';
      return;
    }

    setIsScanning(true);
    setError(null);
    setResults(null);

    const prompt = `You are a senior SEO strategist analyzing SERP data for Indian digital marketers.

For the keyword "${keyword.trim()}"${domain.trim() ? ' and website "' + domain.trim() + '"' : ''}, provide a detailed SERP gap analysis.

Return ONLY a valid JSON object with exactly this structure, no explanation:
{
  "keyword": "${keyword.trim()}",
  "searchVolume": "estimated monthly searches as string e.g. 8,100/mo",
  "difficulty": "Easy or Medium or Hard",
  "topicGaps": [
    { "topic": "specific gap topic", "coverage": "Low or Medium", "opportunity": "High or Medium", "suggestedTitle": "ready to use blog title" },
    { "topic": "...", "coverage": "...", "opportunity": "...", "suggestedTitle": "..." },
    { "topic": "...", "coverage": "...", "opportunity": "...", "suggestedTitle": "..." },
    { "topic": "...", "coverage": "...", "opportunity": "...", "suggestedTitle": "..." },
    { "topic": "...", "coverage": "...", "opportunity": "...", "suggestedTitle": "..." }
  ],
  "featuredSnippetOpportunities": ["opportunity 1", "opportunity 2", "opportunity 3"],
  "recommendedLSI": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"]
}`;

    try {
      const raw = await callGemini(prompt, 1500);
      const res = JSON.parse(raw);
      setResults(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const useGapTopic = (title) => {
    if (window.showDashboardSection) window.showDashboardSection('newblog');
    setTimeout(() => {
      const kwInput = document.getElementById('bf-keyword');
      if (kwInput) {
        kwInput.value = title;
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(kwInput, title);
          kwInput.dispatchEvent(new Event('input', { bubbles: true }));
        }
        kwInput.focus();
      }
    }, 150);
  };

  const opColor = op => op === 'High' ? '#10B981' : '#F59E0B';
  const covColor = cov => cov === 'Low' ? '#10B981' : '#F59E0B';
  const diffColor = d => d === 'Easy' ? '#10B981' : d === 'Medium' ? '#F59E0B' : '#EF4444';

  return (
    <div id="dash-serpgap" className="dash-section" style={{ display: 'none', padding: '40px', color: 'var(--text-primary)' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>SERP Gap Scanner</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Find content gaps your competitors aren't covering</p>
      </div>

      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '28px', marginBottom: '24px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>Target Keyword *</label>
          <input id="serp-keyword" type="text" placeholder="e.g. project management tools India"
            value={keyword} onChange={e => { setKeyword(e.target.value); e.target.style.borderColor = 'var(--border-default)'; }}
            style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#7C3AED'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>Your Domain (optional)</label>
          <input id="serp-domain" type="text" placeholder="e.g. myblog.com"
            value={domain} onChange={e => setDomain(e.target.value)}
            style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
            onFocus={e => e.target.style.borderColor = '#7C3AED'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
          />
        </div>
        <button onClick={runSerpScan} id="serp-btn" disabled={isScanning}
          style={{ width: '100%', background: 'var(--color-accent-gradient)', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: isScanning ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: isScanning ? 0.7 : 1, boxShadow: 'var(--shadow-glow-primary)' }}
          onMouseOver={e => !isScanning && (e.target.style.opacity = '0.9')} onMouseOut={e => !isScanning && (e.target.style.opacity = '1')}>
          {isScanning ? '⏳ Scanning SERP...' : results ? '🔍 Scan Again' : '🔍 Scan SERP Gaps'}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '20px', color: '#EF4444', fontSize: '14px', marginBottom: '24px' }}>
          ❌ Error: {error}
        </div>
      )}

      {results && (
        <div id="serp-results">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Search Volume</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#A78BFA' }}>{results.searchVolume}</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Difficulty</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: diffColor(results.difficulty) }}>{results.difficulty}</div>
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gaps Found</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#06B6D4' }}>{results.topicGaps.length}</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-default)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>📊 Content Gap Opportunities</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-surface)' }}>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.5px' }}>TOPIC GAP</th>
                    <th style={{ padding: '12px 20px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>COVERAGE</th>
                    <th style={{ padding: '12px 20px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textAlign: 'center' }}>OPPORTUNITY</th>
                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>SUGGESTED TITLE</th>
                    <th style={{ padding: '12px 20px', fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {results.topicGaps.map((gap, i) => (
                    <tr key={i} style={{ borderTop: '1px solid var(--border-default)', transition: 'background 0.15s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(124,58,237,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '14px 20px', fontSize: '14px', color: 'var(--text-primary)', fontWeight: 500 }}>{gap.topic}</td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}><span style={{ background: 'rgba(16,185,129,0.1)', color: covColor(gap.coverage), borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: 600 }}>{gap.coverage}</span></td>
                      <td style={{ padding: '14px 20px', textAlign: 'center' }}><span style={{ background: 'rgba(16,185,129,0.1)', color: opColor(gap.opportunity), borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: 600 }}>{gap.opportunity}</span></td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '250px' }}>{gap.suggestedTitle}</td>
                      <td style={{ padding: '14px 20px' }}><button onClick={() => useGapTopic(gap.suggestedTitle)} style={{ background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s' }}>Write This →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px' }}>⭐ Featured Snippet Opportunities</h4>
              {results.featuredSnippetOpportunities.map((s, i) => (
                <div key={i} style={{ fontSize: '13px', color: 'var(--text-secondary)', padding: '8px 0', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}><span style={{ color: '#7C3AED', flexShrink: 0, marginTop: '1px' }}>✦</span>{s}</div>
              ))}
            </div>
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px' }}>🔑 Recommended LSI Keywords</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {results.recommendedLSI.map((k, i) => (
                  <span key={i} style={{ background: 'rgba(124,58,237,0.1)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', padding: '5px 14px', fontSize: '12px', fontWeight: 500 }}>{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SeoScoresSection = () => {
  const [keyword, setKeyword] = useState('');
  const [content, setContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scores, setScores] = useState(null);
  const [error, setError] = useState(null);
  const wordCount = content.trim().split(/\s+/).filter(w => w).length;

  const runSeoScore = async () => {
    let hasErr = false;
    if (!content.trim()) { document.getElementById('seo-content-input').style.borderColor = '#EF4444'; hasErr = true; }
    if (!keyword.trim()) { document.getElementById('seo-target-kw').style.borderColor = '#EF4444'; hasErr = true; }
    if (hasErr) return;

    setIsAnalyzing(true);
    setScores(null);
    setError(null);

    const escapedKeyword = keyword.trim().toLowerCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const kwCount = (content.toLowerCase().match(new RegExp(`\\b${escapedKeyword}\\b`, 'g')) ||
      content.toLowerCase().match(new RegExp(escapedKeyword, 'g')) || []).length;
    const kwDensity = wordCount > 0 ? ((kwCount / wordCount) * 100).toFixed(2) : 0;

    const prompt = `You are an expert SEO auditor specializing in high-performance content for Indian and global markets. 
Analyze the provided blog content against modern SEO standards (Google E-E-A-T, NLP entities, and semantic relevance).

Target keyword: "${keyword.trim()}"
Word count: ${wordCount}
Keyword density: ${kwDensity}%
Full Content (clipped if too long): ${content.substring(0, 6000)}

Return ONLY a valid JSON object with detailed scoring (0-100):
{
  "overallScore": <integer>,
  "titleOptimization": <integer 0-100 based on keyword placement and CTR appeal>,
  "metaDescription": <integer 0-100 based on CTA and length optimization>,
  "keywordDensityScore": <integer 0-100 based on natural integration vs keyword stuffing>,
  "contentDepth": <integer 0-100 based on topic coverage and depth of research>,
  "readabilityScore": <integer 0-100 based on sentence complexity and flow>,
  "internalLinks": <integer 0-100 based on contextually relevant linking opportunities found>,
  "snippetEligibility": <integer 0-100 based on lists, tables, and direct answer formatting>,
  "aiDetectionRisk": <integer 0-100 (100 means very safe/human-like, 0 means robotic)>,
  "nlpEntities": <integer 0-100 based on the presence of related LSI keywords and entities>,
  "schemaMarkup": <integer 0-100 based on structured data potential>,
  "fleschScore": <integer 0-100 (Flesch-Kincaid Reading Ease equivalent balance)>,
  "recommendations": [
    "actionable recommendation for title/meta",
    "recommendation for content structure/headings",
    "specific LSI keyword or entity to add",
    "formatting tip for featured snippets",
    "internal link or CTA suggestion"
  ]
}`;

    try {
      const raw = await callGemini(prompt, 1000);
      const res = JSON.parse(raw);
      setScores({ ...res, kwDensity });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sc = s => s >= 85 ? '#10B981' : s >= 65 ? '#F59E0B' : '#EF4444';
  const metrics = [
    { label: 'Title Optimization', key: 'titleOptimization', icon: '📌' },
    { label: 'Meta Description', key: 'metaDescription', icon: '📝' },
    { label: 'Keyword Density', key: 'keywordDensityScore', icon: '🔑' },
    { label: 'Content Depth', key: 'contentDepth', icon: '📖' },
    { label: 'Readability', key: 'readabilityScore', icon: '👁️' },
    { label: 'Internal Links', key: 'internalLinks', icon: '🔗' },
    { label: 'Snippet Eligibility', key: 'snippetEligibility', icon: '⭐' },
    { label: 'AI Detection Safety', key: 'aiDetectionRisk', icon: '🤖' },
    { label: 'NLP Entities', key: 'nlpEntities', icon: '🧠' },
    { label: 'Schema Markup', key: 'schemaMarkup', icon: '🏷️' }
  ];

  return (
    <div id="dash-seoscores" className="dash-section" style={{ display: 'none', padding: '40px', color: 'var(--text-primary)' }}>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Live SEO Scorer</h2>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Paste any content and get an instant 10-metric SEO analysis</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>Target Keyword *</label>
            <input id="seo-target-kw" type="text" placeholder="e.g. AI tools for startups"
              value={keyword} onChange={e => { setKeyword(e.target.value); e.target.style.borderColor = 'var(--border-default)'; }}
              style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#7C3AED'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>Blog Content *</label>
            <textarea id="seo-content-input" rows="12" placeholder="Paste your full blog content here..."
              value={content} onChange={e => { setContent(e.target.value); e.target.style.borderColor = 'var(--border-default)'; }}
              style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '12px 16px', color: 'var(--text-primary)', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
              onFocus={e => e.target.style.borderColor = '#7C3AED'} onBlur={e => e.target.style.borderColor = 'var(--border-default)'}
            ></textarea>
          </div>
          <div id="seo-word-count" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>{wordCount.toLocaleString()} words</div>
          <button onClick={runSeoScore} id="seo-score-btn" disabled={isAnalyzing}
            style={{ width: '100%', background: 'var(--color-accent-gradient)', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: isAnalyzing ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: isAnalyzing ? 0.7 : 1, boxShadow: 'var(--shadow-glow-primary)' }}
            onMouseOver={e => !isAnalyzing && (e.target.style.opacity = '0.9')} onMouseOut={e => !isAnalyzing && (e.target.style.opacity = '1')}>
            {isAnalyzing ? '⏳ Analyzing...' : scores ? '📊 Analyze Again' : '📊 Analyze SEO Score'}
          </button>
        </div>

        <div id="seo-score-results">
          {isAnalyzing && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', border: '3px solid var(--color-primary-500)', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Running 10-metric analysis...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!isAnalyzing && !scores && !error && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-muted)' }}>Score will appear here</div>
              <div style={{ fontSize: '13px', marginTop: '8px', color: 'var(--text-muted)' }}>Paste content and click Analyze</div>
            </div>
          )}

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '20px', color: '#EF4444', fontSize: '14px' }}>
              ❌ Error: {error}
            </div>
          )}

          {scores && (
            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-default)' }}>
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: `conic-gradient(${sc(scores.overallScore)} 0% ${scores.overallScore}%, var(--border-default) ${scores.overallScore}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative' }}>
                  <div style={{ width: '76px', height: '76px', background: 'var(--bg-surface)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{scores.overallScore}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>/100</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {scores.overallScore >= 90 ? '🏆 Excellent' : scores.overallScore >= 80 ? '✅ Great' : scores.overallScore >= 70 ? '👍 Good' : scores.overallScore >= 55 ? '⚠️ Needs Work' : '❌ Poor'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>Keyword: <span style={{ color: '#A78BFA' }}>{keyword}</span><br />
                    {wordCount.toLocaleString()} words · Density: {scores.kwDensity}% · Flesch: {scores.fleschScore || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {metrics.map((m, i) => (
                  <div key={i} style={{ background: 'var(--bg-surface)', borderRadius: '10px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{m.icon} {m.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: sc(scores[m.key]) }}>{scores[m.key]}</span>
                    </div>
                    <div style={{ background: 'var(--bg-base)', borderRadius: '999px', height: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: sc(scores[m.key]), width: scores[m.key] + '%', borderRadius: '999px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ background: 'var(--bg-surface)', borderRadius: '12px', padding: '18px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px' }}>💡 Recommendations</h4>
                {scores.recommendations.map((r, i) => (
                  <div key={i} style={{ fontSize: '13px', color: 'var(--text-muted)', padding: '8px 0', borderBottom: '1px solid var(--border-default)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}><span style={{ color: '#7C3AED', flexShrink: 0 }}>→</span>{r}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const RoidashboardSection = () => {
  return (
    <div id="dash-roi" className="dash-section" style={{ display: 'none', padding: '40px', color: 'var(--text-primary)' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>ROI & Reports</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Track your content performance and organic growth</p>
        </div>
        <button onClick={(e) => window.generateReport && window.generateReport(e)} style={{ background: 'var(--color-accent-gradient)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          ⚡ Generate AI Report
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '28px' }}>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Total Blogs</div>
          <div id="roi-total-blogs" style={{ fontSize: '32px', fontWeight: '700', color: 'var(--text-primary)' }}>0</div>
        </div>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Avg SEO Score</div>
          <div id="roi-avg-seo" style={{ fontSize: '32px', fontWeight: '700', color: '#06B6D4' }}>—</div>
        </div>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Est. Monthly Traffic</div>
          <div id="roi-traffic" style={{ fontSize: '32px', fontWeight: '700', color: '#10B981' }}>0</div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>visits</div>
        </div>
        <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Content Health</div>
          <div id="roi-health" style={{ fontSize: '32px', fontWeight: '700', color: '#A78BFA' }}>—</div>
        </div>
      </div>

      {/* Performance Table */}
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden', marginBottom: '28px' }}>
        <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>📊 Blog Performance Breakdown</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface)' }}>
                <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '11px', color: '#64748B', fontWeight: '600', letterSpacing: '0.5px' }}>BLOG TITLE</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', color: '#64748B', fontWeight: '600', textAlign: 'center' }}>SEO SCORE</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', color: '#64748B', fontWeight: '600', textAlign: 'center' }}>WORD COUNT</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', color: '#64748B', fontWeight: '600', textAlign: 'center' }}>EST. TRAFFIC</th>
                <th style={{ padding: '12px 20px', fontSize: '11px', color: '#64748B', fontWeight: '600', textAlign: 'center' }}>STATUS</th>
              </tr>
            </thead>
            <tbody id="roi-table-body">
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#4B5563', fontSize: '14px' }}>
                  No blogs yet. <span style={{ color: '#7C3AED', cursor: 'pointer' }} onClick={() => window.showDashboardSection && window.showDashboardSection('newblog')}>Generate your first blog →</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Report Area */}
      <div id="roi-report-area" style={{ display: 'none', background: '#141B2D', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'white', margin: 0 }}>🤖 AI Performance Report</h3>
          <button onClick={(e) => window.copyReport && window.copyReport(e)} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer' }}>Copy Report</button>
        </div>
        <div id="roi-report-content" style={{ fontSize: '14px', color: '#94A3B8', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}></div>
      </div>
    </div>
  );
};






const AutoPublisherSection = () => {
  const { currentUser } = useAuth();
  const [credentials, setCredentials] = useState({});
  const [activeTab, setActiveTab] = useState('wordpress');
  const [saveStatus, setSaveStatus] = useState('');
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    if (currentUser) {
      fetchCredentials(currentUser.uid).then(creds => {
        setCredentials(creds || {});
      });
    }
  }, [currentUser]);

  const updateCred = (platform, field, value) => {
    const updated = {
      ...credentials,
      [platform]: {
        ...(credentials[platform] || {}),
        [field]: value
      }
    };
    setCredentials(updated);
  };

  const handleManualSave = async (e) => {
    e.preventDefault();
    setSaveStatus('Verifying & Saving...');
    setSaveError('');
    
    try {
      let tokenToVerify = '';
      const creds = credentials[activeTab];
      
      if (creds) {
        if (activeTab === 'wordpress') tokenToVerify = `${creds.url}_${creds.username}_${creds.applicationPassword}`;
        else if (activeTab === 'blogger') tokenToVerify = creds.accessToken;
        else if (activeTab === 'devto') tokenToVerify = creds.apiKey;
        else if (activeTab === 'hashnode') tokenToVerify = creds.personalAccessToken;
        else if (activeTab === 'medium') tokenToVerify = creds.integrationToken;
      }
      
      if (tokenToVerify && currentUser) {
        await verifyAndClaimCredential(currentUser.uid, activeTab, tokenToVerify);
      }
      
      if (currentUser) {
        await saveCredentials(currentUser.uid, credentials);
      }
      
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus('');
      setSaveError(err.message || 'Failed to save credentials.');
    }
  };

  const platforms = [
    { id: 'wordpress', name: 'WordPress', icon: '📝' },
    { id: 'blogger', name: 'Blogger', icon: '🅱️' },
    { id: 'devto', name: 'Dev.to', icon: '👩‍💻' },
    { id: 'hashnode', name: 'Hashnode', icon: '🔗' },
    { id: 'medium', name: 'Medium', icon: 'Ⓜ️' }
  ];

  const inputStyle = {
    display: 'block', width: '100%', marginBottom: '16px', padding: '14px 16px',
    background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
    color: 'var(--text-primary)', borderRadius: '10px', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px', fontWeight: 600
  };

  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '32px', maxWidth: '800px' }}>
      <h3 style={{ color: 'var(--text-primary)', fontSize: '22px', marginBottom: '8px', fontWeight: 700 }}>Platform Connections</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '28px' }}>Configure your external blogging platforms to enable one-click publishing.</p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '32px', overflowX: 'auto', paddingBottom: '8px' }}>
        {platforms.map(p => (
          <button
            key={p.id}
            onClick={(e) => { e.preventDefault(); setActiveTab(p.id); }}
            style={{
              background: activeTab === p.id ? 'var(--color-accent-gradient)' : 'var(--bg-surface)',
              color: activeTab === p.id ? 'white' : 'var(--text-muted)',
              border: '1px solid ' + (activeTab === p.id ? 'transparent' : 'var(--border-default)'),
              padding: '12px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            <span>{p.icon}</span> {p.name}
          </button>
        ))}
      </div>

      <div style={{ background: 'var(--bg-base)', padding: '28px', borderRadius: '16px', border: '1px solid var(--border-default)' }}>
        <form onSubmit={handleManualSave}>
          {activeTab === 'wordpress' && (
            <div className="animation-fade-in">
              <label style={labelStyle}>Site URL</label>
              <input value={(credentials.wordpress?.url) || ''} onChange={e => updateCred('wordpress', 'url', e.target.value)} placeholder="https://mysite.com" style={inputStyle} required />

              <label style={labelStyle}>Username</label>
              <input value={(credentials.wordpress?.username) || ''} onChange={e => updateCred('wordpress', 'username', e.target.value)} placeholder="admin" style={inputStyle} required />

              <label style={labelStyle}>Application Password</label>
              <input value={(credentials.wordpress?.applicationPassword) || ''} onChange={e => updateCred('wordpress', 'applicationPassword', e.target.value)} type="password" placeholder="xxxx xxxx xxxx xxxx" style={inputStyle} required />
            </div>
          )}
          {activeTab === 'blogger' && (
            <div className="animation-fade-in">
              <label style={labelStyle}>Blog ID</label>
              <input value={(credentials.blogger?.blogId) || ''} onChange={e => updateCred('blogger', 'blogId', e.target.value)} placeholder="1234567890" style={inputStyle} required />

              <label style={labelStyle}>OAuth Access Token</label>
              <input value={(credentials.blogger?.accessToken) || ''} onChange={e => updateCred('blogger', 'accessToken', e.target.value)} type="password" placeholder="ya29.a0A..." style={inputStyle} required />
            </div>
          )}
          {activeTab === 'devto' && (
            <div className="animation-fade-in">
              <label style={labelStyle}>Dev.to API Key</label>
              <input value={(credentials.devto?.apiKey) || ''} onChange={e => updateCred('devto', 'apiKey', e.target.value)} type="password" placeholder="Your extensions API key" style={inputStyle} required />
            </div>
          )}
          {activeTab === 'hashnode' && (
            <div className="animation-fade-in">
              <label style={labelStyle}>Personal Access Token</label>
              <input value={(credentials.hashnode?.personalAccessToken) || ''} onChange={e => updateCred('hashnode', 'personalAccessToken', e.target.value)} type="password" placeholder="Token from Hashnode Developer settings" style={inputStyle} required />

              <label style={labelStyle}>Publication ID</label>
              <input value={(credentials.hashnode?.publicationId) || ''} onChange={e => updateCred('hashnode', 'publicationId', e.target.value)} placeholder="5fxx..." style={inputStyle} required />
            </div>
          )}
          {activeTab === 'medium' && (
            <div className="animation-fade-in">
              <label style={labelStyle}>Medium Integration Token</label>
              <input value={(credentials.medium?.integrationToken) || ''} onChange={e => updateCred('medium', 'integrationToken', e.target.value)} type="password" placeholder="Get from Medium Settings > Security and apps" style={inputStyle} required />
            </div>
          )}

          {saveError && (
            <div style={{ padding: '12px', background: 'var(--color-danger-100)', color: 'var(--color-danger-500)', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', fontWeight: '500' }}>
              ❌ {saveError}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px' }}>
            <button type="submit" style={{ background: 'var(--color-accent-gradient)', color: 'white', padding: '14px 28px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'all 0.2s', boxShadow: 'var(--shadow-glow-primary)' }}>
              {saveStatus ? saveStatus : 'Save & Connect'}
            </button>
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Keys are verified uniquely and stored securely in the database.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
const planHierarchy = { 'Free': 0, 'Starter': 1, 'Growth': 2, 'Scale': 3 };

const getButtonText = (planName, loadingPlan, userPlan) => {
  if (loadingPlan === planName) return 'Processing...';
  if (userPlan === planName) return 'Current Plan';
  if (planHierarchy[userPlan] > planHierarchy[planName]) return 'Downgrade';
  return 'Upgrade';
};

const isButtonDisabled = (planName, loadingPlan, userPlan) => {
  return loadingPlan === planName || userPlan === planName || planHierarchy[userPlan] > planHierarchy[planName];
};


const Dashboard = ({ onLogout }) => {
  const { currentUser, logOut } = useAuth();
  const uid = currentUser?.uid;
  const displayName = currentUser?.displayName || 'User';
  const firstName = displayName.split(' ')[0];

  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const [userPlan, setUserPlan] = useState('Free');

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().plan) {
            setUserPlan(userDoc.data().plan);
          }
        } catch (error) {
          console.error('Error fetching plan:', error);
        }
      }
    };
    fetchUserPlan();
  }, [currentUser]);

  // Global Publish Modal State
  const [publishModalBlog, setPublishModalBlog] = useState(null);
  const [publishingPlatform, setPublishingPlatform] = useState('wordpress');
  const [publishStatus, setPublishStatus] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const [loadingPlan, setLoadingPlan] = useState(null);

  const handlePlanUpgrade = (planName, amount) => {
    if (!currentUser) return;
    
    setLoadingPlan(planName);
    
    initializeRazorpayPayment({
      planName,
      amount,
      billingCycle: 'monthly',
      userEmail: currentUser.email,
      userName: currentUser.displayName,
      onSuccess: async (response) => {
        setLoadingPlan(null);
        try {
          await setDoc(doc(db, 'users', currentUser.uid), {
            plan: planName,
            amount: amount,
            razorpayPaymentId: response.razorpay_payment_id,
            planActivatedAt: serverTimestamp(),
            planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            email: currentUser.email,
            displayName: currentUser.displayName,
          }, { merge: true });
          setUserPlan(planName);
          alert(`🎉 Successfully upgraded to ${planName} plan!`);
        } catch (error) {
          console.error('Error saving plan:', error);
        }
      },
      onFailure: (reason) => {
        setLoadingPlan(null);
        if (reason !== 'Payment cancelled') {
          alert(`Payment failed: ${reason}`);
        }
      }
    });
  };

  // New state to track in-progress publications and prevent infinite loops
  const [publishingIds, setPublishingIds] = useState(new Set());
  const [failedIds, setFailedIds] = useState(new Set());

  // Theme state for synchronized UI toggles
  const [theme, setTheme] = useState(localStorage.getItem('bf_theme') || 'dark');

  // Dashboard logic simplified...




  const loadDashboardBlogs = async () => {
    if (!uid) return;
    setBlogsLoading(true);
    try {
      const saved = await fetchUserBlogs(uid);
      setBlogs(saved.length ? saved : []);
      // Sync to localStorage for pure-DOM sections that read from it
      localStorage.setItem('bf_blogs', JSON.stringify(saved));
      if (window.loadMyBlogs) window.loadMyBlogs();
    } catch (e) {
      console.error('Failed to load blogs:', e);
    } finally {
      setBlogsLoading(false);
    }
  };

  const changeMonth = (offset) => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(next);
  };

  const handleGlobalPublish = async () => {
    if (!publishingPlatform) {
      alert("Select a platform first");
      return;
    }
    const credsStr = localStorage.getItem('bf_credentials');
    if (!credsStr) {
      setPublishStatus('Error: Credentials not found. Please setup in Auto-Publisher.');
      return;
    }
    const creds = JSON.parse(credsStr)[publishingPlatform];
    if (!creds || Object.keys(creds).length === 0 || !Object.values(creds).some(val => val.length > 0)) {
      setPublishStatus('Error: Invalid API keys for ' + publishingPlatform + '. Please configure them in the Auto-Publisher settings.');
      return;
    }

    if (isScheduled) {
      if (!scheduledAt) {
        setPublishStatus('Error: Please select a date and time.');
        return;
      }
      setPublishStatus('Scheduling for ' + scheduledAt + '...');

      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const stringId = String(publishModalBlog.id);
      const bIdx = blogs.findIndex(b => String(b.id) === stringId);
      if (bIdx !== -1) {
        try {
          await updateBlog(uid, stringId, {
            status: 'scheduled',
            scheduledAt: scheduledAt,
            platform: publishingPlatform
          });
          blogs[bIdx].status = 'scheduled';
          blogs[bIdx].scheduledAt = scheduledAt;
          blogs[bIdx].platform = publishingPlatform;
          localStorage.setItem('bf_blogs', JSON.stringify(blogs));
          if (window.loadMyBlogs) window.loadMyBlogs();
          if (window.loadDashboardBlogs) window.loadDashboardBlogs();
        } catch (err) {
          setPublishStatus('Error: Failed to save to database. ' + err.message);
          return;
        }
      }

      setPublishStatus('✓ Blog scheduled!');
      setTimeout(() => setPublishModalBlog(null), 1500);
      return;
    }

    setPublishStatus('Publishing...');
    try {
      const response = await publishBlog(publishingPlatform, {
        title: publishModalBlog.title,
        content: publishModalBlog.body || publishModalBlog.content,
        tags: [publishModalBlog.keyword].filter(Boolean),
        credentials: creds
      });
      setPublishStatus('Published successfully!');

      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const stringId = String(publishModalBlog.id);
      const bIdx = blogs.findIndex(b => String(b.id) === stringId);
      if (bIdx !== -1) {
        try {
          await updateBlog(uid, stringId, {
            status: 'published',
            platform: publishingPlatform
          });
          blogs[bIdx].status = 'published';
          localStorage.setItem('bf_blogs', JSON.stringify(blogs));
          if (window.loadMyBlogs) window.loadMyBlogs();
          if (window.loadDashboardBlogs) window.loadDashboardBlogs();
        } catch (err) {
          console.error("Failed to update status to published:", err);
        }
      }

      setTimeout(() => setPublishModalBlog(null), 1500);
    } catch (err) {
      setPublishStatus('Error: ' + err.message);
    }
  };

  // Auto-publisher loop for scheduled blogs
  useEffect(() => {
    if (!uid || !blogs.length) return;
    const interval = setInterval(() => {
      const now = new Date();
      const checkBlogs = async () => {
        let hasChanges = false;
        for (const b of blogs) {
          const stringId = String(b.id);
          // Skip if already being published, failed previously, or status is not scheduled
          if (b.status === 'scheduled' && b.scheduledAt && !publishingIds.has(stringId) && !failedIds.has(stringId)) {
            const scheduledTime = new Date(b.scheduledAt);
            if (scheduledTime <= now) {
              console.log("Auto-publishing scheduled blog:", b.title);
              const credsStr = localStorage.getItem('bf_credentials');
              if (!credsStr) continue;
              const creds = JSON.parse(credsStr)[b.platform];

              if (creds && Object.keys(creds).length > 0) {
                // Add to publishing set to avoid duplicate triggers
                setPublishingIds(prev => new Set(prev).add(stringId));
                try {
                  await publishBlog(b.platform, { title: b.title, content: b.body, tags: [b.keyword].filter(Boolean), credentials: creds });
                  await updateBlog(uid, stringId, { status: 'published' });
                  hasChanges = true;
                  if (window.showToast) window.showToast(`Auto-published: ${b.title}`);
                } catch (err) {
                  console.error("Failed to auto-publish:", err);
                  // Mark as failed to avoid hammering the API if rate limited
                  setFailedIds(prev => new Set(prev).add(stringId));
                  if (window.showToast) window.showToast(`Failed: ${b.title}. ${err.message}`, 'error');
                } finally {
                  setPublishingIds(prev => {
                    const next = new Set(prev);
                    next.delete(stringId);
                    return next;
                  });
                }
              }
            }
          }
        }
        if (hasChanges && window.loadDashboardBlogs) await window.loadDashboardBlogs();
      };

      checkBlogs();
    }, 45000); // Check every 45 seconds
    return () => clearInterval(interval);
  }, [blogs, uid, publishingIds, failedIds]);

  useEffect(() => {
    loadDashboardBlogs();
    window.loadDashboardBlogs = loadDashboardBlogs;
    window.showPublishModal = (id) => {
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const blog = blogs.find(b => b.id === id);
      if (blog) {
        setPublishModalBlog(blog);
        setPublishStatus('');
        setPublishingPlatform('wordpress');
        setIsScheduled(false);
        setScheduledAt('');
      }
    };
    return () => {
      delete window.loadDashboardBlogs;
      delete window.showPublishModal;
    };
  }, [uid]);

  // ─── Theme toggle — re-register & sync when dashboard mounts ───
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'bf_theme') setTheme(e.newValue || 'dark');
    };
    window.addEventListener('storage', handleStorageChange);

    // Apply saved theme
    const savedTheme = localStorage.getItem('bf_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);

    const applyThemeUI = (theme) => {
      const isDark = theme === 'dark';
      const navToggle = document.getElementById('theme-toggle');
      const sidebarToggle = document.getElementById('sidebar-theme-toggle');
      const sidebarIcon = document.getElementById('sidebar-theme-icon');
      const sidebarLabel = document.getElementById('sidebar-theme-label');

      if (navToggle) navToggle.textContent = isDark ? '🌙' : '☀️';
      if (sidebarToggle) sidebarToggle.checked = !isDark;
      if (sidebarIcon) sidebarIcon.textContent = isDark ? '🌙' : '☀️';
      if (sidebarLabel) sidebarLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
    };

    // Canonical toggle function
    window.toggleTheme = function () {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('bf_theme', next);
      
      // Update React state if component is mounted
      setTheme(next);
      
      // Update legacy UI elements
      applyThemeUI(next);
    };

    // Sync UI icons on mount
    applyThemeUI(savedTheme);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    window.updateOverviewStats = function () {
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');

      const totalEl = document.getElementById('stat-published');
      const avgEl = document.getElementById('stat-avgseo');
      const trafficEl = document.getElementById('stat-traffic');
      const topEl = document.getElementById('stat-topblog');

      if (blogs.length > 0) {
        if (totalEl) totalEl.textContent = blogs.length;
        const avgSeo = Math.round(blogs.reduce((sum, b) => sum + (parseInt(b.seoScore) || 0), 0) / blogs.length);
        if (avgEl) avgEl.textContent = avgSeo;

        const estTraffic = blogs.length * 156;
        if (trafficEl) trafficEl.textContent = '+' + estTraffic.toLocaleString();

        const topBlog = blogs.reduce((top, b) => (parseInt(b.seoScore) || 0) > (parseInt(top.seoScore) || 0) ? b : top, blogs[0]);
        if (topEl) topEl.textContent = topBlog.title.length > 28 ? topBlog.title.substring(0, 28) + '...' : topBlog.title;
      } else {
        // Authentic demo fallback state when no blogs are created yet
        if (totalEl) totalEl.textContent = '0';
        if (avgEl) avgEl.textContent = '0';
        if (trafficEl) trafficEl.textContent = '0';
        if (topEl) topEl.textContent = 'No blogs yet';
      }

      const usageBar = document.getElementById('plan-usage-bar');
      const usageCount = document.getElementById('plan-usage-count');
      if (usageBar) usageBar.style.width = Math.min((blogs.length / 30) * 100, 100) + '%';
      if (usageCount) usageCount.textContent = blogs.length + '/30 blogs';
    };

    window.loadROIDashboard = function () {
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const totalEl = document.getElementById('roi-total-blogs');
      if (totalEl) totalEl.textContent = blogs.length;

      if (blogs.length > 0) {
        const avgSeo = Math.round(blogs.reduce((s, b) => s + (parseInt(b.seoScore) || 0), 0) / blogs.length);
        const avgEl = document.getElementById('roi-avg-seo');
        if (avgEl) avgEl.textContent = avgSeo;

        const estTraffic = blogs.length * 156;
        const trafficEl = document.getElementById('roi-traffic');
        if (trafficEl) trafficEl.textContent = '+' + estTraffic.toLocaleString();

        const healthEl = document.getElementById('roi-health');
        const health = avgSeo >= 90 ? '🏆 Excellent' : avgSeo >= 75 ? '✅ Good' : '⚠️ Fair';
        if (healthEl) healthEl.textContent = health;

        const sc = s => parseInt(s) >= 90 ? '#10B981' : parseInt(s) >= 75 ? '#F59E0B' : '#EF4444';
        const statusStyle = s => s === 'published'
          ? 'background:rgba(16,185,129,0.1);color:#10B981;'
          : s === 'scheduled'
            ? 'background:rgba(245,158,11,0.1);color:#F59E0B;'
            : 'background:rgba(100,116,139,0.1);color:#94A3B8;';

        const tableBody = document.getElementById('roi-table-body');
        if (tableBody) {
          tableBody.innerHTML = blogs.map(blog => {
            const wc = blog.body ? blog.body.split(/\s+/).filter(w => w).length : 0;
            const traffic = Math.floor((parseInt(blog.seoScore) || 0) * 1.6);
            const dateStr = blog.createdAt ? new Date(blog.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
            return '<tr style="border-top:1px solid rgba(255,255,255,0.04); transition:background 0.15s;" onmouseover="this.style.background=\'rgba(124,58,237,0.05)\'" onmouseout="this.style.background=\'transparent\'">' +
              '<td style="padding:14px 20px; font-size:14px; color:white; font-weight:500; max-width:280px;"><div>' + blog.title + '</div><div style="font-size:11px; color:#64748B; margin-top:4px;">' + dateStr + '</div></td>' +
              '<td style="padding:14px 20px; text-align:center;"><span style="color:' + sc(blog.seoScore) + '; font-weight:700; font-size:14px;">' + (blog.seoScore || '—') + '/100</span></td>' +
              '<td style="padding:14px 20px; text-align:center; font-size:13px; color:#94A3B8;">' + (wc > 0 ? wc.toLocaleString() : '—') + '</td>' +
              '<td style="padding:14px 20px; text-align:center; font-size:13px; color:#10B981; font-weight:600;">+' + traffic + '</td>' +
              '<td style="padding:14px 20px; text-align:center;"><span style="' + statusStyle(blog.status) + ' border-radius:999px; padding:4px 12px; font-size:12px; font-weight:600;">' + (blog.status || 'draft').charAt(0).toUpperCase() + (blog.status || 'draft').slice(1) + '</span></td>' +
              '<td style="padding:14px 20px; text-align:right;">' +
              '<div class="action-menu">' +
              '<button class="action-btn" onclick="toggleActionMenu(event)" style="background:none; border:none; color:#64748B; cursor:pointer; padding:4px; font-size:18px;">⋮</button>' +
              '<div class="action-dropdown">' +
              '<button onclick="viewBlog(\'' + blog.id + '\')">👁 View Blog</button>' +
              '<button onclick="copyBlog(\'' + blog.id + '\', event)">📋 Copy Content</button>' +
              '<button onclick="publishBlog(\'' + blog.id + '\', event)">🚀 Publish Now</button>' +
              '<button onclick="scheduleBlog(\'' + blog.id + '\', event)">📅 Schedule</button>' +
              '<button class="danger" onclick="confirmDeleteBlog(\'' + blog.id + '\', event)">🗑 Delete</button>' +
              '</div>' +
              '</div>' +
              '</td>' +
              '</tr>';
          }).join('');
        }
      }
    };

    window.generateReport = async function (e) {
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      if (blogs.length === 0) {
        alert('Generate some blogs first before creating a report.');
        window.showDashboardSection('newblog');
        return;
      }

      const btn = e.currentTarget;
      const originalText = btn.textContent;
      btn.textContent = '⏳ Generating...';
      btn.disabled = true;

      const avgSeo = Math.round(blogs.reduce((s, b) => s + (parseInt(b.seoScore) || 0), 0) / blogs.length);
      const totalWords = blogs.reduce((s, b) => s + (b.body ? b.body.split(/\s+/).length : 0), 0);
      const keywords = blogs.map(b => b.keyword || b.title).slice(0, 5).join(', ');

      const prompt = `You are a senior SEO content strategist. Write a professional performance report for a content marketing campaign.

Data:
- Total blogs published: ${blogs.length}
- Average SEO score: ${avgSeo}/100
- Total words written: ${totalWords.toLocaleString()}
- Topics covered: ${keywords}
- Estimated monthly traffic: +${(blogs.length * 156).toLocaleString()} visits

Write a 300-word professional report covering:
1. Campaign Performance Summary
2. SEO Health Assessment
3. Content Quality Insights
4. Top Performing Content
5. Recommendations for Next Month

Use clear headings and keep it actionable. Write in a professional consulting tone.`;

      try {
        const report = await callGemini(prompt, 1000);
        const reportArea = document.getElementById('roi-report-area');
        const reportContent = document.getElementById('roi-report-content');
        if (reportArea) reportArea.style.display = 'block';
        if (reportContent) reportContent.textContent = report;
        btn.textContent = '⚡ Regenerate Report';
        btn.disabled = false;
      } catch (err) {
        alert('Error generating report: ' + err.message);
        btn.textContent = originalText;
        btn.disabled = false;
      }
    };

    window.copyReport = function (e) {
      const contentEl = document.getElementById('roi-report-content');
      if (!contentEl) return;
      const content = contentEl.textContent;
      navigator.clipboard.writeText(content).then(() => {
        const btn = e.currentTarget;
        const oldText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.color = 'var(--color-success-500)';
        setTimeout(() => { btn.textContent = oldText; btn.style.color = 'var(--text-muted)'; }, 2000);
      });
    };

    // --- Action Menu & Toast System ---

    window.showToast = function (message, type = 'success') {
      let container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }

      const toast = document.createElement('div');
      toast.className = `toast ${type}`;

      const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
      };

      toast.innerHTML = `<span>${icons[type] || '•'}</span> <span>${message}</span>`;
      container.appendChild(toast);

      // Remove after 3 seconds
      setTimeout(() => {
        toast.style.animation = 'toastOut 0.4s ease-in forwards';
        toast.addEventListener('animationend', () => toast.remove());
      }, 3000);
    };

    window.toggleActionMenu = function (e) {
      e.stopPropagation();
      const btn = e.currentTarget;
      const menu = btn.nextElementSibling;
      const isOpen = menu.classList.contains('open');

      // Close all other menus
      document.querySelectorAll('.action-dropdown.open').forEach(m => {
        if (m !== menu) m.classList.remove('open');
      });

      menu.classList.toggle('open');

      // Close menu when clicking outside
      if (!isOpen) {
        const closeMenu = (event) => {
          if (!menu.contains(event.target) && event.target !== btn) {
            menu.classList.remove('open');
            document.removeEventListener('click', closeMenu);
          }
        };
        document.addEventListener('click', closeMenu);
      }
    };

    window.viewBlog = function (id) {
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const blog = blogs.find(b => b.id == id);
      if (blog) setPublishModalBlog(blog);
    };


    window.scheduleBlog = async function (id, e) {
      if (!uid) return;
      try {
        const stringId = String(id);
        await updateBlog(uid, stringId, { status: 'scheduled' });
        // sync to localStorage cache
        const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
        const idx = blogs.findIndex(b => String(b.id) === stringId);
        if (idx !== -1) { blogs[idx].status = 'scheduled'; localStorage.setItem('bf_blogs', JSON.stringify(blogs)); }
        window.showToast('Blog scheduled!');
        if (window.loadDashboardBlogs) await window.loadDashboardBlogs();
        if (window.loadMyBlogs) window.loadMyBlogs();
        if (window.updateOverviewStats) window.updateOverviewStats();
        if (window.loadROIDashboard) window.loadROIDashboard();
      } catch (err) { window.showToast('Error: ' + err.message, 'error'); }
      const menu = e && e.target && e.target.closest ? e.target.closest('.action-dropdown') : null;
      if (menu) menu.classList.remove('open');
    };


    window.confirmDeleteBlog = async function (id, e) {
      if (!uid) return;
      if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) return;

      const stringId = String(id);
      try {
        // 1. Optimistic Update: Remove from React state immediately
        setBlogs(prev => prev.filter(b => String(b.id) !== stringId));

        // 2. Remove from localStorage immediately
        const blogsLocal = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
        const updated = blogsLocal.filter(b => String(b.id) !== stringId);
        localStorage.setItem('bf_blogs', JSON.stringify(updated));

        // 3. Trigger UI refreshes for pure-DOM sections
        if (window.loadMyBlogs) window.loadMyBlogs();
        if (window.updateOverviewStats) window.updateOverviewStats();
        if (window.loadROIDashboard) window.loadROIDashboard();

        // 4. Perform actual Firestore deletion
        await deleteBlog(uid, stringId);
        window.showToast('Blog deleted from database.', 'warning');

        // 5. Final sync after a short delay (to let Firestore index catch up)
        setTimeout(async () => {
          if (window.loadDashboardBlogs) await window.loadDashboardBlogs();
        }, 1500);

      } catch (err) {
        window.showToast('Error during deletion: ' + err.message, 'error');
        // Rollback? Usually not needed if the user reloads anyway, but let's refresh to be safe
        if (window.loadDashboardBlogs) await window.loadDashboardBlogs();
      }

      if (e && e.target && e.target.closest) {
        const menu = e.target.closest('.action-dropdown');
        if (menu) menu.classList.remove('open');
      }
    };


    window.showDashboardSection = function (section) {
      document.querySelectorAll('.dash-section').forEach(s => { s.style.display = 'none'; s.classList.remove('section-entering'); });
      const target = document.getElementById('dash-' + section);
      if (target) {
        target.style.display = 'block';
        // Force reflow so the animation class re-triggers
        void target.offsetWidth;
        target.classList.add('section-entering');
        // Remove class after animation completes so it can re-trigger next time
        target.addEventListener('animationend', () => target.classList.remove('section-entering'), { once: true });
      }
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('sidebar-active', 'active'));
      const activeLink = document.querySelector('[data-section="' + section + '"]');
      if (activeLink) {
        activeLink.classList.add('sidebar-active');
        activeLink.classList.add('active');
      }
      if (section === 'overview') window.updateOverviewStats();
      if (section === 'myblogs' && window.loadMyBlogs) window.loadMyBlogs();
      if (section === 'roi' && window.loadROIDashboard) window.loadROIDashboard();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Auto-call on mount
    window.updateOverviewStats();
  }, []);

  const dummySections = [


    { id: 'calendar', title: 'Content Calendar' },
    { id: 'clustermap', title: 'Cluster Map' },

    { id: 'keywords', title: 'Keyword Planner' },
    { id: 'competitor', title: 'Competitor Spy' },
    { id: 'publisher', title: 'Auto-Publisher' },
    { id: 'integrations', title: 'Integrations' },
    { id: 'schedule', title: 'Schedule Queue' },

    { id: 'traffic', title: 'Traffic Tracker' },
    { id: 'brandvoice', title: 'Brand Voice' },
    { id: 'billing', title: 'Billing' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Sparkles className="logo-icon text-violet-400" size={24} color="#A78BFA" />
          <span className="logo-text" onClick={() => window.showMarketingSite && window.showMarketingSite()} style={{ cursor: 'pointer' }}>BlogzzUP</span>
        </div>

        <div style={{ padding: '0 12px' }}>
          <a onClick={() => window.showMarketingSite && window.showMarketingSite()} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748B', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px', transition: 'all 0.2s', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = '#fff'} onMouseOut={(e) => e.currentTarget.style.color = '#64748B'}>
            ← Back to Home
          </a>
        </div>

        <div className="sidebar-user">
          {currentUser?.photoURL
            ? <img src={currentUser.photoURL} alt="User" className="user-avatar" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
            : <div className="user-avatar-fallback" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0 }}>{firstName.charAt(0).toUpperCase()}</div>
          }
          <div className="user-info">
            <span className="user-name">{firstName}'s Workspace</span>
            <span className="user-plan">{userPlan} Plan</span>
          </div>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Dashboard navigation">
          <div className="nav-group">
            <a role="button" tabIndex={0} className="nav-item sidebar-link sidebar-active active" data-section="overview" onClick={() => window.showDashboardSection('overview')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('overview')} style={{ cursor: 'pointer' }}><Home size={18} aria-hidden="true" /> Overview</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label" id="nav-label-content">Content</h4>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="newblog" onClick={() => window.showDashboardSection('newblog')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('newblog')} style={{ cursor: 'pointer' }}><Plus size={18} aria-hidden="true" /> New Blog</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="voicetoblog" onClick={() => window.showDashboardSection('voicetoblog')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('voicetoblog')} style={{ cursor: 'pointer' }}><Mic size={18} aria-hidden="true" /> Voice to Blog</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="myblogs" onClick={() => window.showDashboardSection('myblogs')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('myblogs')} style={{ cursor: 'pointer' }}><FileText size={18} aria-hidden="true" /> My Blogs</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="calendar" onClick={() => window.showDashboardSection('calendar')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('calendar')} style={{ cursor: 'pointer' }}><Calendar size={18} aria-hidden="true" /> Content Calendar</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="clustermap" onClick={() => window.showDashboardSection('clustermap')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('clustermap')} style={{ cursor: 'pointer' }}><Network size={18} aria-hidden="true" /> Cluster Map</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label" id="nav-label-research">Research</h4>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="serpgap" onClick={() => window.showDashboardSection('serpgap')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('serpgap')} style={{ cursor: 'pointer' }}><Search size={18} aria-hidden="true" /> SERP Gap Scanner</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="keywords" onClick={() => window.showDashboardSection('keywords')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('keywords')} style={{ cursor: 'pointer' }}><Key size={18} aria-hidden="true" /> Keyword Planner</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="competitor" onClick={() => window.showDashboardSection('competitor')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('competitor')} style={{ cursor: 'pointer' }}><Target size={18} aria-hidden="true" /> Competitor Spy</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label" id="nav-label-publish">Publish</h4>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="publisher" onClick={() => window.showDashboardSection('publisher')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('publisher')} style={{ cursor: 'pointer' }}><UploadCloud size={18} aria-hidden="true" /> Auto-Publisher</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="integrations" onClick={() => window.showDashboardSection('integrations')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('integrations')} style={{ cursor: 'pointer' }}><LinkIcon size={18} aria-hidden="true" /> Integrations</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="schedule" onClick={() => window.showDashboardSection('schedule')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('schedule')} style={{ cursor: 'pointer' }}><List size={18} aria-hidden="true" /> Schedule Queue</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label" id="nav-label-analyze">Analyze</h4>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="seoscores" onClick={() => window.showDashboardSection('seoscores')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('seoscores')} style={{ cursor: 'pointer' }}><BarChart3 size={18} aria-hidden="true" /> SEO Scores</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="traffic" onClick={() => window.showDashboardSection('traffic')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('traffic')} style={{ cursor: 'pointer' }}><TrendingUp size={18} aria-hidden="true" /> Traffic Tracker</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="roi" onClick={() => window.showDashboardSection('roi')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('roi')} style={{ cursor: 'pointer' }}><PieChart size={18} aria-hidden="true" /> ROI Dashboard</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label" id="nav-label-settings">Settings</h4>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="brandvoice" onClick={() => window.showDashboardSection('brandvoice')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('brandvoice')} style={{ cursor: 'pointer' }}><Settings size={18} aria-hidden="true" /> Brand Voice</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="billing" onClick={() => window.showDashboardSection('billing')} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && window.showDashboardSection('billing')} style={{ cursor: 'pointer' }}><CreditCard size={18} aria-hidden="true" /> Billing</a>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', padding: '12px 14px', margin: '12px 8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', display: 'inline-block' }}></span>
              <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 600 }}>AI Engine Active</span>
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-subtle)' }}>Gemini 2.5 Flash</div>
          </div>

          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px', margin: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#A78BFA' }}>Growth Plan</span>
              <span id="plan-usage-count" style={{ fontSize: '11px', color: '#64748B' }}>0/30 blogs</span>
            </div>
            <div style={{ background: 'var(--bg-primary)', borderRadius: '999px', height: '5px', overflow: 'hidden', marginBottom: '10px' }}>
              <div id="plan-usage-bar" style={{ height: '100%', background: 'linear-gradient(90deg,#7C3AED,#06B6D4)', width: '0%', borderRadius: '999px', transition: 'width 0.5s ease' }}></div>
            </div>
            <button onClick={() => window.showDashboardSection && window.showDashboardSection('billing')} style={{ width: '100%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', borderRadius: '8px', padding: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}>
              Upgrade to Scale
            </button>
          </div>
          <div className="theme-toggle-container">
            <button
              className="theme-toggle-pill"
              onClick={window.toggleTheme}
              aria-label="Toggle Theme"
            >
              <div className="left-content">
                <div className="icon-box">
                  {theme === 'dark' ? '🌙' : '☀️'}
                </div>
                <span className="label">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className="theme-toggle-switch">
                <div className="theme-toggle-knob"></div>
              </div>
            </button>
          </div>

          <button className="logout-btn" onClick={async () => {
            try { await logOut(); } catch (e) { console.error(e); }
            const da = document.getElementById('dashboard-app');
            const ms = document.getElementById('marketing-site');
            if (da) da.style.display = 'none';
            if (ms) ms.style.display = 'block';
            if (window.showPage) window.showPage('home');
          }}><LogOut size={16} /> Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{ overflowY: 'auto' }}>
        {/* Overview Section */}
        <div id="dash-overview" className="dash-section" style={{ display: 'block', padding: '40px', color: 'var(--text-primary)' }}>
          <header className="top-header">
            <div className="header-text">
              <h1 className="dashboard-greeting" style={{ color: 'var(--text-primary)' }}>Good morning 👋</h1>
              <p style={{ color: 'var(--text-muted)' }}>Your blogs are running on autopilot.</p>
            </div>
            <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => window.showDashboardSection('roi')}
                style={{ background: 'transparent', color: 'var(--text-muted)', border: 'none', fontSize: '14px', fontWeight: 500, cursor: 'pointer', padding: '11px 22px', borderRadius: '999px', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                View Reports →
              </button>
              <button
                onClick={() => window.showDashboardSection('serpgap')}
                style={{ background: 'transparent', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: '999px', padding: '11px 22px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--color-primary-500)'; e.currentTarget.style.color = 'var(--color-primary-400)'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              >
                🔍 Scan SERP Gaps
              </button>
              <button
                onClick={() => window.showDashboardSection('newblog')}
                style={{ background: 'var(--color-accent-gradient)', color: 'white', border: 'none', borderRadius: '999px', padding: '11px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                + New Blog
              </button>
            </div>
          </header>

          <div className="stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
            <div className="stat-dash-card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '24px' }}>
              <div className="stat-title" style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Blogs Published This Month</div>
              <div className="stat-val" id="stat-published" style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>15</div>
            </div>
            <div className="stat-dash-card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '24px' }}>
              <div className="stat-title" style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Avg SEO Score</div>
              <div className="stat-val text-cyan" style={{ fontSize: '32px', fontWeight: 700, color: '#06B6D4' }}><span id="stat-avgseo">91</span><span className="text-sm" style={{ fontSize: '14px', color: 'var(--text-muted)', marginLeft: '4px' }}>/100</span></div>
            </div>
            <div className="stat-dash-card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '24px' }}>
              <div className="stat-title" style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Est. Monthly Traffic</div>
              <div className="stat-val text-green" style={{ fontSize: '32px', fontWeight: 700, color: '#10B981' }}><span id="stat-traffic">+2,340</span> <span className="text-sm" style={{ fontSize: '14px' }}>visits</span></div>
            </div>
            <div className="stat-dash-card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '24px' }}>
              <div className="stat-title" style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '12px' }}>Top Ranking Blog</div>
              <div className="stat-val text-md" id="stat-topblog" style={{ fontSize: '1.1rem', marginTop: '0.5rem', lineHeight: 1.4, color: 'var(--text-primary)', fontWeight: 600 }}>AI Tools for Startups</div>
            </div>
          </div>

          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '24px' }}>
            {/* Content Table Panel */}
            <div className="content-table-panel" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', overflow: 'hidden' }}>
              <div className="panel-header" style={{ padding: '20px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Your Blogs</h3>
                <span
                  onClick={() => window.showDashboardSection('myblogs')}
                  style={{ fontSize: '14px', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: 500 }}
                  onMouseOver={(e) => e.currentTarget.style.color = '#A78BFA'}
                  onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-accent)'}
                >
                  View all →
                </span>
              </div>
              <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="dash-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>Title</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>SEO Score</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>Status</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>Date</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}>Traffic</th>
                      <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: '12px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-default)' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>No blogs generated yet.</td>
                      </tr>
                    ) : (
                      blogs.map((blog, idx) => (
                        <tr key={blog.id} style={{ borderBottom: '1px solid var(--border-default)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-bg-hover)'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '16px 20px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>{blog.title}</td>
                          <td style={{ padding: '16px 20px' }}>
                            <div className="score-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--bg-surface)', padding: '4px 10px', borderRadius: '999px', border: '1px solid var(--border-default)', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600 }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: (blog.seoScore || blog.score) >= 90 ? '#10B981' : '#F59E0B' }}></span>
                              {blog.seoScore || blog.score || 0}/100
                            </div>
                          </td>
                          <td style={{ padding: '16px 20px' }}>
                            {publishingIds.has(String(blog.id)) ? (
                              <span className="status-badge amber" style={{ animation: 'pulse 1.5s infinite', background: 'rgba(245,158,11,0.1)', color: '#F59E0B', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>Publishing...</span>
                            ) : (
                              <span className={`status-badge ${blog.status === 'published' ? 'green' : blog.status === 'scheduled' ? 'amber' : 'gray'}`} style={{
                                background: blog.status === 'published' ? 'rgba(16,185,129,0.1)' : blog.status === 'scheduled' ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)',
                                color: blog.status === 'published' ? '#10B981' : blog.status === 'scheduled' ? '#F59E0B' : 'var(--text-muted)',
                                padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, textTransform: 'capitalize'
                              }}>{blog.status || 'draft'}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '11px' }}>{blog.createdAt ? new Date(blog.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          <td style={{ padding: '16px 20px', color: '#10B981', fontWeight: 600, fontSize: '13px' }}>+{blog.traffic || 0}</td>
                          <td className="actions-cell" style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => window.viewBlog && window.viewBlog(blog.id)} style={{ background: 'rgba(124,58,237,0.15)', border: 'none', color: '#A78BFA', borderRadius: '6px', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>View</button>
                              <button onClick={() => window.showPublishModal && window.showPublishModal(blog.id)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--color-success-border)', color: 'var(--color-success-500)', borderRadius: '6px', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>Publish</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Side Panel Mini Calendar */}
            <div className="calendar-panel" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
              <div className="panel-header" style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Content Calendar</h3>
              </div>
              <div className="mini-calendar">
                <div className="cal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '14px' }}>
                  <span>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                  <div className="cal-nav" style={{ display: 'flex', gap: '4px' }}>
                    <button onClick={() => changeMonth(-1)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>&lt;</button>
                    <button onClick={() => changeMonth(1)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>&gt;</button>
                  </div>
                </div>
                <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="cal-day-name" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, paddingBottom: '8px' }}>{d}</div>)}
                  {(() => {
                    const year = viewDate.getFullYear();
                    const month = viewDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const cells = [];

                    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="cal-cell empty"></div>);

                    for (let d = 1; d <= daysInMonth; d++) {
                      const dayBlogs = blogs.filter(b => {
                        const dateStr = b.status === 'scheduled' ? b.scheduledAt : (b.createdAt || new Date().toISOString());
                        if (!dateStr) return false;
                        const date = new Date(dateStr);
                        return date.getDate() === d && date.getMonth() === month && date.getFullYear() === year;
                      });
                      const hasPublished = dayBlogs.some(b => b.status === 'published');
                      const hasScheduled = dayBlogs.some(b => b.status === 'scheduled');

                      let cellBg = 'var(--bg-surface)';
                      let dotColor = null;

                      if (dayBlogs.length > 0) {
                        if (hasPublished) dotColor = 'var(--color-success-500)';
                        else if (hasScheduled) dotColor = 'var(--color-warning-500)';
                        else dotColor = 'var(--text-muted)';
                      }

                      cells.push(
                        <div key={d} className="cal-cell" style={{ background: cellBg, border: '1px solid var(--border-default)', height: '36px', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: 'var(--text-primary)', position: 'relative' }}>
                          {d}
                          {dotColor && <div className="cal-dot" style={{ width: '4px', height: '4px', background: dotColor, borderRadius: '50%', position: 'absolute', bottom: '4px' }}></div>}
                        </div>
                      );
                    }
                    return cells;
                  })()}
                </div>
                <div className="cal-legend" style={{ display: 'flex', gap: '12px', marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                  <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success-500)' }}></span> Live</div>
                  <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-warning-500)' }}></span> Sch</div>
                  <div className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--text-muted)' }}></span> Draft</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BlogEditor callGemini={callGemini} publishBlog={publishBlog} uid={uid} />
        <VoiceToBlogSection />
        <MyBlogsSection />
        <SerpGapSection />
        <SeoScoresSection />
        <RoidashboardSection />

        {/* Unique Feature Sections */}
        {dummySections.map(sec => {
          let content = null;

          if (sec.id === 'calendar') {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            content = (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '16px' }}>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => changeMonth(-1)} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>&lt; Prev</button>
                    <button onClick={() => changeMonth(1)} style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer' }}>Next &gt;</button>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '10px' }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                  {(() => {
                    const cells = [];
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} style={{ minHeight: '80px' }}></div>);
                    }
                    for (let d = 1; d <= daysInMonth; d++) {
                      const dayBlogs = blogs.filter(b => {
                        const dateStr = b.status === 'scheduled' ? b.scheduledAt : (b.createdAt || new Date().toISOString());
                        if (!dateStr) return false;
                        const date = new Date(dateStr);
                        return date.getDate() === d && date.getMonth() === month && date.getFullYear() === year;
                      });
                      cells.push(
                        <div key={d} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', minHeight: '80px', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', overflowY: 'auto' }}>
                          <span style={{ color: 'var(--text-primary)', fontSize: '12px' }}>{d}</span>
                          {dayBlogs.map(b => (
                            <div key={b.id} style={{
                              background: b.status === 'published' ? 'rgba(16,185,129,0.1)' : b.status === 'scheduled' ? 'rgba(245,158,11,0.1)' : 'rgba(148,163,184,0.1)',
                              color: b.status === 'published' ? '#10B981' : b.status === 'scheduled' ? '#F59E0B' : 'var(--text-muted)',
                              fontSize: '10px', padding: '2px 4px', borderRadius: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                            }} title={b.title}>
                              {b.status === 'published' ? 'Live: ' : b.status === 'scheduled' ? 'Sch: ' : 'Draft: '}{b.title}
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return cells;
                  })()}
                </div>
              </div>
            );
          } else if (sec.id === 'clustermap') {
            content = (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '60px', position: 'relative' }}>
                <div style={{ background: 'var(--color-accent-gradient)', padding: '16px 32px', borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: '18px', zIndex: 2 }}>Pillar: Artificial Intelligence</div>
                <div style={{ height: '40px', width: '2px', background: 'var(--border-default)' }}></div>
                <div style={{ width: '600px', height: '2px', background: 'var(--border-default)', display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ width: '2px', height: '40px', background: 'var(--border-default)' }}></div>
                  <div style={{ width: '2px', height: '40px', background: 'var(--border-default)' }}></div>
                  <div style={{ width: '2px', height: '40px', background: 'var(--border-default)' }}></div>
                </div>
                <div style={{ width: '640px', display: 'flex', justifyContent: 'space-between', marginTop: '40px' }}>
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--color-success-border)', padding: '12px 16px', borderRadius: '8px', color: 'var(--color-success-500)', fontSize: '13px' }}>Generative AI Tools</div>
                  <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--color-warning-border)', padding: '12px 16px', borderRadius: '8px', color: 'var(--color-warning-500)', fontSize: '13px' }}>AI Content Detection</div>
                  <div style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-default)', padding: '12px 16px', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>+ Add Cluster</div>
                </div>
              </div>
            );
          } else if (sec.id === 'keywords') {
            content = (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <input type="text" placeholder="Seed keyword..." style={{ flex: 1, background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '10px 16px', borderRadius: '8px', outline: 'none' }} />
                  <button style={{ background: 'var(--color-primary-600)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer' }}>Discover</button>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '12px' }}>
                      <th style={{ padding: '12px' }}>KEYWORD</th><th style={{ padding: '12px' }}>VOLUME</th><th style={{ padding: '12px' }}>KD</th><th style={{ padding: '12px' }}>INTENT</th><th style={{ padding: '12px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {['ai writing tools', 'best ai for seo', 'free ai copywriter', 'how to use chatgpt for blogging'].map((kw, i) => (
                      <tr key={kw} style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-primary)', fontSize: '14px' }}>
                        <td style={{ padding: '16px 12px' }}>{kw}</td>
                        <td style={{ padding: '16px 12px' }}>{[12400, 8100, 5400, 3200][i]}</td>
                        <td style={{ padding: '16px 12px' }}><span style={{ color: ['var(--color-error-500)', 'var(--color-warning-500)', 'var(--color-success-500)', 'var(--color-success-500)'][i] }}>{[84, 62, 28, 14][i]}</span></td>
                        <td style={{ padding: '16px 12px' }}><span style={{ background: 'var(--bg-surface)', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>Commercial</span></td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}><button style={{ background: 'transparent', color: 'var(--color-accent)', border: '1px solid rgba(124,58,237,0.3)', padding: '4px 12px', borderRadius: '6px' }}>+ Add</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          } else if (sec.id === 'competitor') {
            content = (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
                  <h3 style={{ marginTop: 0, color: 'var(--text-primary)', fontSize: '16px' }}>Spy on Competitor</h3>
                  <input type="text" placeholder="https://competitor.com" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '12px 16px', borderRadius: '8px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box' }} />
                  <button style={{ width: '100%', background: 'var(--color-secondary-600)', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Analyze Domain</button>
                </div>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Domain Authority</span><span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>78</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Organic Traffic</span><span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>1.2M / mo</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-default)', paddingBottom: '12px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Top Keywords</span><span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>45,200</span>
                  </div>
                </div>
              </div>
            );
          } else if (sec.id === 'publisher') {
            content = <AutoPublisherSection />;
          } else if (sec.id === 'integrations') {
            content = (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '20px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '16px' }}>Google Analytics 4</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px' }}>Track real-time traffic and events from generated content.</p>
                  </div>
                  <button style={{ background: 'var(--color-success-500)', color: 'white', border: 'none', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>Connected ✓</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-default)', paddingBottom: '20px', marginBottom: '20px' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '16px' }}>Google Search Console</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px' }}>Import keyword data and track index status automatically.</p>
                  </div>
                  <button style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>Connect</button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '16px' }}>Zapier</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '13px' }}>Connect BlogzzUP to 5,000+ apps.</p>
                  </div>
                  <button style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', padding: '8px 20px', borderRadius: '8px', cursor: 'pointer' }}>Connect</button>
                </div>
              </div>
            );
          } else if (sec.id === 'schedule') {
            content = (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
                {(typeof blogs !== 'undefined' ? blogs : []).filter(b => b.status === 'scheduled').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No upcoming scheduled blogs.</div>
                ) : (
                  <>
                    {failedIds.size > 0 && (
                      <div style={{ marginBottom: '20px', padding: '12px', background: 'var(--color-danger-100)', border: '1px solid var(--color-danger-border)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--color-danger-500)', fontWeight: 500 }}>⚠️ {failedIds.size} blogs failed to publish.</span>
                        <button onClick={() => setFailedIds(new Set())} style={{ background: 'var(--color-danger-500)', border: 'none', color: 'white', fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '8px', cursor: 'pointer' }}>Retry All</button>
                      </div>
                    )}
                    {blogs.filter(b => b.status === 'scheduled').map(blog => {
                      const sDate = new Date(blog.scheduledAt || blog.createdAt);
                      return (
                        <div key={blog.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--border-default)' }}>
                          <div style={{ background: 'var(--bg-elevated)', color: 'var(--color-primary-600)', padding: '10px', borderRadius: '8px', textAlign: 'center', minWidth: '50px', border: '1px solid var(--border-default)' }}>
                            <div style={{ fontSize: '11px', textTransform: 'uppercase' }}>{sDate.toLocaleDateString('en-IN', { month: 'short' })}</div>
                            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{sDate.getDate()}</div>
                          </div>
                          <div style={{ flex: 1 }}>
                            <h4 style={{ margin: '0 0 4px', color: 'var(--text-primary)', fontSize: '15px' }}>{blog.title}</h4>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px' }}>
                              Scheduled for {sDate.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}
                            </p>
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--color-success-500)', background: 'var(--color-success-100)', padding: '4px 10px', borderRadius: '99px', textTransform: 'capitalize' }}>{blog.platform}</div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            );
          } else if (sec.id === 'traffic' || sec.id === 'roi') {
            content = (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>{sec.id === 'roi' ? 'Est. Traffic Value' : 'Total Sessions'}</div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold' }}>{sec.id === 'roi' ? '₹0' : '0'}</div>
                    <div style={{ color: 'var(--color-success-500)', fontSize: '13px', marginTop: '8px' }}>+0% vs last month</div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>{sec.id === 'roi' ? 'Content Cost Saved' : 'Avg. Duration'}</div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold' }}>{sec.id === 'roi' ? '₹0' : '0m 0s'}</div>
                    <div style={{ color: 'var(--color-success-500)', fontSize: '13px', marginTop: '8px' }}>+0% vs last month</div>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>{sec.id === 'roi' ? 'Leads Generated' : 'Bounce Rate'}</div>
                    <div style={{ color: 'var(--text-primary)', fontSize: '28px', fontWeight: 'bold' }}>{sec.id === 'roi' ? '0' : '0%'}</div>
                    <div style={{ color: 'var(--color-success-500)', fontSize: '13px', marginTop: '8px' }}>{sec.id === 'roi' ? '+0%' : '0%'} vs last month</div>
                  </div>
                </div>
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '16px' }}>📈</div>
                  <h3 style={{ color: 'var(--text-primary)' }}>Interactive Chart Data Loading...</h3>
                  <p>Connect Google Analytics to visualize your daily metrics.</p>
                </div>
              </div>
            );
          } else if (sec.id === 'brandvoice') {
            content = (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Tone of Voice</label>
                  <select style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '12px', borderRadius: '8px', outline: 'none' }}>
                    <option>Professional & Authoritative</option>
                    <option>Conversational & Friendly</option>
                    <option>Humorous & Witty</option>
                    <option>Academic & Data-Driven</option>
                    <option>GenZ Mode 🔥</option>
                  </select>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Custom Core Directives (System Prompt Injections)</label>
                  <textarea rows="4" placeholder="Always write in first-person plural ('we'). Never use exclamation marks. Keep sentences under 20 words where possible." style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '12px', borderRadius: '8px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}></textarea>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '13px', marginBottom: '8px' }}>Forbidden Words (Comma separated)</label>
                  <input type="text" placeholder="e.g. cheap, guarantee, magic" style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '12px', borderRadius: '8px', outline: 'none', boxSizing: 'border-box' }} />
                </div>
                <button style={{ background: 'var(--color-accent-gradient)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Save Brand Voice</button>
              </div>
            );
          } else if (sec.id === 'team') {
            content = (
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>Workspace Members</h3>
                  <button style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>+ Invite Member</button>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-surface)', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="https://i.pravatar.cc/100?img=11" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '14px' }}>Aryan (You)</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>aryan@example.com</div>
                    </div>
                  </div>
                  <span style={{ color: 'var(--color-success-500)', background: 'var(--bg-elevated)', border: '1px solid var(--color-success-border)', padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: 'bold' }}>Owner</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary-500)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>S</div>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 'bold', fontSize: '14px' }}>Sarah Jenkins</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>sarah@example.com</div>
                    </div>
                  </div>
                  <select style={{ background: 'transparent', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}>
                    <option>Editor</option>
                    <option>Viewer</option>
                    <option>Admin</option>
                  </select>
                </div>
              </div>
            );
          } else if (sec.id === 'billing') {
            content = (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                  {[
                    { name: 'Starter', price: '₹1,999', blogs: '15 blogs/mo', action: () => handlePlanUpgrade('Starter', 1999) },
                    { name: 'Growth', price: '₹4,999', blogs: '50 blogs/mo', action: () => handlePlanUpgrade('Growth', 4999) },
                    { name: 'Scale', price: 'Custom', blogs: 'Unlimited blogs', action: () => window.open('mailto:hello@blogforge.ai?subject=Scale Plan Enquiry') }
                  ].map(plan => {
                    const isActive = userPlan === plan.name;
                    const isDisabled = plan.name !== 'Scale' && isButtonDisabled(plan.name, loadingPlan, userPlan);
                    const btnText = plan.name === 'Scale' ? 'Contact Sales →' : getButtonText(plan.name, loadingPlan, userPlan);
                    return (
                    <div key={plan.name} style={{ background: isActive ? 'var(--bg-elevated)' : 'var(--bg-surface)', border: isActive ? '2px solid var(--color-primary-500)' : '1px solid var(--border-default)', borderRadius: '16px', padding: '32px', textAlign: 'center', position: 'relative', opacity: (planHierarchy[userPlan] > planHierarchy[plan.name] && !isActive) ? 0.6 : 1 }}>
                      {isActive && <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-primary-500)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '99px' }}>Current Plan</div>}
                      <h3 style={{ color: 'var(--text-primary)', fontSize: '20px', margin: '0 0 8px' }}>{plan.name}</h3>
                      <div style={{ fontSize: '36px', color: 'var(--text-primary)', fontWeight: 'bold', marginBottom: '16px' }}>{plan.price}<span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/mo</span></div>
                      <div style={{ color: 'var(--color-primary-400)', fontWeight: 'bold', fontSize: '14px', marginBottom: '24px' }}>{plan.blogs}</div>
                      <button 
                        onClick={plan.action}
                        disabled={isDisabled}
                        style={{ width: '100%', background: isActive ? 'transparent' : 'var(--bg-surface)', color: isDisabled && !isActive ? 'var(--text-muted)' : isActive ? 'var(--color-primary-400)' : 'var(--text-primary)', border: isActive ? '1px solid var(--color-primary-400)' : '1px solid var(--border-default)', padding: '12px', borderRadius: '8px', cursor: isDisabled ? 'not-allowed' : 'pointer', fontWeight: 'bold', opacity: loadingPlan === plan.name ? 0.7 : 1 }}>
                        {btnText}
                      </button>
                    </div>
                  )})}
                </div>
              </div>
            );
          }

          return (
            <div key={sec.id} id={`dash-${sec.id}`} className="dash-section" style={{ display: 'none', padding: '40px', color: 'var(--text-primary)' }}>
              <header className="top-header" style={{ marginBottom: '32px' }}>
                <div className="header-text">
                  <h1>{sec.title}</h1>
                  <p>Manage your {sec.title.toLowerCase()} settings and view reports.</p>
                </div>
              </header>
              {content || (
                <div style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border-default)', padding: '60px', textAlign: 'center', borderRadius: '16px' }}>
                  <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{sec.title} Content</h2>
                  <p style={{ color: 'var(--text-muted)' }}>This section is currently under development. Soon you'll be able to access all {sec.title.toLowerCase()} features here.</p>
                </div>
              )}
            </div>
          );
        })}
      </main>
      {/* Global Publish Modal */}
      {publishModalBlog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '32px', width: '420px', position: 'relative', boxShadow: 'var(--shadow-modal)' }}>
            <button onClick={() => setPublishModalBlog(null)} style={{ position: 'absolute', top: '20px', right: '20px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>Publish Blog</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>{publishModalBlog.title}</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 600, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target Platform</label>
              <select
                value={publishingPlatform}
                onChange={(e) => setPublishingPlatform(e.target.value)}
                style={{ width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '12px', borderRadius: '10px', fontSize: '14px', outline: 'none' }}
              >
                <option value="wordpress">WordPress</option>
                <option value="blogger">Blogger</option>
                <option value="devto">Dev.to</option>
                <option value="hashnode">Hashnode</option>
                <option value="medium">Medium</option>
              </select>
            </div>

            {/* Scheduling Options */}
            <div style={{ marginTop: '0px', padding: '16px', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-default)', marginBottom: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: isScheduled ? '12px' : '0' }}>
                <input type="checkbox" checked={isScheduled} onChange={e => setIsScheduled(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary-500)' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Schedule for later</span>
              </label>

              {isScheduled && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Publishing Date & Time</label>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={e => setScheduledAt(e.target.value)}
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', padding: '10px', borderRadius: '8px', outline: 'none', width: '100%', boxSizing: 'border-box', fontSize: '13px' }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleGlobalPublish}
              disabled={publishStatus === 'Publishing...' || publishStatus.includes('Scheduling')}
              style={{
                width: '100%',
                background: 'var(--color-accent-gradient)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '15px',
                boxShadow: 'var(--shadow-glow-primary)'
              }}
            >
              {publishStatus === 'Publishing...' || publishStatus.includes('Scheduling') ? (isScheduled ? 'Scheduling...' : 'Publishing...') : (isScheduled ? 'Schedule Blog' : 'Publish Now')}
            </button>
            {publishStatus && publishStatus !== 'Publishing...' && (
              <p style={{ marginTop: '16px', fontSize: '13px', color: publishStatus.startsWith('Error') ? 'var(--color-danger-500)' : 'var(--color-success-500)', textAlign: 'center', fontWeight: 500 }}>{publishStatus}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

