import React, { useState, memo } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import './ClusterMap.css';

const INITIAL_CLUSTERS = [
  { id: 'pillar-1', name: 'AI Blog Automation', type: 'pillar' },
  { id: 'cluster-1', name: 'SEO OPTIMIZATION', type: 'cluster', status: 'teal' },
  { id: 'cluster-2', name: 'CONTENT STRATEGY', type: 'cluster', status: 'amber' },
  { id: 'cluster-3', name: 'GEO TARGETING', type: 'cluster', status: 'green' },
  { id: 'cluster-4', name: 'KEYWORD ANALYSIS', type: 'cluster', status: 'purple' },
  { id: 'cluster-5', name: 'LINK BUILDING', type: 'cluster', status: 'blue' },
  { id: 'cluster-6', name: 'SOCIAL SHARING', type: 'cluster', status: 'pink' },
  { id: 'cluster-7', name: 'EMAIL OUTREACH', type: 'cluster', status: 'navy' },
  { id: 'cluster-8', name: 'PERFORMANCE TRACKING', type: 'cluster', status: 'gold' }
];

// Memoized Cluster Card for zero-lag hover rendering
const ClusterNode = memo(({ cluster, index, totalItems, onClick }) => {
  // Use absolute pixel math for centering: (index + 1) / (total + 1) * 1000px basis
  const spacing = 1000 / (totalItems + 1);
  const targetX = spacing * (index + 1);
  const leftPosition = `${targetX - 80}px`; // (Target Center X) - (Half-Width 80px)
  
  return (
    <div
      className={`cluster-node-card ${cluster.status}`}
      onClick={() => onClick(cluster)}
      style={{
        position: 'absolute',
        top: '290px',
        left: leftPosition,
        width: '160px',
        padding: '14px 10px',
        textAlign: 'center',
        zIndex: 10,
        cursor: 'pointer',
        transform: 'translateZ(0)' // GPU Only
      }}
    >
      <div style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '0.8px' }}>
        {cluster.name.toUpperCase()}
      </div>
    </div>
  );
});

const ClusterMapViewer = ({ onGenerateBlog }) => {
  const [clusters] = useState(INITIAL_CLUSTERS);
  const [activeNode, setActiveNode] = useState(null);

  const renderLines = () => {
    // 1000px CANVAS BASIS
    const pillarX = 500; 
    const pillarY = 120; 
    const midRow = clusters.filter(c => c.id.startsWith('cluster-') && c.id !== 'cluster-8');
    const bottomNode = clusters.find(c => c.id === 'cluster-8');

    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 1000 650"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 1 }}
      >
        {midRow.map((c, i) => {
          const spacing = 1000 / (midRow.length + 1);
          const endX = spacing * (i + 1);
          const endY = 290; 
          return (
            <line 
              key={`path-${c.id}`}
              x1={pillarX} y1={pillarY}
              x2={endX} y2={endY}
              className="cluster-path"
            />
          );
        })}
        {bottomNode && (
          <line x1={pillarX} y1={pillarY} x2={pillarX} y2={500} className="cluster-path" />
        )}
      </svg>
    );
  };

  return (
    <div className="cluster-viewer-container" style={{ height: '620px', background: 'transparent' }}>
      <div className="cluster-viewer" style={{ width: '1000px', height: '100%', position: 'relative' }}>
        {renderLines()}

        {/* PILLAR - ABSOLUTELY CENTERED AT 500PX (380 is Left Edge for 240px Width) */}
        <div 
          className="cluster-node-pillar"
          onClick={() => setActiveNode(clusters[0])}
          style={{
            position: 'absolute',
            top: '80px',
            left: '380px',
            width: '240px',
            padding: '18px 22px',
            borderRadius: '16px',
            color: 'white',
            fontWeight: '800',
            textAlign: 'center',
            zIndex: 10,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <Sparkles size={18} />
          {clusters[0].name.toUpperCase()}
        </div>

        {/* MIDDLE ROW - PIXEL SYNCED VIA ABSOLUTE CALC */}
        {(() => {
          const midRow = clusters.filter(c => c.id.startsWith('cluster-') && c.id !== 'cluster-8');
          return midRow.map((cluster, index) => (
            <ClusterNode 
              key={cluster.id} 
              cluster={cluster} 
              index={index} 
              totalItems={midRow.length} 
              onClick={setActiveNode} 
            />
          ));
        })()}

        {/* PERFORMANCE NODE - ABSOLUTELY CENTERED AT 500PX (380 is Left Edge for 240px Width) */}
        <div
          className="cluster-node-card gold"
          onClick={() => setActiveNode(clusters[8])}
          style={{
            position: 'absolute',
            top: '500px',
            left: '380px',
            width: '240px',
            padding: '16px',
            textAlign: 'center',
            zIndex: 10,
            cursor: 'pointer'
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: '800', letterSpacing: '1px' }}>
            {clusters[8].name.toUpperCase()}
          </div>
        </div>

        {/* ADD CLUSTER UI */}
        <button 
          className="cluster-add-button-fixed"
          onClick={() => window.showToast?.('Add feature coming soon!', 'info')}
          style={{
            position: 'absolute',
            bottom: '30px',
            right: '-120px', // Adjusted for the 1000px container width
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '800',
            cursor: 'pointer',
            pointerEvents: 'auto'
          }}
        >
          <Plus size={14} /> ADD CLUSTER
        </button>
      </div>

      {activeNode && (
        <div className="cluster-detail-panel" style={{ right: '40px', top: '40px' }}>
           <h3 className="cluster-detail-title">{activeNode.name}</h3>
           <button className="cluster-generate-btn" onClick={() => onGenerateBlog(activeNode.name)}>
            Generate Blog
          </button>
          <button onClick={() => setActiveNode(null)} style={{ marginTop: '10px', width: '100%', background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '11px', cursor: 'pointer' }}>Close</button>
        </div>
      )}
    </div>
  );
};

export default ClusterMapViewer;
