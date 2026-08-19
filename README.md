# 🚀 ReachInbox — Distributed Email Scheduler Platform

A production-grade, distributed cold outreach and email scheduling platform built with **React**, **Node.js/Express**, **TypeScript**, **BullMQ**, **Redis**, **PostgreSQL/Prisma**, and **Google OAuth 2.0 / SMTP**.

[![Live Web App](https://img.shields.io/badge/Live%20App-GitHub%20Pages-success?style=for-the-badge&logo=github)](https://sasi3344.github.io/reachinbox-email-scheduler/)
[![Railway Backend](https://img.shields.io/badge/Railway-Live%20API-blueviolet?style=for-the-badge&logo=railway)](https://reachinbox-email-scheduler-production-d5fc.up.railway.app/api/health)
[![Queue Engine](https://img.shields.io/badge/Queue-BullMQ%20%2B%20Redis-red?style=for-the-badge&logo=redis)](https://bullmq.io/)
[![Database ORM](https://img.shields.io/badge/ORM-Prisma%20%2B%20PostgreSQL-3982CE?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

---

## 🌐 Live Production Deployments

| Component | Live Deployment URL | Status |
| :--- | :--- | :--- |
| 🖥️ **Frontend Web Application (Primary)** | [**`https://sasi3344.github.io/reachinbox-email-scheduler/`**](https://sasi3344.github.io/reachinbox-email-scheduler/) | 🟢 **Live Online** |
| ⚡ **Frontend Web Application (Mirror)** | [**`https://hip-clouds-write.loca.lt`**](https://hip-clouds-write.loca.lt) *(Tunnel IP: `103.191.40.65`)* | 🟢 **Instant Public Access** |
| ⚙️ **Backend API Server (Railway Cloud)** | [**`https://reachinbox-email-scheduler-production-d5fc.up.railway.app`**](https://reachinbox-email-scheduler-production-d5fc.up.railway.app) | 🟢 **Live Online** |
| 📡 **Backend Health Check Endpoint** | [**`https://reachinbox-email-scheduler-production-d5fc.up.railway.app/api/health`**](https://reachinbox-email-scheduler-production-d5fc.up.railway.app/api/health) | 🟢 **HTTP 200 OK** |

---

## ✨ Features & Architecture

- **⚡ Distributed Delayed Email Scheduling**: Bulk queues emails using BullMQ delayed jobs with deterministic timestamp offsets.
- **🛡️ Atomic Redis Rate Limiting**: Enforces strict hourly sender throughput limits via sliding window algorithms.
- **✉️ Native Gmail & Ethereal SMTP Modes**: Switch between live Ethereal sandbox previews and direct Gmail inbox delivery with verified SPF/DKIM headers.
- **📂 Universal CSV/TXT Recipient Parser**: Automatically extracts clean emails from `.csv` and `.txt` files with Windows BOM stripping and variable auto-replacement (`{{name}}`).
- **📊 Real-Time Interactive Dashboard**: 1.5s live polling for scheduled queues, active worker concurrency, delivered emails, and failure tracking.
- **🔐 Google OAuth 2.0 & Direct Email Login**: Authenticate seamlessly via Google OAuth or direct developer email login.
- **👤 Custom Sender Display Name**: Compose outreach campaigns with custom sender names formatted dynamically as `"Name" <email@domain.com>`.

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

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js** >= 20
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

Visit **`http://localhost:5173`** to access the local dashboard.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Axios.
- **Backend**: Node.js 20, Express, TypeScript, BullMQ, ioredis, Nodemailer, Prisma ORM, Winston.
- **Authentication**: Passport.js Google OAuth 2.0 & JWT.
- **Deployment**: Docker, Railway, GitHub Actions, GitHub Pages.

---

## 📄 License
MIT © [Sasidhar](https://github.com/sasi3344)
