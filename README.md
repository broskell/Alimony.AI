# Alimony.AI

A enterprise-grade legal-tech SaaS platform providing AI-powered matrimonial and family law assistance in India. Alimony.AI empowers individuals and legal professionals with advanced alimony calculation engines, bar-verified lawyer discovery and booking, active case management, legal document drafting templates, and real-time legal research tools.

## Key Features

- **Advanced Alimony & Maintenance Calculator** — Implements Supreme Court guidelines from *Rajnesh v. Neha (2020)*, adjusting for 12 statutory legal factors, dependent children, state-specific multipliers, and standard of living benchmarks.
- **Lawyer Discovery & Booking** — Secure directory of Bar Council-verified family law advocates with state, city, language, and budget filters, and full-featured appointment scheduling.
- **Lex AI Legal Assistant** — A streaming legal research assistant specialized in Indian family law (HMA, SMA, DV Act, CrPC Section 125) providing context-aware precedent suggestions and guidance.
- **Case Management Tracker** — Keep track of hearing timelines, legal filings, and key case details with automated AI-generated case briefs.
- **Legal Document Generation** — Instant template generation for petitions, notices, and legal declarations.
- **Comprehensive Legal Library** — Full library of Acts, sections, and landmark court precedents with explanations.
- **Secure PDF Reports** — Professional, court-ready calculation reports generated instantly.

## Architecture & Technology Stack

Alimony.AI is built on a highly performant and secure modern architecture:

- **Frontend:** React 18 + Vite + Tailwind CSS + Framer Motion for premium fluid interactions, with state managed via lightweight Zustand stores.
- **Backend:** Node.js + Express API designed with robust security middleware, structured controllers, and query pipelines.
- **Database:** Prisma ORM connected to PostgreSQL for secure, relational, and transaction-safe schema storage.
- **AI Engine:** Google Gemini (`gemini-2.0-flash`) integrating streaming Server-Sent Events (SSE) for sub-second chat response latency.

---

## Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL database instance named `alimony`

### 1. Database Configuration

Navigate to the server directory, copy the environment file, and apply database migrations:

```bash
cd server
cp .env.example .env
# Configure your database connection string in the newly created .env file
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

### 2. Run the Backend API Server

Install dependencies and start the backend development server:

```bash
cd server
npm install
npm run dev
```

The API server will run at `http://localhost:5000`.

### 3. Run the Frontend Client Application

Navigate to the client directory, install dependencies, and spin up the frontend Vite server:

```bash
cd client
npm install
npm run dev
```

The application client will run at `http://localhost:5173`.

---

## User Accounts for Local Evaluation

| Email | Password | Role |
|-------|----------|------|
| client@demo.com | Demo@1234 | Client |
| lawyer@demo.com | Demo@1234 | Lawyer |
| admin@demo.com | Demo@1234 | Admin |

*Disclaimer: Alimony.AI provides informational tools and automated templates. It does not constitute formal legal advice. Always consult a licensed advocate for professional legal proceedings.*
