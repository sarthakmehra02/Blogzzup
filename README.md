# ✨ BlogForge AI

> India's most powerful AI blog engine — from keyword to ranked blog post in under 10 minutes.

![BlogForge AI](https://img.shields.io/badge/Gemini%202.5%20Flash-Powered-purple?style=for-the-badge&logo=google)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-yellow?style=for-the-badge&logo=vite)
![Firebase](https://img.shields.io/badge/Firebase-Auth-orange?style=for-the-badge&logo=firebase)

---

## 🚀 What is BlogForge AI?

BlogForge AI is a full-stack SaaS platform that automates your entire SEO content pipeline — from keyword research to published blog post — powered by **Gemini 2.5 Flash Preview** with advanced thinking capabilities.

---

## ✨ Key Features

### 🤖 AI-Powered Tools
| Feature | Description |
|---|---|
| **AI Blog Generator** | Generates 2,500+ word SEO-optimised articles with NLP suggestions |
| **SERP Gap Scanner** | Analyses top 10 results, finds missing competitor topics |
| **Live SEO Scorer** | Real-time 0–100 scoring across readability, density & snippets |
| **Content Cluster Map** | Visual pillar/cluster topic universe builder |
| **Keyword Planner** | AI-powered keyword research and intent mapping |
| **Competitor Spy** | Deep competitor content analysis |

### 🔄 Publishing & Automation
| Feature | Description |
|---|---|
| **Auto-Publisher** | Direct integration with WordPress, Webflow, Shopify |
| **Content Calendar** | Plan and schedule your entire content strategy |
| **Schedule Queue** | Automated publishing queue management |

### 📊 Analytics
| Feature | Description |
|---|---|
| **Traffic Tracker** | Monitor organic traffic growth over time |
| **ROI Dashboard** | Track content ROI and conversion metrics |
| **Brand Voice Control** | Train AI on your exact tone and style |

---

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite 5
- **Styling**: Vanilla CSS (glassmorphism dark design system)
- **AI Engine**: Google Gemini 2.5 Flash Preview (`gemini-2.5-flash-preview-04-17`)
  - `thinkingBudget: 512` for higher accuracy SEO analysis
  - `temperature: 1` for optimal generation quality
- **Authentication**: Firebase Auth (Google Sign-In)
- **State/Persistence**: React state + `localStorage`
- **Icons**: Lucide React

---

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone https://github.com/nmnroy/blogforge-ai.git
cd blogforge-ai

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Firebase Setup (Google Sign-In)

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Google Sign-In** under Authentication → Sign-in methods
3. Register a **Web App** and copy your config
4. In `index.html`, replace the placeholder values in the Firebase config block:

```js
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

> **Note:** Without Firebase config, the app falls back to a dev mode that skips authentication and loads the dashboard directly.

### Gemini API
The Gemini API key is already configured for demo purposes. For production, move it to a **server-side proxy** or environment variable to prevent key exposure.

---

## 📁 Project Structure

```
blogforge-ai/
├── public/
│   └── pipeline.png          # How It Works section asset
├── src/
│   ├── App.jsx               # Main SPA — marketing site + routing
│   ├── Dashboard.jsx         # Full dashboard with all 12 modules
│   └── index.css             # Global design system (glassmorphism)
├── index.html                # Firebase SDK + config injection
├── vite.config.js
└── package.json
```

---

## 🎨 Design System

- **Theme**: Dark glassmorphism
- **Primary Accent**: `#7C3AED` (violet)
- **Secondary Accent**: `#06B6D4` (cyan)
- **Success**: `#10B981` (emerald)
- **Font**: Inter (Google Fonts)

---

## 🗺️ Roadmap

- [ ] Supabase/Firebase Firestore backend for blog persistence
- [ ] Real WordPress REST API / Webflow CMS publishing
- [ ] Google Search Console integration for live traffic data
- [ ] Team collaboration and role-based access
- [ ] AI image generation per blog post

---

## 📄 License

MIT © 2025 BlogForge AI
