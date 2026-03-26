# PRD: Corporate Expense Management MVP

## Problem Statement

Companies need a way for employees to submit work-related expenses and for managers to review and act on them. Without a dedicated tool, this process relies on email threads, spreadsheets, or paper forms — leading to lost submissions, unclear status, and slow reimbursement cycles. Employees have no visibility into whether their expense was approved or why it was rejected. Managers have no structured queue to work from.

## Solution

A lightweight web application where employees can submit expense reports and managers can approve or reject them. The system gives employees full visibility into the status of their submissions, including rejection reasons, and gives managers a clean queue-based interface to act on pending expenses. The product is intentionally minimal: no file uploads, no multi-currency, no notifications, no hierarchy — just a clean, reliable flow from submission to decision.

## User Stories

### Authentication
1. As an employee, I want to log in with my email and password, so that I can access my personal expense dashboard.
2. As a manager, I want to log in with my email and password, so that I can access the expense review queue.
3. As any user, I want to be redirected to my role-specific dashboard after login, so that I land in the right place immediately.
4. As any user, I want to be redirected to the login page if I try to access a protected route without being authenticated, so that unauthorized access is prevented.
5. As any user, I want to log out of the application, so that my session is terminated securely.

### Expense Submission (Employee)
6. As an employee, I want to submit an expense with a title, amount, category, date, and optional description, so that I can request reimbursement for a work-related cost.
7. As an employee, I want to choose a category from a predefined list (meals, transport, accommodation, other), so that my expense is properly classified.
8. As an employee, I want the form to validate that required fields are filled and the amount is a positive number, so that I cannot submit an incomplete or invalid expense.
9. As an employee, I want to see a confirmation after successfully submitting an expense, so that I know my submission was received.

### Expense History (Employee)
10. As an employee, I want to see a list of all my submitted expenses, so that I can track what I've submitted.
11. As an employee, I want to see the current status of each expense (pending, approved, rejected), so that I know where each one stands.
12. As an employee, I want to see the rejection reason for any expense that was rejected, so that I understand why it was not approved.
13. As an employee, I want my expense list sorted by submission date (most recent first), so that I can quickly see my latest submissions.

### Expense Review (Manager)
14. As a manager, I want to see a queue of all pending expenses from all employees, so that I can review and act on them.
15. As a manager, I want to see the title, amount, category, date, description, and submitting employee for each pending expense, so that I have enough context to make a decision.
16. As a manager, I want to approve a pending expense with a single action, so that the employee is informed of the outcome.
17. As a manager, I want to reject a pending expense and provide a rejection reason, so that the employee understands why their expense was not approved.
18. As a manager, I want the rejection reason to be required when rejecting an expense, so that employees always receive meaningful feedback.
19. As a manager, I want an approved or rejected expense to disappear from my pending queue immediately, so that my queue always reflects only actionable items.
20. As a manager, I want to see a message when the pending queue is empty, so that I know there is nothing left to review.

### Role Access Control
21. As an employee, I want to be prevented from accessing manager-only pages, so that I cannot act on other employees' expenses.
22. As a manager, I want to be prevented from accessing employee-only pages (like the submission form), so that the interface stays role-appropriate.

## Implementation Decisions

### Roles and Auth
- Two roles: `EMPLOYEE` and `MANAGER`. Flat hierarchy — any manager can approve any expense.
- Authentication via NextAuth.js using the Credentials provider (email + password).
- Passwords stored as bcrypt hashes.
- Role stored on the `User` model and included in the NextAuth session/JWT.
- Route protection via Next.js middleware: unauthenticated users redirect to `/login`; wrong-role users redirect to their own dashboard.

### Data Model
- **User**: id, email, passwordHash, role (EMPLOYEE | MANAGER), createdAt
- **Expense**: id, title, amount (decimal), category (MEALS | TRANSPORT | ACCOMMODATION | OTHER), date, description (optional), status (PENDING | APPROVED | REJECTED), rejectionReason (optional), submittedById (FK → User), createdAt, updatedAt

### Status Machine
- Expenses are created with status `PENDING`.
- Valid transitions: `PENDING → APPROVED`, `PENDING → REJECTED`.
- No other transitions are permitted. Once decided, an expense is immutable.

### API Design
- `POST /api/expenses` — create a new expense (employee only)
- `GET /api/expenses` — list expenses (employee: own only; manager: all pending)
- `PATCH /api/expenses/[id]/approve` — approve an expense (manager only)
- `PATCH /api/expenses/[id]/reject` — reject an expense with a reason (manager only)

### Pages
- `/login` — shared login page for all users
- `/` — root redirect based on role after login
- `/employee/submit` — expense submission form (employee only)
- `/employee/expenses` — expense history with statuses (employee only)
- `/manager/expenses` — pending expense queue with approve/reject (manager only)

### Modules
- **Auth module**: NextAuth configuration, Credentials provider, session/JWT callbacks with role
- **Expense service**: business logic for creating expenses, listing by role/status, applying status transitions with validation
- **Role middleware**: Next.js middleware that enforces authentication and role-based route access
- **Database layer**: Prisma schema, client singleton, seed script

### Seeding
- Seed script creates 2 managers and 4 employees with known credentials for demo purposes.
- Credentials: `manager1@demo.com`, `manager2@demo.com`, `employee1@demo.com` through `employee4@demo.com` — all with password `demo1234`.

### Infrastructure
- Next.js (App Router) deployed to Vercel
- PostgreSQL hosted on Neon (serverless, free tier)
- Prisma as ORM
- Tailwind CSS + shadcn/ui for styling

## Testing Decisions

### Philosophy
Tests should verify that the system behaves correctly from the user's perspective. Only test external behavior — what goes in and what comes out — not internal implementation details. A good test would catch a real bug that a user would experience, not a refactor that doesn't change behavior.

### Unit Tests
- **Expense status transitions**: verify that `PENDING → APPROVED` and `PENDING → REJECTED` are the only valid transitions. Attempting any other transition should return an error.
- **Expense validation**: verify that amount must be positive, required fields cannot be empty, and category must be one of the allowed values.

### Integration Tests
- **API route behavior**: test that `POST /api/expenses` creates an expense and returns the correct shape; that `PATCH .../approve` changes status; that `PATCH .../reject` requires a reason; that role enforcement returns 403 for unauthorized roles.

### End-to-End Tests (Playwright)
- **Employee submits an expense**: log in as employee, fill out the form, submit, verify the expense appears in history with status `pending`.
- **Manager approves an expense**: log in as manager, find a pending expense, approve it, verify it disappears from the queue.
- **Manager rejects an expense with a reason**: log in as manager, reject a pending expense with a reason, verify it disappears from the queue.
- **Employee sees rejection reason**: log in as employee, verify a rejected expense shows the rejection reason inline.
- **Role access control**: verify an employee cannot access `/manager/expenses` and is redirected.

## Out of Scope

- Receipt or file attachment uploads
- Email or in-app notifications when expense status changes
- Expense editing or resubmission after rejection
- Draft expenses (save before submitting)
- Manager requesting revisions (only approve or reject)
- Multi-currency support
- Expense filtering, sorting, or search
- Manager-to-employee assignment (any manager sees all expenses)
- Admin or HR roles
- User registration (accounts created only via seed script)
- Audit logs or expense history for managers
- Mobile-native app (web only, but responsive)
- Analytics, charts, or spending dashboards

## Further Notes

- This is a hackathon MVP. Scope is intentionally minimal. Every decision was made to maximize clarity and demo quality within tight time constraints.
- Inspired by Caju (Brazilian HR tech / corporate benefits platform). The product simulates a realistic corporate expense flow without the complexity of a production system.
- The seed script is the only way to create accounts. This is by design — no signup flow, no admin panel.
- shadcn/ui components should be used for all interactive elements (forms, tables, badges, buttons, dialogs) to ensure visual consistency with minimal custom CSS.
- Status badges on the employee history view should use distinct colors: yellow for pending, green for approved, red for rejected.
