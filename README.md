<div align="center">

# ✦ BlogzzUP ✦
### AI-Powered SEO Blog Engine — Prompt It. We Write It.

[![Live Demo](https://img.shields.io/badge/Live-blogzzup.netlify.app-7C3AED?style=for-the-badge&logo=netlify&logoColor=white)](https://blogzzup.netlify.app)
[![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981?style=for-the-badge)](LICENSE)

**BlogzzUP** is an AI-powered blog content engine that converts a keyword — or a voice note — into a full-length, SEO and GEO-optimized blog post, then auto-publishes it across platforms like dev.to, Hashnode, Medium, and more.

[Live Demo](https://blogzzup.netlify.app) · [Report Bug](https://github.com/nmnroy/blogforge-ai/issues) · [Request Feature](https://github.com/nmnroy/blogforge-ai/issues)

</div>

---

## The 7-Stage AI Pipeline

| Stage | Process | Description |
| :--- | :--- | :--- |
| **01** | 🔍 Intent Analysis | Scans keyword intent and identifies content gaps |
| **02** | 🏗️ Architecture | Builds hierarchical H2/H3 outline for topic authority |
| **03** | 🧊 Synthesis | Generates raw, high-density content blocks |
| **04** | 📈 SEO Injection | Integrates LSI keywords and entity optimization naturally |
| **05** | 🎨 Polishing | Applies brand voice, tone, and readability adjustments |
| **06** | 🔗 Linking | Suggests logical internal links (Beta) |
| **07** | 🚀 Deployment | Pushes directly to connected publishing platforms |

---

## Key Features

- **🧠 Autonomous Generation** — One keyword is all you need. Intent extraction, outlining, and drafting handled automatically via Gemini AI
- **🎙️ Voice to Blog** — Speak your ideas, get a full blog with live transcription and instant SEO scoring. Zero API cost — runs on browser-native Web Speech API
- **📊 Real-time SEO Scoring** — 6-metric live SEO audit: title optimization, content depth, readability, keyword density, snippet eligibility, and AI detection risk
- **🔍 SERP Gap Scanner** — Find content gaps your competitors aren't covering, with suggested blog titles ready to use
- **🌍 GEO Optimization** — Built for Generative Engine Optimization (GEO): content structured to be cited by AI answer engines like Perplexity, ChatGPT, and Google SGE — not just ranked on Google
- **🚀 Auto-Publisher** — One-click publish to WordPress, dev.to, Hashnode, Medium, Blogger etc.
- **📅 Content Calendar** — Visualize and manage your publishing schedule
- **📈 ROI Dashboard** — Track blog performance, SEO scores, and estimated traffic
- **💳 Subscription Plans** — Integrated Razorpay payments with Starter, Growth, and Scale tiers
- **🌓 Obsidian UI** — Premium dark/light mode interface with glassmorphism design system

---

## 🏗️ Technical Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React + Vite | UI architecture and routing |
| **Styling** | CSS Modules + Tokens | Component-scoped design system |
| **Auth** | Firebase Auth | Google OAuth integration |
| **Database** | Firebase Firestore | Blog storage and user data |
| **Hosting** | Netlify | CI/CD and production hosting |
| **AI Engine** | Google Gemini 2.5 Flash | Blog generation + SEO analysis |
| **Voice Capture** | Web Speech API | Browser-native real-time transcription (free, no API key) |
| **Payments** | Razorpay | Subscription billing |

---

## 📁 Project Structure

```
blogzzup/
├── public/
│   ├── favicon.svg
│   ├── icons.svg
│   ├── pipeline.png
│   └── assets/
│       └── blog/
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── utils/
│   │   ├── blogStorage.js     # Firestore read/write
│   │   ├── gemini.js          # Gemini AI API calls
│   │   ├── publishBlog.js     # Auto-publish to platforms
│   │   └── razorpay.js        # Payment integration
│   ├── App.jsx                # Routing and context providers
│   ├── App.css
│   ├── AuthContext.jsx        # Firebase auth state
│   ├── BlogEditor.jsx         # Blog editor — keyword + tone + generation
│   ├── BlogEditor.css
│   ├── CommandPalette.jsx     # Quick-action keyboard UI
│   ├── Dashboard.jsx          # Full dashboard — all sections including Voice to Blog
│   ├── Dashboard.css
│   ├── firebase.js            # Firebase config
│   ├── main.jsx               # React entry point
│   ├── PromptArchitecture.jsx # AI prompt design system
│   ├── PromptArchitecture.css 
│   ├── ToastSystem.jsx        # Notification system
│   ├── index.css
│   ├── tokens.css             # Design tokens
│   ├── a11y.css
│   └── interactions.css
├── .env                       # Environment variables (not committed)
├── index.html
├── netlify.toml
├── vite.config.js
└── package.json
```

---

## 🛠️ Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/nmnroy/blogforge-ai.git
cd Blogzzup
npm install
```

### 2. Environment Setup

Create a `.env` file in the root:

```env
# Firebase
VITE_API10=your_api_key
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Payments
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

Get your keys from:
- Firebase → [console.firebase.google.com](https://console.firebase.google.com)
- Gemini AI → configured directly in `src/utils/gemini.js`
- Razorpay → [dashboard.razorpay.com](https://dashboard.razorpay.com)

### 3. Run Locally

```bash
npm run dev
```

Access at `http://localhost:5173`

---

## 🚀 Deployment

Deployed on **Netlify** with automatic CI/CD from the main branch.

Push to `main` → Netlify builds and deploys automatically.

```toml
# netlify.toml handles SPA routing redirects
```

---

## 💳 Pricing Plans

| Plan | Price | Blogs/Month |
| :--- | :--- | :--- |
| **Free** | ₹0 | Limited |
| **Starter** | ₹1,999/mo | 15 |
| **Growth** | ₹4,999/mo | 50 |
| **Scale** | Custom | Unlimited |

Payments powered by Razorpay with monthly and yearly billing cycles.

---

## 👥 Team Twinkle

Built for **Bizmark '26 — Prompt & Profit** Hackathon

Hosted by DTU Consulting Group × Blogy

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for details.

---

<div align="center">
Built with 💜 · Powered by Google Gemini, Firebase & Web Speech API
</div>
