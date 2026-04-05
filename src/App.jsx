import React, { useEffect, useState, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Star, 
  LineChart, 
  Search, 
  UploadCloud, 
  PenTool, 
  Globe, 
  Network,
  Clock,
  TrendingUp,
  Zap,
  DollarSign,
  Cpu,
  UserCheck,
  Brain,
  BarChart3,
  Map,
  Globe2,
  Calendar,
  Mic,
  Repeat,
  Link as LinkIcon,
  Rocket,
  Plus,
  FileText,
  Settings,
  CheckCircle,
  User,
  CheckCircle2,
  Check,
  Webhook,
  ShieldCheck,
  Menu,
  X,
  ArrowUp,
  ArrowLeft
} from 'lucide-react';
import './index.css';
import './interactions.css';
import { useAuth } from './AuthContext';
import { callGemini } from './utils/gemini';


const AnimatedCounter = ({ endValue, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let startTimestamp = null;
        const duration = 2000;
        const step = (timestamp) => {
          if (!startTimestamp) startTimestamp = timestamp;
          const progress = Math.min((timestamp - startTimestamp) / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(easeOut * endValue));
          if (progress < 1) {
            window.requestAnimationFrame(step);
          }
        };
        window.requestAnimationFrame(step);
        observer.disconnect();
      }
    }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [endValue]);

  return <span ref={ref}>{count}{suffix}</span>;
}

import Dashboard from './Dashboard';
import PromptArchitecture from './PromptArchitecture';


const AccordionItem = ({ stage, title, description, code, isOpen, onClick }) => (
  <div className={`accordion-container ${isOpen ? 'open' : ''}`} onClick={onClick}>
    <div className="accordion-header">
      <div className="accordion-header-left">
        <span className="accordion-badge">Stage {stage}</span>
        <span className="accordion-title">{title}</span>
      </div>
      <div className="accordion-icon">▼</div>
    </div>
    <div className="accordion-body">
      <div className="accordion-desc">{description}</div>
      <div className="accordion-code">{code}</div>
    </div>
  </div>
);

const HowItWorksAccordion = () => {
  const [activeIdx, setActiveIdx] = React.useState(null);
  const items = [
    { stage: 1, title: 'Keyword Intent Analysis', description: 'Classify search intent. Extract primary keyword + 5 LSI keywords. Identify long-tail opportunities.', code: "Analyze the keyword '[KEYWORD]'. Classify intent as informational/commercial/navigational. List 5 semantically related LSI keywords. Identify 3 long-tail variations with estimated search volume > 500/mo." },
    { stage: 2, title: 'SERP Gap Identification', description: 'Compare top 10 results. Find gaps competitors miss. Flag snippet opportunities.', code: "Review the top 10 SERP results for '[KEYWORD]'. List subtopics covered by fewer than 3 results. Identify unanswered questions in PAA boxes. Flag 2 featured snippet opportunities." },
    { stage: 3, title: 'Content Brief Generation', description: 'Generate full H1/H2/H3 hierarchy, word count target, entity list, tone guidelines.', code: "Create a content brief for '[KEYWORD]'. Include: H1 + 5 H2s + H3s per section. Target word count: 1800-2400. Required NLP entities: [list]. Brand tone: [TONE]. Competitor differentiation: [GAP]." },
    { stage: 4, title: 'Structured Draft Writing', description: 'Write section by section using role-based prompting and brand voice.', code: "You are an expert SEO content writer for [NICHE] targeting [AUDIENCE] in India. Write section '[H2]' for the blog '[TITLE]'. Include primary keyword in first 100 words. Use transition sentences. Target Flesch score 65-75. Word count: [N] words." },
    { stage: 5, title: 'SEO Optimization Pass', description: 'Keyword density check, NLP entity injection, meta generation, internal link suggestions.', code: "Review the draft for '[TITLE]'. Check keyword density: target 1.5-2.5%. Inject missing NLP entities: [LIST]. Suggest 3 internal link anchors. Write meta title <60 chars with keyword. Write meta description <155 chars with CTA." },
    { stage: 6, title: 'GEO + Humanization Pass', description: 'Add local signals, vary sentence length, remove robotic patterns, target <5% AI detection.', code: "Optimize for [CITY/REGION]. Add location entities: [LIST]. Vary sentence length between 8-28 words. Replace robotic phrases. Add 2 rhetorical questions. Rewrite passive voice. Target Originality.ai score <5%." },
    { stage: 7, title: 'Schema + Snippet Structuring', description: 'Add FAQ and HowTo schema, format featured snippet answer block.', code: "Add JSON-LD FAQ schema for top 3 questions. Add HowTo schema if applicable. Format one section as a 40-60 word direct answer block for featured snippet. Suggest image alt text for 3 images." }
  ];

  return (
    <div className="accordion-section" style={{maxWidth: '800px', margin: '0 auto', paddingBottom: '8rem'}}>
      <h2 className="accordion-section-title">The 7-Stage Prompt Architecture</h2>
      <p className="accordion-subtitle">The exact prompt pipeline that turns a keyword into a ranking blog</p>
      {items.map((item, idx) => (
        <AccordionItem 
          key={idx} 
          {...item} 
          isOpen={activeIdx === idx} 
          onClick={() => setActiveIdx(activeIdx === idx ? null : idx)} 
        />
      ))}
      <div className="cta-bottom">
        <button className="btn btn-primary" onClick={() => window.showPage('auth')}>See the Engine in Action →</button>
      </div>
    </div>
  );
};


const FeatureCard = ({ icon, title, description, bullets, mockUI }) => (
  <div className="feat-card">
    <div className="feat-left">
      <div className="feat-icon">{icon}</div>
      <h3 className="feat-title">{title}</h3>
      <p className="feat-desc">{description}</p>
      <ul className="feat-bullets">
        {bullets.map((b, i) => (
          <li key={i}><span className="check">✓</span> {b}</li>
        ))}
      </ul>
    </div>
    <div className="feat-right">
      {mockUI}
    </div>
  </div>
);

const TabContent = () => (
  <div className="tab-panel-container">
    <FeatureCard 
      icon="🧠" 
      title="7-Stage Prompt Architecture" 
      description="Our multi-stage pipeline converts any keyword into a full ranking blog. Each stage has a specific role — from intent analysis to schema injection." 
      bullets={["Keyword clustering + intent detection", "Role-based prompt templates", "Naturalness + humanization pass"]}
      mockUI={
        <div className="mock-ui-stages">
          {[ 'Intent Analysis', 'SERP Gap', 'Content Brief', 'Drafting', 'SEO Pass', 'Humanization', 'Schema' ].map((s, i) => (
            <div key={i} className="mock-stage"><span className="mock-stage-num">{i+1}</span> {s}</div>
          ))}
        </div>
      }
    />
    <FeatureCard 
      icon="🎙️" 
      title="Speak It. We Write It." 
      description="Record a 60-second voice note about your topic. BlogzzUP transcribes it, structures it, and outputs a full SEO-optimized blog post." 
      bullets={["Powered by OpenAI Whisper API", "Auto-structures your spoken ideas", "Full SEO pass on transcription"]}
      mockUI={
        <div style={{textAlign: 'center'}}>
          <div className="mock-waveform-container">
            <div className="mock-wave-bar" style={{animationDelay: '0.1s'}}></div>
            <div className="mock-wave-bar" style={{animationDelay: '0.3s'}}></div>
            <div className="mock-wave-bar" style={{animationDelay: '0.5s'}}></div>
            <div className="mock-wave-bar" style={{animationDelay: '0.2s'}}></div>
            <div className="mock-wave-bar" style={{animationDelay: '0.8s'}}></div>
            <div className="mock-wave-bar" style={{animationDelay: '0.4s'}}></div>
            <div className="mock-wave-bar" style={{animationDelay: '0.6s'}}></div>
            <div className="mock-wave-bar" style={{animationDelay: '0.1s'}}></div>
            <div className="mock-wave-bar" style={{animationDelay: '0.9s'}}></div>
            <div className="mock-wave-bar" style={{animationDelay: '0.3s'}}></div>
          </div>
          <div style={{color: '#EF4444', fontSize: '12px', fontWeight: 'bold', marginBottom: '16px'}}>● Recording... 0:23</div>
          <button className="btn btn-primary" style={{padding: '8px 16px', fontSize: '13px'}} onClick={() => window.showPage('auth')}>Generate Blog</button>
        </div>
      }
    />
    <FeatureCard 
      icon="🎯" 
      title="Your Voice. Every Post." 
      description="Paste 3 of your best blogs and BlogzzUP learns your writing style. Every generated post matches your tone, vocabulary, and structure." 
      bullets={["Trains on your existing content", "Tone consistency across all posts", "Customize formality level"]}
      mockUI={
        <div>
          <div className="mock-slider-track">
            <div className="mock-slider-thumb"></div>
          </div>
          <div className="mock-slider-labels">
            <span>Casual</span>
            <span>Formal</span>
          </div>
          <div className="mock-tone-tags">
            <span className="mock-tone-tag">Conversational</span>
            <span className="mock-tone-tag">Data-driven</span>
            <span className="mock-tone-tag">Story-led</span>
          </div>
        </div>
      }
    />
  </div>
);

const TabSeo = () => (
  <div className="tab-panel-container">
    <FeatureCard 
      icon="🔍" 
      title="Find What Competitors Miss" 
      description="Analyzes the top 10 SERP results for your keyword and surfaces topics your competitors don't cover — your opportunity to rank." 
      bullets={["Live SERP data analysis", "Unanswered question detection", "Featured snippet flagging"]}
      mockUI={
        <table className="mock-table">
          <thead>
            <tr><th>Topic Gap</th><th>Coverage</th><th>Score</th></tr>
          </thead>
          <tbody>
            <tr><td>API Pricing</td><td>2/10 URLs</td><td><span style={{color:'#10B981'}}>High</span></td></tr>
            <tr><td>Webhook Setup</td><td>0/10 URLs</td><td><span style={{color:'#10B981'}}>High</span></td></tr>
            <tr><td>Auth Flow</td><td>8/10 URLs</td><td><span style={{color:'#EF4444'}}>Low</span></td></tr>
          </tbody>
        </table>
      }
    />
    <FeatureCard 
      icon="📊" 
      title="Score As You Write" 
      description="10-metric real-time scoring dashboard that updates with every word. Know your SEO score before you hit publish." 
      bullets={["Keyword density + readability", "AI detection percentage", "Snippet eligibility check"]}
      mockUI={
        <div>
          <div className="mock-ring">
            <div className="mock-ring-inner">94</div>
          </div>
          <div style={{fontSize: '11px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center'}}>
            <div><span style={{color:'#10B981'}}>✓</span> Density 1.8%</div>
            <div><span style={{color:'#10B981'}}>✓</span> AI Detection 3%</div>
            <div><span style={{color:'#10B981'}}>✓</span> Snippet Ready</div>
          </div>
        </div>
      }
    />
    <FeatureCard 
      icon="🌍" 
      title="Rank in Every Indian City" 
      description="Automatically injects city-level signals, regional entities, and local schema markup. Target Delhi, Mumbai, Bangalore — or all three." 
      bullets={["City + region-level signals", "Local schema auto-injection", "Multi-location targeting"]}
      mockUI={
        <div className="mock-india-map">
          <div className="mock-city-dot mock-city-delhi"></div>
          <div className="mock-city-dot mock-city-mumbai"></div>
          <div className="mock-city-dot mock-city-blr"></div>
        </div>
      }
    />
  </div>
);

const TabPublishing = () => (
  <div className="tab-panel-container">
    <FeatureCard 
      icon="🚀" 
      title="Publish Everywhere Automatically" 
      description="Connect your CMS once and every blog auto-publishes on schedule. Supports WordPress, Webflow, Shopify, Ghost, Strapi, Sanity, and custom webhooks." 
      bullets={["6 native CMS integrations", "Custom webhook support", "Schedule queue with calendar view"]}
      mockUI={
        <div className="mock-cms-grid">
          {['WordPress', 'Webflow', 'Shopify', 'Ghost', 'Strapi', 'Sanity'].map(cms => (
            <div key={cms} className="mock-cms-pill">
              {cms}
              <div className="mock-cms-connected"></div>
            </div>
          ))}
        </div>
      }
    />
    <FeatureCard 
      icon="📅" 
      title="Your Entire Content Plan. Automated." 
      description="AI-generated publishing schedule based on your niche trends and SERP opportunities. See the next 30 days of content at a glance." 
      bullets={["AI-planned schedule", "Drag-and-drop rescheduling", "Topic preview per date"]}
      mockUI={
        <div className="mock-calendar">
          {Array.from({length: 20}).map((_, i) => (
             <div key={i} className="mock-cal-day">
               {[2, 5, 8, 12, 18, 19].includes(i) && <div className="mock-cal-dot" style={{background: i % 2 === 0 ? '#10B981' : '#7C3AED'}}></div>}
             </div>
          ))}
        </div>
      }
    />
    <FeatureCard 
      icon="🔁" 
      title="One Blog = 10 Content Pieces" 
      description="Every published blog automatically generates LinkedIn posts, Twitter/X threads, Instagram captions, and WhatsApp-ready summaries." 
      bullets={["LinkedIn long-form post", "Twitter/X thread (10 tweets)", "Instagram caption + hashtags"]}
      mockUI={
        <div className="mock-social-split">
          <div className="mock-social-left">Full Blog Post</div>
          <div className="mock-social-arr">→</div>
          <div className="mock-social-right">
            <div className="mock-sc li"></div>
            <div className="mock-sc tw"></div>
            <div className="mock-sc ig"></div>
            <div className="mock-sc wa"></div>
          </div>
        </div>
      }
    />
  </div>
);

const TabAnalytics = () => (
  <div className="tab-panel-container">
    <FeatureCard 
      icon="📈" 
      title="See Exactly What's Working" 
      description="Track keyword rankings, organic traffic delta, and estimated revenue attribution per blog post. Know your ROI to the rupee." 
      bullets={["Per-post traffic attribution", "Keyword position tracking", "Revenue delta estimation"]}
      mockUI={
        <div style={{textAlign: 'center'}}>
          <div className="mock-bar-chart">
            <div className="mock-bar" style={{height: '30%'}}></div>
            <div className="mock-bar" style={{height: '50%'}}></div>
            <div className="mock-bar" style={{height: '40%'}}></div>
            <div className="mock-bar" style={{height: '70%'}}></div>
            <div className="mock-bar" style={{height: '90%'}}></div>
            <div className="mock-bar" style={{height: '100%', background: '#06B6D4', boxShadow: '0 0 10px #06B6D4'}}></div>
          </div>
          <div style={{color: '#10B981', fontSize: '11px', fontWeight: 'bold'}}>↑ 2,340 visits this month</div>
        </div>
      }
    />
    <FeatureCard 
      icon="🗺️" 
      title="See Your Content Universe" 
      description="Visual network graph of your published and planned topics. See clusters, spot gaps, and generate new content with one click." 
      bullets={["Interactive topic network", "Coverage gap highlighting", "One-click blog from gap"]}
      mockUI={
        <div className="mock-cluster-network">
          <div className="mock-cluster-line" style={{transform: 'rotate(0deg)', width: '60px'}}></div>
          <div className="mock-cluster-line" style={{transform: 'rotate(90deg)', width: '60px'}}></div>
          <div className="mock-cluster-line" style={{transform: 'rotate(180deg)', width: '60px'}}></div>
          <div className="mock-cluster-line" style={{transform: 'rotate(270deg)', width: '60px'}}></div>
          <div className="mock-cluster-center">AI Tools</div>
          <div className="mock-cluster-node mcn-1"></div>
          <div className="mock-cluster-node mcn-2"></div>
          <div className="mock-cluster-node mcn-3"></div>
          <div className="mock-cluster-node mcn-4"></div>
        </div>
      }
    />
    <FeatureCard 
      icon="🏆" 
      title="Know What Your Rivals Publish" 
      description="Monitor competitor blogs in real time. Get notified when they publish, see their SEO scores, and auto-generate a better version." 
      bullets={["Real-time competitor monitoring", "SEO score comparison", "Auto-generate competing post"]}
      mockUI={
        <div style={{width: '100%', display: 'flex', flexDirection: 'column'}}>
          <div className="mock-competitor-row">
            <span style={{fontWeight: 'bold'}}>seoblues.com</span>
            <span style={{color: 'var(--text-muted)'}}>2d ago</span>
            <button className="mock-comp-btn" onClick={() => window.showPage('auth')}>Beat This</button>
          </div>
          <div className="mock-competitor-row">
            <span style={{fontWeight: 'bold'}}>contentai.io</span>
            <span style={{color: 'var(--text-muted)'}}>5d ago</span>
            <button className="mock-comp-btn" onClick={() => window.showPage('auth')}>Beat This</button>
          </div>
          <div className="mock-competitor-row" style={{border: 'none'}}>
            <span style={{fontWeight: 'bold'}}>rankmaker.in</span>
            <span style={{color: 'var(--text-muted)'}}>1w ago</span>
            <button className="mock-comp-btn" onClick={() => window.showPage('auth')}>Beat This</button>
          </div>
        </div>
      }
    />
  </div>
);

const FeaturesPage = () => {
  const [activeTab, setActiveTab] = React.useState('content');

  const tabs = [
    { id: 'content', label: '✍️ Content Creation' },
    { id: 'seo', label: '🔍 SEO & Research' },
    { id: 'publishing', label: '🚀 Publishing' },
    { id: 'analytics', label: '📈 Analytics' }
  ];

  return (
    <div className="container" style={{paddingTop: '8rem', paddingBottom: '8rem'}}>
      <div className="features-header" style={{textAlign: 'center', marginBottom: '48px'}}>
        <h1 style={{fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1}}>
          Every Tool You Need.<br />
          <span style={{background: 'linear-gradient(135deg, #7C3AED, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Nothing You Don't.</span>
        </h1>
        <p style={{color: 'var(--text-muted)', marginTop: '12px', fontSize: '18px'}}>Nine specialized AI tools working together as one platform</p>
      </div>

      <div className="feature-tabs" style={{display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '48px'}}>
        {tabs.map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`feature-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="tab-content-area">
        {activeTab === 'content' && <TabContent />}
        {activeTab === 'seo' && <TabSeo />}
        {activeTab === 'publishing' && <TabPublishing />}
        {activeTab === 'analytics' && <TabAnalytics />}
      </div>

      <div className="comparison-table-section" style={{marginTop: '80px'}}>
        <h2 style={{textAlign: 'center', fontSize: '28px', color: 'var(--text-primary)', marginBottom: '32px'}}>How We Stack Up</h2>
        <div style={{borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)'}}>
          <table className="comp-table" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px'}}>
            <thead>
              <tr style={{background: 'var(--bg-elevated)', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
                <th style={{padding: '16px 20px', color: 'var(--text-primary)'}}>Feature</th>
                <th style={{padding: '16px 20px', color: '#7C3AED', fontWeight: 700}}>BlogzzUP</th>
                <th style={{padding: '16px 20px', color: 'var(--text-primary)'}}>Blogy</th>
                <th style={{padding: '16px 20px', color: 'var(--text-primary)'}}>Jasper</th>
                <th style={{padding: '16px 20px', color: 'var(--text-primary)'}}>Manual</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>SERP Gap Scanner</td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
              </tr>
              <tr>
                <td>Live SEO Scorer</td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-partial">Partial</span></td>
                <td><span className="comp-mark-no">✗</span></td>
              </tr>
              <tr>
                <td>SEO Optimization</td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
              </tr>
              <tr>
                <td>Voice-to-Blog</td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
              </tr>
              <tr>
                <td>Social Repurpose</td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
              </tr>
              <tr>
                <td>Content Cluster Map</td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
              </tr>
              <tr>
                <td>Auto-Publisher</td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
              </tr>
              <tr>
                <td>ROI Tracker</td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-no">✗</span></td>
              </tr>
              <tr>
                <td>Blog Generation using AI</td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
                <td><span className="comp-mark-yes">✓</span></td>
                <td><span className="comp-mark-no">✗</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


const demoInitialMessages = [
  { role: 'user', text: 'Write an SEO blog about AI tools for Indian startups' },
  { role: 'ai', text: 'Analyzing SERP gap... Found 3 low-competition keywords ✓\nClustering topics... Done ✓\nDrafting blog with 94% SEO score... ✓\nGenerating featured snippet structure... ✓' },
  { role: 'user', text: 'Optimize for GEO — target Delhi and Bangalore' },
  { role: 'ai', text: 'Adding location-specific entities... ✓\nInjecting local search modifiers... ✓\nApplying regional schema markup... ✓\nYour blog is ready to publish!' }
];

window.renderDemoMessage = function(msg) {
  const isUser = msg.role === 'user';
  const div = document.createElement('div');
  div.style.cssText = 'display:flex; ' + (isUser ? 'justify-content:flex-end' : 'justify-content:flex-start');
  div.innerHTML = '<div style="' +
    'max-width:82%; padding:11px 16px; font-size:13px; line-height:1.6; white-space:pre-wrap;' +
    (isUser 
      ? 'background:#7C3AED; color:white; border-radius:18px 18px 4px 18px;'
      : 'background:#141B2D; color:#94A3B8; border-radius:18px 18px 18px 4px;') +
    '">' + msg.text + '</div>';
  return div;
};

window.initDemoChat = function() {
  const container = document.getElementById('demo-chat-messages');
  if (!container) return;
  container.innerHTML = '';
  demoInitialMessages.forEach(msg => container.appendChild(window.renderDemoMessage(msg)));
  container.scrollTop = container.scrollHeight;
};

window.sendDemoMessage = async function() {
  const input = document.getElementById('demo-chat-input');
  
  if (!input) {
    console.error('demo-chat-input element not found in DOM');
    return;
  }
  
  const keyword = input.value.trim();
  
  if (!keyword) {
    input.style.borderColor = '#EF4444';
    setTimeout(() => { input.style.borderColor = 'var(--border-strong)'; }, 2000);
    return;
  }

  const container = document.getElementById('demo-chat-messages');
  const btn = document.getElementById('demo-send-btn');

  container.appendChild(window.renderDemoMessage({ role: 'user', text: keyword }));
  container.scrollTop = container.scrollHeight;
  input.value = '';
  if (btn) {
    btn.disabled = true;
    btn.style.opacity = '0.5';
  }

  const thinkingDiv = document.createElement('div');
  thinkingDiv.style.cssText = 'display:flex; justify-content:flex-start;';
  thinkingDiv.innerHTML = '<div style="background:#141B2D; color:#94A3B8; border-radius:18px 18px 18px 4px; padding:11px 16px; font-size:13px;">⏳ Analyzing keyword...</div>';
  container.appendChild(thinkingDiv);
  container.scrollTop = container.scrollHeight;

  const prompt = `You are BlogForge AI, an expert SEO content engine assistant. \nThe user just typed: "${keyword}"\n\nRespond in 3-4 short lines as if you are an AI engine processing their request. \nShow a realistic step-by-step processing response like:\n- Analyzing SERP gap for "${keyword}"... Found X low-competition keywords ✓\n- Identifying content gaps vs top 10 competitors... ✓  \n- Drafting SEO blog outline with XX% optimization score... ✓\n- Structuring for featured snippet eligibility... ✓\n\nKeep it short, punchy, technical. Show specific numbers related to "${keyword}". \nDo NOT write a blog. Just show the processing steps.`;

  try {
    const raw = await callGemini(prompt, 300, 'text/plain');
    thinkingDiv.remove();
    container.appendChild(window.renderDemoMessage({ role: 'ai', text: raw }));
  } catch(err) {
    thinkingDiv.remove();
    container.appendChild(window.renderDemoMessage({ 
      role: 'ai', 
      text: 'Analyzing "' + keyword + '"...\\nFound SERP gaps ✓\\nBlog outline ready ✓\\nSEO score: 91/100 ✓\\nReady to generate full blog!' 
    }));
  }

  container.scrollTop = container.scrollHeight;
  if (btn) {
    btn.disabled = false;
    btn.style.opacity = '1';
  }
};

window.addEventListener('load', () => {
  window.initDemoChat();
});

window.generateSampleBlog = async function() {
  const inputEl = document.getElementById('tiy-keyword-input');
  const btn = document.getElementById('tiy-generate-btn');
  const resultsEl = document.getElementById('tiy-results');

  if (!inputEl) { console.error('tiy-keyword-input not found'); return; }

  const keyword = inputEl.value.trim();

  if (!keyword) {
    inputEl.style.borderColor = '#EF4444';
    inputEl.placeholder = 'Please enter a keyword first!';
    setTimeout(() => {
      inputEl.style.borderColor = 'var(--border-strong)';
      inputEl.placeholder = 'Enter any keyword, e.g. data science, SaaS tools...';
    }, 2000);
    return;
  }

  if (btn) {
    btn.textContent = '⏳ Generating...';
    btn.disabled = true;
    btn.style.opacity = '0.7';
  }

  if (resultsEl) {
    resultsEl.style.display = 'block';
    resultsEl.innerHTML = '<div style="text-align:center;padding:40px 0;color:#94A3B8;font-size:15px;"><div style="margin-bottom:16px;font-size:28px;">✨</div>Generating your blog on <strong style="color:#A78BFA;">' + keyword + '</strong>...<br/><span style="font-size:12px;color:#64748B;margin-top:8px;display:inline-block;">This may take a few seconds</span></div>';
  }

  const prompt = `You are an expert SEO content writer. Write a short but complete blog post about "${keyword}".

Return ONLY valid JSON with this exact structure:
{
  "title": "compelling blog title about ${keyword}, under 65 chars",
  "metaDescription": "meta description under 155 chars about ${keyword}",
  "sections": [
    {"heading": "Introduction", "content": "2-3 sentence introduction about ${keyword}. Hook the reader."},
    {"heading": "section heading", "content": "2-3 sentences about this aspect of ${keyword}."},
    {"heading": "section heading", "content": "2-3 sentences about this aspect of ${keyword}."},
    {"heading": "Conclusion", "content": "2-3 sentence conclusion with a call to action."}
  ]
}`;

  try {
    const raw = await callGemini(prompt, 2000, 'application/json');
    let cleaned = raw.replace(/```json|```/g, '').trim();

    // Robust JSON repair
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleaned = jsonMatch[0];
    // Fix unterminated strings
    const quoteCount = (cleaned.match(/(?<!\\)"/g) || []).length;
    if (quoteCount % 2 !== 0) cleaned += '"';
    // Fix unterminated brackets
    const opens = (cleaned.match(/[\[{]/g) || []).length;
    const closes = (cleaned.match(/[\]\}]/g) || []).length;
    for (let k = closes; k < opens; k++) {
      cleaned += cleaned.lastIndexOf('[') > cleaned.lastIndexOf('{') ? ']' : '}';
    }

    const data = JSON.parse(cleaned);

    // Build blog HTML
    let blogHTML = '';
    blogHTML += '<div style="margin-bottom:24px;">';
    blogHTML += '<div style="font-size:11px;color:#7C3AED;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">📌 Blog Title</div>';
    blogHTML += '<h2 style="font-size:22px;color:#fff;font-weight:700;margin:0;line-height:1.3;">' + (data.title || keyword) + '</h2>';
    blogHTML += '</div>';

    blogHTML += '<div style="margin-bottom:24px;padding:12px 16px;background:rgba(124,58,237,0.08);border-left:3px solid #7C3AED;border-radius:0 8px 8px 0;">';
    blogHTML += '<div style="font-size:11px;color:#7C3AED;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">📝 Meta Description</div>';
    blogHTML += '<div style="font-size:13px;color:#94A3B8;line-height:1.5;">' + (data.metaDescription || '') + '</div>';
    blogHTML += '</div>';

    if (data.sections && data.sections.length > 0) {
      data.sections.forEach(function(sec, idx) {
        blogHTML += '<div style="margin-bottom:20px;">';
        blogHTML += '<h3 style="font-size:16px;color:#E2E8F0;font-weight:600;margin:0 0 8px;display:flex;align-items:center;gap:8px;"><span style="color:#7C3AED;">§</span> ' + (sec.heading || 'Section ' + (idx + 1)) + '</h3>';
        blogHTML += '<p style="font-size:14px;color:#94A3B8;line-height:1.8;margin:0;">' + (sec.content || '') + '</p>';
        blogHTML += '</div>';
      });
    }

    blogHTML += '<div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:12px;flex-wrap:wrap;">';
    blogHTML += '<span style="font-size:11px;background:rgba(16,185,129,0.1);color:#10B981;padding:4px 12px;border-radius:999px;font-weight:500;">✓ AI Generated</span>';
    blogHTML += '<span style="font-size:11px;background:rgba(124,58,237,0.1);color:#A78BFA;padding:4px 12px;border-radius:999px;font-weight:500;">🔑 ' + keyword + '</span>';
    blogHTML += '<span style="font-size:11px;background:rgba(6,182,212,0.1);color:#06B6D4;padding:4px 12px;border-radius:999px;font-weight:500;">📊 SEO Optimized</span>';
    blogHTML += '</div>';

    if (resultsEl) {
      resultsEl.style.display = 'block';
      resultsEl.innerHTML = blogHTML;
    }

  } catch(err) {
    console.error('Gemini error:', err.message);
    // Show error with retry option instead of hardcoded fallback
    if (resultsEl) {
      resultsEl.style.display = 'block';
      resultsEl.innerHTML = '<div style="text-align:center;padding:32px 0;">' +
        '<div style="font-size:28px;margin-bottom:12px;">⚠️</div>' +
        '<div style="font-size:15px;color:#F59E0B;font-weight:600;margin-bottom:8px;">AI is busy — please try again</div>' +
        '<div style="font-size:13px;color:#64748B;margin-bottom:20px;">Our API keys are cooling down. Click below to retry.</div>' +
        '<button onclick="window.generateSampleBlog()" style="background:linear-gradient(135deg,#7C3AED,#06B6D4);color:white;border:none;border-radius:10px;padding:12px 28px;font-size:14px;font-weight:600;cursor:pointer;">🔄 Retry Generation</button>' +
        '</div>';
    }
  }

  if (btn) {
    btn.textContent = 'Generate →';
    btn.disabled = false;
    btn.style.opacity = '1';
  }
};

window.typeWriterEffect = function(element, text, speed) {
  element.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  type();
};

const DemoPage = () => {


  return (
    <div className="container" style={{paddingTop: '8rem', paddingBottom: '8rem'}}>
      <div style={{textAlign: 'center', marginBottom: '48px'}}>
        <h1 style={{fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', margin: 0}}>Try BlogzzUP Live</h1>
        <p style={{color: 'var(--text-muted)', marginTop: '12px', fontSize: '18px'}}>No signup required. See the engine work in real time.</p>
      </div>

      <div style={{maxWidth: '900px', margin: '0 auto', background: 'var(--bg-surface)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
        <div style={{width: '100%', display: 'flex', flexWrap: 'wrap'}}>
          <div style={{flex: '1 1 60%', display: 'flex', flexDirection: 'column', minWidth: '300px'}}>
            <div style={{padding: '14px 20px', background: 'var(--bg-base)', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{display: 'flex', gap: '6px'}}>
                <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444'}}></div>
                <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B'}}></div>
                <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#10B981'}}></div>
              </div>
              <div style={{fontSize: '12px', color: 'var(--text-subtle)', marginLeft: '8px'}}>BlogzzUP — Content Engine</div>
            </div>
            
            <div style={{display: 'flex', height: '480px'}}>
              <div style={{width: '160px', background: 'var(--bg-base)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px', flexShrink: 0, display: 'flex', flexDirection: 'column'}}>
                <div style={{fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '20px'}}>⚡ BlogzzUP</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <div style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-subtle)', cursor: 'pointer'}}>+ New Project</div>
                  <div style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-subtle)', cursor: 'pointer'}}>📄 My Documents</div>
                  <div style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-subtle)', cursor: 'pointer'}}>🗺️ Cluster Map</div>
                  <div style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-subtle)', cursor: 'pointer'}}>📅 Content Calendar</div>
                  <div style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: 'var(--text-subtle)', cursor: 'pointer'}}>⚙️ Settings</div>
                </div>
                <div style={{marginTop: 'auto'}}>
                  <span style={{background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', marginBottom: '6px', display: 'block'}}>● SEO Optimizer</span>
                  <span style={{background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', display: 'block'}}>● Auto Publisher</span>
                </div>
              </div>

              <div style={{flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-surface)'}}>
                <div id="demo-chat-messages" style={{flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                  {/* messages will be injected here */}
                </div>
                
                <div style={{marginTop: 'auto'}}>
                  <div style={{padding: '12px 16px', background: 'var(--bg-base)', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <input 
                      id="demo-chat-input"
                      type="text" 
                      placeholder="Enter your keyword or topic..."
                      onKeyDown={(e) => { if(e.key === 'Enter') window.sendDemoMessage(); }}
                      style={{flex: 1, background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none'}}
                      onFocus={(e) => e.target.style.borderColor='#7C3AED'}
                      onBlur={(e) => e.target.style.borderColor='var(--border-strong)'}
                    />
                    <button 
                      onClick={() => window.sendDemoMessage()}
                      id="demo-send-btn"
                      style={{background: '#7C3AED', width: '38px', height: '38px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-primary)', fontSize: '16px', border: 'none', flexShrink: 0, transition: 'all 0.2s'}}
                      onMouseEnter={(e) => e.target.style.background='#6D28D9'}
                      onMouseLeave={(e) => e.target.style.background='#7C3AED'}
                    >
                      ↑
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{flex: '1 1 40%', background: 'var(--bg-base)', borderLeft: '1px solid rgba(124,58,237,0.15)', padding: '28px', display: 'flex', flexDirection: 'column', minWidth: '250px'}}>
            <div style={{fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '20px'}}>Live SEO Score</div>
            
            <div style={{margin: '0 auto 24px', width: '100px', height: '100px', position: 'relative', borderRadius: '50%', background: 'conic-gradient(#7C3AED 0% 94%, var(--bg-elevated) 94% 100%)'}}>
              <div style={{position: 'absolute', top: '8px', left: '8px', width: '84px', height: '84px', background: 'var(--bg-base)', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1}}>94</div>
                <div style={{fontSize: '12px', color: 'var(--text-subtle)'}}>/100</div>
              </div>
            </div>
            <div style={{fontSize: '12px', color: '#10B981', textAlign: 'center', marginTop: '-16px', marginBottom: '24px'}}>Excellent</div>

            <div style={{display: 'flex', flexDirection: 'column'}}>
              {[
                ["Keyword Density", "1.8% ✓"],
                ["Readability", "78/100 ✓"],
                ["AI Detection", "3% ✓"],
                ["Snippet Ready", "Yes ✓"],
                ["Featured Snippet", "Eligible ✓"]
              ].map((metric, i) => (
                <div key={i} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '13px'}}>
                  <span style={{color: 'var(--text-muted)'}}>{metric[0]}</span>
                  <span style={{color: '#10B981', fontWeight: 500}}>{metric[1]}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => { if(window.showDashboard) window.showDashboard(); }}
              style={{marginTop: '24px', width: '100%', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: 'var(--text-primary)', border: 'none', borderRadius: '10px', padding: '13px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s'}}
              onMouseEnter={(e) => e.target.style.filter='brightness(1.1)'}
              onMouseLeave={(e) => e.target.style.filter='brightness(1)'}
            >
              Generate Full Blog →
            </button>
          </div>
        </div>
      </div>

      <div style={{marginTop: '64px'}}>
        <h2 style={{fontSize: '32px', color: 'var(--text-primary)', textAlign: 'center', margin: 0, fontWeight: 700}}>Try It Yourself</h2>
        <p style={{color: 'var(--text-muted)', textAlign: 'center', marginBottom: '32px', marginTop: '12px'}}>Enter any topic and get an AI-generated blog post instantly</p>
        
        <div style={{maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '12px'}}>
          <input 
            id="tiy-keyword-input"
            type="text" 
            placeholder="Enter any topic, e.g. data science, SaaS tools, fitness apps..."
            onKeyDown={(e) => { if (e.key === 'Enter') window.generateSampleBlog(); }}
            style={{flex: 1, background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 20px', color: 'var(--text-primary)', fontSize: '15px', outline: 'none'}}
            onFocus={(e) => e.target.style.borderColor='#7C3AED'}
            onBlur={(e) => e.target.style.borderColor='var(--border-strong)'}
          />
          <button 
            onClick={() => window.generateSampleBlog()}
            id="tiy-generate-btn"
            style={{background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', color: 'var(--text-primary)', border: 'none', borderRadius: '12px', padding: '14px 28px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s'}}
            onMouseEnter={(e) => e.target.style.opacity='0.9'}
            onMouseLeave={(e) => e.target.style.opacity='1'}
          >
            Generate →
          </button>
        </div>

        <div id="tiy-results" style={{display: 'none', background: 'var(--bg-elevated)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '28px', marginTop: '20px', maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto'}}></div>
      </div>

      <div style={{marginTop: '64px', textAlign: 'center'}}>
        <p style={{fontSize: '18px', color: 'var(--text-muted)'}}>Ready for the real thing?</p>
        <button onClick={() => window.showPage('auth')} style={{background: 'linear-gradient(135deg,#7C3AED,#9333EA)', color: 'var(--text-primary)', borderRadius: '999px', padding: '14px 32px', fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer', marginTop: '16px'}}>
          Start Free — First Month on Us →
        </button>
      </div>
    </div>
  );
};


const PricingPage = ({ onSignIn }) => {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const [activeFaq, setActiveFaq] = React.useState(null);
  const faqs = [
    { q: "Is there a free trial?", a: "Yes. The Starter plan is free for your first month — no credit card required. You get full access to all Starter features for 30 days." },
    { q: "Can I cancel anytime?", a: "Absolutely. Cancel with one click from your dashboard. No cancellation fees, no questions asked." },
    { q: "Do I own the content BlogzzUP generates?", a: "100%. All content generated and published through BlogzzUP belongs entirely to you." },
    { q: "Which CMS platforms are supported?", a: "WordPress, Webflow, Shopify, Ghost, Strapi, Sanity, and any platform via custom webhook." },
    { q: "How is this different from ChatGPT?", a: "ChatGPT is a general AI. BlogzzUP is a purpose-built SEO engine — it clusters keywords, analyzes SERPs, scores content in real time, and auto-publishes. ChatGPT can't do any of that." },
    { q: "What is GEO Optimization?", a: "GEO (Generative Engine Optimization) structures your content to rank both in Google and in AI answer engines like ChatGPT, Perplexity, and Gemini." },
    { q: "How does auto-publishing work?", a: "Connect your CMS once via API. BlogzzUP generates, schedules, and publishes blogs automatically at your set frequency — no manual steps." },
    { q: "Is the content SEO-optimized?", a: "Yes. Every post is scored across 10 metrics including keyword density, readability, snippet eligibility, and AI detection before it ever gets published." },
    { q: "Can my team use one account?", a: "The Growth and Scale plans include shared team access. You can invite members and assign roles from your dashboard." },
    { q: "Is there a white-label option?", a: "Yes, available on the Scale plan. Contact our sales team for details." }
  ];

  return (
    <div className="container" style={{paddingTop: '8rem', paddingBottom: '8rem'}}>
      <div style={{textAlign: 'center', marginBottom: '48px'}}>
        <h1 style={{fontSize: '48px', fontWeight: 800, color: 'var(--text-primary)', margin: 0}}>
          Simple Pricing. <span style={{background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Serious Results.</span>
        </h1>
        <p style={{color: 'var(--text-muted)', marginTop: '12px', fontSize: '18px'}}>Start free. Upgrade when you're ready. Cancel anytime.</p>
      </div>

      <div className="pricing-toggle">
        <div className="pt-container">
          <button 
            onClick={() => setBillingCycle('monthly')}
            className={`pt-btn ${billingCycle === 'monthly' ? 'active' : 'inactive'}`}
          >Monthly</button>
          <button 
            onClick={() => setBillingCycle('yearly')}
            className={`pt-btn ${billingCycle === 'yearly' ? 'active' : 'inactive'}`}
          >Yearly (Save 30%)</button>
        </div>
      </div>

      <div className="pricing-grid-3">
        {/* Starter */}
        <div className="pc-card">
          <h3 className="pc-header">Starter</h3>
          <div className="pc-price-wrap">
            <span className="pc-price">{billingCycle === 'yearly' ? '₹16,790' : '₹1,999'}</span>
            <span className="pc-per">{billingCycle === 'yearly' ? '/year' : '/month'}</span>
          </div>
          <div style={{fontSize: '12px', color: '#10B981', marginTop: '4px'}}>(First month free)</div>
          <p className="pc-desc">For early-stage startups building organic presence</p>
          <div className="pc-divider"></div>
          <ul className="pc-feat-list">
            <li className="pc-feat"><span className="pc-feat-check">✓</span> 15 SEO blogs / month</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Real-time SEO Scorer</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Auto-publish to 1 website</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> SERP Gap Scanner (5/month)</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Content Calendar</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Email support</li>
          </ul>
          <button
            className="pc-btn-outline"
            onClick={() => onSignIn && onSignIn()}
          >Start Free →</button>
        </div>

        {/* Growth */}
        <div className="pc-card popular">
          <div className="pc-most-pop">Most Popular</div>
          <h3 className="pc-header">Growth</h3>
          <div className="pc-price-wrap">
            <span className="pc-price">{billingCycle === 'yearly' ? '₹41,990' : '₹4,999'}</span>
            <span className="pc-per">{billingCycle === 'yearly' ? '/year' : '/month'}</span>
          </div>
          <p className="pc-desc" style={{margin: '32px 0 24px'}}>For startups replacing their marketing team</p>
          <div className="pc-divider"></div>
          <ul className="pc-feat-list">
            <div style={{fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, padding: '6px 0'}}>✓ Everything in Starter</div>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> 50 SEO blogs / month</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> GEO Optimization Engine</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Content Cluster Map (unlimited)</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Social Repurpose Engine</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Voice-to-Blog (10/month)</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> ROI & Traffic Tracker</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Priority support</li>
          </ul>
          <button
            className="pc-btn-solid"
            onClick={() => onSignIn && onSignIn()}
          >Get Started →</button>
        </div>

        {/* Scale */}
        <div className="pc-card">
          <h3 className="pc-header">Scale</h3>
          <div className="pc-price-wrap">
            <span className="pc-price">Custom</span>
          </div>
          <p className="pc-desc" style={{margin: '48px 0 24px'}}>For agencies and high-growth teams</p>
          <div className="pc-divider"></div>
          <ul className="pc-feat-list">
             <li className="pc-feat"><span className="pc-feat-check">✓</span> Unlimited blogs</li>
             <li className="pc-feat"><span className="pc-feat-check">✓</span> Multi-website support</li>
             <li className="pc-feat"><span className="pc-feat-check">✓</span> Custom brand voice training</li>
             <li className="pc-feat"><span className="pc-feat-check">✓</span> Full API access</li>
             <li className="pc-feat"><span className="pc-feat-check">✓</span> White-label option</li>
             <li className="pc-feat"><span className="pc-feat-check">✓</span> Dedicated onboarding</li>
             <li className="pc-feat"><span className="pc-feat-check">✓</span> SLA + Priority support</li>
             <li className="pc-feat"><span className="pc-feat-check">✓</span> Advanced analytics</li>
          </ul>
          <button
            className="pc-btn-outline-cyan"
            onClick={() => window.open('mailto:hello@blogforge.ai?subject=Scale Plan Enquiry')}
          >Contact Sales →</button>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px', marginTop: '8px' }}>
        Sign in to activate your plan
      </p>

      <div style={{marginTop: '32px', textAlign: 'center', fontSize: '13px', color: 'var(--text-subtle)'}}>
        🔒 No credit card required · Cancel anytime · SOC2 Compliant · Used by 500+ Indian startups
      </div>

      <div className="faq-accordion" style={{marginTop: '80px', maxWidth: '800px', margin: '80px auto 0'}}>
        <h2 style={{fontSize: '32px', color: 'var(--text-primary)', textAlign: 'center', marginBottom: '32px', fontWeight: 700}}>Frequently Asked Questions</h2>
        {faqs.map((faq, i) => (
           <div 
             key={i} 
             onClick={() => setActiveFaq(activeFaq === i ? null : i)}
             className={`accordion-container ${activeFaq === i ? 'open' : ''}`}
           >
             <div className="accordion-header">
               <span className="accordion-title">{faq.q}</span>
               <span className="accordion-icon">▼</span>
             </div>
             <div className="accordion-body">
               <div className="accordion-answer">{faq.a}</div>
             </div>
           </div>
        ))}
      </div>
    </div>
  );
};

const BlogDetailView = ({ post, onBack }) => {
  return (
    <div className="container blog-detail-container">
      <button className="blog-back-btn" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Blog
      </button>
      
      <img src={post.image} alt={post.title} className="blog-hero-img" />
      
      <article className="blog-article">
        <span className="blog-tag">{post.tag}</span>
        <h1>{post.title}</h1>
        <div className="blog-meta" style={{marginBottom: '3rem'}}>
          <span>📅 Mar 2026</span>
          <span>⏱ {post.readTime}</span>
          <span>👤 By BlogzzUP</span>
        </div>
        
        <div className="blog-content">
          {post.content.map((p, i) => (
            <div key={i}>
              {p.type === 'h2' ? <h2>{p.text}</h2> : <p>{p.text}</p>}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
};

const BlogPage = () => {
  const [selectedPost, setSelectedPost] = useState(null);

  const posts = [
    { 
      id: 1,
      title: "The 2026 SEO Blueprint: Why Cluster Mapping is the New Backlinking", 
      tag: "AI & SEO Strategy", 
      emoji: "🗺️", 
      image: "/assets/blog/seo_blueprint.png",
      readTime: "8 min read",
      grad: "linear-gradient(135deg,#1E0B4B,#2D1B69)",
      content: [
        { type: 'p', text: "In the rapidly evolving landscape of search engine optimization, traditional backlinking strategies are no longer the sole foundation of authority. As we head into 2026, Google's algorithms have shifted focus towards 'Topical Authority' and 'Semantic Relevance' over simple volume-based metrics." },
        { type: 'h2', text: "The Shift to Topical Authority" },
        { type: 'p', text: "Cluster mapping is the process of visually and strategically organizing your content into 'Pillars' and 'Clusters'. A pillar page serves as the comprehensive anchor for a broad topic, while cluster pages deep-dive into specific long-tail keywords that link back to the pillar." },
        { type: 'p', text: "This structure signals to search engines that your site is a definitive resource on the subject, creating a web of internal links that is far more resilient than sporadic external backlinks. When your site is structured this way, every new post strengthens the authority of the entire domain, rather than standing alone." },
        { type: 'h2', text: "Why AI-Driven Mapping is Essential" },
        { type: 'p', text: "Manually mapping out content ecosystems used to take agencies weeks of research and spreadsheet management. With BlogzzUP, we analyze live SERP data to identify the exact semantic gaps in your niche, building your cluster map in seconds." },
        { type: 'p', text: "Our engine looks at the top 100 ranking pages, extracts their entity relationships, and identifies topics that aren't being fully addressed. This allows you to build a content moat that competitors find nearly impossible to breach without significant manual effort." }
      ]
    },
    { 
      id: 2,
      title: "From 8 Hours to 8 Minutes: How AI is Rescuing the Modern Content Marketer", 
      tag: "Productivity", 
      emoji: "⚡", 
      image: "/assets/blog/ai_productivity.png",
      readTime: "6 min read",
      grad: "linear-gradient(135deg,#0C2340,#1E3A5F)",
      content: [
        { type: 'p', text: "Content fatigue is real. The modern marketer is expected to be a researcher, writer, editor, SEO specialist, and publisher all at once. Traditionally, producing a high-quality, 2,500-word SEO article would take a dedicated professional anywhere from 6 to 8 hours of focused work." },
        { type: 'h2', text: "The Content Bottleneck" },
        { type: 'p', text: "The bottleneck isn't just the writing; it's the research. Identifying what competitors are doing, finding the right NLP keywords, and structuring the H-tags takes more time than the actual typing. By the time many writers get to the body content, they are already mentally exhausted, leading to generic results." },
        { type: 'h2', text: "Enter the One-Click Workflow" },
        { type: 'p', text: "BlogzzUP collapses this entire pipeline. By using a 7-stage prompt architecture, we handle the boring parts—the research and the SEO optimization—leaving you to simply review and hit publish. We're not just making writing faster; we're redefining the marketer's role from 'creator' to 'director'." },
        { type: 'p', text: "In a world where speed is a competitive advantage, the ability to iterate on content strategies in real-time is invaluable. Instead of waiting a month for a content agency to deliver four posts, you can now produce an entire content series in a single afternoon, responding to market trends while they are still relevant." }
      ]
    },
    { 
      id: 3,
      title: "Hyper-Local Dominance: Leveraging GEO Optimization for Indian Tier-1 Markets", 
      tag: "GEO Special", 
      emoji: "🏙️", 
      image: "/assets/blog/geo_opt.png",
      readTime: "10 min read",
      grad: "linear-gradient(135deg,#0B3D2E,#1A5940)",
      content: [
        { type: 'p', text: "India's digital growth is no longer confined to Bangalore and Mumbai. Startups are finding massive opportunities in Tier-1 and Tier-2 cities, but ranking for localized search terms requires a level of customization that most global AI tools fail to provide." },
        { type: 'h2', text: "The Power of Localized Search" },
        { type: 'p', text: "When a user in Delhi searches for a service, they see different results than someone in Chennai. GEO optimization means automatically infusing your content with local context, landmarks, and regional keywords without sounding like a bot. This builds immediate trust with the user who feels the content was written specifically for their local needs." },
        { type: 'h2', text: "Scaling to 500 Cities" },
        { type: 'p', text: "BlogzzUP's GEO Optimizer allows you to generate city-specific versions of your landing pages and blog posts. Imagine having 500 unique, high-quality blog posts targeting 500 different Indian cities, all generated and published in a single afternoon." },
        { type: 'p', text: "This strategy allows you to capture long-tail traffic that is often high-intent. A user searching for 'marketing agency in Indiranagar' is much closer to a conversion than someone searching for 'global marketing agencies'. We give you the tools to win those local battles at scale." }
      ]
    },
    { 
      id: 4,
      title: "The Soul of the Machine: How to Train AI to Mimic Your Unique Founder Voice", 
      tag: "Brand Voice", 
      emoji: "🎙️", 
      image: "/assets/blog/brand_voice.png",
      readTime: "7 min read",
      grad: "linear-gradient(135deg,#3D1A0B,#5C2810)",
      content: [
        { type: 'p', text: "The biggest fear founders have with AI content is that it sounds 'soulless'. Generic AI writing is easy to spot—it's polite, repetitive, and lacks an opinion. To stand out in 2026, your content needs to reflect your unique 'Founder Voice'—the perspective that made your company special in the first place." },
        { type: 'h2', text: "Injecting Personality into Pixels" },
        { type: 'p', text: "Your brand isn't just what you sell; it's how you talk. Are you provocative? Authoritative? Friendly? We've built Brand Voice Control modules that allow you to feed your past newsletters, social posts, and manifestos directly into the AI to analyze your unique stylistic fingerprint." },
        { type: 'h2', text: "Setting Constraints" },
        { type: 'p', text: "Mimicking a voice is about what you *don't* say as much as what you do. Our tool lets you set negative keywords and stylistic constraints (e.g., 'Never use emojis' or 'Always use short, punchy sentences') to ensure every blog post feels like it came from your keyboard. This coherence across all channels is what builds lasting brand equity." },
        { type: 'p', text: "By automating the drafting process while maintaining your voice, you can spend more time on strategic thinking and high-level editing, ensuring that every piece of content that leaves your dashboard is a true representation of your brand's philosophy." }
      ]
    },
    { 
      id: 5,
      title: "Beyond Generative AI: The Rise of Autonomous Content Agents in Digital Marketing", 
      tag: "Tech Trends", 
      emoji: "🤖", 
      image: "/assets/blog/autonomous_agents.png",
      readTime: "9 min read",
      grad: "linear-gradient(135deg,#1A0B3D,#2D1A5C)",
      content: [
        { type: 'p', text: "We are moving past the 'Chatbot' era. The future of content marketing doesn't involve you typing prompts into a box. It involves Autonomous Content Agents—AI that monitors your niche, spots trends, and suggests content before you even know it's needed. This is the shift from 'Generative' to 'Agentic' AI." },
        { type: 'h2', text: "The 24/7 Marketing Department" },
        { type: 'p', text: "Autonomous agents don't just write; they think. They can analyze your analytics, notice a drop in traffic for a specific keyword, and automatically draft a replacement article to regain your ranking. They can monitor competitor moves and suggest counter-strategies, acting as a proactive partner in your marketing department." },
        { type: 'h2', text: "Connecting the Dots" },
        { type: 'p', text: "At BlogzzUP, we're building the infrastructure for this autonomous future. By connecting your Google Search Console and CMS, our agents can operate as a self-healing content ecosystem that compounds in value while you sleep. The goal isn't just to produce more content, but to produce the *right* content at the exact moment it's needed by the market." }
      ]
    },
    { 
      id: 6,
      title: "Case Study: How 'BuildFast Delhi' Scaled from 0 to 100k Monthly Visits in 90 Days", 
      tag: "Success Story", 
      emoji: "🚀", 
      image: "/assets/blog/success_story.png",
      readTime: "12 min read",
      grad: "linear-gradient(135deg,#0B1A3D,#1A2D5C)",
      content: [
        { type: 'p', text: "Meet Rakesh, the founder of BuildFast Delhi. Like many entrepreneurs, he had a great product but zero organic visibility. Agencies quoted him 6 months and 5 lakhs to 'start seeing results'. He didn't have that kind of time or budget, and was close to giving up on organic search entirely." },
        { type: 'h2', text: "The Strategy: Volume + Velocity" },
        { type: 'p', text: "Using BlogzzUP, Rakesh didn't just publish one blog a week. He used our automation tools to publish three high-quality blogs *a day*. By leveraging our SERP Gap Scanner, he targeted thousands of low-difficulty long-tail keywords that competitors were ignoring because they were too labor-intensive to target manually." },
        { type: 'h2', text: "The Results" },
        { type: 'p', text: "Within 30 days, BuildFast was ranking for 450 long-tail keywords. By day 90, they hit the 100,000 monthly visitor mark, leading to a 400% increase in inbound leads and a significant decrease in their cost-per-acquisition. Total cost? Less than a single month's agency retainer. Rakesh's story proves that with the right AI tools, David can indeed beat Goliath in the search results." }
      ]
    }
  ];

  if (selectedPost) {
    return <BlogDetailView post={selectedPost} onBack={() => { setSelectedPost(null); window.scrollTo(0, 0); }} />;
  }

  return (
    <div className="container" style={{paddingTop: '8rem', paddingBottom: '8rem'}}>
      <div style={{textAlign: 'center', marginBottom: '48px'}}>
        <h1 style={{fontSize: '48px', color: 'var(--text-primary)', margin: 0, fontWeight: 800}}>Latest from BlogzzUP</h1>
        <p style={{color: 'var(--text-muted)', marginTop: '12px', fontSize: '18px'}}>Insights, strategies, and playbooks on AI content and SEO</p>
      </div>

      <div className="blog-grid">
        {posts.map((post, i) => (
          <div key={i} className="blog-card">
            <div className="blog-thumb" style={{background: post.grad}}>
               <img src={post.image} alt={post.title} style={{width:'100%', height:'100%', objectFit:'cover', opacity: 0.8}} />
            </div>
            <div className="blog-body">
              <div>
                <span className="blog-tag">{post.tag}</span>
              </div>
              <h3 className="blog-title">{post.title}</h3>
              <div className="blog-meta">
                <span>📅 Mar 2026</span>
                <span>⏱ {post.readTime}</span>
              </div>
              <div className="blog-read-more" onClick={() => { setSelectedPost(post); window.scrollTo(0, 0); }}>Read More →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomeFeaturesSection = () => {
  const [active, setActive] = React.useState('generator');
  
  const features = [
    { id: 'generator', icon: <PenTool size={20}/>, title: 'AI Blog Generator', desc: 'Generate 2,500+ word SEO-optimized articles in one click with real-time NLP suggestions.' },
    { id: 'cluster', icon: <Network size={20}/>, title: 'Cluster Map Planner', desc: 'Visually map out your pillar pages and topic clusters to build topical authority.' },
    { id: 'serp', icon: <Search size={20}/>, title: 'SERP Gap Scanner', desc: 'Analyze the top 10 search results to instantly find missing topics and keyword gaps.' },
    { id: 'seo', icon: <LineChart size={20}/>, title: 'Live SEO Scorer', desc: 'Get a real-time out-of-100 score on readability, keyword density, and snippet targeting.' },
    { id: 'publish', icon: <UploadCloud size={20}/>, title: 'Auto-Publisher', desc: 'Connect directly to WordPress, Webflow, or Shopify to automate your entire pipeline.' },
    { id: 'voice', icon: <Mic size={20}/>, title: 'Brand Voice Control', desc: 'Train the AI on your exact tone of voice, target audience, and negative keywords.' }
  ];

  const renderMockup = (id) => {
    switch(id) {
      case 'generator':
        return (
          <div style={{display:'flex', gap:'12px', width:'100%', height:'100%', padding:'16px', boxSizing:'border-box', background:'var(--bg-surface)', borderRadius:'0 0 16px 16px'}}>
             <div style={{flex: 1, display:'flex', flexDirection:'column', gap:'12px'}}>
               <div>
                 <div style={{fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px'}}>Target Keyword</div>
                 <div style={{background:'var(--bg-elevated)', padding:'8px 12px', borderRadius:'6px', color:'var(--text-primary)', fontSize:'12px', border:'1px solid rgba(255,255,255,0.05)'}}>SaaS Marketing Strategies</div>
               </div>
               <div>
                 <div style={{fontSize:'11px', color:'var(--text-muted)', marginBottom:'4px'}}>Tone of Voice</div>
                 <div style={{background:'var(--bg-elevated)', padding:'8px 12px', borderRadius:'6px', color:'var(--text-primary)', fontSize:'12px', border:'1px solid rgba(255,255,255,0.05)'}}>Authoritative & Actionable</div>
               </div>
               <button onClick={() => window.showDashboard && window.showDashboard()} style={{marginTop:'auto', background:'linear-gradient(135deg, #7C3AED, #5B21B6)', color:'var(--text-primary)', border:'none', padding:'10px', borderRadius:'6px', fontSize:'12px', cursor:'pointer', fontWeight:'bold'}}>Generate Blog →</button>
             </div>
             <div style={{flex: 1.5, background:'var(--bg-base)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'8px', padding:'12px', position:'relative', overflow:'hidden'}}>
               <div style={{width:'70%', height:'14px', background:'var(--border-strong)', borderRadius:'4px', marginBottom:'12px'}}></div>
               <div style={{width:'100%', height:'8px', background:'var(--bg-elevated)', borderRadius:'4px', marginBottom:'8px'}}></div>
               <div style={{width:'90%', height:'8px', background:'var(--bg-elevated)', borderRadius:'4px', marginBottom:'8px'}}></div>
               <div style={{width:'95%', height:'8px', background:'var(--bg-elevated)', borderRadius:'4px', marginBottom:'16px'}}></div>
               <div style={{position:'absolute', bottom:0, left:0, right:0, height:'40px', background:'linear-gradient(to top, var(--bg-base), transparent)'}}></div>
               <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', background:'rgba(16,185,129,0.2)', color:'#10B981', padding:'4px 12px', borderRadius:'12px', fontSize:'10px', fontWeight:'bold', border:'1px solid rgba(16,185,129,0.3)'}}>Processing AI Generation...</div>
             </div>
          </div>
        );
      case 'cluster':
        return (
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%', background:'var(--bg-surface)', position:'relative', borderRadius:'0 0 16px 16px', flex:1}}>
             <div style={{position:'absolute', width:'100px', height:'2px', background:'var(--border-strong)', zIndex:1}}></div>
             <div style={{position:'absolute', width:'2px', height:'80px', background:'var(--border-strong)', zIndex:1, left:'65%'}}></div>
             <div style={{zIndex:2, background:'#5B21B6', padding:'10px 16px', borderRadius:'8px', color:'var(--text-primary)', fontSize:'12px', fontWeight:'bold', marginRight:'120px', boxShadow:'0 0 15px rgba(124,58,237,0.4)'}}>Pillar: SEO Strategy</div>
             <div style={{display:'flex', flexDirection:'column', gap:'16px', zIndex:2}}>
                <div style={{background:'var(--bg-elevated)', border:'1px solid #334155', padding:'8px 12px', borderRadius:'6px', color:'var(--text-secondary)', fontSize:'11px'}}>Technical SEO Tips</div>
                <div style={{background:'var(--bg-elevated)', border:'1px solid #334155', padding:'8px 12px', borderRadius:'6px', color:'var(--text-secondary)', fontSize:'11px'}}>Backlink Outreach</div>
             </div>
          </div>
        );
      case 'serp':
        return (
          <div style={{width:'100%', height:'100%', background:'var(--bg-surface)', padding:'16px', boxSizing:'border-box', borderRadius:'0 0 16px 16px', flex:1}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:'8px', color:'var(--text-muted)', fontSize:'10px', borderBottom:'1px solid #334155', paddingBottom:'8px', marginBottom:'8px'}}>
               <div>COMPETITOR</div><div>IDENTIFIED GAP</div><div>OPPORTUNITY</div>
            </div>
            {[
              {domain:'hubspot.com', gap:'Programmatic SEO execution', opp:'High'},
              {domain:'ahrefs.com', gap:'AI content safeguards', opp:'Medium'},
            ].map(row => (
              <div key={row.domain} style={{display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:'8px', color:'var(--text-primary)', fontSize:'11px', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                 <div style={{color:'#A78BFA'}}>{row.domain}</div>
                 <div>{row.gap}</div>
                 <div><span style={{background:'rgba(16,185,129,0.1)', color:'#10B981', padding:'2px 6px', borderRadius:'4px'}}>{row.opp}</span></div>
              </div>
            ))}
            <button onClick={() => window.showDashboard && window.showDashboard()} style={{width:'100%', marginTop:'12px', background:'var(--bg-elevated)', border:'1px dashed #334155', padding:'8px', color:'#A78BFA', fontSize:'11px', borderRadius:'6px', cursor:'pointer'}}>Scan New Seed Keyword</button>
          </div>
        );
      case 'seo':
        return (
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'32px', width:'100%', height:'100%', background:'var(--bg-surface)', padding:'20px', boxSizing:'border-box', borderRadius:'0 0 16px 16px', flex:1}}>
             <div style={{position:'relative', width:'100px', height:'100px', borderRadius:'50%', background:'conic-gradient(#10B981 92%, var(--bg-elevated) 0)', display:'flex', alignItems:'center', justifyContent:'center'}}>
               <div style={{position:'absolute', inset:'8px', background:'var(--bg-surface)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
                 <span style={{fontSize:'24px', fontWeight:'bold', color:'var(--text-primary)'}}>92</span>
                 <span style={{fontSize:'9px', color:'var(--text-muted)'}}>SCORE</span>
               </div>
             </div>
             <div style={{display:'flex', flexDirection:'column', gap:'12px', flex:1}}>
               <div>
                 <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'var(--text-muted)', marginBottom:'4px'}}><span>Readability</span><span>Great</span></div>
                 <div style={{height:'6px', background:'var(--bg-elevated)', borderRadius:'3px'}}><div style={{width:'85%', height:'100%', background:'#10B981', borderRadius:'3px'}}></div></div>
               </div>
               <div>
                 <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'var(--text-muted)', marginBottom:'4px'}}><span>Keyword Density</span><span>1.2%</span></div>
                 <div style={{height:'6px', background:'var(--bg-elevated)', borderRadius:'3px'}}><div style={{width:'100%', height:'100%', background:'#10B981', borderRadius:'3px'}}></div></div>
               </div>
               <div>
                 <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'var(--text-muted)', marginBottom:'4px'}}><span>Target Snippets</span><span>Missing</span></div>
                 <div style={{height:'6px', background:'var(--bg-elevated)', borderRadius:'3px'}}><div style={{width:'40%', height:'100%', background:'#F59E0B', borderRadius:'3px'}}></div></div>
               </div>
             </div>
          </div>
        );
      case 'publish':
        return (
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', width:'100%', height:'100%', background:'var(--bg-surface)', borderRadius:'0 0 16px 16px', flex:1}}>
             <div style={{width:'50px', height:'50px', background:'#5B21B6', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-primary)'}}><Sparkles size={24}/></div>
             <div style={{display:'flex', gap:'4px'}}>
               <div style={{width:'6px', height:'6px', background:'var(--border-strong)', borderRadius:'50%'}}></div>
               <div style={{width:'6px', height:'6px', background:'var(--border-strong)', borderRadius:'50%'}}></div>
               <div style={{width:'6px', height:'6px', background:'var(--border-strong)', borderRadius:'50%'}}></div>
             </div>
             <div style={{background:'var(--bg-elevated)', border:'1px solid rgba(16,185,129,0.3)', width:'60px', height:'60px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', position:'relative'}}>
                <span style={{fontWeight:800, fontSize:'13px', color:'var(--color-primary-400)'}}>WP</span>
                <div style={{position:'absolute', top:'-6px', right:'-6px', background:'#10B981', color:'var(--text-primary)', fontSize:'8px', padding:'2px 4px', borderRadius:'4px', fontWeight:'bold'}}>Synced</div>
             </div>
          </div>
        );
      case 'voice':
        return (
          <div style={{display:'flex', flexDirection:'column', gap:'12px', width:'100%', height:'100%', background:'var(--bg-surface)', padding:'20px', boxSizing:'border-box', borderRadius:'0 0 16px 16px', flex:1}}>
            <textarea readOnly style={{width:'100%', flex:1, background:'var(--bg-base)', border:'1px solid #334155', borderRadius:'8px', color:'#A78BFA', padding:'12px', fontSize:'11px', resize:'none', outline:'none', fontFamily:'monospace'}} value="CORE_DIRECTIVE: Always maintain a professional yet engaging tone. Avoid jargon where possible. Refer to the reader as 'you'." />
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:'11px', color:'var(--text-muted)'}}>Creativity Temperature: <span style={{color:'var(--text-primary)'}}>1.0</span></div>
              <div style={{background:'rgba(124,58,237,0.1)', color:'#A78BFA', padding:'4px 8px', borderRadius:'4px', fontSize:'10px', border:'1px solid rgba(124,58,237,0.3)'}}>Active Profile</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container" style={{padding: '8rem 0'}}>
      <div style={{textAlign: 'center', marginBottom: '4rem'}}>
        <h2 style={{fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem'}}>Everything you need to <span className="title-accent-violet">dominate search.</span></h2>
        <p style={{color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto'}}>Navigate through all our core modules natively right here.</p>
      </div>
      
      <div style={{display: 'flex', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', gap: '2rem', background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem'}}>
        {/* Sidebar Toolbar */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px', borderRight: window.innerWidth <= 768 ? 'none' : '1px solid rgba(255,255,255,0.05)', borderBottom: window.innerWidth <= 768 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingRight: window.innerWidth <= 768 ? '0' : '2rem', paddingBottom: window.innerWidth <= 768 ? '2rem' : '0', minWidth: '280px'}}>
          {features.map(f => (
            <button key={f.id} onClick={() => setActive(f.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px',
              background: active === f.id ? 'rgba(124,58,237,0.1)' : 'transparent',
              border: active === f.id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
              color: active === f.id ? 'var(--text-primary)' : 'var(--text-muted)',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%'
            }}>
              <div style={{color: active === f.id ? '#A78BFA' : 'var(--text-subtle)', display: 'flex'}}>{f.icon}</div>
              <span style={{fontWeight: 600, fontSize: '15px'}}>{f.title}</span>   
            </button>
          ))}
        </div>
        
        {/* Right Panel Display */}
        <div style={{flex: 1, padding: window.innerWidth <= 768 ? '0' : '1rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '350px'}}>
           {features.map(f => (
             <div key={f.id} style={{display: active === f.id ? 'flex' : 'none', animation: 'fadeIn 0.4s ease forwards', height: '100%', flexDirection: 'column'}}>
               <h3 style={{fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '1rem'}}>{f.title}</h3>
               <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem'}}>{f.desc}</p>
               
               <div style={{background: 'var(--bg-elevated)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minHeight: '260px'}}>
                  <div style={{height: '40px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '6px', width: '100%', boxSizing: 'border-box'}}>
                    <div style={{width: 10, height: 10, borderRadius: '50%', background: '#EF4444'}}></div>
                    <div style={{width: 10, height: 10, borderRadius: '50%', background: '#F59E0B'}}></div>
                    <div style={{width: 10, height: 10, borderRadius: '50%', background: '#10B981'}}></div>
                    <div style={{marginLeft: 'auto', fontSize: '10px', color: 'var(--text-subtle)', fontFamily: 'monospace'}}>BlogzzUP.ai/dash/{f.id}</div>
                  </div>
                  {renderMockup(f.id)}
               </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

function App() {
  const { currentUser, signInWithGoogle, signIn, signUp, logOut, resendVerification, resetPassword } = useAuth();

  // Redirect to dashboard automatically if already logged in
  useEffect(() => {
    if (currentUser) {
      const ms = document.getElementById('marketing-site');
      const da = document.getElementById('dashboard-app');
      if (ms) ms.style.display = 'none';
      if (da) da.style.display = 'flex';
      window.updateUserInDashboard && window.updateUserInDashboard(currentUser);
      if (window.showDashboardSection) window.showDashboardSection('overview');
    }
  }, [currentUser]);

  // Navigation Utilities
  useEffect(() => {
    window.updateUserInDashboard = function(user) {
      if (!user) return;
      const firstName = (user.displayName || 'User').split(' ')[0];
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const greetingEl = document.querySelector('.dashboard-greeting');
      if (greetingEl) greetingEl.textContent = greeting + ', ' + firstName + ' 👋';
      const avatarEl = document.querySelector('.user-avatar');
      if (avatarEl && user.photoURL) {
        avatarEl.src = user.photoURL;
        avatarEl.style.display = 'block';
        const fallback = document.querySelector('.user-avatar-fallback');
        if (fallback) fallback.style.display = 'none';
      }
      const nameEl = document.querySelector('.user-name');
      if (nameEl) nameEl.textContent = firstName + "'s Workspace";
    };

    // Redirect to auth page — real login happens in the auth form
    window.showDashboard = function() {
      if (window.showPage) window.showPage('auth');
    };

    window.showMarketingSite = function() {
      const da = document.getElementById('dashboard-app');
      if (da) da.style.display = 'none';
      const ms = document.getElementById('marketing-site');
      if (ms) ms.style.display = 'block';
      if (window.showPage) window.showPage('home');
      window.scrollTo(0, 0);
    };
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(false);
  const [view, setView] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'reset'
  const [authLoading, setAuthLoading] = useState(false);
  const [authMsg, setAuthMsg] = useState({ type: '', text: '' });
  const [showResend, setShowResend] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      setShowTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (view !== 'landing' || window.innerWidth <= 768) return;
    const items = document.querySelectorAll('.fade-section');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    items.forEach(item => observer.observe(item));
    return () => observer.disconnect();
  }, [view]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pills = [
    { icon: <LineChart size={16} />, text: "SEO Scorer" },
    { icon: <Search size={16} />, text: "SERP Gap Finder" },
    { icon: <UploadCloud size={16} />, text: "Auto Publisher" },
    { icon: <PenTool size={16} />, text: "Brand Voice AI" },
    { icon: <Globe size={16} />, text: "Search-first" },
    { icon: <Network size={16} />, text: "Cluster Map" },
  ];

  const avatars = [
    "https://i.pravatar.cc/100?img=11",
    "https://i.pravatar.cc/100?img=12",
    "https://i.pravatar.cc/100?img=33",
    "https://i.pravatar.cc/100?img=44",
    "https://i.pravatar.cc/100?img=45",
  ];

  const stats = [
    { value: 92, suffix: "%", label: "Time Saved Per Blog", desc: "vs 6-8 hours manually", icon: <Clock size={24} /> },
    { value: 4, suffix: "x", label: "Better Organic ROI", desc: "vs traditional methods", icon: <TrendingUp size={24} /> },
    { value: 15, suffix: "x", label: "Publishing Speed", desc: "vs manual workflows", icon: <Zap size={24} /> },
    { value: 80, suffix: "%", label: "Cost Reduction", desc: "vs agencies & freelancers", icon: <DollarSign size={24} /> },
    { value: 24, suffix: "/7", label: "Autonomous Publishing", desc: "zero human effort", icon: <Cpu size={24} /> },
    { value: 98, suffix: "%", label: "Human-Score Rating", desc: "passes all AI detection", icon: <UserCheck size={24} /> },
  ];

  const logos = [
    "wordpress", "webflow", "shopify", "ghost", "strapi", "sanity", "medium", "linkedin"
  ];

  const integrationsList = [
    { name: "WordPress", subtitle: "REST API + Application Password", icon: "wordpress" },
    { name: "Webflow", subtitle: "CMS API", icon: "webflow" },
    { name: "Shopify", subtitle: "Admin API + Blog Posts", icon: "shopify" },
    { name: "Ghost", subtitle: "Content API", icon: "ghost" },
    { name: "Strapi", subtitle: "REST / GraphQL", icon: "strapi" },
    { name: "Sanity", subtitle: "Content API", icon: "sanity" },
    { name: "Medium", subtitle: "Publication API", icon: "medium" },
    { name: "LinkedIn", subtitle: "Article Publishing", icon: "linkedin" },
    { name: "Notion", subtitle: "Database sync", icon: "notion" },
  ];

  useEffect(() => {
    window.showPage = function(name) {
      document.querySelectorAll('.page-section').forEach(s => {
        s.style.display = 'none';
        s.style.opacity = '0';
      });
      const target = document.getElementById('page-' + name);
      if (target) {
        target.style.display = 'block';
        setTimeout(() => { target.style.opacity = '1'; }, 10);
        target.style.transition = 'opacity 0.3s ease';
      }
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelectorAll('[data-nav="' + name + '"]').forEach(activeLink => {
        activeLink.classList.add('active');
      });
      window.location.hash = name;
      window.scrollTo(0, 0);
      if (name === 'demo') {
        setTimeout(window.initDemoChat, 100);
      }
    };

    const hash = window.location.hash.replace('#', '') || 'home';
    if (['home', 'howitworks', 'features', 'demo', 'pricing', 'blog', 'auth'].includes(hash)) {
      setTimeout(() => window.showPage(hash), 100);
    } else {
      setTimeout(() => window.showPage('home'), 100);
    }
  }, []);

  

  if (view === 'architecture') {
    return <PromptArchitecture onBack={() => { setView('landing'); window.scrollTo(0, 0); }} />;
  }

  return (
    <>
      {/* Skip navigation — keyboard / screen-reader accessibility */}
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Hidden live region for screen-reader announcements */}
      <div id="sr-live-region" aria-live="polite" aria-atomic="true" />
      <div id="marketing-site" style={{ display: 'block' }}>
      <div className="bg-grid" role="presentation" aria-hidden="true"></div>
      <div className="bg-glow" role="presentation" aria-hidden="true"></div>

      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="container">
          <a href="#" className="logo" aria-label="BlogzzUP — home">
            <Sparkles className="logo-icon" size={24} aria-hidden="true" />
            BlogzzUP
          </a>
          
          <ul className="nav-links" role="list" aria-label="Site pages">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); window.showPage('home'); }} data-nav="home" className="nav-link active" aria-current="page">Home</a></li>
            <li><a href="#howitworks" onClick={(e) => { e.preventDefault(); window.showPage('howitworks'); }} data-nav="howitworks" className="nav-link">How it Works</a></li>
            <li><a href="#features" onClick={(e) => { e.preventDefault(); window.showPage('features'); }} data-nav="features" className="nav-link">Features</a></li>
            <li><a href="#demo" onClick={(e) => { e.preventDefault(); window.showPage('demo'); }} data-nav="demo" className="nav-link">Demo</a></li>
            <li><a href="#pricing" onClick={(e) => { e.preventDefault(); window.showPage('pricing'); }} data-nav="pricing" className="nav-link">Pricing</a></li>
            <li><a href="#blog" onClick={(e) => { e.preventDefault(); window.showPage('blog'); }} data-nav="blog" className="nav-link">Blog</a></li>
          </ul>

          <div className="nav-actions" role="group" aria-label="Account actions" style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            <button 
              id="theme-toggle" 
              onClick={() => window.toggleTheme && window.toggleTheme()} 
              title="Toggle light/dark mode"
              style={{
                background: 'var(--border-default)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '999px',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '17px',
                transition: 'background 0.2s, border-color 0.2s',
                flexShrink: 0
              }}
              onMouseOver={(e) => { e.currentTarget.style.background='rgba(124,58,237,0.15)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.4)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background='var(--border-default)'; e.currentTarget.style.borderColor='var(--border-strong)'; }}
            >
              🌙
            </button>
            <button className="btn btn-ghost" onClick={() => window.showPage('auth')}>Sign In</button>
            <button className="btn btn-primary" onClick={() => window.showPage('auth')} aria-label="Start free for 30 days">Start Free</button>
          </div>

          <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(true)} aria-label="Open navigation menu" aria-expanded={mobileMenuOpen} aria-controls="mobile-drawer">
            <Menu size={24} color="#fff" aria-hidden="true" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div
        id="mobile-drawer"
        className={`mobile-drawer ${mobileMenuOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        aria-hidden={!mobileMenuOpen}
      >
        <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation menu">
          <X size={24} color="#fff" aria-hidden="true" />
        </button>
        <ul className="mobile-nav-links">
          <li><a href="#home" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); window.showPage('home'); }} data-nav="home" className="nav-link active">Home</a></li>
          <li><a href="#howitworks" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); window.showPage('howitworks'); }} data-nav="howitworks" className="nav-link">How it Works</a></li>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); window.showPage('features'); }} data-nav="features" className="nav-link">Features</a></li>
          <li><a href="#demo" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); window.showPage('demo'); }} data-nav="demo" className="nav-link">Demo</a></li>
          <li><a href="#pricing" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); window.showPage('pricing'); }} data-nav="pricing" className="nav-link">Pricing</a></li>
          <li><a href="#blog" onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); window.showPage('blog'); }} data-nav="blog" className="nav-link">Blog</a></li>
        </ul>
        <div className="mobile-nav-actions">
          <button onClick={() => { window.showPage('auth'); setMobileMenuOpen(false); }} className="btn btn-outline-white w-full">Sign In</button>
          <button onClick={() => { window.showPage('auth'); setMobileMenuOpen(false); }} className="btn btn-primary w-full mt-4">Start Free</button>
        </div>
      </div>

      

      

      

      

      

      

      

      

      

      
            <div className="page-section" id="page-home" style={{ display: 'none' }}>
        <main className="hero fade-section" id="main-content" style={{ position: 'relative' }} tabIndex={-1}>
          <div className="hero-glow-orb"></div>
          <div className="container hero-content">


            
            <h1 className="hero-title stagger-in-item">
              Publish <span className="title-accent-violet">10x Output</span><br />
              With Zero Writing.
            </h1>
            
            <p className="subheading stagger-in-item">
              Stop fighting writer's block. BlogzzUP researches, writes, optimizes, and automatically publishes high-ranking SEO content directly to your WordPress, Webflow, or custom CMS.
            </p>

            <div className="hero-actions stagger-in-item">
              <button className="btn btn-primary btn-lg" onClick={() => window.showDashboard()}>Start Free Trial →</button>
              <button 
                onClick={() => window.showPage('demo')} 
                style={{background:'transparent', border:'1px solid rgba(255,255,255,0.2)', color:'var(--text-primary)', padding:'14px 28px', borderRadius:'999px', fontSize:'16px', fontWeight:500, cursor:'pointer', display:'flex', alignItems:'center', gap:'10px', transition:'all 0.2s'}}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor='#7C3AED'; e.currentTarget.style.color='#A78BFA'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'; e.currentTarget.style.color='var(--text-primary)'; }}
              >
                <span style={{fontSize:'18px'}}>▷</span> Watch Demo
              </button>
            </div>

            <div className="feature-pill-grid stagger-in">
              <div className="fp-card glass-card" onClick={(e) => { e.preventDefault(); window.showPage('howitworks'); }}>
                <div className="fp-card-header"><span style={{fontSize: '20px'}}>🧠</span><span className="fp-title">AI Prompt Engine</span></div>
                <div className="fp-desc">7-stage pipeline from keyword to publish</div>
                <span className="fp-arrow">→</span>
              </div>
              <div className="fp-card glass-card" onClick={(e) => { e.preventDefault(); window.showPage('features'); }}>
                <div className="fp-card-header"><span style={{fontSize: '20px'}}>🔍</span><span className="fp-title">SERP Gap Scanner</span></div>
                <div className="fp-desc">Find keywords competitors miss</div>
                <span className="fp-arrow">→</span>
              </div>
              <div className="fp-card glass-card" onClick={(e) => { e.preventDefault(); window.showPage('demo'); }}>
                <div className="fp-card-header"><span style={{fontSize: '20px'}}>📊</span><span className="fp-title">Live SEO Scorer</span></div>
                <div className="fp-desc">Real-time 10-metric scoring</div>
                <span className="fp-arrow">→</span>
              </div>
              <div className="fp-card glass-card" onClick={(e) => { e.preventDefault(); window.showPage('features'); }}>
                <div className="fp-card-header"><span style={{fontSize: '20px'}}>🗺️</span><span className="fp-title">Content Cluster Map</span></div>
                <div className="fp-desc">Visual topic universe builder</div>
                <span className="fp-arrow">→</span>
              </div>
              <div className="fp-card glass-card" onClick={(e) => { e.preventDefault(); window.showPage('features'); }}>
                <div className="fp-card-header"><span style={{fontSize: '20px'}}>🌍</span><span className="fp-title">SEO optimization</span></div>
                <div className="fp-desc">Search-first blog optimization for visibility</div>
                <span className="fp-arrow">→</span>
              </div>
              <div className="fp-card glass-card" onClick={(e) => { e.preventDefault(); window.showPage('features'); }}>
                <div className="fp-card-header"><span style={{fontSize: '20px'}}>🔁</span><span className="fp-title">Social Repurpose</span></div>
                <div className="fp-desc">One blog → 10 content pieces</div>
                <span className="fp-arrow">→</span>
              </div>
            </div>

            <div className="home-stats-strip">
              <div className="home-stats-flex">
                <div className="home-stat-item">
                  <div className="home-stat-num">92%</div>
                  <div className="home-stat-label">Time Saved</div>
                </div>
                <div className="home-stat-divider"></div>
                <div className="home-stat-item">
                  <div className="home-stat-num">4x</div>
                  <div className="home-stat-label">Better ROI</div>
                </div>
                <div className="home-stat-divider"></div>
                <div className="home-stat-item">
                  <div className="home-stat-num">15x</div>
                  <div className="home-stat-label">Faster Publishing</div>
                </div>
                <div className="home-stat-divider"></div>
                <div className="home-stat-item">
                  <div className="home-stat-num">500+</div>
                  <div className="home-stat-label">Startups</div>
                </div>
              </div>
            </div>

            <div className="home-marquee-section">
              <div className="home-marquee-title">Publishes everywhere you already are</div>
              <div className="home-marquee-container-wrapper" style={{overflow: 'hidden'}}>
                <div className="home-marquee-container">
                  <div style={{display: 'flex', gap: '16px'}}>
                    <div className="home-marquee-pill">WordPress</div>
                    <div className="home-marquee-pill">Webflow</div>
                    <div className="home-marquee-pill">Shopify</div>
                    <div className="home-marquee-pill">Ghost</div>
                    <div className="home-marquee-pill">Strapi</div>
                    <div className="home-marquee-pill">Sanity</div>
                    <div className="home-marquee-pill">Medium</div>
                    <div className="home-marquee-pill">LinkedIn</div>
                    <div className="home-marquee-pill">Notion</div>
                  </div>
                  <div style={{display: 'flex', gap: '16px'}}>
                    <div className="home-marquee-pill">WordPress</div>
                    <div className="home-marquee-pill">Webflow</div>
                    <div className="home-marquee-pill">Shopify</div>
                    <div className="home-marquee-pill">Ghost</div>
                    <div className="home-marquee-pill">Strapi</div>
                    <div className="home-marquee-pill">Sanity</div>
                    <div className="home-marquee-pill">Medium</div>
                    <div className="home-marquee-pill">LinkedIn</div>
                    <div className="home-marquee-pill">Notion</div>
                  </div>
                </div>
              </div>
            </div>

            <HomeFeaturesSection />

          </div>
        </main>
      </div>

      <div className="page-section" id="page-howitworks" style={{ display: 'none' }}>
        <div className="container" style={{paddingTop: '8rem'}}>
          <div className="hiw-header">
            <h1 className="hiw-title">How BlogzzUP Works</h1>
            <p className="hiw-subtitle">From keyword to ranked blog post in under 10 minutes</p>
          </div>
          
          <div style={{margin: '3rem auto 5rem', maxWidth: '1000px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', padding: '0 20px', boxSizing: 'border-box'}}>
             {/* Connector glow line */}
             <div style={{position: 'absolute', top: '50%', left: '12%', right: '12%', height: '2px', background: 'linear-gradient(90deg, rgba(124,58,237,0) 0%, rgba(124,58,237,0.5) 50%, rgba(6,182,212,0) 100%)', zIndex: 0}}></div>
             {/* Animated particles */}
             <div style={{position: 'absolute', top: 'calc(50% - 4px)', left: '20%', width: '8px', height: '8px', background: '#A78BFA', borderRadius: '50%', boxShadow: '0 0 10px #A78BFA', animation: 'moveRightParticle 3s linear infinite', zIndex: 1}}></div>
             <div style={{position: 'absolute', top: 'calc(50% - 4px)', left: '20%', width: '8px', height: '8px', background: '#06B6D4', borderRadius: '50%', boxShadow: '0 0 10px #06B6D4', animation: 'moveRightParticle 3s linear infinite 1.5s', zIndex: 1}}></div>
             {/* Node 1 – Discovery */}
             <div className="glass-card" style={{padding: '24px', textAlign: 'center', width: '220px', flexShrink: 0, zIndex: 2}}>
               <div style={{background: 'rgba(255,255,255,0.05)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-muted)'}}><Search size={32}/></div>
               <h3 style={{color: 'var(--text-primary)', fontSize: '18px', margin: '0 0 8px', fontWeight: 700}}>1. Discovery</h3>
               <p style={{color: 'var(--text-subtle)', fontSize: '13px', margin: 0, lineHeight: 1.5}}>Keyword & SERP analysis automatically extracts missing competitor topics.</p>
             </div>
             {/* Node 2 – AI Engine (centre, glowing) */}
             <div style={{background: 'var(--bg-elevated)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '24px', padding: '32px', textAlign: 'center', width: '240px', flexShrink: 0, zIndex: 2, boxShadow: '0 0 40px rgba(124,58,237,0.25)', position: 'relative'}}>
               <div style={{position: 'absolute', inset: 0, borderRadius: '24px', boxShadow: '0 0 0 0 rgba(124,58,237,0.4)', animation: 'pulseBorderGlow 2s infinite', pointerEvents: 'none'}}></div>
               <div style={{background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--text-primary)', boxShadow: '0 10px 20px rgba(124,58,237,0.4)'}}><Brain size={40}/></div>
               <h3 style={{color: 'var(--text-primary)', fontSize: '22px', margin: '0 0 6px', fontWeight: 800}}>AI Engine</h3>
               <p style={{color: '#A78BFA', fontSize: '13px', margin: 0}}>Generates, scores & optimises NLP content in real time.</p>
             </div>
             {/* Node 3 – Publishing */}
             <div className="glass-card" style={{padding: '24px', textAlign: 'center', width: '220px', flexShrink: 0, zIndex: 2}}>
               <div style={{background: 'rgba(6,182,212,0.1)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#06B6D4'}}><Globe2 size={32}/></div>
               <h3 style={{color: 'var(--text-primary)', fontSize: '18px', margin: '0 0 8px', fontWeight: 700}}>3. Publishing</h3>
               <p style={{color: 'var(--text-subtle)', fontSize: '13px', margin: 0, lineHeight: 1.5}}>One-click sync to major CMS platforms like WordPress or Ghost.</p>
             </div>
             <style dangerouslySetInnerHTML={{__html: `
               @keyframes moveRightParticle {
                 0%   { left: 20%; opacity: 0; transform: scale(0.5); }
                 10%  { opacity: 1; transform: scale(1); }
                 90%  { opacity: 1; transform: scale(1); }
                 100% { left: 80%; opacity: 0; transform: scale(0.5); }
               }
               @keyframes pulseBorderGlow {
                 0%   { box-shadow: 0 0 0 0 rgba(124,58,237,0.5); }
                 70%  { box-shadow: 0 0 0 16px rgba(124,58,237,0); }
                 100% { box-shadow: 0 0 0 0 rgba(124,58,237,0); }
               }
             `}} />
          </div>
          
        <section className="works-section fade-section" id="works">
        <div className="container">
          

          <div className="timeline-grid">
            <div className="timeline-line-animated"></div>
            
            <div className="step-card">
              <div className="step-header">
                <div className="step-icon-wrapper cyan">
                  <LinkIcon size={32} />
                </div>
                <h3 className="step-title">1. Connect Your Brand</h3>
                <p className="step-desc">
                  Connect your CMS (WordPress, Webflow, Shopify, etc.) and paste your website URL. BlogzzUP reads your brand, niche, and competitor landscape in 60 seconds.
                </p>
              </div>
              
              <div className="demo-visual-card">
                <div className="cms-connection-demo">
                  <div className="cms-icons">
                    <div className="cms-icon" style={{fontWeight: 700, fontSize: '11px', color: 'var(--color-primary-400)'}}>WP</div>
                    <div className="cms-icon" style={{fontWeight: 700, fontSize: '11px', color: 'var(--color-secondary-500)'}}>WF</div>
                    <div className="cms-icon" style={{fontWeight: 700, fontSize: '11px', color: '#10B981'}}>SH</div>
                  </div>
                  <div className="connection-path">
                    <div className="data-packet"></div>
                  </div>
                  <div className="BlogzzUP-node">
                    <Sparkles size={24} className="logo-icon block" />
                  </div>
                </div>
              </div>
            </div>

            <div className="step-card">
              <div className="step-header">
                <div className="step-icon-wrapper violet">
                  <Sparkles size={32} />
                </div>
                <h3 className="step-title">2. AI Does Everything</h3>
                <p className="step-desc">
                  Our 7-stage prompt engine researches keywords, finds SERP gaps, writes a full SEO blog, scores it live, adds AI images, and optimizes for snippets — automatically.
                </p>
              </div>
              
              <div className="demo-visual-card">
                <div className="pipeline-demo">
                  <div className="pipeline-item">Analyzing SEO Gap...</div>
                  <div className="pipeline-item">Drafting Outline & Structure...</div>
                  <div className="pipeline-item">Optimizing NLP Entities...</div>
                  <div className="pipeline-item">Ready to Publish!</div>
                </div>
              </div>
            </div>

            <div className="step-card">
              <div className="step-header">
                <div className="step-icon-wrapper amber">
                  <Rocket size={32} />
                </div>
                <h3 className="step-title">3. Blogs Go Live, Traffic Grows</h3>
                <p className="step-desc">
                  Blogs auto-publish to your site on your schedule. You get daily fresh content, compounding organic traffic, and full analytics — without touching a keyboard.
                </p>
              </div>
              
              <div className="demo-visual-card">
                <div className="graph-demo">
                  <svg className="growth-line" viewBox="0 0 100 50">
                    <path className="growth-path" d="M0,45 Q20,40 40,25 T70,15 T100,5" fill="none" stroke="url(#gradient)" strokeWidth="3" />
                    <circle cx="20" cy="37" r="2.5" fill="#F59E0B" className="pulse-dot delay-1"/>
                    <circle cx="55" cy="20" r="2.5" fill="#F59E0B" className="pulse-dot delay-2"/>
                    <circle cx="85" cy="10" r="2.5" fill="#F59E0B" className="pulse-dot delay-3"/>
                    <defs>
                      <linearGradient id="gradient">
                         <stop offset="0%" stopColor="#7C3AED" />
                         <stop offset="100%" stopColor="#F59E0B" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
          <HowItWorksAccordion />
        </div>
      </div>

      <div className="page-section" id="page-features" style={{ display: 'none' }}>
        <FeaturesPage />
      </div>

      <div className="page-section" id="page-demo" style={{ display: 'none' }}>
        <DemoPage />
      </div>

      <div className="page-section" id="page-pricing" style={{ display: 'none' }}>
        <PricingPage onSignIn={() => window.showPage('auth')} />
      </div>

      <div className="page-section" id="page-blog" style={{ display: 'none' }}>
        <BlogPage />
      </div>

      <div className="page-section" id="page-auth" style={{ display: 'none' }}>
        <div className="auth-layout container">
          <div className="auth-hero stagger-in">
            <div className="glass-card auth-hero-content stagger-in-item">
              <h2 className="auth-welcome-title">India's largest brands trust BlogzzUP</h2>
              <p className="auth-welcome-desc">Join 500+ startups saving 92% of their content creation time.</p>
              <div className="auth-quotes stagger-in-item">
                <div className="auth-quote">
                  "BlogzzUP replaced our entire content agency. We're now publishing 4x more for 1/10th the cost."
                  <div className="auth-author">— Founder, Delhi.AI</div>
                </div>
              </div>
              <div className="auth-stats-grid stagger-in-item">
                <div className="auth-stat"><div className="auth-stat-val">94%</div><div className="auth-stat-lab">Avg. SEO Score</div></div>
                <div className="auth-stat"><div className="auth-stat-val">10/10</div><div className="auth-stat-lab">Human Feel</div></div>
              </div>
            </div>
          </div>

          <div className="auth-form-container stagger-in">
            <div className="auth-form-card glass-card stagger-in-item">
              <div className="auth-header">
                <h1 className="auth-title">
                  {authMode === 'login' ? 'Welcome Back' : authMode === 'signup' ? 'Create Account' : 'Reset Password'}
                </h1>
                <p className="auth-subtitle">
                  {authMode === 'login' ? 'Sign in to your BlogzzUP Workspace' : authMode === 'signup' ? 'Get started with BlogzzUP' : 'Enter your email to receive a reset link'}
                </p>
              </div>

              {/* Error / Success Message */}
              {authMsg.text && (
                <div style={{
                  padding: '12px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '14px',
                  background: authMsg.type === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
                  border: `1px solid ${authMsg.type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}`,
                  color: authMsg.type === 'error' ? '#EF4444' : '#10B981',
                }}>
                  {authMsg.text}
                  {showResend && (
                    <button
                      onClick={async () => {
                        try { await resendVerification(email, password); setAuthMsg({ type: 'success', text: 'Verification email resent! Check your inbox.' }); setShowResend(false); }
                        catch(e) { setAuthMsg({ type: 'error', text: 'Could not resend: ' + e.message }); }
                      }}
                      style={{ display: 'block', marginTop: '8px', background: 'transparent', border: '1px solid currentColor', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer', fontSize: '12px', color: 'inherit' }}
                    >Resend verification email</button>
                  )}
                </div>
              )}

              {/* Google Sign-In */}
              <div className="auth-google-btn-wrap">
                <button
                  className="btn btn-outline btn-lg w-full"
                  disabled={authLoading}
                  onClick={async () => {
                    setAuthLoading(true); setAuthMsg({ type: '', text: '' });
                    try {
                      const user = await signInWithGoogle();
                      window.updateUserInDashboard && window.updateUserInDashboard(user);
                      document.getElementById('marketing-site').style.display = 'none';
                      document.getElementById('dashboard-app').style.display = 'flex';
                      if (window.showDashboardSection) window.showDashboardSection('overview');
                      window.scrollTo(0, 0);
                    } catch(e) {
                      if (e.code !== 'auth/popup-closed-by-user') setAuthMsg({ type: 'error', text: e.message });
                    } finally { setAuthLoading(false); }
                  }}
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" width="18" alt="" />
                  {authLoading ? 'Signing in…' : 'Continue with Google'}
                </button>
              </div>

              <div className="auth-divider"><span>or continue with email</span></div>

              <div className="auth-fields">
                {authMode === 'signup' && (
                  <div className="input-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                )}
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                {authMode !== 'reset' && (
                  <div className="input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ margin: 0 }}>Password</label>
                      {authMode === 'login' && (
                        <span 
                          className="auth-link" 
                          style={{ fontSize: '12px', fontWeight: 500 }}
                          onClick={() => { setAuthMode('reset'); setAuthMsg({ type: '', text: '' }); }}
                        >
                          Forgot Password?
                        </span>
                      )}
                    </div>
                    <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('auth-submit-btn').click(); }} />
                  </div>
                )}
              </div>

              <button
                id="auth-submit-btn"
                className="btn btn-primary btn-lg w-full"
                disabled={authLoading}
                onClick={async () => {
                  setAuthLoading(true); setAuthMsg({ type: '', text: '' }); setShowResend(false);
                  try {
                    if (authMode === 'login') {
                      const user = await signIn(email, password);
                      window.updateUserInDashboard && window.updateUserInDashboard(user);
                      document.getElementById('marketing-site').style.display = 'none';
                      document.getElementById('dashboard-app').style.display = 'flex';
                      if (window.showDashboardSection) window.showDashboardSection('overview');
                      window.scrollTo(0, 0);
                    } else if (authMode === 'signup') {
                      if (!name.trim()) { setAuthMsg({ type: 'error', text: 'Please enter your full name.' }); setAuthLoading(false); return; }
                      if (password.length < 6) { setAuthMsg({ type: 'error', text: 'Password must be at least 6 characters.' }); setAuthLoading(false); return; }
                      await signUp(name.trim(), email, password);
                      setAuthMsg({ type: 'success', text: '✅ Account created! We sent a verification email to ' + email + '. Please verify your email then sign in.' });
                      setAuthMode('login'); setPassword('');
                    } else if (authMode === 'reset') {
                      if (!email.trim()) { setAuthMsg({ type: 'error', text: 'Please enter your email address.' }); setAuthLoading(false); return; }
                      await resetPassword(email);
                      setAuthMsg({ type: 'success', text: '✅ Reset link sent! Check your inbox for instructions.' });
                    }
                  } catch(e) {
                    const msg = e.message || '';
                    if (msg.includes('verify your email')) { setShowResend(true); setAuthMsg({ type: 'error', text: msg }); }
                    else if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') setAuthMsg({ type: 'error', text: 'Invalid email or password.' });
                    else if (e.code === 'auth/email-already-in-use') setAuthMsg({ type: 'error', text: 'An account with this email already exists. Sign in instead.' });
                    else if (e.code === 'auth/invalid-email') setAuthMsg({ type: 'error', text: 'Please enter a valid email address.' });
                    else setAuthMsg({ type: 'error', text: msg });
                  } finally { setAuthLoading(false); }
                }}
              >
                {authLoading ? (authMode === 'login' ? 'Signing in…' : authMode === 'signup' ? 'Creating account…' : 'Sending...') : (authMode === 'login' ? 'Sign In' : authMode === 'signup' ? 'Sign Up' : 'Send Reset Link')}
              </button>

              <div className="auth-footer">
                {authMode === 'login' ? (
                  <>Don't have an account? <span className="auth-link" onClick={() => { setAuthMode('signup'); setAuthMsg({ type: '', text: '' }); }}>Sign Up</span></>
                ) : authMode === 'signup' ? (
                  <>Already have an account? <span className="auth-link" onClick={() => { setAuthMode('login'); setAuthMsg({ type: '', text: '' }); }}>Sign In</span></>
                ) : (
                  <span className="auth-link" onClick={() => { setAuthMode('login'); setAuthMsg({ type: '', text: '' }); }}>Back to Sign In</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button className={`scroll-top ${showTop ? 'visible' : ''}`} onClick={scrollToTop} aria-label="Scroll to top of page">
        <ArrowUp size={24} aria-hidden="true" />
      </button>

      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">
                <Sparkles className="logo-icon" size={24} aria-hidden="true" />
                BlogzzUP
              </div>
              <p className="footer-desc">Empowering Indian startups with autonomous, SEO-winning content engines.</p>
            </div>
            
            <div className="footer-links">
              <h4>Platform</h4>
              <ul>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); window.showPage('features'); }}>Features</a></li>
                <li><a href="#pricing" onClick={(e) => { e.preventDefault(); window.showPage('pricing'); }}>Pricing</a></li>
                <li><a href="#howitworks" onClick={(e) => { e.preventDefault(); window.showPage('howitworks'); }}>How it Works</a></li>
              </ul>
            </div>

            <div className="footer-links">
              <h4>Legal</h4>
              <ul>
                <li><a href="#">Privacy Policy</a></li>
                <li><a href="#">Terms of Service</a></li>
                <li><a href="#">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>
              © 2026 BlogzzUP. Built in India 🇮🇳. All rights reserved.
            </span>
            <div className="footer-socials" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <a href="#" className="social-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#000', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '15px', fontWeight: 900, fontFamily: 'sans-serif'}}>𝕏</a>
              <a href="#" className="social-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#0A66C2', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 700, fontFamily: 'sans-serif', lineHeight: 1, flexShrink: 0}}>in</a>
              <a href="#" className="social-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '16px'}}>◎</a>
              <a href="#" className="social-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#24292E', color: 'var(--text-primary)', textDecoration: 'none', fontSize: '18px'}}>⌥</a>
            </div>
          </div>
        </div>
      </footer>

      {showTop && (
        <button className="back-to-top" onClick={scrollToTop}>
          <ArrowUp size={20} color="#fff" />
        </button>
      )}

      {/* Sticky Bottom Bar for Mobile */}
      <div className="mobile-sticky-bottom">
        <button onClick={() => window.showDashboard()} className="btn btn-primary w-full shadow-lg">Start Free <ArrowRight size={16} className="ml-2"/></button>
      </div>

          </div>
      <div id="dashboard-app" style={{ display: 'none', width: '100%', minHeight: '100vh' }}>
        <Dashboard />
      </div>
    </>
  );
}

export default App;
