# 📚 smartSakhi (RETROPREP)
> **The Unified Academic & Wellness Engine for Modern Engineering Students.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-smartSakhi-22c55e?style=for-the-badge&logo=vercel)](https://smart-sakhi-two.vercel.app)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-18181b?style=for-the-badge&logo=github)](https://github.com/akash-912/smartSakhi)

smartSakhi is a full-stack, production-ready workspace engineered to solve the fragmentation of university resources. It centralizes dynamic syllabus tracking, AI-driven mentorship, and peer-to-peer mental wellness support into a single, highly scalable platform. 

---

## 🚀 Impact & Engineering Highlights

* **Scalable Relational Architecture:** Designed a highly normalized PostgreSQL database via Supabase to handle complex academic hierarchies (Branches → Semesters → Subjects → Units → Topics), ensuring rapid data retrieval over traditional NoSQL alternatives.
* **Enterprise-Grade Security:** Implemented comprehensive Row Level Security (RLS) policies and JWT-based authentication to ensure strict data isolation and secure an exclusive Admin Portal for live curriculum mutations.
* **AI-Powered Mentorship Engine:** Integrated a context-aware Large Language Model to power a 24/7 AI Tutor capable of generating targeted question papers, evaluating subjective answers with rigorous rubrics, and providing non-judgmental "AI Comfort" for student wellness.
* **Gamified User Engagement:** Engineered a GitHub-style 180-day activity heatmap and a dynamic "Compassion Leaderboard" to drive daily active usage (DAU) and foster a positive, supportive peer ecosystem.
* **Optimized Cloud Storage:** Utilized direct Supabase Storage bucket integration for seamless, low-latency hosting and retrieval of heavy academic assets (PDFs, PYQs).

---

## 💡 Core Modules

### 1. Unified Syllabus & Progress Engine
* Branch and semester-specific dynamic rendering.
* Granular, topic-level progress tracking mapped directly to database relationships.
* Centralized access to study materials, PYQs, and curated YouTube playlists.

### 2. The Safe Space (Mental Wellness)
* A secure, anonymous peer-to-peer forum mitigating academic burnout.
* **Compassion Leaderboard:** Incentivizes positive community support through a point-based reward system.
* **AI Comfort:** An empathetic, automated responder for immediate psychological first-aid during odd hours.

### 3. Smart Planning & Analytics
* Integrated Mid-Semester, End-Semester, and Daily task planners.
* Real-time visual analytics, including a dynamic consistency graph and circular progress indicators.

### 4. Admin Command Center
* PIN-protected operational gateway.
* Live database mutations for managing the curriculum engine without deploying code changes.

---

## 🛠️ Technical Stack

**Frontend Architecture:**
* **Core:** React.js, Vite
* **Styling:** Tailwind CSS (Custom Dark Premium UI)
* **Data Visualization:** `react-calendar-heatmap` (Customized), Lucide Icons

**Backend & Infrastructure (BaaS):**
* **Database:** PostgreSQL (Supabase)
* **Authentication:** Supabase Auth (JWT)
* **Object Storage:** Supabase Storage Bucket
* **Deployment:** Vercel

---

## ⚙️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/akash-912/smartSakhi.git](https://github.com/akash-912/smartSakhi.git)
   cd smartSakhi