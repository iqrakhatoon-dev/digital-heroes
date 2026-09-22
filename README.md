# Digital Heroes — Golf. Give. Win.

> A subscription-driven golf performance and charity draw platform. Track Stableford scores, support a cause you believe in, and compete for monthly prizes.

![Digital Heroes](https://img.shields.io/badge/Status-Production%20Ready-4ECBA0?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38BDF8?style=for-the-badge&logo=tailwindcss)

---

## What is Digital Heroes?

Digital Heroes is a web platform where golfers:

- **Subscribe** monthly or yearly
- **Enter their last 5 Stableford scores** (rolling window)
- **Participate in monthly draws** — match 3, 4, or 5 numbers to win
- **Support a charity** of their choice with every subscription

Every subscription splits into: **60% prize pool · 10%+ charity · platform costs.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS 3 |
| Auth & Database | Supabase (PostgreSQL + RLS) |
| Payments | Stripe Checkout |
| Routing | React Router v6 |
| Deployment | Vercel |
| Icons | Lucide React |
| Notifications | React Hot Toast |

---

## Features

### User Side
- ✅ Signup with 4-step onboarding (Plan → Account → Charity → Payment)
- ✅ Monthly & yearly subscription plans via Stripe
- ✅ Stableford score entry (1–45), rolling 5-score window
- ✅ One score per date — edit/delete supported
- ✅ Charity selection with adjustable contribution (10–100%)
- ✅ Monthly draw participation — automatic
- ✅ Dashboard — scores, draws, winnings, charity, subscription status
- ✅ Winner proof upload (screenshot of golf scores)
- ✅ Account settings — profile, charity, password

### Admin Side
- ✅ Overview — live stats (users, prize pool, charity raised)
- ✅ User management — search, filter, edit subscription/role
- ✅ Draw management — configure random or algorithm-weighted draws
- ✅ Draw simulation before publishing
- ✅ Jackpot rollover logic
- ✅ Charity management — add, edit, delete, feature
- ✅ Winner verification — approve/reject proof, mark as paid
- ✅ Reports & analytics — totals, draw history, plan breakdown

### Draw Engine
- **Random** — standard lottery-style (5 numbers from 1–45)
- **Algorithm** — weighted by score frequency across all active subscribers
- **Prize tiers** — 5-match jackpot (40%), 4-match (35%), 3-match (25%)
- **Jackpot rollover** — unclaimed jackpot carries to next month

---

## Project Structure

```
digital-heroes/
├── public/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx        # Auth state, session, profile
│   ├── lib/
│   │   ├── supabase.js            # Supabase client
│   │   ├── stripe.js              # Stripe config & plan definitions
│   │   ├── drawEngine.js          # Draw logic (random + algorithmic)
│   │   └── schema.sql             # Full DB schema — run in Supabase
│   ├── components/
│   │   └── layout/
│   │       ├── Navbar.jsx
│   │       ├── Footer.jsx
│   │       └── ProtectedRoute.jsx
│   └── pages/
│       ├── Home.jsx               # Landing page (split hero layout)
│       ├── Login.jsx              # Sign in
│       ├── Subscribe.jsx          # 4-step signup + subscription flow
│       ├── Charities.jsx          # Public charity directory
│       ├── HowItWorks.jsx         # Explainer page
│       ├── NotFound.jsx           # 404
│       ├── user/
│       │   ├── Dashboard.jsx      # User dashboard
│       │   └── Settings.jsx       # Account settings
│       └── admin/
│           ├── AdminLayout.jsx    # Sidebar layout
│           ├── AdminOverview.jsx  # Stats overview
│           ├── AdminUsers.jsx     # User management
│           ├── AdminDraws.jsx     # Draw management
│           ├── AdminCharities.jsx # Charity management
│           ├── AdminWinners.jsx   # Winner verification
│           └── AdminReports.jsx   # Reports & analytics
├── .env.example                   # Environment variable template
├── vercel.json                    # Vercel SPA routing config
├── tailwind.config.js
└── vite.config.js
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) account (free)
- A [Stripe](https://stripe.com) account (free, test mode)
- A [Vercel](https://vercel.com) account (free)

---

### 1. Clone & Install

```bash
git clone https://github.com/your-username/digital-heroes.git
cd digital-heroes
npm install
```

---

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) → Create a **new project**
2. Go to **SQL Editor** → **New query**
3. Copy the contents of `src/lib/schema.sql` → Paste → **Run**
4. Go to **Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

---

### 3. Setup Stripe

1. Go to [stripe.com](https://stripe.com) → Create account → **Test mode ON**
2. Go to **Products** → Add two products:

| Product | Price | Interval |
|---|---|---|
| Digital Heroes Monthly | £9.99 | Monthly |
| Digital Heroes Yearly | £89.99 | Yearly |

3. Copy each **Price ID** (`price_xxxxx`)
4. Go to **Developers → API Keys** → Copy **Publishable key** (`pk_test_xxxxx`)

---

### 4. Environment Variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...
VITE_STRIPE_MONTHLY_PRICE_ID=price_1...
VITE_STRIPE_YEARLY_PRICE_ID=price_1...
```

---

### 5. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

### 6. Create Admin Account

1. Sign up through the app at `/subscribe`
2. Go to **Supabase → Table Editor → profiles**
3. Find your row → Set `role` to `admin` → Save
4. Sign out → Sign back in → Access `/admin`

---

## Deployment (Vercel)

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "initial commit: Digital Heroes platform"
git branch -M main
git remote add origin https://github.com/iqrakhatoon-dev/digital-heroes.git
git push -u origin main
```

### Step 2 — Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repository
3. Framework: **Vite** (auto-detected)
4. Add all environment variables from `.env.local`
5. Click **Deploy**

> `vercel.json` 

### Step 3 — Update Supabase Auth URL

After deployment, go to:
**Supabase → Authentication → URL Configuration**

Add your Vercel URL:
```
Site URL: https://your-app.vercel.app
Redirect URLs: https://your-app.vercel.app/**
```

---

## Test Credentials

After setup, create these manually:

| Role | How to create |
|---|---|
| Admin | Sign up normally → set `role = admin` in Supabase |
| Subscriber | Sign up normally through `/subscribe` |

**Stripe test card:**
```
Card number : 4242 4242 4242 4242
Expiry      : Any future date
CVC         : Any 3 digits
```

---

## Draw System

The draw engine is in `src/lib/drawEngine.js`:

```
Monthly draw cadence
       ↓
Admin configures: Random or Algorithm
       ↓
Simulation runs — shows winners preview
       ↓
Admin publishes — results saved to DB
       ↓
Winners notified — upload score proof
       ↓
Admin verifies → marks as Paid
```

**Prize pool split:**
```
Total pool = 60% of all active subscriptions

5-match jackpot  → 40% (rolls over if unclaimed)
4-number match   → 35% (split among winners)
3-number match   → 25% (split among winners)
```

---

## PRD Checklist

- [x] Subscription system — monthly & yearly via Stripe
- [x] Score entry — rolling 5, Stableford 1–45, one per date
- [x] Draw system — random + algorithm-weighted
- [x] Jackpot rollover logic
- [x] 3-tier prize pool (40/35/25%)
- [x] Charity selection at signup
- [x] Charity contribution 10–100%
- [x] Charity directory with search & filter
- [x] Featured charity on homepage
- [x] Winner verification (proof upload, approve/reject)
- [x] Payout tracking (pending → paid)
- [x] User dashboard — all 5 required modules
- [x] Admin dashboard — all 5 control surfaces
- [x] Reports & analytics
- [x] 3 user roles (public, subscriber, admin)
- [x] Row Level Security on all tables
- [x] Responsive — mobile & desktop
- [x] Non-golf aesthetic — emotion-driven modern UI

---

## Built By

**Iqra Khatoon** — Full Stack Developer (MERN + React)  
[iqrakhatoon-dev.vercel.app](https://iqrakhatoon-dev.vercel.app)

---

*Digital Heroes · digitalheroes.co.in · Edition 2026*
