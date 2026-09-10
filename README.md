# 🧠 FEYNIT — Feynman Technique AI Classroom

[![React](https://img.shields.io/badge/React-19-blue.svg?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple.svg?logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Express](https://img.shields.io/badge/Express-4-lightgrey.svg?logo=express&logoColor=white)](https://expressjs.com)
[![Supabase](https://img.shields.io/badge/Supabase-Database-emerald.svg?logo=supabase&logoColor=white)](https://supabase.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange.svg?logo=openai&logoColor=white)](https://openai.com)

**FEYNIT** is an interactive, gamified learning application designed around the **Feynman Technique** ("Explain it like I'm five"). By acting as a teacher and explaining complex topics to AI-powered students with distinct personalities, users deepen their own understanding. The game rewards clarity, penalizes jargon, and tests the student's absorption of the material via AI-generated exams.

---

## 🚀 Key Features

*   **Dual Roles**: Enter as a **Professor** to teach topics, or as a **Student** to learn from an AI tutor.
*   **Unique Student Personalities**: Unlock and teach students with different cognitive traits:
    *   *Marko* (Easy) — Simple explanations and everyday examples.
    *   *Stefan* (Medium) — Understands things only through football analogies.
    *   *Jovana* (Medium) — Connects material to art, colors, and metaphors.
    *   *Viktor* (Hard) — Demands mathematical precision and rigorous logic.
    *   *Prof. Vuk* (Extreme) — Arogant genius who rejects non-academic explanations.
*   **Speech Recognition & Synthesis (STT/TTS)**: Talk to your students using real-time speech-to-text, and listen to their synthesized voice responses.
*   **Automated Evaluation & Exams**: Administer custom multiple-choice exams. The AI student answers based on how well you explained the topic.
*   **Pedagogical Analytics**: Get immediate, detailed feedback on your teaching style (what went well, what needs improvement, and your final pedagogical score).
*   **Interactive Store & Leaderboard**: Earn IQ points from successful lectures, unlock new students in the shop, and compete for the top ranking.

---

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Motion (Framer Motion)
*   **Backend**: Express 4, Node.js, TSX (TypeScript execution)
*   **AI Integration**: OpenAI API (GPT-4o / Gemini-2.0-flash proxy), OpenAI TTS (voice), Web Speech API (speech-to-text)
*   **Database & Auth**: Supabase (Leaderboard, Documents library, User stats cloud sync, Email Authentication)

---

## ⚙️ Installation & Setup

### 1. Install Dependencies

You can install all dependencies from the root directory:

```bash
npm run install:all
```

*Alternatively, install them manually:*
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment Variables

Create the following configuration files in their respective folders:

#### 📁 `backend/.env`
```env
PORT=3001
OPENAI_MODEL=gpt-4o
OPENAI_API_KEY=your_openai_api_key
GITHUB_TOKEN=your_optional_github_pat_token

# Supabase Configurations
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 📁 `frontend/.env.local`
```env
# Supabase Configurations
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Set Up Supabase Database Tables

Execute the following SQL commands in your Supabase SQL Editor to create all required database schemas:

```sql
-- 1. Leaderboard Table
create table leaderboard (
  id uuid default gen_random_uuid() primary key,
  username text not null unique,
  score integer not null default 0,
  updated_at timestamptz default now()
);

-- 2. Documents Library Table
create table documents (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  subject text default 'Opste',
  storage_path text not null,
  extracted_text text,
  file_size integer,
  created_at timestamptz default now()
);

-- 3. User Statistics Table (Cloud Sync)
create table user_stats (
  user_id uuid primary key,
  username text not null,
  iq_points integer not null default 60,
  student_level integer not null default 1,
  unlocked_students text[] default array['marko'],
  active_student_id text default 'marko',
  history jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
```

> [!IMPORTANT]
> Make sure to enable the **Email Provider** in the Supabase Dashboard under **Authentication > Providers** to allow user logins.

### 4. Setup Static Assets

To ensure student avatars and backgrounds render correctly, place your files in the `frontend/public/assets/` directory using these exact names:

*   **Login Screen Assets**:
    *   `login-bg.jpg` — Background image of the school entrance.
    *   `login-logo.png` — FEYNIT title logo.
*   **Student Avatars**:
    *   `student-marko.png` (Marko)
    *   `student_stefan.png` (Stefan)
    *   `student_jovana.png` (Jovana)
    *   `student_viktor.png` (Viktor)
    *   `student-vuk.png` (Prof. Vuk)
    *   `student-soon.png` (Placeholder for coming-soon slots)

---

## 🏃 Running Locally

To run both the backend server and frontend development client concurrently:

```bash
# Run from the root directory
npm run dev
```

*   **Frontend Client**: http://localhost:5173
*   **Backend Server**: http://localhost:3001

---

## 📁 Project Directory Structure

```
feynit/
├── backend/
│   ├── content/          # Cached local document uploads
│   ├── server.ts         # Express server & AI endpoint proxies
│   └── package.json
├── frontend/
│   ├── public/assets/    # Visual backgrounds, avatars, and fonts
│   ├── src/
│   │   ├── components/   # Shared UI components (e.g. IQ Level Badge)
│   │   ├── data/         # Mock data and student profiles (students.ts)
│   │   ├── lib/          # AI client helper, translations, and Supabase client
│   │   ├── pages/        # Scene screens (Classroom, Store, Leaderboard, Analytics)
│   │   ├── App.tsx       # Main router and state manager
│   │   └── main.tsx
│   └── package.json
└── README.md
```

---

## 📜 License

Copyright (c) 2026 SPIRIT. All rights reserved.
Licensed under the [MIT License](LICENSE).