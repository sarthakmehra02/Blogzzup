import React, { useEffect, useState } from 'react';
import { 
  Home, Plus, FileText, Calendar, Network, Search, Key, Target, 
  UploadCloud, Link as LinkIcon, List, BarChart3, TrendingUp, PieChart,
  Settings, Users, CreditCard, Sparkles, MoreVertical, LogOut
} from 'lucide-react';
import './Dashboard.css';
async function callGemini(prompt, maxTokens = 4000) {
  const apiKey = 'AIzaSyAOCdbhW95ld9N2pKCwy_nXF8CVYt-1UOw';
  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=' + apiKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: 1
        }
      })
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.candidates[0].content.parts[0].text;
  return text.replace(/```json|```/g, '').trim();
}

const MyBlogsSection = () => {
  const [blogs, setBlogs] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modalBlog, setModalBlog] = useState(null);

  const loadMyBlogs = () => {
    const saved = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
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
                const date = new Date(blog.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
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
                        <button onClick={() => setModalBlog(blog)} style={{background: 'rgba(124,58,237,0.15)', border: 'none', color: '#A78BFA', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer'}}>View</button>
                        <button onClick={() => deleteBlog(blog.id)} style={{background: 'rgba(239,68,68,0.1)', border: 'none', color: '#EF4444', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer'}}>Delete</button>
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

const NewBlogSection = () => {
  const [keyword, setKeyword] = useState('');
  const [tone, setTone] = useState('professional');
  const [wordCount, setWordCount] = useState('1500');
  const [geo, setGeo] = useState('');
  const [instructions, setInstructions] = useState('');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState({ show: false, text: '', pct: 0 });
  const [error, setError] = useState('');
  const [output, setOutput] = useState(null);
  const [kwFocused, setKwFocused] = useState(false);

  const generateBlog = async () => {
    if (!keyword.trim()) {
       setError("Please enter a keyword first!");
       return;
    }
    setError('');
    setIsGenerating(true);
    setProgress({ show: true, text: 'Analyzing keyword intent...', pct: 10 });
    setOutput(null);

    const steps = [
      { text: 'Analyzing keyword intent...', pct: 10 },
      { text: 'Scanning SERP gaps...', pct: 25 },
      { text: 'Building content brief...', pct: 40 },
      { text: 'Drafting blog content...', pct: 60 },
      { text: 'Running SEO optimization pass...', pct: 75 },
      { text: 'Humanizing content...', pct: 88 },
      { text: 'Structuring for featured snippets...', pct: 95 }
    ];
    
    let stepIndex = 0;
    const progressInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        setProgress({ show: true, text: steps[stepIndex].text, pct: steps[stepIndex].pct });
        stepIndex++;
      }
    }, 800);

    const geoInstruction = geo ? 'Target location: ' + geo + '. Include local entities and city-specific examples.' : '';
    const extraInstructions = instructions ? 'Additional requirements: ' + instructions : '';
    
    const prompt = `You are an expert SEO content writer for Indian startups and businesses.

Write a comprehensive, SEO-optimized blog post with these specifications:
- Primary keyword: "${keyword}"
- Tone: ${tone}
- Target word count: ${wordCount} words
- ${geoInstruction}
- ${extraInstructions}

Format your response as valid JSON with exactly these fields:
{
  "title": "SEO-optimized H1 title (include keyword, under 60 chars)",
  "metaDescription": "Compelling meta description under 155 chars with keyword and CTA",
  "seoScore": <number between 85-98>,
  "body": "Full blog post in markdown format with H2s, H3s, bullet points, and natural keyword usage. Minimum ${wordCount} words. Include an introduction, 5-7 main sections, and a conclusion with CTA."
}

IMPORTANT: Return ONLY the JSON object. No preamble, no explanation, no markdown code blocks.`;

    try {
      const cleaned = await callGemini(prompt, 4000);
      
      clearInterval(progressInterval);
      setProgress({ show: true, text: 'Complete! ✓', pct: 100 });
      
      const blogData = JSON.parse(cleaned);
      
      const wordCountActual = blogData.body.split(' ').length;
      const readTime = Math.ceil(wordCountActual / 200);
      
      setTimeout(() => {
        setProgress(p => ({...p, show: false}));
        setOutput({ ...blogData, keyword, tone, geo, wordCountActual, readTime, createdAt: new Date().toISOString() });
        setIsGenerating(false);
      }, 500);

    } catch (err) {
      clearInterval(progressInterval);
      setProgress(p => ({...p, show: false}));
      setError(err.message);
      setIsGenerating(false);
    }
  };

  const copyBlog = (e) => {
    if (!output) return;
    const text = output.title + '\n\n' + output.metaDescription + '\n\n' + output.body;
    navigator.clipboard.writeText(text).then(() => {
      const btn = e.target;
      const oldText = btn.textContent;
      const oldColor = btn.style.color;
      btn.textContent = '✓ Copied!';
      btn.style.color = '#10B981';
      setTimeout(() => { btn.textContent = oldText; btn.style.color = oldColor; }, 2000);
    });
  };

  const saveBlog = (e) => {
    if (!output) return;
    const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');
    const newBlog = {
      id: Date.now(),
      title: output.title,
      metaDescription: output.metaDescription,
      body: output.body,
      seoScore: output.seoScore,
      keyword: output.keyword,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    blogs.unshift(newBlog);
    localStorage.setItem('bf_blogs', JSON.stringify(blogs));
    if (window.updateOverviewStats) window.updateOverviewStats();
    
    const btn = e.target;
    btn.textContent = '✓ Saved!';
    btn.style.color = '#10B981';
    setTimeout(() => { btn.textContent = 'Save Draft'; btn.style.color = '#A78BFA'; }, 2000);
    
    if (window.loadMyBlogs) window.loadMyBlogs();
  };

  return (
    <div id="dash-newblog" className="dash-section" style={{display: 'none', padding: '40px', color: '#fff'}}>
      <div style={{display: 'flex', gap: '40px', flexWrap: 'wrap'}}>
        
        {/* Left Column */}
        <div style={{flex: '1 1 400px', maxWidth: '600px'}}>
          <div style={{fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '4px'}}>Generate New Blog</div>
          <div style={{fontSize: '14px', color: '#94A3B8', marginBottom: '32px'}}>Fill in the details and let the AI engine do the work</div>

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontSize: '13px', color: '#E2E8F0', fontWeight: 500}}>Target Keyword *</label>
            <input 
              type="text" 
              value={keyword}
              onChange={e => {setKeyword(e.target.value); setError('');}}
              onFocus={() => setKwFocused(true)}
              onBlur={() => setKwFocused(false)}
              placeholder={error ? error : "e.g. AI tools for Indian startups"}
              style={{
                width: '100%', background: '#141B2D', 
                border: `1px solid ${error ? '#EF4444' : (kwFocused ? '#7C3AED' : 'rgba(255,255,255,0.1)')}`, 
                borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none',
                transition: 'border-color 0.2s'
              }}
            />
          </div>

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontSize: '13px', color: '#E2E8F0', fontWeight: 500}}>Tone</label>
            <select 
              value={tone}
              onChange={e => setTone(e.target.value)}
              style={{
                width: '100%', background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', cursor: 'pointer'
              }}
            >
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="authoritative">Authoritative</option>
              <option value="educational">Educational</option>
            </select>
          </div>

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontSize: '13px', color: '#E2E8F0', fontWeight: 500}}>Word Count: <span style={{color: '#A78BFA'}}>{wordCount}</span> words</label>
            <input 
              type="range" min="800" max="3000" step="100" 
              value={wordCount}
              onChange={e => setWordCount(e.target.value)}
              style={{ width: '100%', accentColor: '#7C3AED' }}
            />
          </div>

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontSize: '13px', color: '#E2E8F0', fontWeight: 500}}>GEO Target (City/Region)</label>
            <input 
              type="text" placeholder="e.g. Delhi, Bangalore, Pan India"
              value={geo}
              onChange={e => setGeo(e.target.value)}
              style={{
                width: '100%', background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none'
              }}
            />
          </div>

          <div style={{marginBottom: '20px'}}>
            <label style={{display: 'block', marginBottom: '8px', fontSize: '13px', color: '#E2E8F0', fontWeight: 500}}>Additional Instructions (optional)</label>
            <textarea 
              rows="3" placeholder="e.g. Include stats, mention competitor names, focus on B2B audience..."
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              style={{
                width: '100%', background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', 
                borderRadius: '10px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', resize: 'vertical'
              }}
            ></textarea>
          </div>

          <button 
            onClick={generateBlog}
            disabled={isGenerating}
            style={{
              width: '100%', background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', color: 'white', 
              border: 'none', borderRadius: '12px', padding: '14px', fontSize: '16px', fontWeight: 600, 
              cursor: isGenerating ? 'not-allowed' : 'pointer', transition: 'all 0.2s', marginTop: '8px',
              opacity: isGenerating ? 0.7 : 1
            }}
          >
            {isGenerating ? '⚡ Generating...' : (output ? '⚡ Generate Another Blog' : '⚡ Generate Blog')}
          </button>

          {progress.show && (
            <div style={{marginTop: '20px'}}>
              <div style={{background: '#141B2D', borderRadius: '12px', padding: '20px'}}>
                <div style={{fontSize: '14px', color: '#A78BFA', marginBottom: '12px'}}>{progress.text}</div>
                <div style={{background: '#0D1526', borderRadius: '999px', height: '6px', overflow: 'hidden'}}>
                  <div style={{height: '100%', background: 'linear-gradient(90deg,#7C3AED,#06B6D4)', width: `${progress.pct}%`, transition: 'width 0.5s ease', borderRadius: '999px'}}></div>
                </div>
                <div style={{fontSize: '12px', color: '#64748B', marginTop: '8px'}}>{progress.pct}%</div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div style={{flex: '1 1 500px', background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', minHeight: '500px'}}>
          {!output && error && !progress.show && (
             <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#4B5563', textAlign: 'center'}}>
               <div style={{fontSize: '48px', marginBottom: '16px'}}>❌</div>
               <div style={{fontSize: '14px', color: '#EF4444'}}>Error: {error}</div>
               <div style={{fontSize: '12px', color: '#64748B', marginTop: '8px'}}>Check your API key and try again</div>
             </div>
          )}
          {!output && !error && (
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px', color: '#4B5563', textAlign: 'center'}}>
              <div style={{fontSize: '48px', marginBottom: '16px'}}>✍️</div>
              <div style={{fontSize: '16px', fontWeight: 500, color: '#64748B'}}>Your blog will appear here</div>
              <div style={{fontSize: '13px', marginTop: '8px'}}>Fill in the keyword and click Generate</div>
            </div>
          )}

          {output && (
            <div>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
                <span style={{fontSize: '13px', color: '#10B981', fontWeight: 600}}>✓ Blog Generated</span>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button onClick={copyBlog} style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer'}}>Copy</button>
                  <button onClick={saveBlog} style={{background: 'rgba(124,58,237,0.2)', border: '1px solid rgba(124,58,237,0.4)', color: '#A78BFA', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer'}}>Save Draft</button>
                  <button onClick={() => window.showDashboardSection && window.showDashboardSection('publisher')} style={{background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', border: 'none', color: 'white', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', fontWeight: 600}}>Publish →</button>
                </div>
              </div>
              
              <div style={{display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap'}}>
                <div style={{background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px'}}>
                  <span style={{color: '#64748B'}}>SEO Score</span>
                  <span style={{color: '#10B981', fontWeight: 700, marginLeft: '8px'}}>{output.seoScore}/100</span>
                </div>
                <div style={{background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px'}}>
                  <span style={{color: '#64748B'}}>Words</span>
                  <span style={{color: '#A78BFA', fontWeight: 700, marginLeft: '8px'}}>{output.wordCountActual.toLocaleString()}</span>
                </div>
                <div style={{background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px'}}>
                  <span style={{color: '#64748B'}}>Read time</span>
                  <span style={{color: '#06B6D4', fontWeight: 700, marginLeft: '8px'}}>{output.readTime} min</span>
                </div>
              </div>
              
              <div style={{fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '12px', lineHeight: 1.3}}>{output.title}</div>
              <div style={{fontSize: '13px', color: '#64748B', background: '#0D1526', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', fontStyle: 'italic'}}>📝 {output.metaDescription}</div>
              <div style={{fontSize: '14px', color: '#94A3B8', lineHeight: 1.8, whiteSpace: 'pre-wrap'}}>{output.body}</div>
            </div>
          )}
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

const Dashboard = ({ onLogout }) => {
const blogs = [
    { title: "10 AI Tools Disrupting Martech in India", score: 94, status: "Published", date: "Oct 12, 2026", traffic: "1,240", statusColor: "green" },
    { title: "How to Automate SEO with Generative AI", score: 88, status: "Published", date: "Oct 10, 2026", traffic: "890", statusColor: "green" },
    { title: "Top 5 Tier-2 Cities for Tech Startups", score: 96, status: "Scheduled", date: "Oct 15, 2026", traffic: "—", statusColor: "amber" },
    { title: "Understanding Google's Helpful Content Update", score: 91, status: "Scheduled", date: "Oct 18, 2026", traffic: "—", statusColor: "amber" },
    { title: "Building an Autonomous Agent from Scratch", score: 72, status: "Draft", date: "Last edited 2h ago", traffic: "—", statusColor: "gray" },
  ];

  useEffect(() => {
    window.updateOverviewStats = function() {
      const blogs = JSON.parse(localStorage.getItem('bf_blogs') || '[]');

      const totalEl = document.getElementById('stat-published');
      if (totalEl) totalEl.textContent = blogs.length;

      if (blogs.length > 0) {
        const avgSeo = Math.round(blogs.reduce((sum, b) => sum + (parseInt(b.seoScore) || 0), 0) / blogs.length);
        const avgEl = document.getElementById('stat-avgseo');
        if (avgEl) avgEl.textContent = avgSeo;

        const estTraffic = blogs.length * 156;
        const trafficEl = document.getElementById('stat-traffic');
        if (trafficEl) trafficEl.textContent = '+' + estTraffic.toLocaleString();

        const topBlog = blogs.reduce((top, b) => (parseInt(b.seoScore) || 0) > (parseInt(top.seoScore) || 0) ? b : top, blogs[0]);
        const topEl = document.getElementById('stat-topblog');
        if (topEl) topEl.textContent = topBlog.title.length > 28 ? topBlog.title.substring(0, 28) + '...' : topBlog.title;
      } else {
        const avgEl = document.getElementById('stat-avgseo');
        if (avgEl) avgEl.textContent = '—';
        const trafficEl = document.getElementById('stat-traffic');
        if (trafficEl) trafficEl.textContent = '+0';
        const topEl = document.getElementById('stat-topblog');
        if (topEl) topEl.textContent = 'No blogs yet';
      }

      const usageBar = document.getElementById('plan-usage-bar');
      const usageCount = document.getElementById('plan-usage-count');
      if (usageBar) usageBar.style.width = Math.min((blogs.length / 50) * 100, 100) + '%';
      if (usageCount) usageCount.textContent = blogs.length + '/50 blogs';
    };

    window.showDashboardSection = function(section) {
      document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
      const target = document.getElementById('dash-' + section);
      if (target) {
        target.style.display = 'block';
        target.style.opacity = '0';
        setTimeout(() => { target.style.opacity = '1'; target.style.transition = 'opacity 0.2s ease'; }, 10);
      }
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('sidebar-active', 'active'));
      const activeLink = document.querySelector('[data-section="' + section + '"]');
      if (activeLink) {
          activeLink.classList.add('sidebar-active');
          activeLink.classList.add('active');
      }
      if (section === 'overview') window.updateOverviewStats();
      if (section === 'myblogs' && window.loadMyBlogs) window.loadMyBlogs();
      window.scrollTo(0, 0);
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
    { id: 'roi', title: 'ROI Dashboard' },
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
          <span className="logo-text" onClick={() => window.showMarketingSite && window.showMarketingSite()} style={{cursor: 'pointer'}}>BlogForge AI</span>
        </div>
        
        <div style={{padding: '0 12px'}}>
          <a onClick={() => window.showMarketingSite && window.showMarketingSite()} style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', color:'#64748B', cursor:'pointer', padding:'8px 12px', borderRadius:'8px', marginBottom:'8px', transition:'all 0.2s', textDecoration:'none'}} onMouseOver={(e) => e.currentTarget.style.color='#fff'} onMouseOut={(e) => e.currentTarget.style.color='#64748B'}>
            ← Back to Home
          </a>
        </div>

        <div className="sidebar-user">
          <img src="https://i.pravatar.cc/100?img=11" alt="User" className="user-avatar" />
          <div className="user-info">
            <span className="user-name">Aryan's Workspace</span>
            <span className="user-plan">Growth Plan</span>
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="nav-group">
            <a className="nav-item sidebar-link sidebar-active active" data-section="overview" onClick={() => window.showDashboardSection('overview')} style={{cursor: 'pointer'}}><Home size={18}/> Overview</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label">Content</h4>
            <a className="nav-item sidebar-link" data-section="newblog" onClick={() => window.showDashboardSection('newblog')} style={{cursor: 'pointer'}}><Plus size={18}/> New Blog</a>
            <a className="nav-item sidebar-link" data-section="myblogs" onClick={() => window.showDashboardSection('myblogs')} style={{cursor: 'pointer'}}><FileText size={18}/> My Blogs</a>
            <a className="nav-item sidebar-link" data-section="calendar" onClick={() => window.showDashboardSection('calendar')} style={{cursor: 'pointer'}}><Calendar size={18}/> Content Calendar</a>
            <a className="nav-item sidebar-link" data-section="clustermap" onClick={() => window.showDashboardSection('clustermap')} style={{cursor: 'pointer'}}><Network size={18}/> Cluster Map</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label">Research</h4>
            <a className="nav-item sidebar-link" data-section="serpgap" onClick={() => window.showDashboardSection('serpgap')} style={{cursor: 'pointer'}}><Search size={18}/> SERP Gap Scanner</a>
            <a className="nav-item sidebar-link" data-section="keywords" onClick={() => window.showDashboardSection('keywords')} style={{cursor: 'pointer'}}><Key size={18}/> Keyword Planner</a>
            <a className="nav-item sidebar-link" data-section="competitor" onClick={() => window.showDashboardSection('competitor')} style={{cursor: 'pointer'}}><Target size={18}/> Competitor Spy</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label">Publish</h4>
            <a className="nav-item sidebar-link" data-section="publisher" onClick={() => window.showDashboardSection('publisher')} style={{cursor: 'pointer'}}><UploadCloud size={18}/> Auto-Publisher</a>
            <a className="nav-item sidebar-link" data-section="integrations" onClick={() => window.showDashboardSection('integrations')} style={{cursor: 'pointer'}}><LinkIcon size={18}/> Integrations</a>
            <a className="nav-item sidebar-link" data-section="schedule" onClick={() => window.showDashboardSection('schedule')} style={{cursor: 'pointer'}}><List size={18}/> Schedule Queue</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label">Analyze</h4>
            <a className="nav-item sidebar-link" data-section="seoscores" onClick={() => window.showDashboardSection('seoscores')} style={{cursor: 'pointer'}}><BarChart3 size={18}/> SEO Scores</a>
            <a className="nav-item sidebar-link" data-section="traffic" onClick={() => window.showDashboardSection('traffic')} style={{cursor: 'pointer'}}><TrendingUp size={18}/> Traffic Tracker</a>
            <a className="nav-item sidebar-link" data-section="roi" onClick={() => window.showDashboardSection('roi')} style={{cursor: 'pointer'}}><PieChart size={18}/> ROI Dashboard</a>
          </div>

          <div className="nav-group">
            <h4 className="nav-label">Settings</h4>
            <a className="nav-item sidebar-link" data-section="brandvoice" onClick={() => window.showDashboardSection('brandvoice')} style={{cursor: 'pointer'}}><Settings size={18}/> Brand Voice</a>
            <a className="nav-item sidebar-link" data-section="team" onClick={() => window.showDashboardSection('team')} style={{cursor: 'pointer'}}><Users size={18}/> Team</a>
            <a className="nav-item sidebar-link" data-section="billing" onClick={() => window.showDashboardSection('billing')} style={{cursor: 'pointer'}}><CreditCard size={18}/> Billing</a>
          </div>
        </div>

        <div className="sidebar-footer">
          <div style={{background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: '10px', padding: '12px 14px', margin: '12px 8px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px'}}>
              <span style={{width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', display: 'inline-block'}}></span>
              <span style={{fontSize: '12px', color: '#10B981', fontWeight: 600}}>AI Engine Active</span>
            </div>
            <div style={{fontSize: '11px', color: '#64748B'}}>Gemini 2.5 Flash</div>
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
              <h1 className="dashboard-greeting">Good morning, Aryan 👋</h1>
              <p>Your blogs are running on autopilot.</p>
            </div>
            <div className="header-actions">
              <button className="btn btn-ghost">View Reports</button>
              <button className="btn btn-outline-cyan">Scan SERP Gaps</button>
              <button className="btn btn-primary"><Plus size={16} className="mr-2"/> New Blog</button>
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
                <a href="#" className="view-all">View all</a>
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
                          <button className="action-btn"><MoreVertical size={16}/></button>
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
                  <span>October 2026</span>
                  <div className="cal-nav">
                    <button>&lt;</button>
                    <button>&gt;</button>
                  </div>
                </div>
                <div className="cal-grid">
                  {['S','M','T','W','T','F','S'].map((d,i) => <div key={i} className="cal-day-name">{d}</div>)}
                  {/* Dummy calendar dates */}
                  {[...Array(31)].map((_, i) => {
                    const day = i + 1;
                    const hasBlue = day === 12 || day === 10;
                    const hasAmber = day === 15 || day === 18 || day === 22;
                    return (
                      <div key={i} className={`cal-cell ${hasBlue ? 'active-blue' : ''} ${hasAmber ? 'active-amber' : ''}`}>
                        {day}
                        {(hasBlue || hasAmber) && <div className={`cal-dot ${hasAmber ? 'amber' : 'green'}`}></div>}
                      </div>
                    );
                  })}
                </div>
                <div className="cal-legend">
                  <div className="legend-item"><span className="dot green"></span> Published</div>
                  <div className="legend-item"><span className="dot amber"></span> Scheduled</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <NewBlogSection />
        <MyBlogsSection />
        <SerpGapSection />
        <SeoScoresSection />

        {/* Unique Feature Sections */}
        {dummySections.map(sec => {
          let content = null;
          
          if (sec.id === 'calendar') {
            content = (
              <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
                  <h3 style={{margin:0, color:'white', fontSize:'16px'}}>October 2026</h3>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button style={{background: '#0D1526', color: 'white', border: '1px solid rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:'6px'}}>Week</button>
                    <button style={{background: '#7C3AED', color: 'white', border: 'none', padding:'6px 12px', borderRadius:'6px'}}>Month</button>
                  </div>
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', color: '#94A3B8', fontSize: '12px', marginBottom: '10px'}}>
                  {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=><div key={d}>{d}</div>)}
                </div>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px'}}>
                  {[...Array(35)].map((_,i) => {
                    const d = i - 2;
                    const isValid = d > 0 && d <= 31;
                    const hasLive = d === 12;
                    const hasDraft = d === 15 || d === 22;
                    return (
                      <div key={i} style={{background: isValid ? '#0D1526' : 'transparent', border: isValid ? '1px solid rgba(255,255,255,0.04)' : 'none', minHeight: '80px', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
                        <span style={{color: isValid ? 'white' : 'transparent', fontSize:'12px'}}>{d > 0 ? d : ''}</span>
                        {hasLive && <div style={{background: 'rgba(16,185,129,0.1)', color: '#10B981', fontSize:'10px', padding:'2px 4px', borderRadius:'4px', whiteSpace:'nowrap', overflow:'hidden'}}>Live: Top 10 AI...</div>}
                        {hasDraft && <div style={{background: 'rgba(245,158,11,0.1)', color: '#F59E0B', fontSize:'10px', padding:'2px 4px', borderRadius:'4px', whiteSpace:'nowrap', overflow:'hidden'}}>Draft: SEO Guides</div>}
                      </div>
                    )
                  })}
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
            content = (
              <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px'}}>
                {['WordPress', 'Webflow', 'Shopify', 'Ghost', 'Medium'].map(platform => (
                  <div key={platform} style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px', textAlign:'center'}}>
                    <div style={{width:'60px', height:'60px', background:'#0D1526', borderRadius:'12px', margin:'0 auto 16px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px'}}>🔌</div>
                    <h3 style={{color:'white', fontSize:'16px', margin:'0 0 8px'}}>{platform}</h3>
                    <p style={{color:'#64748B', fontSize:'13px', margin:'0 0 20px'}}>Auto-publish directly to your {platform} site.</p>
                    <button style={{background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid rgba(255,255,255,0.1)', padding:'8px 20px', borderRadius:'8px', cursor:'pointer'}}>Connect</button>
                  </div>
                ))}
              </div>
            );
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
                     <p style={{color:'#64748B', margin:0, fontSize:'13px'}}>Connect BlogForge AI to 5,000+ apps.</p>
                   </div>
                   <button style={{background:'rgba(255,255,255,0.05)', color:'white', border:'1px solid rgba(255,255,255,0.1)', padding:'8px 20px', borderRadius:'8px', cursor:'pointer'}}>Connect</button>
                </div>
              </div>
            );
          } else if (sec.id === 'schedule') {
            content = (
              <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                {[1,2,3].map(i => (
                  <div key={i} style={{display:'flex', alignItems:'center', gap:'16px', padding:'16px', background:'#0D1526', borderRadius:'12px', marginBottom:'12px'}}>
                    <div style={{background:'rgba(124,58,237,0.1)', color:'#A78BFA', padding:'10px', borderRadius:'8px', textAlign:'center', minWidth:'40px'}}>
                       <div style={{fontSize:'11px', textTransform:'uppercase'}}>Oct</div>
                       <div style={{fontSize:'20px', fontWeight:'bold'}}>{14 + i}</div>
                    </div>
                    <div style={{flex:1}}>
                      <h4 style={{margin:'0 0 4px', color:'white', fontSize:'15px'}}>The Future of Autonomous Agents</h4>
                      <p style={{margin:0, color:'#64748B', fontSize:'13px'}}>Scheduled for {14+i} Oct 2026, 09:00 AM</p>
                    </div>
                    <button style={{background:'transparent', color:'#94A3B8', border:'1px solid rgba(255,255,255,0.1)', padding:'6px 12px', borderRadius:'6px'}}>Edit Time</button>
                  </div>
                ))}
              </div>
            );
          } else if (sec.id === 'traffic' || sec.id === 'roi') {
            content = (
              <div>
                <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'20px', marginBottom:'20px'}}>
                   <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                     <div style={{color:'#94A3B8', fontSize:'13px', marginBottom:'8px'}}>{sec.id === 'roi' ? 'Est. Traffic Value' : 'Total Sessions'}</div>
                     <div style={{color:'white', fontSize:'28px', fontWeight:'bold'}}>{sec.id === 'roi' ? '$4,520' : '45.2K'}</div>
                     <div style={{color:'#10B981', fontSize:'13px', marginTop:'8px'}}>+12.4% vs last month</div>
                   </div>
                   <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '16px', padding: '24px'}}>
                     <div style={{color:'#94A3B8', fontSize:'13px', marginBottom:'8px'}}>{sec.id === 'roi' ? 'Content Cost Saved' : 'Avg. Duration'}</div>
                     <div style={{color:'white', fontSize:'28px', fontWeight:'bold'}}>{sec.id === 'roi' ? '$12,400' : '2m 14s'}</div>
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
    </div>
  );
};

export default Dashboard;

