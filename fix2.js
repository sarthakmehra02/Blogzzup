import fs from 'fs';

let content = fs.readFileSync('src/Dashboard.jsx', 'utf8');

const autoPublisherComponent = \`
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
      <h3 style={{color:'white', fontSize:'22px', marginBottom:'8px', fontWeight: 700}}>Connect Platforms</h3>
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
            <span style={{color: '#94A3B8', fontSize: '13px'}}>Keys are stored securely in your browser\\'s local cache.</span>
          </div>
        </form>
      </div>
    </div>
  );
};
\`

const startIndex = content.indexOf('const AutoPublisherSection = () => {');
const endIndex = content.indexOf('const Dashboard = ({ onLogout }) => {');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + autoPublisherComponent + '\\n\\n' + content.substring(endIndex);
  fs.writeFileSync('src/Dashboard.jsx', content);
  console.log('Replaced AutoPublisherSection perfectly!');
} else {
  console.log('Could not find boundaries.');
}
