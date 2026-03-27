import React, { useEffect, useState } from 'react';
import { 
  Home, Plus, FileText, Calendar, Network, Search, Key, Target, 
  UploadCloud, Link as LinkIcon, List, BarChart3, TrendingUp, PieChart,
  Settings, Users, CreditCard, Sparkles, MoreVertical, LogOut
} from 'lucide-react';
import './Dashboard.css';
import './BlogEditor.css';
import { publishBlog } from './utils/publishBlog';
import BlogEditor from './BlogEditor';
const apiKeys = [
  import.meta.env.VITE_API1,
  import.meta.env.VITE_API2,
  import.meta.env.VITE_API3,
].filter(Boolean);
let currentKeyIndex = 0;

// Track when a key is allowed to be used again (Date.now() timestamp)
const keyCooldowns = {};

async function callGemini(prompt, maxTokens = 8192) {
  let lastError = null;
  let allKeysOnCooldown = true;

  // Try each API key exactly once in round-robin order
  for (let i = 0; i < apiKeys.length; i++) {
    const index = (currentKeyIndex + i) % apiKeys.length;
    const apiKey = apiKeys[index];

    // If this key is marked as exhausted/cooling down, skip testing it entirely
    if (keyCooldowns[apiKey] && Date.now() < keyCooldowns[apiKey]) {
      const remainingSecs = Math.ceil((keyCooldowns[apiKey] - Date.now()) / 1000);
      console.warn(`API key at index ${index} is in cooldown for ${remainingSecs}s. Skipping...`);
      continue;
    }

    // A key is ready to test
    allKeysOnCooldown = false;

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: maxTokens,
              temperature: 0.9,
              responseMimeType: "application/json"
            }
          })
        }
      );
      
      const data = await response.json();
      
      // Fallback on ANY error from the API (not just 429 quota limits)
      if (!response.ok || data.error) {
        const errorMsg = data.error ? data.error.message : `HTTP Error ${response.status}`;
        lastError = new Error(errorMsg);
        
        // Check if there is a specific wait time recommended by Google
        const match = errorMsg.match(/retry in ([\d\.]+)s/i);
        let waitSeconds = match ? parseFloat(match[1]) : 60; // Default wait to 60 seconds for errors
        
        // Mark this key as exhausted/failed so we don't attempt to use it again until cooldown passes
        keyCooldowns[apiKey] = Date.now() + (waitSeconds * 1000);
        console.warn(`API key at index ${index} failed (${errorMsg}). Marked as failed. Testing next key...`);
        
        continue; // Immediately try the next key in the array
      }
      
      // Success: update the current key index to the working key
      currentKeyIndex = index;
      
      const text = data.candidates[0].content.parts[0].text;
      return text.replace(/```json|```/g, '').trim();
    } catch (err) {
      lastError = err;
      // Default to a 60 second cooldown on network/fetch errors
      keyCooldowns[apiKey] = Date.now() + (60 * 1000);
      console.warn(`API key at index ${index} threw an error: ${err.message}. Testing next key...`);
      continue;
    }
  }

  // If we reach this point, all available keys were either skipped (on cooldown) or failed
  if (allKeysOnCooldown) {
      throw new Error("All API keys are currently full or disabled. Please wait a minute for quotas to reset.");
  }
  
  throw lastError || new Error("All API keys exhausted their quotas or returned an error.");
}

const MyBlogsSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalBlog, setModalBlog] = useState(null);

  

  
  



  const loadMyBlogs = () => {
    let saved = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
    // Check if we need to refresh old demo data (Oct 2026) to March 2026
    const hasOldData = saved.some(b => b.id === 'db1' || b.id === 'db2');
    if (saved.length === 0 || hasOldData) {
      // Inject standard demo blogs for MARCH 2026
      saved = [
        {
          id: 'db1_mar', title: '10 AI Tools Disrupting Martech in India', seoScore: '94', status: 'published',
          createdAt: '2026-03-12T10:00:00Z', views: '1,240', keyword: 'martech ai india', body: '# 10 AI Tools...'
        },
        {
          id: 'db2_mar', title: 'How to Automate SEO with Generative AI', seoScore: '88', status: 'published',
          createdAt: '2026-03-10T14:30:00Z', views: '890', keyword: 'automate seo ai', body: '# How to Automate...'
        },
        {
          id: 'db3_mar', title: 'Top 5 Tier-2 Cities for Tech Startups', seoScore: '96', status: 'scheduled',
          scheduledAt: '2026-03-15T09:00:00Z', views: '---', keyword: 'tier 2 cities startups', body: '# Top 5 Tier-2 Cities...'
        },
        {
          id: 'db4_mar', title: "Understanding Google's Helpful Content Update", seoScore: '91', status: 'scheduled',
          scheduledAt: '2026-03-18T16:00:00Z', views: '---', keyword: 'google helpful content update', body: '# Understanding Google...'
        }
      ];
      localStorage.setItem('bf_blogs', JSON.stringify(saved));
    }
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

  const deleteBlog = (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    const updated = blogs.filter(b => b.id !== id);
    localStorage.setItem('bf_blogs', JSON.stringify(updated));
    if (window.updateOverviewStats) window.updateOverviewStats();
    setBlogs(updated);
  };

  const copyBlogFromModal = (blog, e) => {
    const text = blog.title + '\n\n' + blog.metaDescription + '\n\n' + blog.body;
    navigator.clipboard.writeText(text).then(() => {
      const btn = e.target;
      const oldText = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.style.color = '#10B981';
      setTimeout(() => { btn.textContent = oldText; btn.style.color = '#94A3B8'; }, 2000);
    });
  };

  const filteredBlogs = blogs.filter(b => {
    const matchSearch = String(b.title || '').toLowerCase().includes(search.toLowerCase()) || String(b.keyword || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || b.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div id="dash-myblogs" className="dash-section" style={{display: 'none', padding: '40px', color: '#fff'}}>
      {/* Header */}
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px'}}>
        <div>
          <h2 style={{fontSize: '24px', fontWeight: 700, color: 'white', margin: 0}}>My Blogs</h2>
          <p style={{fontSize: '14px', color: '#64748B', marginTop: '4px'}}>All your generated and saved blog posts</p>
        </div>
        <button onClick={() => window.showDashboardSection && window.showDashboardSection('newblog')} style={{background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', color: 'white', border: 'none', borderRadius: '10px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'}}>+ New Blog</button>
      </div>

      {/* Filter/Search */}
      <div style={{display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap'}}>
        <input type="text" placeholder="Search blogs..." value={search} onChange={e => setSearch(e.target.value)} style={{flex: 1, minWidth: '200px', background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 16px', color: 'white', fontSize: '14px', outline: 'none'}} />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '10px 16px', color: 'white', fontSize: '14px', outline: 'none', cursor: 'pointer'}}>
          <option value="all">All Status</option>
          <option value="draft">Drafts</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Table */}
      <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr style={{background: '#0D1526'}}>
              <th style={{textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#64748B', fontWeight: 600, letterSpacing: '0.5px'}}>TITLE</th>
              <th style={{textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#64748B', fontWeight: 600}}>SEO SCORE</th>
              <th style={{textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#64748B', fontWeight: 600}}>STATUS</th>
              <th style={{textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#64748B', fontWeight: 600}}>DATE</th>
              <th style={{textAlign: 'left', padding: '14px 20px', fontSize: '12px', color: '#64748B', fontWeight: 600}}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan="5" style={{textAlign: 'center', padding: '48px', color: '#4B5563', fontSize: '14px'}}>
                  No blogs found. {blogs.length === 0 ? <span style={{color: '#7C3AED', cursor: 'pointer'}} onClick={() => window.showDashboardSection && window.showDashboardSection('newblog')}>Generate your first blog →</span> : ''}
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog) => {
                const scoreColor = blog.seoScore >= 90 ? '#10B981' : blog.seoScore >= 75 ? '#F59E0B' : '#EF4444';
                const statusStyle = blog.status === 'published' ? {background: 'rgba(16,185,129,0.1)', color: '#10B981'} : blog.status === 'scheduled' ? {background: 'rgba(245,158,11,0.1)', color: '#F59E0B'} : {background: 'rgba(100,116,139,0.1)', color: '#94A3B8'};
                const displayDate = blog.status === 'scheduled' ? (blog.scheduledAt || blog.createdAt) : blog.createdAt;
                const date = new Date(displayDate).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
                return (
                  <tr key={blog.id} style={{borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s'}} onMouseOver={e => e.currentTarget.style.background = 'rgba(124,58,237,0.05)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <td onClick={() => setModalBlog(blog)} style={{padding: '14px 20px', fontSize: '14px', color: 'white', fontWeight: 500, maxWidth: '280px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                      {blog.title}
                    </td>
                    <td style={{padding: '14px 20px'}}><span style={{color: scoreColor, fontWeight: 700, fontSize: '14px'}}>● {blog.seoScore}/100</span></td>
                    <td style={{padding: '14px 20px'}}><span style={{...statusStyle, borderRadius: '999px', padding: '4px 12px', fontSize: '12px', fontWeight: 600}}>{String(blog.status).charAt(0).toUpperCase() + String(blog.status).slice(1)}</span></td>
                    <td style={{padding: '14px 20px', fontSize: '13px', color: '#64748B'}}>{date}</td>
                    <td style={{padding: '14px 20px'}}>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button onClick={() => window.viewBlog && window.viewBlog(blog.id)} style={{background: 'rgba(124,58,237,0.15)', border: 'none', color: '#A78BFA', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer'}}>View</button>
                        <button onClick={() => window.showPublishModal && window.showPublishModal(blog.id)} style={{background: 'rgba(16,185,129,0.15)', border: 'none', color: '#10B981', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer'}}>Publish</button>
                        <button onClick={() => window.confirmDeleteBlog && window.confirmDeleteBlog(blog.id)} style={{background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer'}}>Delete</button>
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
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, overflowY: 'auto', padding: '40px 20px', display: 'block'}}>
          <div style={{maxWidth: '800px', margin: '0 auto', background: '#141B2D', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px', padding: '32px', position: 'relative'}}>
            <button onClick={() => setModalBlog(null)} style={{position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px'}}>✕</button>
            <h2 style={{fontSize: '22px', fontWeight: 700, color: 'white', marginBottom: '8px'}}>{modalBlog.title}</h2>
            <p style={{fontSize: '13px', color: '#64748B', background: '#0D1526', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px'}}>{modalBlog.metaDescription}</p>
            <div style={{display: 'flex', gap: '12px', marginBottom: '20px'}}>
              <span style={{background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600}}>SEO: {modalBlog.seoScore}/100</span>
              <span style={{background: 'rgba(124,58,237,0.1)', color: '#A78BFA', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', fontWeight: 600}}>🔑 {modalBlog.keyword}</span>
            </div>
            <div style={{fontSize: '14px', color: '#94A3B8', lineHeight: 1.8, whiteSpace: 'pre-wrap', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px'}}>{modalBlog.body}</div>
            <div style={{display: 'flex', gap: '10px', marginTop: '24px'}}>
              <button onClick={(e) => copyBlogFromModal(modalBlog, e)} style={{flex: 1, background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: '10px', padding: '12px', fontSize: '14px', cursor: 'pointer'}}>Copy Content</button>
              <button onClick={() => setModalBlog(null)} style={{flex: 1, background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', border: 'none', color: 'white', borderRadius: '10px', padding: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'}}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// NewBlogSection replaced by BlogEditor component (see BlogEditor.jsx)
// BlogEditor is rendered directly in the Dashboard JSX below



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
        if(nativeInputValueSetter) {
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
    <div id="dash-serpgap" className="dash-section" style={{display: 'none', padding: '40px', color: '#fff'}}>
      <div style={{marginBottom: '28px'}}>
        <h2 style={{fontSize: '24px', fontWeight: 700, color: 'white', margin: 0}}>SERP Gap Scanner</h2>
        <p style={{fontSize: '14px', color: '#64748B', marginTop: '4px'}}>Find content gaps your competitors aren't covering</p>
      </div>

      <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '28px', marginBottom: '24px'}}>
        <div style={{marginBottom: '16px'}}>
          <label style={{fontSize: '13px', color: '#94A3B8', fontWeight: 500, display: 'block', marginBottom: '8px'}}>Target Keyword *</label>
          <input id="serp-keyword" type="text" placeholder="e.g. project management tools India"
            value={keyword} onChange={e => { setKeyword(e.target.value); e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            style={{width: '100%', background: '#0D1526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
            onFocus={e => e.target.style.borderColor='#7C3AED'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
          />
        </div>
        <div style={{marginBottom: '20px'}}>
          <label style={{fontSize: '13px', color: '#94A3B8', fontWeight: 500, display: 'block', marginBottom: '8px'}}>Your Domain (optional)</label>
          <input id="serp-domain" type="text" placeholder="e.g. myblog.com"
            value={domain} onChange={e => setDomain(e.target.value)}
            style={{width: '100%', background: '#0D1526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
            onFocus={e => e.target.style.borderColor='#7C3AED'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
          />
        </div>
        <button onClick={runSerpScan} id="serp-btn" disabled={isScanning}
          style={{width: '100%', background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: isScanning ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: isScanning ? 0.7 : 1}}
          onMouseOver={e => !isScanning && (e.target.style.opacity='0.9')} onMouseOut={e => !isScanning && (e.target.style.opacity='1')}>
          {isScanning ? '⏳ Scanning SERP...' : results ? '🔍 Scan Again' : '🔍 Scan SERP Gaps'}
        </button>
      </div>

      {error && (
        <div style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '20px', color: '#EF4444', fontSize: '14px', marginBottom: '24px'}}>
          ❌ Error: {error}
        </div>
      )}

      {results && (
        <div id="serp-results">
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px', marginBottom: '24px'}}>
            <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', textAlign: 'center'}}>
              <div style={{fontSize: '12px', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Search Volume</div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#A78BFA'}}>{results.searchVolume}</div>
            </div>
            <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', textAlign: 'center'}}>
              <div style={{fontSize: '12px', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Difficulty</div>
              <div style={{fontSize: '24px', fontWeight: 700, color: diffColor(results.difficulty)}}>{results.difficulty}</div>
            </div>
            <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', textAlign: 'center'}}>
              <div style={{fontSize: '12px', color: '#64748B', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Gaps Found</div>
              <div style={{fontSize: '24px', fontWeight: 700, color: '#06B6D4'}}>{results.topicGaps.length}</div>
            </div>
          </div>

          <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', marginBottom: '24px'}}>
            <div style={{padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
              <h3 style={{fontSize: '15px', fontWeight: 600, color: 'white', margin: 0}}>📊 Content Gap Opportunities</h3>
            </div>
            <div style={{overflowX: 'auto'}}>
              <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '600px'}}>
                <thead>
                  <tr style={{background: '#0D1526'}}>
                    <th style={{textAlign: 'left', padding: '12px 20px', fontSize: '11px', color: '#64748B', fontWeight: 600, letterSpacing: '0.5px'}}>TOPIC GAP</th>
                    <th style={{padding: '12px 20px', fontSize: '11px', color: '#64748B', fontWeight: 600, textAlign: 'center'}}>COVERAGE</th>
                    <th style={{padding: '12px 20px', fontSize: '11px', color: '#64748B', fontWeight: 600, textAlign: 'center'}}>OPPORTUNITY</th>
                    <th style={{textAlign: 'left', padding: '12px 20px', fontSize: '11px', color: '#64748B', fontWeight: 600}}>SUGGESTED TITLE</th>
                    <th style={{padding: '12px 20px', fontSize: '11px', color: '#64748B', fontWeight: 600}}></th>
                  </tr>
                </thead>
                <tbody>
                  {results.topicGaps.map((gap, i) => (
                    <tr key={i} style={{borderTop: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s'}} onMouseOver={e => e.currentTarget.style.background='rgba(124,58,237,0.05)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                      <td style={{padding: '14px 20px', fontSize: '14px', color: 'white', fontWeight: 500}}>{gap.topic}</td>
                      <td style={{padding: '14px 20px', textAlign: 'center'}}><span style={{background: 'rgba(16,185,129,0.1)', color: covColor(gap.coverage), borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: 600}}>{gap.coverage}</span></td>
                      <td style={{padding: '14px 20px', textAlign: 'center'}}><span style={{background: 'rgba(16,185,129,0.1)', color: opColor(gap.opportunity), borderRadius: '999px', padding: '3px 12px', fontSize: '12px', fontWeight: 600}}>{gap.opportunity}</span></td>
                      <td style={{padding: '14px 20px', fontSize: '13px', color: '#94A3B8', maxWidth: '250px'}}>{gap.suggestedTitle}</td>
                      <td style={{padding: '14px 20px'}}><button onClick={() => useGapTopic(gap.suggestedTitle)} style={{background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', borderRadius: '6px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'}}>Write This →</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
            <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px'}}>
              <h4 style={{fontSize: '13px', fontWeight: 600, color: 'white', margin: '0 0 14px'}}>⭐ Featured Snippet Opportunities</h4>
              {results.featuredSnippetOpportunities.map((s, i) => (
                <div key={i} style={{fontSize: '13px', color: '#94A3B8', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '10px', alignItems: 'flex-start'}}><span style={{color: '#7C3AED', flexShrink: 0, marginTop: '1px'}}>✦</span>{s}</div>
              ))}
            </div>
            <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px'}}>
              <h4 style={{fontSize: '13px', fontWeight: 600, color: 'white', margin: '0 0 14px'}}>🔑 Recommended LSI Keywords</h4>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
                {results.recommendedLSI.map((k, i) => (
                  <span key={i} style={{background: 'rgba(124,58,237,0.1)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '999px', padding: '5px 14px', fontSize: '12px', fontWeight: 500}}>{k}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const RoidashboardSection = () => {
  return (
    <div id="dash-roi" className="dash-section" style={{display: 'none', padding: '40px', color: '#fff'}}>
      {/* Section Header */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px'}}>
        <div>
          <h2 style={{fontSize:'24px', fontWeight:'700', color:'white', margin:0}}>ROI & Reports</h2>
          <p style={{fontSize:'14px', color:'#64748B', marginTop:'4px'}}>Track your content performance and organic growth</p>
        </div>
        <button onClick={(e) => window.generateReport && window.generateReport(e)} style={{background:'linear-gradient(135deg,#7C3AED,#06B6D4)', color:'white', border:'none', borderRadius:'10px', padding:'10px 20px', fontSize:'14px', fontWeight:'600', cursor:'pointer'}}>
          ⚡ Generate AI Report
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'28px'}}>
        <div style={{background:'#141B2D', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px'}}>
          <div style={{fontSize:'12px', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px'}}>Total Blogs</div>
          <div id="roi-total-blogs" style={{fontSize:'32px', fontWeight:'700', color:'white'}}>152</div>
        </div>
        <div style={{background:'#141B2D', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px'}}>
          <div style={{fontSize:'12px', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px'}}>Avg SEO Score</div>
          <div id="roi-avg-seo" style={{fontSize:'32px', fontWeight:'700', color:'#06B6D4'}}>—</div>
        </div>
        <div style={{background:'#141B2D', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px'}}>
          <div style={{fontSize:'12px', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px'}}>Est. Monthly Traffic</div>
          <div id="roi-traffic" style={{fontSize:'32px', fontWeight:'700', color:'#10B981'}}>+14,250</div>
          <div style={{fontSize:'12px', color:'#64748B', marginTop:'4px'}}>visits</div>
        </div>
        <div style={{background:'#141B2D', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', padding:'24px'}}>
          <div style={{fontSize:'12px', color:'#64748B', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'12px'}}>Content Health</div>
          <div id="roi-health" style={{fontSize:'32px', fontWeight:'700', color:'#A78BFA'}}>—</div>
        </div>
      </div>

      {/* Performance Table */}
      <div style={{background:'#141B2D', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'16px', overflow:'hidden', marginBottom:'28px'}}>
        <div style={{padding:'18px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h3 style={{fontSize:'15px', fontWeight:'600', color:'white', margin:0}}>📊 Blog Performance Breakdown</h3>
        </div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%', borderCollapse:'collapse', minWidth:'600px'}}>
            <thead>
              <tr style={{background:'#0D1526'}}>
                <th style={{textAlign:'left', padding:'12px 20px', fontSize:'11px', color:'#64748B', fontWeight:'600', letterSpacing:'0.5px'}}>BLOG TITLE</th>
                <th style={{padding:'12px 20px', fontSize:'11px', color:'#64748B', fontWeight:'600', textAlign:'center'}}>SEO SCORE</th>
                <th style={{padding:'12px 20px', fontSize:'11px', color:'#64748B', fontWeight:'600', textAlign:'center'}}>WORD COUNT</th>
                <th style={{padding:'12px 20px', fontSize:'11px', color:'#64748B', fontWeight:'600', textAlign:'center'}}>EST. TRAFFIC</th>
                <th style={{padding:'12px 20px', fontSize:'11px', color:'#64748B', fontWeight:'600', textAlign:'center'}}>STATUS</th>
              </tr>
            </thead>
            <tbody id="roi-table-body">
              <tr>
                <td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#4B5563', fontSize:'14px'}}>
                  No blogs yet. <span style={{color:'#7C3AED', cursor:'pointer'}} onClick={() => window.showDashboardSection && window.showDashboardSection('newblog')}>Generate your first blog →</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Report Area */}
      <div id="roi-report-area" style={{display:'none', background:'#141B2D', border:'1px solid rgba(124,58,237,0.3)', borderRadius:'16px', padding:'24px'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px'}}>
          <h3 style={{fontSize:'15px', fontWeight:'600', color:'white', margin:0}}>🤖 AI Performance Report</h3>
          <button onClick={(e) => window.copyReport && window.copyReport(e)} style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#94A3B8', borderRadius:'8px', padding:'6px 14px', fontSize:'12px', cursor:'pointer'}}>Copy Report</button>
        </div>
        <div id="roi-report-content" style={{fontSize:'14px', color:'#94A3B8', lineHeight:1.8, whiteSpace:'pre-wrap'}}></div>
      </div>
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

    const escapedKeyword = keyword.toLowerCase().replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    const kwCount = (content.toLowerCase().match(new RegExp(escapedKeyword, 'g')) || []).length;
    const kwDensity = wordCount > 0 ? ((kwCount / wordCount) * 100).toFixed(2) : 0;

    const prompt = `You are an expert SEO analyst. Analyze this blog content for SEO quality.

Target keyword: "${keyword.trim()}"
Word count: ${wordCount}
Keyword density: ${kwDensity}%
Content preview: ${content.substring(0, 800)}

Return ONLY a valid JSON object:
{
  "overallScore": <integer 0-100>,
  "titleOptimization": <integer 0-100>,
  "metaDescription": <integer 0-100>,
  "keywordDensityScore": <integer 0-100>,
  "contentDepth": <integer 0-100>,
  "readabilityScore": <integer 0-100>,
  "internalLinks": <integer 0-100>,
  "snippetEligibility": <integer 0-100>,
  "aiDetectionRisk": <integer 0-100>,
  "nlpEntities": <integer 0-100>,
  "schemaMarkup": <integer 0-100>,
  "fleschScore": <integer 0-100>,
  "recommendations": ["specific actionable recommendation 1", "rec 2", "rec 3", "rec 4", "rec 5"]
}`;

    try {
      const raw = await callGemini(prompt, 1000);
      const res = JSON.parse(raw);
      setScores({...res, kwDensity});
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
    <div id="dash-seoscores" className="dash-section" style={{display: 'none', padding: '40px', color: '#fff'}}>
      <div style={{marginBottom: '28px'}}>
        <h2 style={{fontSize: '24px', fontWeight: 700, color: 'white', margin: 0}}>Live SEO Scorer</h2>
        <p style={{fontSize: '14px', color: '#64748B', marginTop: '4px'}}>Paste any content and get an instant 10-metric SEO analysis</p>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start'}}>
        <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
          <div style={{marginBottom: '16px'}}>
            <label style={{fontSize: '13px', color: '#94A3B8', fontWeight: 500, display: 'block', marginBottom: '8px'}}>Target Keyword *</label>
            <input id="seo-target-kw" type="text" placeholder="e.g. AI tools for startups"
              value={keyword} onChange={e => { setKeyword(e.target.value); e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              style={{width: '100%', background: '#0D1526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', boxSizing: 'border-box'}}
              onFocus={e => e.target.style.borderColor='#7C3AED'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            />
          </div>
          <div style={{marginBottom: '20px'}}>
            <label style={{fontSize: '13px', color: '#94A3B8', fontWeight: 500, display: 'block', marginBottom: '8px'}}>Blog Content *</label>
            <textarea id="seo-content-input" rows="12" placeholder="Paste your full blog content here..."
              value={content} onChange={e => { setContent(e.target.value); e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              style={{width: '100%', background: '#0D1526', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6}}
              onFocus={e => e.target.style.borderColor='#7C3AED'} onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.1)'}
            ></textarea>
          </div>
          <div id="seo-word-count" style={{fontSize: '12px', color: '#64748B', marginBottom: '16px'}}>{wordCount.toLocaleString()} words</div>
          <button onClick={runSeoScore} id="seo-score-btn" disabled={isAnalyzing}
            style={{width: '100%', background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', color: 'white', border: 'none', borderRadius: '10px', padding: '14px', fontSize: '15px', fontWeight: 600, cursor: isAnalyzing ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: isAnalyzing ? 0.7 : 1}}
            onMouseOver={e => !isAnalyzing && (e.target.style.opacity='0.9')} onMouseOut={e => !isAnalyzing && (e.target.style.opacity='1')}>
            {isAnalyzing ? '⏳ Analyzing...' : scores ? '📊 Analyze Again' : '📊 Analyze SEO Score'}
          </button>
        </div>

        <div id="seo-score-results">
          {isAnalyzing && (
            <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', textAlign: 'center'}}>
              <div style={{width: '48px', height: '48px', border: '3px solid #7C3AED', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 1s linear infinite'}}></div>
              <div style={{fontSize: '14px', color: '#94A3B8'}}>Running 10-metric analysis...</div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {!isAnalyzing && !scores && !error && (
            <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', textAlign: 'center', color: '#4B5563'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>📊</div>
              <div style={{fontSize: '15px', fontWeight: 500, color: '#64748B'}}>Score will appear here</div>
              <div style={{fontSize: '13px', marginTop: '8px', color: '#4B5563'}}>Paste content and click Analyze</div>
            </div>
          )}

          {error && (
            <div style={{background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '20px', color: '#EF4444', fontSize: '14px'}}>
              ❌ Error: {error}
            </div>
          )}

          {scores && (
            <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
                <div style={{width: '100px', height: '100px', borderRadius: '50%', background: `conic-gradient(${sc(scores.overallScore)} 0% ${scores.overallScore}%, #1E293B ${scores.overallScore}% 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative'}}>
                  <div style={{width: '76px', height: '76px', background: '#141B2D', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{fontSize: '26px', fontWeight: 800, color: 'white', lineHeight: 1}}>{scores.overallScore}</span>
                    <span style={{fontSize: '11px', color: '#64748B'}}>/100</span>
                  </div>
                </div>
                <div>
                  <div style={{fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '6px'}}>
                    {scores.overallScore >= 90 ? '🏆 Excellent' : scores.overallScore >= 80 ? '✅ Great' : scores.overallScore >= 70 ? '👍 Good' : scores.overallScore >= 55 ? '⚠️ Needs Work' : '❌ Poor'}
                  </div>
                  <div style={{fontSize: '13px', color: '#64748B', lineHeight: 1.6}}>Keyword: <span style={{color: '#A78BFA'}}>{keyword}</span><br />
                  {wordCount.toLocaleString()} words · Density: {scores.kwDensity}% · Flesch: {scores.fleschScore || '—'}</div>
                </div>
              </div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px'}}>
                {metrics.map((m, i) => (
                  <div key={i} style={{background: '#0D1526', borderRadius: '10px', padding: '12px 14px'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px'}}>
                      <span style={{fontSize: '12px', color: '#94A3B8'}}>{m.icon} {m.label}</span>
                      <span style={{fontSize: '13px', fontWeight: 700, color: sc(scores[m.key])}}>{scores[m.key]}</span>
                    </div>
                    <div style={{background: '#1E293B', borderRadius: '999px', height: '4px', overflow: 'hidden'}}>
                      <div style={{height: '100%', background: sc(scores[m.key]), width: scores[m.key] + '%', borderRadius: '999px'}}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{background: '#0D1526', borderRadius: '12px', padding: '18px'}}>
                <h4 style={{fontSize: '13px', fontWeight: 600, color: 'white', margin: '0 0 14px'}}>💡 Recommendations</h4>
                {scores.recommendations.map((r, i) => (
                  <div key={i} style={{fontSize: '13px', color: '#94A3B8', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', gap: '10px', alignItems: 'flex-start'}}><span style={{color: '#7C3AED', flexShrink: 0}}>→</span>{r}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};




const AutoPublisherSection = () => {
  const [credentials, setCredentials] = useState(() => {
    return JSON.parse(localStorage.getItem('bf_credentials') || '{}');
  });
  const [activeTab, setActiveTab] = useState('wordpress');
  const [saveStatus, setSaveStatus] = useState('');

  const updateCred = (platform, field, value) => {
    const updated = {
      ...credentials,
      [platform]: {
        ...(credentials[platform] || {}),
        [field]: value
      }
    };
    setCredentials(updated);
    localStorage.setItem('bf_credentials', JSON.stringify(updated));
  };

  const handleManualSave = (e) => {
    e.preventDefault();
    setSaveStatus('Connecting...');
    setTimeout(() => {
      setSaveStatus('Saved successfully!');
      setTimeout(() => setSaveStatus(''), 2000);
    }, 600);
  };

  const platforms = [
    { id: 'wordpress', name: 'WordPress', icon: '📝' },
    { id: 'blogger', name: 'Blogger', icon: '🅱️' },
    { id: 'devto', name: 'Dev.to', icon: '👩‍💻' },
    { id: 'hashnode', name: 'Hashnode', icon: '🔗' },
    { id: 'tumblr', name: 'Tumblr', icon: '🆃' }
  ];

  const inputStyle = {
    display: 'block', width: '100%', marginBottom: '16px', padding: '14px 16px', 
    background: '#0D1526', border: '1px solid rgba(255,255,255,0.1)', 
    color: 'white', borderRadius: '10px', fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s'
  };

  const labelStyle = {
    display: 'block', color: '#94A3B8', fontSize: '13px', marginBottom: '8px', fontWeight: 600
  };

  return (
    <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', maxWidth: '800px'}}>
      <h3 style={{color:'white', fontSize:'22px', marginBottom:'8px', fontWeight: 700}}>Platform Connections</h3>
      <p style={{color:'#64748B', fontSize:'14px', marginBottom:'28px'}}>Configure your external blogging platforms to enable one-click publishing.</p>
      
      <div style={{display:'flex', gap:'12px', marginBottom:'32px', overflowX:'auto', paddingBottom:'8px'}}>
        {platforms.map(p => (
          <button 
            key={p.id} 
            onClick={(e) => { e.preventDefault(); setActiveTab(p.id); }} 
            style={{
              background: activeTab === p.id ? 'linear-gradient(135deg,#7C3AED,#5B21B6)' : '#0D1526', 
              color: activeTab === p.id ? 'white' : '#94A3B8', 
              border: '1px solid ' + (activeTab === p.id ? 'transparent' : 'rgba(255,255,255,0.1)'), 
              padding:'12px 20px', borderRadius:'10px', cursor:'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s', whiteSpace: 'nowrap'
            }}
          >
            <span>{p.icon}</span> {p.name}
          </button>
        ))}
      </div>
      
      <div style={{background: 'rgba(255,255,255,0.02)', padding: '28px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.04)'}}>
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
          {activeTab === 'tumblr' && (
            <div className="animation-fade-in">
              <label style={labelStyle}>Blog Identifier</label>
              <input value={(credentials.tumblr?.blogIdentifier) || ''} onChange={e => updateCred('tumblr', 'blogIdentifier', e.target.value)} placeholder="example.tumblr.com" style={inputStyle} required />
              
              <label style={labelStyle}>Consumer Key</label>
              <input value={(credentials.tumblr?.consumerKey) || ''} onChange={e => updateCred('tumblr', 'consumerKey', e.target.value)} type="password" placeholder="from tumblr app" style={inputStyle} required />

              <label style={labelStyle}>Consumer Secret</label>
              <input value={(credentials.tumblr?.consumerSecret) || ''} onChange={e => updateCred('tumblr', 'consumerSecret', e.target.value)} type="password" placeholder="from tumblr app" style={inputStyle} required />

              <label style={labelStyle}>OAuth Token</label>
              <input value={(credentials.tumblr?.oauthToken) || ''} onChange={e => updateCred('tumblr', 'oauthToken', e.target.value)} type="password" placeholder="from console auth" style={inputStyle} required />

              <label style={labelStyle}>OAuth Token Secret</label>
              <input value={(credentials.tumblr?.oauthTokenSecret) || ''} onChange={e => updateCred('tumblr', 'oauthTokenSecret', e.target.value)} type="password" placeholder="from console" style={inputStyle} required />
            </div>
          )}

          <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px'}}>
            <button type="submit" style={{background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', padding: '14px 28px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16,185,129,0.2)'}}>
              {saveStatus ? saveStatus : 'Save & Connect'}
            </button>
            <span style={{color: '#94A3B8', fontSize: '13px'}}>Keys are stored securely in your browser\'s local cache.</span>
          </div>
        </form>
      </div>
    </div>
  );
};


const Dashboard = ({ onLogout }) => {
  const [blogs, setBlogs] = useState([]);
  const [viewDate, setViewDate] = useState(new Date());

  // Global Publish Modal State
  const [publishModalBlog, setPublishModalBlog] = useState(null);
  const [publishingPlatform, setPublishingPlatform] = useState('wordpress');
  const [publishStatus, setPublishStatus] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');

  const loadDashboardBlogs = () => {
    let saved = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
    const hasOldData = saved.some(b => b.id === 'db1' || b.id === 'db2');
    if (saved.length === 0 || hasOldData) {
      // Inject standard demo blogs for MARCH 2026
      saved = [
        {
          id: 'db1_mar', title: '10 AI Tools Disrupting Martech in India', seoScore: '94', status: 'published',
          createdAt: '2026-03-12T10:00:00Z', views: '1,240', keyword: 'martech ai india', body: '# 10 AI Tools...'
        },
        {
          id: 'db2_mar', title: 'How to Automate SEO with Generative AI', seoScore: '88', status: 'published',
          createdAt: '2026-03-10T14:30:00Z', views: '890', keyword: 'automate seo ai', body: '# How to Automate...'
        },
        {
          id: 'db3_mar', title: 'Top 5 Tier-2 Cities for Tech Startups', seoScore: '96', status: 'scheduled',
          scheduledAt: '2026-03-15T09:00:00Z', views: '---', keyword: 'tier 2 cities startups', body: '# Top 5 Tier-2 Cities...'
        },
        {
          id: 'db4_mar', title: "Understanding Google's Helpful Content Update", seoScore: '91', status: 'scheduled',
          scheduledAt: '2026-03-18T16:00:00Z', views: '---', keyword: 'google helpful content update', body: '# Understanding Google...'
        }
      ];
      localStorage.setItem('bf_blogs', JSON.stringify(saved));
    }
    setBlogs(saved);
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
      const bIdx = blogs.findIndex(b => b.id === publishModalBlog.id);
      if (bIdx !== -1) {
        blogs[bIdx].status = 'scheduled';
        blogs[bIdx].scheduledAt = scheduledAt;
        blogs[bIdx].platform = publishingPlatform;
        localStorage.setItem('bf_blogs', JSON.stringify(blogs));
        if (window.loadMyBlogs) window.loadMyBlogs();
        if (window.loadDashboardBlogs) window.loadDashboardBlogs();
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
      const bIdx = blogs.findIndex(b => b.id === publishModalBlog.id);
      if (bIdx !== -1) {
        blogs[bIdx].status = 'published';
        localStorage.setItem('bf_blogs', JSON.stringify(blogs));
        if (window.loadMyBlogs) window.loadMyBlogs();
        if (window.loadDashboardBlogs) window.loadDashboardBlogs();
      }

      setTimeout(() => setPublishModalBlog(null), 1500);
    } catch(err) {
      setPublishStatus('Error: ' + err.message);
    }
  };

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
  }, []);

  useEffect(() => {
    window.updateOverviewStats = function() {
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
        if (totalEl) totalEl.textContent = '152';
        if (avgEl) avgEl.textContent = '94';
        if (trafficEl) trafficEl.textContent = '+14,250';
        if (topEl) topEl.textContent = '10 AI Martech Tools Disrupting India';
      }

      const usageBar = document.getElementById('plan-usage-bar');
      const usageCount = document.getElementById('plan-usage-count');
      if (usageBar) usageBar.style.width = Math.min((blogs.length / 50) * 100, 100) + '%';
      if (usageCount) usageCount.textContent = blogs.length + '/50 blogs';
    };

    window.loadROIDashboard = function() {
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
            return '<tr style="border-top:1px solid rgba(255,255,255,0.04); transition:background 0.15s;" onmouseover="this.style.background=\'rgba(124,58,237,0.05)\'" onmouseout="this.style.background=\'transparent\'">' +
              '<td style="padding:14px 20px; font-size:14px; color:white; font-weight:500; max-width:280px;">' + blog.title + '</td>' +
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

    window.generateReport = async function(e) {
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
      } catch(err) {
        alert('Error generating report: ' + err.message);
        btn.textContent = originalText;
        btn.disabled = false;
      }
    };

    window.copyReport = function(e) {
      const contentEl = document.getElementById('roi-report-content');
      if (!contentEl) return;
      const content = contentEl.textContent;
      navigator.clipboard.writeText(content).then(() => {
        const btn = e.currentTarget;
        const oldText = btn.textContent;
        btn.textContent = '✓ Copied!';
        btn.style.color = '#10B981';
        setTimeout(() => { btn.textContent = oldText; btn.style.color = '#94A3B8'; }, 2000);
      });
    };

    // --- Action Menu & Toast System ---
    
    window.showToast = function(message, type = 'success') {
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

    window.toggleActionMenu = function(e) {
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

    window.viewBlog = function(id) {
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const blog = blogs.find(b => b.id == id);
      if (blog && window.loadMyBlogs) {
        // We can't easily open the modal of MyBlogsSection from here if we're not in that section,
        // so we'll just switch to the section and hope it handles it, or implement a global modal.
        // For now, let's just alert or log as a placeholder if we're not in MyBlogsSection.
        window.showDashboardSection('myblogs');
        // If MyBlogsSection is already mounted, it might have its own modal state.
        // This is a bit tricky with React vs Globals.
        console.log("Viewing blog:", blog);
      }
    };

    window.copyBlog = function(id, e) {
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const blog = blogs.find(b => b.id == id);
      if (blog) {
        const text = (blog.title || '') + '\n\n' + (blog.metaDescription || '') + '\n\n' + (blog.body || '');
        navigator.clipboard.writeText(text).then(() => {
          window.showToast('Content copied to clipboard!');
        });
      }
      const menu = e.target.closest('.action-dropdown');
      if (menu) menu.classList.remove('open');
    };

    window.publishBlog = function(id) {
      if (window.showPublishModal) window.showPublishModal(id);
    };

    window.viewBlog = function(id) {
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const blog = blogs.find(b => b.id == id);
      if (blog) setPublishModalBlog(blog);
    };

    window.scheduleBlog = function(id, e) {
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const idx = blogs.findIndex(b => b.id == id);
      if (idx !== -1) {
        blogs[idx].status = 'scheduled';
        localStorage.setItem('bf_blogs', JSON.stringify(blogs));
        window.showToast('Blog scheduled for tomorrow.');
        if (window.loadMyBlogs) window.loadMyBlogs();
        if (window.updateOverviewStats) window.updateOverviewStats();
        if (window.loadROIDashboard) window.loadROIDashboard();
      }
      const menu = e.target.closest('.action-dropdown');
      if (menu) menu.classList.remove('open');
    };

    window.confirmDeleteBlog = function(id, e) {
      if (!confirm('Are you sure you want to delete this blog? This action cannot be undone.')) return;
      
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
      const updated = blogs.filter(b => b.id != id);
      localStorage.setItem('bf_blogs', JSON.stringify(updated));
      
      window.showToast('Blog deleted.', 'warning');
      
      if (window.loadMyBlogs) window.loadMyBlogs();
      if (window.updateOverviewStats) window.updateOverviewStats();
      if (window.loadROIDashboard) window.loadROIDashboard();
      
      if (e && e.target && e.target.closest) {
        const menu = e.target.closest('.action-dropdown');
        if (menu) menu.classList.remove('open');
      }
    };

    window.showDashboardSection = function(section) {
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
    { id: 'team', title: 'Team' },
    { id: 'billing', title: 'Billing' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Sparkles className="logo-icon text-violet-400" size={24} color="#A78BFA" />
          <span className="logo-text" onClick={() => window.showMarketingSite && window.showMarketingSite()} style={{cursor: 'pointer'}}>BlogzzUP</span>
        </div>
        
        <div style={{padding: '0 12px'}}>
          <a onClick={() => window.showMarketingSite && window.showMarketingSite()} style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#64748B', cursor:'pointer', padding:'8px 12px', borderRadius:'8px', marginBottom:'8px', transition:'all 0.2s', textDecoration:'none'}} onMouseOver={(e) => e.currentTarget.style.color='#fff'} onMouseOut={(e) => e.currentTarget.style.color='#64748B'}>
            ← Back to Home
          </a>
        </div>

        <div className="sidebar-user">
          <img src="https://i.pravatar.cc/100?img=11" alt="User" className="user-avatar" />
          <div className="user-info">
            <span className="user-name">My Workspace</span>
            <span className="user-plan">Growth Plan</span>
          </div>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Dashboard navigation">
          <div className="nav-group">
            <a role="button" tabIndex={0} className="nav-item sidebar-link sidebar-active active" data-section="overview" onClick={() => window.showDashboardSection('overview')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('overview')} style={{cursor: 'pointer'}}><Home size={18} aria-hidden="true"/> Overview</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label" id="nav-label-content">Content</h4>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="newblog" onClick={() => window.showDashboardSection('newblog')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('newblog')} style={{cursor: 'pointer'}}><Plus size={18} aria-hidden="true"/> New Blog</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="myblogs" onClick={() => window.showDashboardSection('myblogs')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('myblogs')} style={{cursor: 'pointer'}}><FileText size={18} aria-hidden="true"/> My Blogs</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="calendar" onClick={() => window.showDashboardSection('calendar')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('calendar')} style={{cursor: 'pointer'}}><Calendar size={18} aria-hidden="true"/> Content Calendar</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="clustermap" onClick={() => window.showDashboardSection('clustermap')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('clustermap')} style={{cursor: 'pointer'}}><Network size={18} aria-hidden="true"/> Cluster Map</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label" id="nav-label-research">Research</h4>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="serpgap" onClick={() => window.showDashboardSection('serpgap')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('serpgap')} style={{cursor: 'pointer'}}><Search size={18} aria-hidden="true"/> SERP Gap Scanner</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="keywords" onClick={() => window.showDashboardSection('keywords')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('keywords')} style={{cursor: 'pointer'}}><Key size={18} aria-hidden="true"/> Keyword Planner</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="competitor" onClick={() => window.showDashboardSection('competitor')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('competitor')} style={{cursor: 'pointer'}}><Target size={18} aria-hidden="true"/> Competitor Spy</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label" id="nav-label-publish">Publish</h4>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="publisher" onClick={() => window.showDashboardSection('publisher')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('publisher')} style={{cursor: 'pointer'}}><UploadCloud size={18} aria-hidden="true"/> Auto-Publisher</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="integrations" onClick={() => window.showDashboardSection('integrations')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('integrations')} style={{cursor: 'pointer'}}><LinkIcon size={18} aria-hidden="true"/> Integrations</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="schedule" onClick={() => window.showDashboardSection('schedule')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('schedule')} style={{cursor: 'pointer'}}><List size={18} aria-hidden="true"/> Schedule Queue</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label" id="nav-label-analyze">Analyze</h4>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="seoscores" onClick={() => window.showDashboardSection('seoscores')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('seoscores')} style={{cursor: 'pointer'}}><BarChart3 size={18} aria-hidden="true"/> SEO Scores</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="traffic" onClick={() => window.showDashboardSection('traffic')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('traffic')} style={{cursor: 'pointer'}}><TrendingUp size={18} aria-hidden="true"/> Traffic Tracker</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="roi" onClick={() => window.showDashboardSection('roi')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('roi')} style={{cursor: 'pointer'}}><PieChart size={18} aria-hidden="true"/> ROI Dashboard</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label" id="nav-label-settings">Settings</h4>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="brandvoice" onClick={() => window.showDashboardSection('brandvoice')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('brandvoice')} style={{cursor: 'pointer'}}><Settings size={18} aria-hidden="true"/> Brand Voice</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="team" onClick={() => window.showDashboardSection('team')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('team')} style={{cursor: 'pointer'}}><Users size={18} aria-hidden="true"/> Team</a>
            <a role="button" tabIndex={0} className="nav-item sidebar-link" data-section="billing" onClick={() => window.showDashboardSection('billing')} onKeyDown={(e) => (e.key==='Enter'||e.key===' ') && window.showDashboardSection('billing')} style={{cursor: 'pointer'}}><CreditCard size={18} aria-hidden="true"/> Billing</a>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div style={{background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', padding: '12px 14px', margin: '12px 8px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
              <span style={{width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', display: 'inline-block'}}></span>
              <span style={{fontSize: '12px', color: '#10B981', fontWeight: 600}}>AI Engine Active</span>
            </div>
            <div style={{fontSize: '11px', color: 'var(--text-subtle)'}}>Gemini 2.5 Flash</div>
          </div>

          <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px', margin: '8px'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <span style={{fontSize: '12px', fontWeight: 600, color: '#A78BFA'}}>Growth Plan</span>
              <span id="plan-usage-count" style={{fontSize: '11px', color: '#64748B'}}>0/50 blogs</span>
            </div>
            <div style={{background: '#0D1526', borderRadius: '999px', height: '5px', overflow: 'hidden', marginBottom: '10px'}}>
              <div id="plan-usage-bar" style={{height: '100%', background: 'linear-gradient(90deg,#7C3AED,#06B6D4)', width: '0%', borderRadius: '999px', transition: 'width 0.5s ease'}}></div>
            </div>
            <button onClick={() => window.showDashboardSection && window.showDashboardSection('billing')} style={{width: '100%', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#A78BFA', borderRadius: '8px', padding: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'}}>
              Upgrade to Scale
            </button>
          </div>
          <button className="logout-btn" onClick={() => { if(window.signOut) window.signOut(); else onLogout(); }}><LogOut size={16}/> Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content" style={{overflowY: 'auto'}}>
        {/* Overview Section */}
        <div id="dash-overview" className="dash-section" style={{display: 'block'}}>
          <header className="top-header">
            <div className="header-text">
              <h1 className="dashboard-greeting">Good morning 👋</h1>
              <p>Your blogs are running on autopilot.</p>
            </div>
            <div className="header-actions">
              <button 
                onClick={() => window.showDashboardSection('roi')} 
                style={{background:'transparent', color:'#94A3B8', border:'none', fontSize:'14px', fontWeight:500, cursor:'pointer', padding:'11px 22px', borderRadius:'999px', transition:'all 0.2s'}} 
                onMouseOver={(e) => e.currentTarget.style.color='white'} 
                onMouseOut={(e) => e.currentTarget.style.color='#94A3B8'}
              >
                View Reports →
              </button>
              <button 
                onClick={() => window.showDashboardSection('serpgap')} 
                style={{background:'transparent', color:'white', border:'1px solid rgba(255,255,255,0.15)', borderRadius:'999px', padding:'11px 22px', fontSize:'14px', fontWeight:500, cursor:'pointer', transition:'all 0.2s'}} 
                onMouseOver={(e) => { e.currentTarget.style.borderColor='#7C3AED'; e.currentTarget.style.color='#A78BFA'; }} 
                onMouseOut={(e) => { e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; e.currentTarget.style.color='white'; }}
              >
                🔍 Scan SERP Gaps
              </button>
              <button 
                onClick={() => window.showDashboardSection('newblog')} 
                style={{background:'linear-gradient(135deg,#7C3AED,#5B21B6)', color:'white', border:'none', borderRadius:'999px', padding:'11px 22px', fontSize:'14px', fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', transition:'all 0.2s'}} 
                onMouseOver={(e) => e.currentTarget.style.transform='translateY(-1px)'} 
                onMouseOut={(e) => e.currentTarget.style.transform='translateY(0)'}
              >
                + New Blog
              </button>
            </div>
          </header>

          <div className="stats-row">
            <div className="stat-dash-card">
              <div className="stat-title">Blogs Published This Month</div>
              <div className="stat-val" id="stat-published">15</div>
            </div>
            <div className="stat-dash-card">
              <div className="stat-title">Avg SEO Score</div>
              <div className="stat-val text-cyan"><span id="stat-avgseo">91</span><span className="text-sm text-muted">/100</span></div>
            </div>
            <div className="stat-dash-card">
              <div className="stat-title">Est. Monthly Traffic</div>
              <div className="stat-val text-green"><span id="stat-traffic">+2,340</span> <span className="text-sm">visits</span></div>
            </div>
            <div className="stat-dash-card">
              <div className="stat-title">Top Ranking Blog</div>
              <div className="stat-val text-md" id="stat-topblog" style={{fontSize: '1.2rem', marginTop: '0.5rem', lineHeight: 1.4}}>AI Tools for Startups</div>
            </div>
          </div>

          <div className="dashboard-grid">
            {/* Content Table */}
            <div className="content-table-panel">
              <div className="panel-header">
                <h3>Your Blogs</h3>
                <span 
                  onClick={() => window.showDashboardSection('myblogs')} 
                  style={{fontSize:'14px', color:'#7C3AED', cursor:'pointer', fontWeight:500}} 
                  onMouseOver={(e) => e.currentTarget.style.color='#A78BFA'} 
                  onMouseOut={(e) => e.currentTarget.style.color='#7C3AED'}
                >
                  View all →
                </span>
              </div>
              <div className="table-responsive">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>SEO Score</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Traffic</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map((blog, idx) => (
                      <tr key={idx}>
                        <td className="font-medium text-white">{blog.title}</td>
                        <td>
                          <div className="score-badge">
                            <span className={`dot ${blog.score >= 90 ? 'green' : 'amber'}`}></span>
                            {blog.score}/100
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${blog.statusColor}`}>{blog.status}</span>
                        </td>
                        <td className="text-muted">{blog.date}</td>
                        <td>{blog.traffic}</td>
                        <td className="actions-cell">
                          <div style={{display: 'flex', gap: '8px'}}>
                            <button onClick={() => window.viewBlog && window.viewBlog(blog.id)} style={{background: 'rgba(124,58,237,0.15)', border: 'none', color: '#A78BFA', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer'}}>View</button>
                            <button onClick={() => window.showPublishModal && window.showPublishModal(blog.id)} style={{background: 'rgba(16,185,129,0.15)', border: 'none', color: '#10B981', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer'}}>Publish</button>
                            <button onClick={() => window.confirmDeleteBlog && window.confirmDeleteBlog(blog.id, {target: {}})} style={{background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', borderRadius: '6px', padding: '4px 10px', fontSize: '11px', cursor: 'pointer'}}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right side panel mini calendar */}
            <div className="calendar-panel">
              <div className="panel-header">
                <h3>Content Calendar</h3>
              </div>
              <div className="mini-calendar">
                <div className="cal-header">
                  <span>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                  <div className="cal-nav">
                    <button onClick={() => changeMonth(-1)}>&lt;</button>
                    <button onClick={() => changeMonth(1)}>&gt;</button>
                  </div>
                </div>
                <div className="cal-grid">
                  {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="cal-day-name">{d}</div>)}
                  {(() => {
                    const year = viewDate.getFullYear();
                    const month = viewDate.getMonth();
                    const firstDay = new Date(year, month, 1).getDay();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    const cells = [];
                    
                    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="cal-cell empty"></div>);
                    
                    for (let d = 1; d <= daysInMonth; d++) {
                      const dayBlogs = blogs.filter(b => {
                        const date = new Date(b.status === 'scheduled' ? b.scheduledAt : b.createdAt);
                        return date.getDate() === d && date.getMonth() === month && date.getFullYear() === year && (b.status === 'published' || b.status === 'scheduled');
                      });
                      const hasPublished = dayBlogs.some(b => b.status === 'published');
                      const hasScheduled = dayBlogs.some(b => b.status === 'scheduled');
                      
                      cells.push(
                        <div key={d} className={`cal-cell ${dayBlogs.length > 0 ? (hasPublished ? 'active-blue' : 'active-amber') : ''}`}>
                          {d}
                          {dayBlogs.length > 0 && <div className={`cal-dot ${hasPublished ? 'green' : 'amber'}`}></div>}
                        </div>
                      );
                    }
                    return cells;
                  })()}
                </div>
                <div className="cal-legend">
                  <div className="legend-item"><span className="dot green"></span> Published</div>
                  <div className="legend-item"><span className="dot amber"></span> Scheduled</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <BlogEditor callGemini={callGemini} publishBlog={publishBlog} />
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
              <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                  <h3 style={{margin:0, color:'white', fontSize:'16px'}}>{viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h3>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button onClick={() => changeMonth(-1)} style={{background: '#0D1526', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'}}>&lt; Prev</button>
                    <button onClick={() => changeMonth(1)} style={{background: '#0D1526', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:'6px', cursor:'pointer'}}>Next &gt;</button>
                  </div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', color: '#94A3B8', fontSize: '12px', marginBottom: '10px'}}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d}>{d}</div>)}
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px'}}>
                  {(() => {
                    const cells = [];
                    for (let i = 0; i < firstDay; i++) {
                      cells.push(<div key={`empty-${i}`} style={{minHeight: '80px'}}></div>);
                    }
                    for (let d = 1; d <= daysInMonth; d++) {
                      const dayBlogs = blogs.filter(b => {
                        const date = new Date(b.status === 'scheduled' ? b.scheduledAt : b.createdAt);
                        return date.getDate() === d && date.getMonth() === month && date.getFullYear() === year && (b.status === 'published' || b.status === 'scheduled');
                      });
                      cells.push(
                        <div key={d} style={{background: '#0D1526', border: '1px solid rgba(255,255,255,0.04)', minHeight: '80px', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
                          <span style={{color: 'white', fontSize:'12px'}}>{d}</span>
                          {dayBlogs.map(b => (
                              <div key={b.id} style={{
                                 background: b.status === 'published' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', 
                                 color: b.status === 'published' ? '#10B981' : '#F59E0B', 
                                 fontSize:'10px', padding:'2px 4px', borderRadius:'4px', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'
                              }} title={b.title}>
                                 {b.status === 'published' ? 'Live: ' : 'Sch: '}{b.title}
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
              <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '60px', position: 'relative'}}>
                <div style={{background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', padding: '16px 32px', borderRadius: '12px', color: 'white', fontWeight: 'bold', fontSize: '18px', zIndex: 2}}>Pillar: Artificial Intelligence</div>
                <div style={{height: '40px', width: '2px', background: 'rgba(255,255,255,0.1)'}}></div>
                <div style={{width: '600px', height: '2px', background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between'}}>
                  <div style={{width: '2px', height: '40px', background: 'rgba(255,255,255,0.1)'}}></div>
                  <div style={{width: '2px', height: '40px', background: 'rgba(255,255,255,0.1)'}}></div>
                  <div style={{width: '2px', height: '40px', background: 'rgba(255,255,255,0.1)'}}></div>
                </div>
                <div style={{width: '640px', display: 'flex', justifyContent: 'space-between', marginTop: '40px'}}>
                  <div style={{background: '#0D1526', border: '1px solid rgba(16,185,129,0.3)', padding: '12px 16px', borderRadius: '8px', color: '#10B981', fontSize: '13px'}}>Generative AI Tools</div>
                  <div style={{background: '#0D1526', border: '1px solid rgba(245,158,11,0.3)', padding: '12px 16px', borderRadius: '8px', color: '#F59E0B', fontSize: '13px'}}>AI Content Detection</div>
                  <div style={{background: '#0D1526', border: '1px dashed rgba(255,255,255,0.2)', padding: '12px 16px', borderRadius: '8px', color: '#94A3B8', fontSize: '13px'}}>+ Add Cluster</div>
                </div>
              </div>
            );
          } else if (sec.id === 'keywords') {
            content = (
              <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                <div style={{display:'flex', gap:'12px', marginBottom: '20px'}}>
                  <input type="text" placeholder="Seed keyword..." style={{flex:1, background: '#0D1526', border: '1px solid rgba(255,255,255,0.1)', color:'white', padding:'10px 16px', borderRadius:'8px', outline:'none'}} />
                  <button style={{background: '#7C3AED', color: 'white', border: 'none', padding:'10px 20px', borderRadius:'8px', cursor: 'pointer'}}>Discover</button>
                </div>
                <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left'}}>
                  <thead>
                    <tr style={{borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#64748B', fontSize: '12px'}}>
                      <th style={{padding: '12px'}}>KEYWORD</th><th style={{padding: '12px'}}>VOLUME</th><th style={{padding: '12px'}}>KD</th><th style={{padding: '12px'}}>INTENT</th><th style={{padding: '12px'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {['ai writing tools', 'best ai for seo', 'free ai copywriter', 'how to use chatgpt for blogging'].map((kw, i) => (
                      <tr key={kw} style={{borderBottom: '1px solid rgba(255,255,255,0.04)', color: 'white', fontSize: '14px'}}>
                        <td style={{padding: '16px 12px'}}>{kw}</td>
                        <td style={{padding: '16px 12px'}}>{[12400, 8100, 5400, 3200][i]}</td>
                        <td style={{padding: '16px 12px'}}><span style={{color: ['#EF4444','#F59E0B','#10B981','#10B981'][i]}}>{[84, 62, 28, 14][i]}</span></td>
                        <td style={{padding: '16px 12px'}}><span style={{background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius:'4px', fontSize:'11px'}}>Commercial</span></td>
                        <td style={{padding: '16px 12px', textAlign:'right'}}><button style={{background:'transparent', color:'#A78BFA', border:'1px solid rgba(167,139,250,0.3)', padding:'4px 12px', borderRadius:'6px'}}>+ Add</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          } else if (sec.id === 'competitor') {
            content = (
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px'}}>
                <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                  <h3 style={{marginTop:0, color:'white', fontSize:'16px'}}>Spy on Competitor</h3>
                  <input type="text" placeholder="https://competitor.com" style={{width:'100%', background: '#0D1526', border: '1px solid rgba(255,255,255,0.1)', color:'white', padding:'12px 16px', borderRadius:'8px', outline:'none', marginBottom:'16px', boxSizing:'border-box'}} />
                  <button style={{width:'100%', background: '#06B6D4', color: 'white', border: 'none', padding:'12px', borderRadius:'8px', fontWeight:'bold', cursor:'pointer'}}>Analyze Domain</button>
                </div>
                <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', display:'flex', flexDirection:'column', gap:'16px'}}>
                   <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'12px'}}>
                     <span style={{color:'#94A3B8', fontSize:'13px'}}>Domain Authority</span><span style={{color:'white', fontWeight:'bold'}}>78</span>
                   </div>
                   <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'12px'}}>
                     <span style={{color:'#94A3B8', fontSize:'13px'}}>Organic Traffic</span><span style={{color:'white', fontWeight:'bold'}}>1.2M / mo</span>
                   </div>
                   <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'12px'}}>
                     <span style={{color:'#94A3B8', fontSize:'13px'}}>Top Keywords</span><span style={{color:'white', fontWeight:'bold'}}>45,200</span>
                   </div>
                </div>
              </div>
            );
          } else if (sec.id === 'publisher') {
            content = <AutoPublisherSection />;
          } else if (sec.id === 'integrations') {
            content = (
              <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'20px', marginBottom:'20px'}}>
                   <div>
                     <h3 style={{color:'white', margin:'0 0 4px', fontSize:'16px'}}>Google Analytics 4</h3>
                     <p style={{color:'#64748B', margin:0, fontSize:'13px'}}>Track real-time traffic and events from generated content.</p>
                   </div>
                   <button style={{background:'#10B981', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', cursor:'pointer'}}>Connected ✓</button>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid rgba(255,255,255,0.05)', paddingBottom:'20px', marginBottom:'20px'}}>
                   <div>
                     <h3 style={{color:'white', margin:'0 0 4px', fontSize:'16px'}}>Google Search Console</h3>
                     <p style={{color:'#64748B', margin:0, fontSize:'13px'}}>Import keyword data and track index status automatically.</p>
                   </div>
                   <button style={{background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid rgba(255,255,255,0.1)', padding:'8px 20px', borderRadius:'8px', cursor:'pointer'}}>Connect</button>
                </div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                   <div>
                     <h3 style={{color:'white', margin:'0 0 4px', fontSize:'16px'}}>Zapier</h3>
                     <p style={{color:'#64748B', margin:0, fontSize:'13px'}}>Connect BlogzzUP to 5,000+ apps.</p>
                   </div>
                   <button style={{background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid rgba(255,255,255,0.1)', padding:'8px 20px', borderRadius:'8px', cursor:'pointer'}}>Connect</button>
                </div>
              </div>
            );
          } else if (sec.id === 'schedule') {
            content = (
              <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                {(typeof blogs !== 'undefined' ? blogs : []).filter(b => b.status === 'scheduled').length === 0 ? (
                    <div style={{textAlign:'center', padding:'40px', color:'#64748B'}}>No upcoming scheduled blogs.</div>
                 ) : (
                    blogs.filter(b => b.status === 'scheduled').map(blog => {
                      const sDate = new Date(blog.scheduledAt);
                      return (
                        <div key={blog.id} style={{display:'flex', alignItems:'center', gap:'16px', padding:'16px', background:'#0D1526', borderRadius:'12px', marginBottom:'12px'}}>
                          <div style={{background:'rgba(124,58,237,0.1)', color:'#A78BFA', padding:'10px', borderRadius:'8px', textAlign:'center', minWidth:'50px'}}>
                             <div style={{fontSize:'11px', textTransform:'uppercase'}}>{sDate.toLocaleDateString('en-IN', {month:'short'})}</div>
                             <div style={{fontSize:'20px', fontWeight:'bold'}}>{sDate.getDate()}</div>
                          </div>
                          <div style={{flex:1}}>
                            <h4 style={{margin:'0 0 4px', color:'white', fontSize:'15px'}}>{blog.title}</h4>
                            <p style={{margin:0, color:'#64748B', fontSize:'13px'}}>
                               Scheduled for {sDate.toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'numeric', minute:'numeric', hour12:true })}
                            </p>
                          </div>
                          <div style={{fontSize:'12px', color:'#10B981', background:'rgba(16,185,129,0.1)', padding:'4px 10px', borderRadius:'99px', textTransform:'capitalize'}}>{blog.platform}</div>
                        </div>
                      );
                    })
                 )}
              </div>
            );
          } else if (sec.id === 'traffic' || sec.id === 'roi') {
            content = (
              <div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px', marginBottom:'20px'}}>
                   <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                     <div style={{color:'#94A3B8', fontSize:'13px', marginBottom:'8px'}}>{sec.id === 'roi' ? 'Est. Traffic Value' : 'Total Sessions'}</div>
                     <div style={{color:'white', fontSize:'28px', fontWeight:'bold'}}>{sec.id === 'roi' ? '₹4,520' : '45.2K'}</div>
                     <div style={{color:'#10B981', fontSize:'13px', marginTop:'8px'}}>+12.4% vs last month</div>
                   </div>
                   <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                     <div style={{color:'#94A3B8', fontSize:'13px', marginBottom:'8px'}}>{sec.id === 'roi' ? 'Content Cost Saved' : 'Avg. Duration'}</div>
                     <div style={{color:'white', fontSize:'28px', fontWeight:'bold'}}>{sec.id === 'roi' ? '₹12,400' : '2m 14s'}</div>
                     <div style={{color:'#10B981', fontSize:'13px', marginTop:'8px'}}>+5.2% vs last month</div>
                   </div>
                   <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                     <div style={{color:'#94A3B8', fontSize:'13px', marginBottom:'8px'}}>{sec.id === 'roi' ? 'Leads Generated' : 'Bounce Rate'}</div>
                     <div style={{color:'white', fontSize:'28px', fontWeight:'bold'}}>{sec.id === 'roi' ? '242' : '42.1%'}</div>
                     <div style={{color:'#10B981', fontSize:'13px', marginTop:'8px'}}>{sec.id === 'roi' ? '+18.1%' : '-2.4%'} vs last month</div>
                   </div>
                </div>
                <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '40px', textAlign:'center', color:'#64748B'}}>
                   <div style={{fontSize:'40px', marginBottom:'16px'}}>📈</div>
                   <h3>Interactive Chart Data Loading...</h3>
                   <p>Connect Google Analytics to visualize your daily metrics.</p>
                </div>
              </div>
            );
          } else if (sec.id === 'brandvoice') {
            content = (
              <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                <div style={{marginBottom:'20px'}}>
                  <label style={{display:'block', color:'#94A3B8', fontSize:'13px', marginBottom:'8px'}}>Tone of Voice</label>
                  <select style={{width:'100%', background:'#0D1526', border:'1px solid rgba(255,255,255,0.1)', color:'white', padding:'12px', borderRadius:'8px', outline:'none'}}>
                    <option>Professional & Authoritative</option>
                    <option>Conversational & Friendly</option>
                    <option>Humorous & Witty</option>
                    <option>Academic & Data-Driven</option>
                  </select>
                </div>
                <div style={{marginBottom:'20px'}}>
                  <label style={{display:'block', color:'#94A3B8', fontSize:'13px', marginBottom:'8px'}}>Custom Core Directives (System Prompt Injections)</label>
                  <textarea rows="4" placeholder="Always write in first-person plural ('we'). Never use exclamation marks. Keep sentences under 20 words where possible." style={{width:'100%', background:'#0D1526', border:'1px solid rgba(255,255,255,0.1)', color:'white', padding:'12px', borderRadius:'8px', outline:'none', resize:'vertical', boxSizing:'border-box'}}></textarea>
                </div>
                <div style={{marginBottom:'20px'}}>
                  <label style={{display:'block', color:'#94A3B8', fontSize:'13px', marginBottom:'8px'}}>Forbidden Words (Comma separated)</label>
                  <input type="text" placeholder="e.g. cheap, guarantee, magic" style={{width:'100%', background:'#0D1526', border:'1px solid rgba(255,255,255,0.1)', color:'white', padding:'12px', borderRadius:'8px', outline:'none', boxSizing:'border-box'}} />
                </div>
                <button style={{background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', color: 'white', border: 'none', padding:'12px 24px', borderRadius:'8px', cursor: 'pointer', fontWeight:'bold'}}>Save Brand Voice</button>
              </div>
            );
          } else if (sec.id === 'team') {
            content = (
              <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px'}}>
                  <h3 style={{color:'white', margin:0}}>Workspace Members</h3>
                  <button style={{background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid rgba(255,255,255,0.1)', padding:'8px 16px', borderRadius:'8px', cursor:'pointer'}}>+ Invite Member</button>
                </div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:'#0D1526', borderRadius:'12px', marginBottom:'12px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <img src="https://i.pravatar.cc/100?img=11" style={{width:'40px', height:'40px', borderRadius:'50%'}} />
                    <div>
                      <div style={{color:'white', fontWeight:'bold', fontSize:'14px'}}>Aryan (You)</div>
                      <div style={{color:'#64748B', fontSize:'12px'}}>aryan@example.com</div>
                    </div>
                  </div>
                  <span style={{color:'#10B981', background:'rgba(16,185,129,0.1)', padding:'4px 12px', borderRadius:'99px', fontSize:'12px', fontWeight:'bold'}}>Owner</span>
                </div>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px', background:'#0D1526', borderRadius:'12px'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                    <div style={{width:'40px', height:'40px', borderRadius:'50%', background:'#7C3AED', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold'}}>S</div>
                    <div>
                      <div style={{color:'white', fontWeight:'bold', fontSize:'14px'}}>Sarah Jenkins</div>
                      <div style={{color:'#64748B', fontSize:'12px'}}>sarah@example.com</div>
                    </div>
                  </div>
                  <select style={{background:'transparent', border:'1px solid rgba(255,255,255,0.1)', color:'white', padding:'6px 12px', borderRadius:'6px', outline:'none'}}>
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
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px'}}>
                  {[
                    {name: 'Starter', price: '₹2,499', blogs: '10 blogs/mo'},
                    {name: 'Growth', price: '₹6,499', blogs: '50 blogs/mo', active: true},
                    {name: 'Scale', price: '₹16,500', blogs: '200 blogs/mo'}
                  ].map(plan => (
                    <div key={plan.name} style={{background: plan.active ? 'rgba(124,58,237,0.1)' : '#141B2D', border: plan.active ? '1px solid #7C3AED' : '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '32px', textAlign:'center', position:'relative'}}>
                      {plan.active && <div style={{position:'absolute', top:'-12px', left:'50%', transform:'translateX(-50%)', background:'#7C3AED', color:'white', fontSize:'11px', fontWeight:'bold', padding:'4px 12px', borderRadius:'99px'}}>Current Plan</div>}
                      <h3 style={{color:'white', fontSize:'20px', margin:'0 0 8px'}}>{plan.name}</h3>
                      <div style={{fontSize:'36px', color:'white', fontWeight:'bold', marginBottom:'16px'}}>{plan.price}<span style={{fontSize:'14px', color:'#94A3B8'}}>/mo</span></div>
                      <div style={{color:'#A78BFA', fontWeight:'bold', fontSize:'14px', marginBottom:'24px'}}>{plan.blogs}</div>
                      <button style={{width:'100%', background: plan.active ? 'transparent' : 'rgba(255,255,255,0.05)', color: plan.active ? '#A78BFA' : 'white', border: plan.active ? '1px solid #A78BFA' : 'none', padding:'12px', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>{plan.active ? 'Manage Plan' : 'Upgrade'}</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={sec.id} id={`dash-${sec.id}`} className="dash-section" style={{display: 'none', padding: '40px', color: '#fff'}}>
              <header className="top-header" style={{marginBottom: '32px'}}>
                <div className="header-text">
                  <h1>{sec.title}</h1>
                  <p>Manage your {sec.title.toLowerCase()} settings and view reports.</p>
                </div>
              </header>
              {content || (
                <div style={{background: '#141B2D', border: '1px dashed rgba(255,255,255,0.2)', padding: '60px', textAlign: 'center', borderRadius: '16px'}}>
                  <h2 style={{fontSize: '24px', marginBottom: '16px'}}>{sec.title} Content</h2>
                  <p style={{color: '#94A3B8'}}>This section is currently under development. Soon you'll be able to access all {sec.title.toLowerCase()} features here.</p>
                </div>
              )}
            </div>
          );
        })}
      </main>
      {/* Global Publish Modal */}
      {publishModalBlog && (
        <div style={{position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{background: '#141B2D', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '20px', padding: '32px', width: '400px', position: 'relative'}}>
            <button onClick={() => setPublishModalBlog(null)} style={{position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', fontSize: '16px'}}>✕</button>
            <h2 style={{fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '8px'}}>Publish Blog</h2>
            <p style={{fontSize: '13px', color: '#94A3B8', marginBottom: '20px'}}>{publishModalBlog.title}</p>
            
            <label style={{color: 'white', fontSize: '14px', marginBottom: '8px', display: 'block'}}>Select Platform</label>
            <select value={publishingPlatform} onChange={(e) => setPublishingPlatform(e.target.value)} style={{width: '100%', background: '#0D1526', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '20px'}}>
              <option value="wordpress">WordPress</option>
              <option value="blogger">Blogger</option>
              <option value="devto">Dev.to</option>
              <option value="hashnode">Hashnode</option>
              <option value="tumblr">Tumblr</option>
            </select>

            {/* Scheduling Options */}
            <div style={{marginTop:'0px', padding:'16px', background:'rgba(255,255,255,0.03)', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.05)', marginBottom: '20px'}}>
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

            <button onClick={handleGlobalPublish} disabled={publishStatus === 'Publishing...' || publishStatus.includes('Scheduling')} style={{width: '100%', background: '#10B981', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
              {publishStatus === 'Publishing...' || publishStatus.includes('Scheduling') ? (isScheduled ? 'Scheduling...' : 'Publishing...') : (isScheduled ? 'Schedule Blog' : 'Publish Now')}
            </button>
            {publishStatus && publishStatus !== 'Publishing...' && (
              <p style={{marginTop: '16px', fontSize: '14px', color: publishStatus.startsWith('Error') ? '#EF4444' : '#10B981', textAlign: 'center'}}>{publishStatus}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

