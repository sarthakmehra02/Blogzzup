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
  ArrowUp
} from 'lucide-react';
import './index.css';

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
      description="Record a 60-second voice note about your topic. BlogForge transcribes it, structures it, and outputs a full SEO-optimized blog post." 
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
          <button className="btn btn-primary" style={{padding: '8px 16px', fontSize: '13px'}}>Generate Blog</button>
        </div>
      }
    />
    <FeatureCard 
      icon="🎯" 
      title="Your Voice. Every Post." 
      description="Paste 3 of your best blogs and BlogForge learns your writing style. Every generated post matches your tone, vocabulary, and structure." 
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
          <div style={{fontSize: '11px', color: '#94A3B8', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center'}}>
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
            <span style={{color: '#94A3B8'}}>2d ago</span>
            <button className="mock-comp-btn">Beat This</button>
          </div>
          <div className="mock-competitor-row">
            <span style={{fontWeight: 'bold'}}>contentai.io</span>
            <span style={{color: '#94A3B8'}}>5d ago</span>
            <button className="mock-comp-btn">Beat This</button>
          </div>
          <div className="mock-competitor-row" style={{border: 'none'}}>
            <span style={{fontWeight: 'bold'}}>rankmaker.in</span>
            <span style={{color: '#94A3B8'}}>1w ago</span>
            <button className="mock-comp-btn">Beat This</button>
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
        <h1 style={{fontSize: '48px', fontWeight: 800, color: '#fff', lineHeight: 1.1}}>
          Every Tool You Need.<br />
          <span style={{background: 'linear-gradient(135deg, #7C3AED, #06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Nothing You Don't.</span>
        </h1>
        <p style={{color: '#94A3B8', marginTop: '12px', fontSize: '18px'}}>Nine specialized AI tools working together as one platform</p>
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
        <h2 style={{textAlign: 'center', fontSize: '28px', color: '#fff', marginBottom: '32px'}}>How We Stack Up</h2>
        <div style={{borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)'}}>
          <table className="comp-table" style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px'}}>
            <thead>
              <tr style={{background: '#141B2D', borderBottom: '1px solid rgba(255,255,255,0.06)'}}>
                <th style={{padding: '16px 20px', color: '#fff'}}>Feature</th>
                <th style={{padding: '16px 20px', color: '#7C3AED', fontWeight: 700}}>BlogForge AI</th>
                <th style={{padding: '16px 20px', color: '#fff'}}>Blogy</th>
                <th style={{padding: '16px 20px', color: '#fff'}}>Jasper</th>
                <th style={{padding: '16px 20px', color: '#fff'}}>Manual</th>
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
                <td>GEO Optimizer</td>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


const DemoPage = () => {
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [typedTitle, setTypedTitle] = React.useState('');
  const [typedMeta, setTypedMeta] = React.useState('');
  const [typedPara, setTypedPara] = React.useState('');

  const fullTitle = "Top 10 AI Tools for Indian Startups in 2026 — Ranked by ROI";
  const fullMeta = "Discover the best AI tools Indian startups are using to cut costs, automate workflows, and grow 10x faster. Ranked by real ROI data from 500+ founders.";
  const fullPara = "India's startup ecosystem is moving fast — and AI tools are the new competitive edge. From automating customer support to generating SEO content at scale, the right AI stack can save an early-stage startup lakhs of rupees every month. In this guide, we've ranked the top 10 AI tools actually being used by Indian founders in 2026, based on ROI data collected from over 500 startups.";

  const handleGenerate = () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setShowResults(true);
    setTypedTitle('');
    setTypedMeta('');
    setTypedPara('');

    let titleIdx = 0;
    let metaIdx = 0;
    let paraIdx = 0;

    const typePara = () => {
      if (paraIdx < fullPara.length) {
        setTypedPara(prev => fullPara.substring(0, paraIdx + 1));
        paraIdx++;
        setTimeout(typePara, 15);
      } else {
        setIsGenerating(false);
      }
    };

    const typeMeta = () => {
      if (metaIdx < fullMeta.length) {
        setTypedMeta(prev => fullMeta.substring(0, metaIdx + 1));
        metaIdx++;
        setTimeout(typeMeta, 15);
      } else {
        setTimeout(typePara, 200);
      }
    };

    const typeTitle = () => {
      if (titleIdx < fullTitle.length) {
        setTypedTitle(prev => fullTitle.substring(0, titleIdx + 1));
        titleIdx++;
        setTimeout(typeTitle, 15);
      } else {
        setTimeout(typeMeta, 200);
      }
    };

    typeTitle();
  };

  return (
    <div className="container" style={{paddingTop: '8rem', paddingBottom: '8rem'}}>
      <div style={{textAlign: 'center', marginBottom: '48px'}}>
        <h1 style={{fontSize: '48px', fontWeight: 800, color: '#fff', margin: 0}}>Try BlogForge AI Live</h1>
        <p style={{color: '#94A3B8', marginTop: '12px', fontSize: '18px'}}>No signup required. See the engine work in real time.</p>
      </div>

      <div style={{maxWidth: '900px', margin: '0 auto', background: '#0D1526', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
        <div style={{width: '100%', display: 'flex', flexWrap: 'wrap'}}>
          <div style={{flex: '1 1 60%', display: 'flex', flexDirection: 'column', minWidth: '300px'}}>
            <div style={{padding: '14px 20px', background: '#080E1C', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px'}}>
              <div style={{display: 'flex', gap: '6px'}}>
                <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#EF4444'}}></div>
                <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B'}}></div>
                <div style={{width: '12px', height: '12px', borderRadius: '50%', background: '#10B981'}}></div>
              </div>
              <div style={{fontSize: '12px', color: '#64748B', marginLeft: '8px'}}>BlogForge AI — Content Engine</div>
            </div>
            
            <div style={{display: 'flex', height: '480px'}}>
              <div style={{width: '160px', background: '#080E1C', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '16px', flexShrink: 0, display: 'flex', flexDirection: 'column'}}>
                <div style={{fontSize: '13px', color: '#fff', fontWeight: 600, marginBottom: '20px'}}>⚡ BlogForge</div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                  <div style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#64748B', cursor: 'pointer'}}>+ New Project</div>
                  <div style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#64748B', cursor: 'pointer'}}>📄 My Documents</div>
                  <div style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#64748B', cursor: 'pointer'}}>🗺️ Cluster Map</div>
                  <div style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#64748B', cursor: 'pointer'}}>📅 Content Calendar</div>
                  <div style={{padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#64748B', cursor: 'pointer'}}>⚙️ Settings</div>
                </div>
                <div style={{marginTop: 'auto'}}>
                  <span style={{background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', marginBottom: '6px', display: 'block'}}>● SEO Optimizer</span>
                  <span style={{background: 'rgba(16,185,129,0.1)', color: '#10B981', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', display: 'block'}}>● Auto Publisher</span>
                </div>
              </div>

              <div style={{flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#0D1526'}}>
                <div style={{alignSelf: 'flex-end', background: '#7C3AED', color: '#fff', padding: '10px 16px', borderRadius: '18px 18px 4px 18px', maxWidth: '75%', fontSize: '13px', lineHeight: 1.5}}>
                  Write an SEO blog about AI tools for Indian startups
                </div>
                <div style={{alignSelf: 'flex-start', background: '#141B2D', color: '#94A3B8', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', maxWidth: '85%', fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-line'}}>
                  Analyzing SERP gap... Found 3 low-competition keywords ✓<br/>
                  Clustering topics... Done ✓<br/>
                  Drafting blog with 94% SEO score... ✓<br/>
                  Generating featured snippet structure... ✓
                </div>
                <div style={{alignSelf: 'flex-end', background: '#7C3AED', color: '#fff', padding: '10px 16px', borderRadius: '18px 18px 4px 18px', maxWidth: '75%', fontSize: '13px', lineHeight: 1.5}}>
                  Optimize for GEO — target Delhi and Bangalore
                </div>
                <div style={{alignSelf: 'flex-start', background: '#141B2D', color: '#94A3B8', padding: '12px 16px', borderRadius: '18px 18px 18px 4px', maxWidth: '85%', fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-line'}}>
                  Adding location-specific entities... ✓<br/>
                  Injecting local search modifiers... ✓<br/>
                  Applying regional schema markup... ✓<br/>
                  Your blog is ready to publish!
                </div>
                
                <div style={{marginTop: 'auto', paddingTop: '12px'}}>
                  <div style={{padding: '12px 16px', background: '#080E1C', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{flex: 1, background: '#141B2D', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 14px', color: '#4B5563', fontSize: '13px'}}>
                      Enter your keyword or topic...
                    </div>
                    <div style={{background: '#7C3AED', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '16px'}}>↑</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div style={{flex: '1 1 40%', background: '#080E1C', borderLeft: '1px solid rgba(124,58,237,0.15)', padding: '28px', display: 'flex', flexDirection: 'column', minWidth: '250px'}}>
            <div style={{fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '20px'}}>Live SEO Score</div>
            
            <div style={{margin: '0 auto 24px', width: '100px', height: '100px', position: 'relative', borderRadius: '50%', background: 'conic-gradient(#7C3AED 0% 94%, #1E293B 94% 100%)'}}>
              <div style={{position: 'absolute', top: '8px', left: '8px', width: '84px', height: '84px', background: '#080E1C', borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                <div style={{fontSize: '28px', fontWeight: 700, color: '#fff', lineHeight: 1}}>94</div>
                <div style={{fontSize: '12px', color: '#64748B'}}>/100</div>
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
                  <span style={{color: '#94A3B8'}}>{metric[0]}</span>
                  <span style={{color: '#10B981', fontWeight: 500}}>{metric[1]}</span>
                </div>
              ))}
            </div>

            <button style={{marginTop: 'auto', width: '100%', background: 'linear-gradient(135deg,#7C3AED,#6D28D9)', color: '#fff', borderRadius: '10px', padding: '13px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer', transition: 'all 0.2s', className: 'hover-brighten'}}>
              Generate Full Blog →
            </button>
          </div>
        </div>
      </div>

      <div style={{marginTop: '64px'}}>
        <h2 style={{fontSize: '32px', color: '#fff', textAlign: 'center', margin: 0, fontWeight: 700}}>Try It Yourself</h2>
        <p style={{color: '#94A3B8', textAlign: 'center', marginBottom: '32px', marginTop: '12px'}}>Enter any keyword and watch the AI work</p>
        
        <div style={{maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '12px'}}>
          <input type="text" placeholder="Enter a keyword, e.g. AI tools for startups..." style={{flex: 1, background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 20px', color: '#fff', fontSize: '15px'}} />
          <button onClick={handleGenerate} style={{background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', color: '#fff', borderRadius: '12px', padding: '14px 24px', fontWeight: 600, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'}}>
            Generate →
          </button>
        </div>

        {showResults && (
          <div style={{maxWidth: '600px', margin: '20px auto 0', background: '#141B2D', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '16px', padding: '24px'}}>
            <div style={{fontSize: '11px', color: '#7C3AED', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>📌 Blog Title</div>
            <div style={{fontSize: '18px', color: '#fff', fontWeight: 600, marginBottom: '20px', minHeight: '27px'}}>{typedTitle}</div>
            
            <div style={{fontSize: '11px', color: '#7C3AED', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>📝 Meta Description</div>
            <div style={{fontSize: '14px', color: '#94A3B8', marginBottom: '20px', minHeight: '42px'}}>{typedMeta}</div>
            
            <div style={{fontSize: '11px', color: '#7C3AED', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px'}}>✍️ First Paragraph</div>
            <div style={{fontSize: '14px', color: '#94A3B8', lineHeight: 1.7, minHeight: '100px'}}>{typedPara}</div>
          </div>
        )}
      </div>

      <div style={{marginTop: '64px', textAlign: 'center'}}>
        <p style={{fontSize: '18px', color: '#94A3B8'}}>Ready for the real thing?</p>
        <button onClick={() => window.showPage('auth')} style={{background: 'linear-gradient(135deg,#7C3AED,#9333EA)', color: '#fff', borderRadius: '999px', padding: '14px 32px', fontSize: '16px', fontWeight: '600', border: 'none', cursor: 'pointer', marginTop: '16px'}}>
          Start Free — First Month on Us →
        </button>
      </div>
    </div>
  );
};


const PricingPage = () => {
  const [annualBilling, setAnnualBilling] = React.useState(false);

  const [activeFaq, setActiveFaq] = React.useState(null);
  const faqs = [
    { q: "Is there a free trial?", a: "Yes. The Starter plan is free for your first month — no credit card required. You get full access to all Starter features for 30 days." },
    { q: "Can I cancel anytime?", a: "Absolutely. Cancel with one click from your dashboard. No cancellation fees, no questions asked." },
    { q: "Do I own the content BlogForge generates?", a: "100%. All content generated and published through BlogForge belongs entirely to you." },
    { q: "Which CMS platforms are supported?", a: "WordPress, Webflow, Shopify, Ghost, Strapi, Sanity, and any platform via custom webhook." },
    { q: "How is this different from ChatGPT?", a: "ChatGPT is a general AI. BlogForge is a purpose-built SEO engine — it clusters keywords, analyzes SERPs, scores content in real time, and auto-publishes. ChatGPT can't do any of that." },
    { q: "What is GEO Optimization?", a: "GEO (Generative Engine Optimization) structures your content to rank both in Google and in AI answer engines like ChatGPT, Perplexity, and Gemini." },
    { q: "How does auto-publishing work?", a: "Connect your CMS once via API. BlogForge generates, schedules, and publishes blogs automatically at your set frequency — no manual steps." },
    { q: "Is the content SEO-optimized?", a: "Yes. Every post is scored across 10 metrics including keyword density, readability, snippet eligibility, and AI detection before it ever gets published." },
    { q: "Can my team use one account?", a: "The Growth and Scale plans include shared team access. You can invite members and assign roles from your dashboard." },
    { q: "Is there a white-label option?", a: "Yes, available on the Scale plan. Contact our sales team for details." }
  ];

  return (
    <div className="container" style={{paddingTop: '8rem', paddingBottom: '8rem'}}>
      <div style={{textAlign: 'center', marginBottom: '48px'}}>
        <h1 style={{fontSize: '48px', fontWeight: 800, color: '#fff', margin: 0}}>
          Simple Pricing. <span style={{background: 'linear-gradient(135deg,#7C3AED,#06B6D4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>Serious Results.</span>
        </h1>
        <p style={{color: '#94A3B8', marginTop: '12px', fontSize: '18px'}}>Start free. Upgrade when you're ready. Cancel anytime.</p>
      </div>

      <div className="pricing-toggle">
        <div className="pt-container">
          <button 
            onClick={() => setAnnualBilling(false)}
            className={`pt-btn ${!annualBilling ? 'active' : 'inactive'}`}
          >Monthly</button>
          <button 
            onClick={() => setAnnualBilling(true)}
            className={`pt-btn ${annualBilling ? 'active' : 'inactive'}`}
          >Yearly (Save 30%)</button>
        </div>
      </div>

      <div className="pricing-grid-3">
        {/* Starter */}
        <div className="pc-card">
          <h3 className="pc-header">Starter</h3>
          <div className="pc-price-wrap">
            <span className="pc-price">{annualBilling ? '₹16,790' : '₹1,999'}</span>
            <span className="pc-per">{annualBilling ? '/year' : '/month'}</span>
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
          <button className="pc-btn-outline" onClick={() => window.showPage('auth')}>Start Free →</button>
        </div>

        {/* Growth */}
        <div className="pc-card popular">
          <div className="pc-most-pop">Most Popular</div>
          <h3 className="pc-header">Growth</h3>
          <div className="pc-price-wrap">
            <span className="pc-price">{annualBilling ? '₹41,990' : '₹4,999'}</span>
            <span className="pc-per">{annualBilling ? '/year' : '/month'}</span>
          </div>
          <p className="pc-desc" style={{margin: '32px 0 24px'}}>For startups replacing their marketing team</p>
          <div className="pc-divider"></div>
          <ul className="pc-feat-list">
            <div style={{fontSize: '14px', color: '#fff', fontWeight: 600, padding: '6px 0'}}>✓ Everything in Starter</div>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> 50 SEO blogs / month</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> GEO Optimization Engine</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Content Cluster Map (unlimited)</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Social Repurpose Engine</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Voice-to-Blog (10/month)</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> ROI & Traffic Tracker</li>
            <li className="pc-feat"><span className="pc-feat-check">✓</span> Priority support</li>
          </ul>
          <button className="pc-btn-solid" onClick={() => window.showPage('auth')}>Get Started →</button>
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
          <button className="pc-btn-outline-cyan">Contact Sales →</button>
        </div>
      </div>

      <div style={{marginTop: '32px', textAlign: 'center', fontSize: '13px', color: '#64748B'}}>
        🔒 No credit card required · Cancel anytime · SOC2 Compliant · Used by 500+ Indian startups
      </div>

      <div className="faq-accordion" style={{marginTop: '80px', maxWidth: '800px', margin: '80px auto 0'}}>
        <h2 style={{fontSize: '32px', color: '#fff', textAlign: 'center', marginBottom: '32px', fontWeight: 700}}>Frequently Asked Questions</h2>
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

const BlogPage = () => {
  const posts = [
    { title: "How BlogForge AI is Disrupting Martech in India", tag: "AI & SEO", emoji: "🤖", grad: "linear-gradient(135deg,#1E0B4B,#2D1B69)" },
    { title: "How to Get 10x Organic Traffic Without Writing a Single Blog", tag: "Growth", emoji: "📈", grad: "linear-gradient(135deg,#0C2340,#1E3A5F)" },
    { title: "The 7-Stage Prompt Architecture That Beats Human Writers", tag: "SEO Tips", emoji: "🔍", grad: "linear-gradient(135deg,#0B3D2E,#1A5940)" },
    { title: "Why GEO Optimization is the Next Frontier for Indian Startups", tag: "GEO", emoji: "🌍", grad: "linear-gradient(135deg,#3D1A0B,#5C2810)" },
    { title: "Content Cluster Maps: The Secret Weapon of Top SEO Agencies", tag: "Strategy", emoji: "🗺️", grad: "linear-gradient(135deg,#1A0B3D,#2D1A5C)" },
    { title: "How a Delhi SaaS Startup Got 50,000 Monthly Visitors in 90 Days", tag: "Case Study", emoji: "🚀", grad: "linear-gradient(135deg,#0B1A3D,#1A2D5C)" }
  ];

  return (
    <div className="container" style={{paddingTop: '8rem', paddingBottom: '8rem'}}>
      <div style={{textAlign: 'center', marginBottom: '48px'}}>
        <h1 style={{fontSize: '48px', color: '#fff', margin: 0, fontWeight: 800}}>Latest from BlogForge</h1>
        <p style={{color: '#94A3B8', marginTop: '12px', fontSize: '18px'}}>Insights, strategies, and playbooks on AI content and SEO</p>
      </div>

      <div className="blog-grid">
        {posts.map((post, i) => (
          <div key={i} className="blog-card">
            <div className="blog-thumb" style={{background: post.grad}}>
              {post.emoji}
            </div>
            <div className="blog-body">
              <div>
                <span className="blog-tag">{post.tag}</span>
              </div>
              <h3 className="blog-title">{post.title}</h3>
              <div className="blog-meta">
                <span>📅 Mar 2026</span>
                <span>⏱ 7 min read</span>
              </div>
              <div className="blog-read-more">Read More →</div>
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
          <div style={{display:'flex', gap:'12px', width:'100%', height:'100%', padding:'16px', boxSizing:'border-box', background:'#111827', borderRadius:'0 0 16px 16px'}}>
             <div style={{flex: 1, display:'flex', flexDirection:'column', gap:'12px'}}>
               <div>
                 <div style={{fontSize:'11px', color:'#94A3B8', marginBottom:'4px'}}>Target Keyword</div>
                 <div style={{background:'#1E293B', padding:'8px 12px', borderRadius:'6px', color:'white', fontSize:'12px', border:'1px solid rgba(255,255,255,0.05)'}}>SaaS Marketing Strategies</div>
               </div>
               <div>
                 <div style={{fontSize:'11px', color:'#94A3B8', marginBottom:'4px'}}>Tone of Voice</div>
                 <div style={{background:'#1E293B', padding:'8px 12px', borderRadius:'6px', color:'white', fontSize:'12px', border:'1px solid rgba(255,255,255,0.05)'}}>Authoritative & Actionable</div>
               </div>
               <button onClick={() => window.showDashboard && window.showDashboard()} style={{marginTop:'auto', background:'linear-gradient(135deg, #7C3AED, #5B21B6)', color:'white', border:'none', padding:'10px', borderRadius:'6px', fontSize:'12px', cursor:'pointer', fontWeight:'bold'}}>Generate Blog →</button>
             </div>
             <div style={{flex: 1.5, background:'#0F172A', border:'1px solid rgba(255,255,255,0.05)', borderRadius:'8px', padding:'12px', position:'relative', overflow:'hidden'}}>
               <div style={{width:'70%', height:'14px', background:'#334155', borderRadius:'4px', marginBottom:'12px'}}></div>
               <div style={{width:'100%', height:'8px', background:'#1E293B', borderRadius:'4px', marginBottom:'8px'}}></div>
               <div style={{width:'90%', height:'8px', background:'#1E293B', borderRadius:'4px', marginBottom:'8px'}}></div>
               <div style={{width:'95%', height:'8px', background:'#1E293B', borderRadius:'4px', marginBottom:'16px'}}></div>
               <div style={{position:'absolute', bottom:0, left:0, right:0, height:'40px', background:'linear-gradient(to top, #0F172A, transparent)'}}></div>
               <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%, -50%)', background:'rgba(16,185,129,0.2)', color:'#10B981', padding:'4px 12px', borderRadius:'12px', fontSize:'10px', fontWeight:'bold', border:'1px solid rgba(16,185,129,0.3)'}}>Processing AI Generation...</div>
             </div>
          </div>
        );
      case 'cluster':
        return (
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', width:'100%', height:'100%', background:'#111827', position:'relative', borderRadius:'0 0 16px 16px', flex:1}}>
             <div style={{position:'absolute', width:'100px', height:'2px', background:'#334155', zIndex:1}}></div>
             <div style={{position:'absolute', width:'2px', height:'80px', background:'#334155', zIndex:1, left:'65%'}}></div>
             <div style={{zIndex:2, background:'#5B21B6', padding:'10px 16px', borderRadius:'8px', color:'white', fontSize:'12px', fontWeight:'bold', marginRight:'120px', boxShadow:'0 0 15px rgba(124,58,237,0.4)'}}>Pillar: SEO Strategy</div>
             <div style={{display:'flex', flexDirection:'column', gap:'16px', zIndex:2}}>
                <div style={{background:'#1E293B', border:'1px solid #334155', padding:'8px 12px', borderRadius:'6px', color:'#E2E8F0', fontSize:'11px'}}>Technical SEO Tips</div>
                <div style={{background:'#1E293B', border:'1px solid #334155', padding:'8px 12px', borderRadius:'6px', color:'#E2E8F0', fontSize:'11px'}}>Backlink Outreach</div>
             </div>
          </div>
        );
      case 'serp':
        return (
          <div style={{width:'100%', height:'100%', background:'#111827', padding:'16px', boxSizing:'border-box', borderRadius:'0 0 16px 16px', flex:1}}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:'8px', color:'#94A3B8', fontSize:'10px', borderBottom:'1px solid #334155', paddingBottom:'8px', marginBottom:'8px'}}>
               <div>COMPETITOR</div><div>IDENTIFIED GAP</div><div>OPPORTUNITY</div>
            </div>
            {[
              {domain:'hubspot.com', gap:'Programmatic SEO execution', opp:'High'},
              {domain:'ahrefs.com', gap:'AI content safeguards', opp:'Medium'},
            ].map(row => (
              <div key={row.domain} style={{display:'grid', gridTemplateColumns:'1fr 2fr 1fr', gap:'8px', color:'white', fontSize:'11px', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                 <div style={{color:'#A78BFA'}}>{row.domain}</div>
                 <div>{row.gap}</div>
                 <div><span style={{background:'rgba(16,185,129,0.1)', color:'#10B981', padding:'2px 6px', borderRadius:'4px'}}>{row.opp}</span></div>
              </div>
            ))}
            <button onClick={() => window.showDashboard && window.showDashboard()} style={{width:'100%', marginTop:'12px', background:'#1E293B', border:'1px dashed #334155', padding:'8px', color:'#A78BFA', fontSize:'11px', borderRadius:'6px', cursor:'pointer'}}>Scan New Seed Keyword</button>
          </div>
        );
      case 'seo':
        return (
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'32px', width:'100%', height:'100%', background:'#111827', padding:'20px', boxSizing:'border-box', borderRadius:'0 0 16px 16px', flex:1}}>
             <div style={{position:'relative', width:'100px', height:'100px', borderRadius:'50%', background:'conic-gradient(#10B981 92%, #1E293B 0)', display:'flex', alignItems:'center', justifyContent:'center'}}>
               <div style={{position:'absolute', inset:'8px', background:'#111827', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column'}}>
                 <span style={{fontSize:'24px', fontWeight:'bold', color:'white'}}>92</span>
                 <span style={{fontSize:'9px', color:'#94A3B8'}}>SCORE</span>
               </div>
             </div>
             <div style={{display:'flex', flexDirection:'column', gap:'12px', flex:1}}>
               <div>
                 <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#94A3B8', marginBottom:'4px'}}><span>Readability</span><span>Great</span></div>
                 <div style={{height:'6px', background:'#1E293B', borderRadius:'3px'}}><div style={{width:'85%', height:'100%', background:'#10B981', borderRadius:'3px'}}></div></div>
               </div>
               <div>
                 <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#94A3B8', marginBottom:'4px'}}><span>Keyword Density</span><span>1.2%</span></div>
                 <div style={{height:'6px', background:'#1E293B', borderRadius:'3px'}}><div style={{width:'100%', height:'100%', background:'#10B981', borderRadius:'3px'}}></div></div>
               </div>
               <div>
                 <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', color:'#94A3B8', marginBottom:'4px'}}><span>Target Snippets</span><span>Missing</span></div>
                 <div style={{height:'6px', background:'#1E293B', borderRadius:'3px'}}><div style={{width:'40%', height:'100%', background:'#F59E0B', borderRadius:'3px'}}></div></div>
               </div>
             </div>
          </div>
        );
      case 'publish':
        return (
          <div style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', width:'100%', height:'100%', background:'#111827', borderRadius:'0 0 16px 16px', flex:1}}>
             <div style={{width:'50px', height:'50px', background:'#5B21B6', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', color:'white'}}><Sparkles size={24}/></div>
             <div style={{display:'flex', gap:'4px'}}>
               <div style={{width:'6px', height:'6px', background:'#334155', borderRadius:'50%'}}></div>
               <div style={{width:'6px', height:'6px', background:'#334155', borderRadius:'50%'}}></div>
               <div style={{width:'6px', height:'6px', background:'#334155', borderRadius:'50%'}}></div>
             </div>
             <div style={{background:'#1E293B', border:'1px solid rgba(16,185,129,0.3)', width:'60px', height:'60px', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', position:'relative'}}>
                <img src="https://cdn.simpleicons.org/wordpress/white" width="30" />
                <div style={{position:'absolute', top:'-6px', right:'-6px', background:'#10B981', color:'white', fontSize:'8px', padding:'2px 4px', borderRadius:'4px', fontWeight:'bold'}}>Synced</div>
             </div>
          </div>
        );
      case 'voice':
        return (
          <div style={{display:'flex', flexDirection:'column', gap:'12px', width:'100%', height:'100%', background:'#111827', padding:'20px', boxSizing:'border-box', borderRadius:'0 0 16px 16px', flex:1}}>
            <textarea readOnly style={{width:'100%', flex:1, background:'#0F172A', border:'1px solid #334155', borderRadius:'8px', color:'#A78BFA', padding:'12px', fontSize:'11px', resize:'none', outline:'none', fontFamily:'monospace'}} value="CORE_DIRECTIVE: Always maintain a professional yet engaging tone. Avoid jargon where possible. Refer to the reader as 'you'." />
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div style={{fontSize:'11px', color:'#94A3B8'}}>Creativity Temperature: <span style={{color:'white'}}>1.0</span></div>
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
        <h2 style={{fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '1rem'}}>Everything you need to <span className="title-accent-violet">dominate search.</span></h2>
        <p style={{color: '#94A3B8', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto'}}>Navigate through all our core modules natively right here.</p>
      </div>
      
      <div style={{display: 'flex', flexDirection: window.innerWidth <= 768 ? 'column' : 'row', gap: '2rem', background: '#0D1526', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '2rem'}}>
        {/* Sidebar Toolbar */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '8px', borderRight: window.innerWidth <= 768 ? 'none' : '1px solid rgba(255,255,255,0.05)', borderBottom: window.innerWidth <= 768 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingRight: window.innerWidth <= 768 ? '0' : '2rem', paddingBottom: window.innerWidth <= 768 ? '2rem' : '0', minWidth: '280px'}}>
          {features.map(f => (
            <button key={f.id} onClick={() => setActive(f.id)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', borderRadius: '12px',
              background: active === f.id ? 'rgba(124,58,237,0.1)' : 'transparent',
              border: active === f.id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
              color: active === f.id ? 'white' : '#94A3B8',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s', width: '100%'
            }}>
              <div style={{color: active === f.id ? '#A78BFA' : '#64748B', display: 'flex'}}>{f.icon}</div>
              <span style={{fontWeight: 600, fontSize: '15px'}}>{f.title}</span>   
            </button>
          ))}
        </div>
        
        {/* Right Panel Display */}
        <div style={{flex: 1, padding: window.innerWidth <= 768 ? '0' : '1rem 2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '350px'}}>
           {features.map(f => (
             <div key={f.id} style={{display: active === f.id ? 'flex' : 'none', animation: 'fadeIn 0.4s ease forwards', height: '100%', flexDirection: 'column'}}>
               <h3 style={{fontSize: '2rem', color: 'white', marginBottom: '1rem'}}>{f.title}</h3>
               <p style={{color: '#94A3B8', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem'}}>{f.desc}</p>
               
               <div style={{background: '#141B2D', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minHeight: '260px'}}>
                  <div style={{height: '40px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '6px', width: '100%', boxSizing: 'border-box'}}>
                    <div style={{width: 10, height: 10, borderRadius: '50%', background: '#EF4444'}}></div>
                    <div style={{width: 10, height: 10, borderRadius: '50%', background: '#F59E0B'}}></div>
                    <div style={{width: 10, height: 10, borderRadius: '50%', background: '#10B981'}}></div>
                    <div style={{marginLeft: 'auto', fontSize: '10px', color: '#64748B', fontFamily: 'monospace'}}>blogforge.ai/dash/{f.id}</div>
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


  
  // Navigation Utilities
  useEffect(() => {
    window.updateUserInDashboard = function(user) {
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

    window.showDashboard = function() {
      if (typeof auth !== 'undefined' && firebaseConfig.apiKey !== "PASTE_FIREBASE_API_KEY") {
        auth.signInWithPopup(googleProvider)
          .then((result) => {
            window.updateUserInDashboard(result.user);
            document.getElementById('marketing-site').style.display = 'none';
            document.getElementById('dashboard-app').style.display = 'flex';
            if (window.showDashboardSection) window.showDashboardSection('overview');
            window.scrollTo(0, 0);
          })
          .catch((error) => {
            if (error.code !== 'auth/popup-closed-by-user') {
              alert('Sign in failed: ' + error.message);
            }
          });
      } else {
        // Fallback if API key not set, let them see dashboard anyway for dev
        console.warn("Firebase API key not set or auth undefined. Skipping sign-in.");
        document.getElementById('marketing-site').style.display = 'none';
        document.getElementById('dashboard-app').style.display = 'flex';
        if (window.showDashboardSection) window.showDashboardSection('overview');
        window.scrollTo(0, 0);
      }
    };

    window.showMarketingSite = function() {
      const da = document.getElementById('dashboard-app');
      if (da) da.style.display = 'none';
      const ms = document.getElementById('marketing-site');
      if (ms) ms.style.display = 'block';
      if (window.showPage) window.showPage('home');
      window.scrollTo(0, 0);
    };

    window.signOut = function() {
      if (typeof auth !== 'undefined' && firebaseConfig.apiKey !== "PASTE_FIREBASE_API_KEY") {
        auth.signOut().then(() => {
          localStorage.removeItem('bf_user');
          document.getElementById('dashboard-app').style.display = 'none';
          document.getElementById('marketing-site').style.display = 'block';
          if (window.showPage) window.showPage('home');
        });
      } else {
          document.getElementById('dashboard-app').style.display = 'none';
          document.getElementById('marketing-site').style.display = 'block';
          if (window.showPage) window.showPage('home');
      }
    };
  }, []);

  const [scrolled, setScrolled] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(false);
  const [view, setView] = useState('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);

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
    { icon: <Globe size={16} />, text: "GEO Optimizer" },
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
          <a href="#" className="logo" aria-label="BlogForge AI — home">
            <Sparkles className="logo-icon" size={24} aria-hidden="true" />
            BlogForge AI
          </a>
          
          <ul className="nav-links" role="list" aria-label="Site pages">
            <li><a href="#home" onClick={(e) => { e.preventDefault(); window.showPage('home'); }} data-nav="home" className="nav-link active" aria-current="page">Home</a></li>
            <li><a href="#howitworks" onClick={(e) => { e.preventDefault(); window.showPage('howitworks'); }} data-nav="howitworks" className="nav-link">How it Works</a></li>
            <li><a href="#features" onClick={(e) => { e.preventDefault(); window.showPage('features'); }} data-nav="features" className="nav-link">Features</a></li>
            <li><a href="#demo" onClick={(e) => { e.preventDefault(); window.showPage('demo'); }} data-nav="demo" className="nav-link">Demo</a></li>
            <li><a href="#pricing" onClick={(e) => { e.preventDefault(); window.showPage('pricing'); }} data-nav="pricing" className="nav-link">Pricing</a></li>
            <li><a href="#blog" onClick={(e) => { e.preventDefault(); window.showPage('blog'); }} data-nav="blog" className="nav-link">Blog</a></li>
          </ul>

          <div className="nav-actions" role="group" aria-label="Account actions">
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
            <div className="badge stagger-in-item">
              <span className="badge-dot"></span>
              ✦ India's #1 AI Blog Engine — Now in Beta
            </div>
            
            <h1 className="hero-title stagger-in-item">
              Publish <span className="title-accent-violet">10x Output</span><br />
              With Zero Writing.
            </h1>
            
            <p className="subheading stagger-in-item">
              Stop fighting writer's block. BlogForge researches, writes, optimizes, and automatically publishes high-ranking SEO content directly to your WordPress, Webflow, or custom CMS.
            </p>

            <div className="hero-actions stagger-in-item">
              <button className="btn btn-primary btn-lg" onClick={() => window.showDashboard()}>Start Free Trial →</button>
              <button className="btn btn-outline btn-lg" onClick={() => window.showPage('demo')}><Play size={18} style={{marginRight: '8px'}} /> Watch Demo</button>
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
                <div className="fp-card-header"><span style={{fontSize: '20px'}}>🌍</span><span className="fp-title">GEO Optimizer</span></div>
                <div className="fp-desc">Rank in every city automatically</div>
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
            <h1 className="hiw-title">How BlogForge Works</h1>
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
               <h3 style={{color: 'white', fontSize: '18px', margin: '0 0 8px', fontWeight: 700}}>1. Discovery</h3>
               <p style={{color: 'var(--text-subtle)', fontSize: '13px', margin: 0, lineHeight: 1.5}}>Keyword & SERP analysis automatically extracts missing competitor topics.</p>
             </div>
             {/* Node 2 – AI Engine (centre, glowing) */}
             <div style={{background: 'linear-gradient(135deg, #1A1333, #0D1526)', border: '1px solid rgba(124,58,237,0.4)', borderRadius: '24px', padding: '32px', textAlign: 'center', width: '240px', flexShrink: 0, zIndex: 2, boxShadow: '0 0 40px rgba(124,58,237,0.25)', position: 'relative'}}>
               <div style={{position: 'absolute', inset: 0, borderRadius: '24px', boxShadow: '0 0 0 0 rgba(124,58,237,0.4)', animation: 'pulseBorderGlow 2s infinite', pointerEvents: 'none'}}></div>
               <div style={{background: 'linear-gradient(135deg, #7C3AED, #5B21B6)', width: '80px', height: '80px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white', boxShadow: '0 10px 20px rgba(124,58,237,0.4)'}}><Brain size={40}/></div>
               <h3 style={{color: 'white', fontSize: '22px', margin: '0 0 6px', fontWeight: 800}}>AI Engine</h3>
               <p style={{color: '#A78BFA', fontSize: '13px', margin: 0}}>Generates, scores & optimises NLP content in real time.</p>
             </div>
             {/* Node 3 – Publishing */}
             <div className="glass-card" style={{padding: '24px', textAlign: 'center', width: '220px', flexShrink: 0, zIndex: 2}}>
               <div style={{background: 'rgba(6,182,212,0.1)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#06B6D4'}}><Globe2 size={32}/></div>
               <h3 style={{color: 'white', fontSize: '18px', margin: '0 0 8px', fontWeight: 700}}>3. Publishing</h3>
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
                  Connect your CMS (WordPress, Webflow, Shopify, etc.) and paste your website URL. BlogForge reads your brand, niche, and competitor landscape in 60 seconds.
                </p>
              </div>
              
              <div className="demo-visual-card">
                <div className="cms-connection-demo">
                  <div className="cms-icons">
                    <div className="cms-icon"><img src="https://cdn.simpleicons.org/wordpress/white" alt="WP" style={{width: 20}}/></div>
                    <div className="cms-icon"><img src="https://cdn.simpleicons.org/webflow/white" alt="WF" style={{width: 20}}/></div>
                    <div className="cms-icon"><img src="https://cdn.simpleicons.org/shopify/white" alt="SH" style={{width: 20}}/></div>
                  </div>
                  <div className="connection-path">
                    <div className="data-packet"></div>
                  </div>
                  <div className="blogforge-node">
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
        <PricingPage />
      </div>

      <div className="page-section" id="page-blog" style={{ display: 'none' }}>
        <div className="container" style={{padding: '12rem 0 8rem', textAlign: 'center', minHeight: '60vh'}}>
          <h2 className="section-title">Blog <span className="title-accent-violet">Updates</span></h2>
          <p className="section-subtitle">Read the latest news and guides from BlogForge AI.</p>
        </div>
      </div>

      <div className="page-section" id="page-auth" style={{ display: 'none' }}>
        <div className="auth-layout container">
          <div className="auth-hero stagger-in">
            <div className="glass-card auth-hero-content stagger-in-item">
              <h2 className="auth-welcome-title">India's largest brands trust BlogForge</h2>
              <p className="auth-welcome-desc">Join 500+ startups saving 92% of their content creation time.</p>
              
              <div className="auth-quotes stagger-in-item">
                <div className="auth-quote">
                  "BlogForge replaced our entire content agency. We're now publishing 4x more for 1/10th the cost."
                  <div className="auth-author">— Founder, Delhi.AI</div>
                </div>
              </div>

              <div className="auth-stats-grid stagger-in-item">
                <div className="auth-stat">
                  <div className="auth-stat-val">94%</div>
                  <div className="auth-stat-lab">Avg. SEO Score</div>
                </div>
                <div className="auth-stat">
                  <div className="auth-stat-val">10/10</div>
                  <div className="auth-stat-lab">Human Feel</div>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-form-container stagger-in">
            <div className="auth-form-card glass-card stagger-in-item">
              <div className="auth-header">
                <h1 className="auth-title">Welcome Back</h1>
                <p className="auth-subtitle">Sign in to your BlogForge Workspace</p>
              </div>

              <div className="auth-google-btn-wrap">
                <button className="btn btn-outline btn-lg w-full" onClick={() => window.showDashboard()}>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" width="18" alt="" />
                  Continue with Google
                </button>
              </div>

              <div className="auth-divider">
                <span>or continue with email</span>
              </div>

              <div className="auth-fields">
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="name@company.com" disabled />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" disabled />
                </div>
              </div>

              <button className="btn btn-primary btn-lg w-full" disabled>
                Sign In (SSO Only)
              </button>

              <div className="auth-footer">
                Don't have an account? <span className="auth-link" onClick={() => window.showPage('pricing')}>View Pricing</span>
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
                BlogForge AI
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
              © 2026 BlogForge AI. Built in India 🇮🇳. All rights reserved.
            </div>
            <div className="footer-socials" style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <a href="#" className="social-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#000', color: 'white', textDecoration: 'none', fontSize: '15px', fontWeight: 900, fontFamily: 'sans-serif'}}>𝕏</a>
              <a href="#" className="social-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#0A66C2', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 700, fontFamily: 'sans-serif', lineHeight: 1, flexShrink: 0}}>in</a>
              <a href="#" className="social-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#F58529,#DD2A7B,#8134AF)', color: 'white', textDecoration: 'none', fontSize: '16px'}}>◎</a>
              <a href="#" className="social-icon" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#24292E', color: 'white', textDecoration: 'none', fontSize: '18px'}}>⌥</a>
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
