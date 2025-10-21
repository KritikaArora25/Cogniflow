# Cogniflow 🌸

Cogniflow is a cognitive-behavior-based study planner that tracks focus and distractions in real-time using a Chrome extension, provides personalized productivity tips, and helps optimize study habits.
---

## 🚀 Features

Real-time Focus Tracking: Monitor your active study time and distractions using our Chrome extension

Website Monitoring: Extension automatically detects when you visit non-study websites during sessions

Dynamic Allowed Sites: Customize which websites are allowed during each study session

Fatigue Detection & Break Suggestions: Get tips or break notifications when fatigue rises

Study Session Management: Start, pause, and stop study sessions with custom subject and site permissions

Analytics Dashboard: Visualize study duration by subject, focus vs distracted time, and weekly streaks using interactive charts

Gamified Focus Streaks: Track your consistency and get motivated to maintain focus

Modern UI: Responsive and visually appealing interface using React, Tailwind CSS, and Framer Motion

---

## 🛠 Tech Stack

Frontend: React, Tailwind CSS, Framer Motion, Chart.js

Backend: Node.js, Express, MongoDB, JWT Authentication

Browser Extension: Chrome Extension API (Manifest V3)

Database: MongoDB (Atlas)

Deployment: Vercel (Frontend) + Render (Backend)

---

## 📊 Dashboard Overview

Study duration by subject (Pie Chart)

Focus vs Distracted time (Pie Chart)

Weekly focus streaks (Bar Chart)

Real-time distraction alerts

Productivity/fatigue tips with break suggestions

Extension status monitoring

---

## 🔌 Chrome Extension

The Cogniflow extension works alongside the web app to provide real-time focus monitoring:

Extension Features:
Tab Monitoring: Tracks which websites you visit during study sessions

Smart Detection: Compares current tabs against your allowed study sites

Cross-Tab Communication: Background script coordinates between all browser tabs

Session Control: Starts/stops monitoring based on your study sessions

```bash
extension/
├── manifest.json      # Extension configuration
├── background.js      # Coordinates tab monitoring
├── content.js         # Runs on all websites
└── popup.html         # Extension popup (optional)
```

## ⚡ Getting Started

1. **Clone the repository**
```bash
git clone git@github.com:KritikaArora25/Cogniflow.git
cd Cogniflow
```
2. **Install dependencies**
```bash
npm install
```
3. **Setup environment variables**
Create a .env file:
```bash
MONGO_URI=your_mongodb_connection_string
```
4. **Run the project**
```bash
npm run dev
```

## Folder Structure
```bash
Cogniflow/
│
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── utils/           # API utilities
│   │   └── ...
│   ├── package.json
│   └── .env
│
├── backend/                  # Node.js API
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── package.json
│   └── .env
│
├── extension/               # Chrome extension
│   ├── manifest.json       # Extension config
│   ├── background.js       # Background script
│   ├── content.js          # Content scripts
│   └── popup.html          # Extension UI
│
└── README.md

```




