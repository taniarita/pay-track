# pay-track

Expense management app for companies. Employees submit expenses; managers approve or reject them with a reason.

Built with Next.js 16 (App Router), Prisma 7, Neon (PostgreSQL), NextAuth v5, and Tailwind CSS.

---

## Prerequisites

- Node.js 18+
- A free [Neon](https://neon.tech) account (no local PostgreSQL needed)

---

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd pay-track
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in the three values:

```env
DATABASE_URL="postgresql://..."   # connection string from Neon
AUTH_SECRET="..."                  # any random string (e.g. run: openssl rand -base64 32)
NEXTAUTH_URL="http://localhost:3000"
```

**Getting the Neon connection string:**
1. Create a project at [neon.tech](https://neon.tech)
2. Go to your project → **Connection Details**
3. Copy the **connection string** (starts with `postgresql://`)

### 3. Run migrations and seed

```bash
npx prisma migrate deploy
npm run db:seed
```

The seed creates 6 demo users (password for all: `demo1234`):

| Email | Role |
|---|---|
| manager1@example.com | Manager |
| manager2@example.com | Manager |
| employee1@example.com | Employee |
| employee2@example.com | Employee |
| employee3@example.com | Employee |
| employee4@example.com | Employee |

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with any seed account.

---

## Testing

```bash
npm test           # unit and integration tests (Vitest)
npm run test:e2e   # end-to-end tests (Playwright, requires dev server running)
```

---

## Project structure

```
app/
  api/expenses/          # REST API routes
  employee/              # employee pages (submit, history)
  manager/               # manager pages (review queue)
  login/                 # login page
lib/                     # business logic (validation, auth)
prisma/                  # schema, migrations, seed
components/              # shared UI components
__tests__/               # unit and integration tests
e2e/                     # Playwright end-to-end tests
```

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL via [Neon](https://neon.tech) |
| ORM | Prisma 7 |
| Auth | NextAuth v5 (Credentials + JWT) |
| UI | Tailwind CSS + shadcn/ui |
| Unit/integration tests | Vitest |
| E2E tests | Playwright |
