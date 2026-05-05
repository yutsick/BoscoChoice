# Bosco Choice

A quiz application where questions cycle through categories in round-robin order. Built with Next.js 15, Payload CMS v3, and PostgreSQL (Neon).

## Features

- **Category-based quiz** — questions rotate through subcategories within the selected category (sub1 → sub2 → sub3 → sub1 → ...)
- **No repeats per session** — each question is shown only once until the browser tab is closed (sessionStorage)
- **Admin panel** — Payload CMS with role-based access (superadmin / category_admin)
- **Bulk import** — upload JSON or CSV files to create questions in bulk (superadmin only)
- **Animated UI** — slide transitions and category-colored overlays (Framer Motion)

## Stack

- **Next.js 15** (App Router)
- **Payload CMS v3** (embedded admin)
- **PostgreSQL** via [Neon](https://neon.tech) (cloud-hosted, no Docker needed)
- **Tailwind CSS** + **Framer Motion**
- **Vercel** deployment

## Getting Started

```bash
npm install
npm run dev
```

### Environment Variables

Create a `.env.local` file:

```env
DATABASE_URI=postgresql://user:pass@ep-xxx.neon.tech/dbname
PAYLOAD_SECRET=your-32-char-random-string
NEXT_PUBLIC_SERVER_URL=http://localhost:3000
```

## Project Structure

```
app/(frontend)/page.tsx          — Home page (category grid)
app/(frontend)/quiz/[slug]/      — Quiz page
app/(payload)/admin/             — Payload admin panel
app/api/import-questions/        — Bulk import endpoint
collections/                     — Payload collection configs
components/QuizClient.tsx        — Quiz client component
lib/quiz-engine.ts               — Round-robin queue builder
```

## Roles

| Role           | Permissions                                                  |
|----------------|--------------------------------------------------------------|
| superadmin     | Full CRUD on everything, bulk import                         |
| category_admin | CRUD on questions & subcategories within assigned category   |

## Bulk Import

Superadmins can import questions via the admin dashboard or the API endpoint.

**JSON format:**
```json
[
  {
    "title": "Admin label",
    "content": "Question text",
    "categorySlug": "history",
    "subcategoryName": "Ancient History"
  }
]
```

**CSV format:**
```csv
title,content,categorySlug,subcategoryName
"Admin label","Question text","history","Ancient History"
```

Categories and subcategories must already exist in the database.

## Scripts

| Command              | Description                     |
|----------------------|---------------------------------|
| `npm run dev`        | Start development server        |
| `npm run build`      | Production build                |
| `npm run start`      | Start production server         |
| `npm run generate:types` | Regenerate Payload types    |
