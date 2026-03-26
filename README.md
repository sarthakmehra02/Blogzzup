<div align="center">

<img src="public/favicon.svg" width="80" alt="BlogForge AI logo" />

# ✦ BlogForge AI ✦
### The Premium Autonomous Content Engine for Modern SaaS

[![GitHub Release](https://img.shields.io/github/v/release/nmnroy/blogforge-ai?style=for-the-badge&color=7C3AED)](https://github.com/nmnroy/blogforge-ai)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite 8](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)

**BlogForge AI** is a state-of-the-art content automation platform that transforms single keywords into high-ranking, 2,500+ word blog posts. Built for scale, it leverages a sophisticated 7-stage AI pipeline to handle research, SEO optimization, and publishing autonomously.

[Explore the Code](https://github.com/nmnroy/blogforge-ai/tree/main/src) · [Report Bug](https://github.com/nmnroy/blogforge-ai/issues) · [Request Feature](https://github.com/nmnroy/blogforge-ai/issues)

</div>

---

## 🔱 The 7-Stage AI Pipeline
BlogForge doesn't just "write." It executes a multi-agent architectural flow to ensure human-grade quality:

1.  **🔍 SERP Intent Analysis**: Scans top competitors to find content gaps.
2.  **🏗️ Semantic Architecture**: Builds a hierarchical H2/H3 outline for maximum "Topic Authority."
3.  **🧊 Draft Synthesis**: Generates raw, high-density content blocks.
4.  **📈 SEO Injection**: Naturally integrates LSI keywords and entity-based optimization.
5.  **🎨 Narrative Polishing**: Applies brand voice, tone, and readability adjustments.
6.  **🔗 Internal Link Mapping**: (Beta) Suggests logical internal links to existing content.
7.  **🚀 CMS Deployment**: Formats and pushes directly to WordPress, Webflow, or Shopify.

---

## 🔥 Key Features

- **🧠 Autonomous Intelligence**: One keyword is all you need. The system does the rest.
- **🗺️ Topic Cluster Map**: Visualise your content universe to build ultimate site authority.
- **📊 Real-time SEO Scoring**: A dynamic 10-metric score that updates as the AI writes.
- **🎙️ Brand Voice DNA**: Clone your writing style by providing samples or style guides.
- **🌍 Global Geo-Targeting**: Localize content for specific cities or regions with one click.
- **🌓 Premium Dark Mode UI**: A "Glassmorphism" design system built for professional content teams.

---

## 🏗️ Technical Architecture

### **Core Stack**
- **Frontend**: React 19 (Concurrent Mode) + Vite 8
- **Styling**: Vanilla CSS Design Token System (`tokens.css`)
- **Animations**: CSS Variables + Micro-interaction Engine (`interactions.css`)
- **Backend/AI**: Google Gemini Pro 1.5 API
- **Auth**: Firebase Authentication (Google OAuth)

### **Design System**
The UI follows a precise token-based architecture ensuring high performance and accessible aesthetics:
- **`tokens.css`**: Centralized colors, spacing, and fluid typography.
- **`interactions.css`**: Sublte hover states and transition logic.
- **`a11y.css`**: WCAG 2.1 compliant focus and contrast overrides.

---

## 🛠️ Setup & Installation

### 1. Clone & Install
```bash
git clone https://github.com/nmnroy/blogforge-ai.git
cd blogforge-ai
npm install
```

### 2. Configure Environment
Create a `.env` file or update the config in `App.jsx` and `BlogEditor.jsx`:
- **Firebase**: [Get config from Firebase Console](https://console.firebase.google.com)
- **Gemini AI**: [Generate API Key from AI Studio](https://aistudio.google.com/app/apikey)

### 3. Run Development
```bash
npm run dev
```

---

## 📁 Repository Structure

```text
src/
├── components/          # Reusable UI primitives
├── features/            # Modular feature logic (Editor, Map, Planner)
├── tokens.css           # Global Design Tokens
├── interactions.css     # Motion & Interaction Logic
├── App.jsx              # Application Shell & Shared Layouts
└── main.jsx             # React Entry Point
```

---

## 📄 License & Attribution
Distributed under the MIT License. See `LICENSE` for more information.

Built with 💜 by [NMN Roy](https://github.com/nmnroy) · Powered by Google Gemini & React 19.

---

<div align="center">
⭐ **If you find this project useful, please give it a star on GitHub!**
</div>
