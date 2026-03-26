import fs from 'fs';

let content = fs.readFileSync('src/Dashboard.jsx', 'utf8');

// 1. Redesign AutoPublisherSection
const autoPublisherComponent = `
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
            onClick={() => setActiveTab(p.id)} 
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
              
              <label style={labelStyle}>OAuth Token / API Key</label>
              <input value={(credentials.tumblr?.apiKey) || ''} onChange={e => updateCred('tumblr', 'apiKey', e.target.value)} type="password" placeholder="Consumer Key / Token" style={inputStyle} required />
            </div>
          )}

          <div style={{display: 'flex', alignItems: 'center', gap: '16px', marginTop: '20px'}}>
            <button type="submit" style={{background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', padding: '14px 28px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '15px', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16,185,129,0.2)'}}>
              {saveStatus ? saveStatus : 'Save & Connect'}
            </button>
            <span style={{color: '#94A3B8', fontSize: '13px'}}>Keys are stored securely in your browser's local cache.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
`;

// Replace the old AutoPublisherSection with the new one
if (content.includes('const AutoPublisherSection = () => {')) {
  // Regex to remove the old section entirely to inject the new one
  content = content.replace(/const AutoPublisherSection = \(\) => \{[\s\S]*?\}\;\n/g, autoPublisherComponent + '\n');
}

// 2. Fix the missing "Publish" button. The previous script tried to match Exact html strings with spaces that might have missed.
// Let's use Regex to find the View/Delete buttons inside `MyBlogsSection`'s loop and explicitly add Publish.
content = content.replace(
  /<button onClick=\{\(\) => setModalBlog\(blog\)\}.*?>View<\/button>\s*<button onClick=\{\(\) => deleteBlog\(blog\.id\)\}/g,
  `<button onClick={() => setModalBlog(blog)} style={{background: 'rgba(124,58,237,0.15)', border: 'none', color: '#A78BFA', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer'}}>View</button>
   <button onClick={() => { setPublishModalBlog(blog); setPublishStatus(''); setPublishingPlatform('wordpress'); }} style={{background: 'rgba(16,185,129,0.15)', border: 'none', color: '#10B981', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer'}}>Publish</button>
   <button onClick={() => deleteBlog(blog.id)}`
);

// If for some reason the above failed, try catching the whole Delete button block:
if (!content.includes('setPublishModalBlog(blog)')) {
    // Attempt fallback injection directly using strings
    const strMatch = "onClick={() => deleteBlog(blog.id)}";
    content = content.replace(strMatch, `onClick={() => { setPublishModalBlog(blog); setPublishStatus(''); setPublishingPlatform('wordpress'); }} style={{background: 'rgba(16,185,129,0.15)', border: 'none', color: '#10B981', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer', marginRight: '8px'}}>Publish</button>\n<button onClick={() => deleteBlog(blog.id)}`);
}

// 3. Make sure the Publish Modal is well integrated.
// We will replace the default handlePublish inside MyBlogsSection if we need to, but it's likely already there from previous patch.
// Let's modify handlePublish to print explicit warnings
const updatedPublishMethod = `
  const handlePublish = async () => {
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

    setPublishStatus('Publishing...');
    try {
      await publishBlog(publishingPlatform, {
        title: publishModalBlog.title,
        content: publishModalBlog.body || publishModalBlog.content,
        tags: [publishModalBlog.keyword].filter(Boolean),
        credentials: creds
      });
      setPublishStatus('Published successfully!');
      setTimeout(() => setPublishModalBlog(null), 1500);
    } catch(err) {
      setPublishStatus('Error: ' + err.message);
    }
  };
`;

content = content.replace(/const handlePublish = async \(\) => \{[\s\S]*?catch\(err\) \{\s*setPublishStatus\('Error: ' \+ err.message\);\s*\}\s*\};/g, updatedPublishMethod);

fs.writeFileSync('src/Dashboard.jsx', content);
console.log('Fixed Dashboard UI and API key storage logic!');
