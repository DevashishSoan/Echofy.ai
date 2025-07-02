# Echofy.ai 🎙️

> Real-time voice-to-text transcription platform built for creators, professionals, and accessibility users.

---

## 🔍 Overview

**Echofy.ai** is a lightweight and accurate voice transcription web app with:
- ⏱️ Real-time speech-to-text (<100ms latency)
- 🌐 Multilingual support
- ✂️ Transcript editing & export
- 🔐 Supabase-based user authentication
- ☁️ Fully deployed (frontend & backend)

---

## 🛠️ Tech Stack

| Part | Technology |
|------|------------|
| Frontend | React + Vite (Hosted on Vercel) |
| Backend | Node.js / Supabase (Hosted on Railway) |
| Auth | Supabase |
| CI/CD | GitHub + Vercel/Railway |
| Built with | [Bolt.new](https://bolt.new) ⚡ |

---

## 🚀 Live Demo

- 🔗 **App:** [echofy-ai.vercel.app](https://echofy-ai-t8s6.vercel.app/)
- 🔗 **GitHub Repo:** [github.com/DevashishSoan/Echofy.ai](https://github.com/DevashishSoan/Echofy.ai)

---

## 🧪 Local Development

### 1. Clone the repo

```bash
git clone https://github.com/DevashishSoan/Echofy.ai.git
cd Echofy.ai
```

### 2. Setup environment variables

Create a `.env` file and add:

```env
VITE_APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:3001
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start frontend

```bash
npm install
npm run dev
```

### 4. Start backend

Go into `/backend`, install dependencies, and run:

```bash
npm install
npm start
```

---

## 🧩 Folder Structure

```
project/
├── backend/                # Server-side logic
├── project/                # Frontend app
├── public/assets/          # Static images/assets
└── README.md
```

---

## 💬 Contact

For feedback or collaboration, reach out at:  
📧 soandevashish@gmail.com  
🔗 [LinkedIn](https://www.linkedin.com/in/devashishsoan/)

---
✅ Built with Bolt.new

