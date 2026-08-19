# 🚀 ReachInbox — Distributed Email Scheduler Platform

A production-grade, distributed cold outreach and email scheduling platform built with **React**, **Node.js/Express**, **TypeScript**, **BullMQ**, **Redis**, **PostgreSQL/Prisma**, and **Google OAuth 2.0 / SMTP**.

[![Live Demo](https://img.shields.io/badge/Frontend-Vite%20%2B%20React%2018-blue)](http://localhost:5173)
[![API Health](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-green)](http://localhost:5000/api/health)
[![Queue](https://img.shields.io/badge/Queue-BullMQ%20%2B%20Redis-red)](https://bullmq.io/)
[![Database](https://img.shields.io/badge/ORM-Prisma%20%2B%20PostgreSQL-3982CE)](https://www.prisma.io/)

---

## ✨ Features & Architecture

- **⚡ Distributed Delayed Email Scheduling**: Bulk queues emails using BullMQ delayed jobs with deterministic timestamp offsets.
- **🛡️ Atomic Redis Rate Limiting**: Enforces strict hourly sender throughput limits via sliding window algorithms.
- **✉️ Native Gmail & Ethereal SMTP Modes**: Switch between live Ethereal sandbox previews and direct Gmail inbox delivery with verified SPF/DKIM headers.
- **📂 Universal CSV/TXT Recipient Parser**: Automatically extracts clean emails from `.csv` and `.txt` files with Windows BOM stripping and variable auto-replacement (`{{name}}`).
- **📊 Real-Time Interactive Dashboard**: 1.5s live polling for scheduled queues, active worker concurrency, delivered emails, and failure tracking.
- **🔐 Google OAuth 2.0 & Direct Email Login**: Authenticate seamlessly via Google OAuth or direct developer email login.

---

## 🏗️ System Architecture

```
[ Frontend (React + Vite + Tailwind) ]
                │
         HTTP REST APIs
                │
                ▼
[ Backend API Server (Express + TypeScript) ]
        │                       │
   PostgreSQL (Prisma)     Redis (BullMQ)
                                │
                                ▼
                   [ Worker Queue Processor ]
                                │
                   ┌────────────┴────────────┐
                   ▼                         ▼
          [ Ethereal Sandbox ]      [ Google Gmail SMTP ]
          (Test Preview URLs)       (Primary Inbox Delivery)
```

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** >= 18
- **Redis** & **PostgreSQL** (or run with automatic memory fallbacks)

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit **`http://localhost:5173`** to access the dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js, Express, TypeScript, BullMQ, ioredis, Nodemailer, Prisma ORM, Winston.
- **Authentication**: Passport.js Google OAuth 2.0 & JWT.
- **Testing**: Jest, Supertest.

---

## 📄 License
MIT © [Sasidhar](https://github.com/sasi3344)
