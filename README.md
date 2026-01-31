# 🌌 MyNova (Beta)

**MyNova** is a **self-hosted personal space** designed to help you stay intentional with your time, goals, and daily flow — privately, calmly, and without noise.

This repository contains the **Beta version** of MyNova.  
It is intended for **early testers and developers** who are comfortable with Git and basic deployment workflows.

---

## ✨ What Is MyNova?

MyNova is **not** just a productivity app.

It’s a place where:
- You decide what matters today
- You capture ideas before they disappear
- You move forward in small, honest steps
- Your data stays **yours**

No feeds.  
No pressure.  
No public metrics.

Just you and your flow.

---

## 🧪 Beta Status

This is a **Beta Release**.

That means:
- Core features are already functional
- Some systems (EXP, profile cosmetics, achievements) are still evolving
- Installation currently assumes **technical familiarity**

⚠️ **Important**  
This beta version is recommended for:
- Developers
- Indie hackers
- Power users
- Curious builders

A more beginner-friendly version will be released later.

---

## 🧩 Core Features (Beta)

### 🏠 Core Pages
- **Hero / Daily Focus**
- **Todo**
- **Vision**
  - Goals
  - Ideas
- **Wishlist**
- **Tips**
- **Notes**
- **Pomodoro**
- **Profile** (basic)
- **Achievements** (foundation)

---

### 🎯 Goals & Progress
- Goals with milestone breakdown
- Automatic progress calculation
- Visual progress tracking
- Clean, distraction-free UI

---

### ⏱ Pomodoro System
- Custom focus & break duration
- Multiple sessions
- Persistent timer (keeps running across pages)
- Designed for calm focus, not pressure

---

### 🧠 Gamification (In Progress)
- EXP system
- Level progression
- Achievements (foundation ready)
- Designed to **support motivation**, not replace discipline

---

### 🔐 Privacy First
- **Self-hosted**
- Your database
- Your authentication
- Your control

No shared analytics.  
No selling your data.  
No tracking behavior for ads.

---

## 🏗 Tech Stack

- **Next.js**
- **Clerk** — Authentication
- **Neon** — PostgreSQL Database
- **Prisma** — ORM
- **Vercel** — Deployment
- **Zustand** — Global State
- **GSAP** — Motion & Micro-interactions

---

## 🚀 Installation

👉 **See `INSTALLATION.md`**

The installation guide covers:
- GitHub setup
- Clerk authentication
- Neon database
- Environment variables
- Vercel deployment
- Admin-only locking system

---

## 🔒 Security Model

MyNova uses an **Admin Lock System**:
- First login creates your user
- Your Clerk User ID becomes the admin
- All other users are blocked

This ensures:
- Single-owner usage
- Maximum privacy
- No accidental sharing

---

## 🧭 Philosophy

MyNova is built on a simple idea:

> “If you don’t decide your day, your day will decide for you.”

This project focuses on:
- Calm structure
- Intentional planning
- Small, consistent wins
- Long-term clarity

No hustle culture.  
No dopamine farming.  
No fake productivity.

---

## 🧪 Feedback

This beta exists for learning.

If you are testing this:
- Be honest
- Be critical
- Be kind

Your feedback helps shape V1.

---

## 🌱 Roadmap (High Level)

- Profile customization
- Cosmetic progression (avatars, frames, pets)
- Daily login rewards
- Shop & currency system
- Scheduled todos
- Backup & import/export
- AI assistant (optional, V3+)

---

## 🧠 Final Note

MyNova is not meant to compete with everything.

It’s meant to be **one place** that quietly supports your life.

If it helps you move forward — even 1% —  
then it’s doing its job.
