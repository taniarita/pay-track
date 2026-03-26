# Plan: Corporate Expense Management MVP

> Source PRD: ./prd/expense-management-mvp.md

## Architectural decisions

- **Routes**: `/login`, `/` (role-based redirect), `/employee/submit`, `/employee/expenses`, `/manager/expenses`
- **Schema**: `User` (id, email, passwordHash, role, createdAt) · `Expense` (id, title, amount, category, date, description, status, rejectionReason, submittedById, createdAt, updatedAt)
- **Key models**: `Role` enum — `EMPLOYEE | MANAGER` · `ExpenseStatus` enum — `PENDING | APPROVED | REJECTED` · `ExpenseCategory` enum — `MEALS | TRANSPORT | ACCOMMODATION | OTHER`
- **Status machine**: only `PENDING → APPROVED` and `PENDING → REJECTED` are valid transitions; decided expenses are immutable
- **Auth**: NextAuth.js Credentials provider · bcrypt password hashing · role stored in JWT and session · Next.js middleware enforces authentication and role-based access
- **Stack**: Next.js (App Router) · Prisma ORM · PostgreSQL on Neon · Tailwind CSS · shadcn/ui · Vercel deployment
- **Testing approach**: TDD from Phase 2 onwards — write failing tests first, implement the minimum to pass, then refactor. Unit tests for business logic, integration tests for API routes, E2E with Playwright for user journeys.

---

## Phase 1: Project Setup

**User stories**: none (infrastructure only)

### What to build

Bootstrap the full project infrastructure so that every subsequent phase starts from a working, connected foundation. No application logic yet — just the scaffolding that everything else will build on.

1. Scaffold Next.js project with App Router and TypeScript
2. Install and configure Tailwind CSS and shadcn/ui
3. Install Prisma, connect to Neon (PostgreSQL), run initial migration with `User` model
4. Install NextAuth.js, configure Credentials provider and Prisma adapter, set required environment variables
5. Write and run seed script (2 managers + 4 employees, all with password `demo1234`)

### Acceptance criteria

- [ ] `npm run dev` starts the project without errors
- [ ] Prisma connects to Neon and the `User` table exists in the database
- [ ] `npm run db:seed` creates 6 demo users without errors
- [ ] NextAuth is installed and configured (config file + adapter in place), even if login is not functional yet
- [ ] shadcn/ui is installed and a sample component renders correctly

---

## Phase 2: Authentication

**User stories**: 1, 2, 3, 4, 5, 21, 22

### What to build

A complete working auth flow, built with TDD. By the end of this phase, a user can log in with email and password, receive a session with their role, be redirected to the correct dashboard, and log out. Middleware blocks unauthenticated and wrong-role access.

**TDD cycle:**
- Write tests for login API: valid credentials, wrong password, unknown email
- Write tests for middleware: unauthenticated access, correct-role access, wrong-role access
- Write E2E tests: employee login → redirected to `/employee/expenses`; manager login → redirected to `/manager/expenses`
- Implement login page, session with role in JWT, middleware, and root redirect to make tests pass

### Acceptance criteria

- [ ] Logging in with valid credentials creates a session and redirects to the role-specific dashboard
- [ ] Logging in with wrong password or unknown email returns an error message
- [ ] Visiting any protected route without a session redirects to `/login`
- [ ] An employee visiting `/manager/expenses` is redirected away
- [ ] A manager visiting `/employee/submit` is redirected away
- [ ] Logging out clears the session and redirects to `/login`
- [ ] Login API tests pass: valid credentials, wrong password, unknown email
- [ ] Middleware tests pass: unauthenticated, correct-role, wrong-role
- [ ] E2E tests pass: employee and manager login flows with correct redirects

---

## Phase 3: Expense Submission + Employee History

**User stories**: 6, 7, 8, 9, 10, 11, 13

### What to build

A complete vertical slice for the employee side, built with TDD. By the end of this phase, an employee can submit an expense via a form and view all their submissions in a history list with status badges.

**TDD cycle:**
- Write unit tests for expense validation logic (required fields, amount > 0, valid category)
- Write integration tests for `POST /api/expenses`: creates expense, rejects invalid input, rejects manager role
- Write integration tests for `GET /api/expenses` as employee: returns only own expenses, sorted by date descending
- Write E2E test: employee submits expense → sees it in history with `pending` badge
- Implement `Expense` schema migration, API routes, form, and history page to make tests pass

### Acceptance criteria

- [ ] `Expense` model added to Prisma schema and migrated
- [ ] `POST /api/expenses` creates an expense with status `PENDING` and returns it
- [ ] `POST /api/expenses` returns 400 for missing required fields or invalid amount
- [ ] `POST /api/expenses` returns 403 if called by a manager
- [ ] `GET /api/expenses` returns only the authenticated employee's own expenses, sorted by `createdAt` descending
- [ ] Submission form validates required fields before submitting
- [ ] A success message is shown after a successful submission
- [ ] History page shows title, amount, category, date, and a status badge per expense
- [ ] Status badge colors: yellow for `pending`, green for `approved`, red for `rejected`
- [ ] Unit tests pass: validation logic
- [ ] Integration tests pass: POST and GET routes
- [ ] E2E test passes: submit expense → appears in history with `pending` badge

---

## Phase 4: Manager Review Queue

**User stories**: 12, 14, 15, 16, 17, 18, 19, 20

### What to build

A complete vertical slice for the manager side, built with TDD. By the end of this phase, a manager can see all pending expenses, approve or reject each one (rejection requires a reason), and see the queue update immediately. Employees can see the updated status and rejection reason in their history.

**TDD cycle:**
- Write unit tests for status transition logic: only `PENDING → APPROVED` and `PENDING → REJECTED` are valid; any other transition is rejected
- Write integration tests for `PATCH /api/expenses/[id]/approve`: approves expense, returns 403 for employee, returns 400 if already decided
- Write integration tests for `PATCH /api/expenses/[id]/reject`: requires reason, returns 403 for employee, returns 400 if already decided
- Write integration tests for `GET /api/expenses` as manager: returns all `PENDING` expenses from all employees
- Write E2E tests: manager approves → disappears from queue; manager rejects → disappears from queue; employee sees rejection reason
- Implement API routes and manager queue page to make tests pass

### Acceptance criteria

- [ ] `GET /api/expenses` as manager returns all `PENDING` expenses from all employees, including submitter info
- [ ] `PATCH /api/expenses/[id]/approve` transitions expense to `APPROVED`
- [ ] `PATCH /api/expenses/[id]/reject` transitions expense to `REJECTED` and stores the rejection reason
- [ ] `PATCH /api/expenses/[id]/reject` returns 400 if rejection reason is empty or missing
- [ ] Both PATCH routes return 403 if called by an employee
- [ ] Both PATCH routes return 400 if the expense is not in `PENDING` status
- [ ] Approved or rejected expenses disappear from the manager queue immediately after action
- [ ] Manager queue shows an empty state message when there are no pending expenses
- [ ] Employee history shows the rejection reason inline for rejected expenses
- [ ] Unit tests pass: valid and invalid status transitions
- [ ] Integration tests pass: approve, reject, and GET routes
- [ ] E2E tests pass: approve flow, reject flow, employee sees rejection reason
