# UniEvents — Campus Event Management

> **Next.js 14** · **TypeScript** · **Tailwind CSS 3** · **Supabase**

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.local.example .env.local
# → fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# 3. Run dev server
npm run dev
# → http://localhost:3000
```

## Build

```bash
npm run build
npm start
```

---

## Tech Stack

| Layer       | Technology             | Version  |
|-------------|------------------------|----------|
| Framework   | Next.js App Router     | 14.2.3   |
| Language    | TypeScript             | 5.4.5    |
| Styling     | Tailwind CSS           | 3.4.4    |
| Database    | Supabase               | 2.x      |
| Charts      | Recharts               | 2.12.7   |
| QR Generate | qrcode                 | 1.5.3    |
| QR Scanner  | html5-qrcode           | 2.3.8    |

---

## Demo Accounts

| Role       | Email                | Notes                           |
|------------|----------------------|---------------------------------|
| Student    | `student@uni.edu`    | Browse, register, QR tickets    |
| Organiser  | `organiser@uni.edu`  | Dashboard, analytics, check-in  |

---

## Project Structure

```
unievent/
├── app/
│   ├── layout.tsx                  Root layout (fonts, ToastContainer)
│   ├── page.tsx                    Redirects / → /login
│   ├── globals.css                 Tailwind directives + dark theme globals
│   ├── (auth)/
│   │   ├── layout.tsx              Centred auth layout
│   │   └── login/page.tsx          Sign in + register
│   └── (app)/
│       ├── layout.tsx              Auth guard + Navbar wrapper
│       ├── browse/
│       │   ├── page.tsx            Student — browse & register for events
│       │   ├── BrowseClient.tsx
│       │   ├── loading.tsx
│       │   └── error.tsx
│       ├── my-events/
│       │   ├── page.tsx            Student — registrations, waitlist, past events
│       │   ├── MyEventsClient.tsx
│       │   ├── loading.tsx
│       │   └── error.tsx
│       ├── profile/
│       │   ├── page.tsx            Profile editor + notification preferences
│       │   ├── ProfileClient.tsx
│       │   ├── loading.tsx
│       │   └── error.tsx
│       ├── dashboard/
│       │   ├── page.tsx            Organiser — stats + event management
│       │   ├── DashboardClient.tsx
│       │   ├── loading.tsx
│       │   └── error.tsx
│       ├── create/
│       │   ├── page.tsx            Organiser — create new event
│       │   ├── loading.tsx
│       │   └── error.tsx
│       ├── checkin/
│       │   ├── page.tsx            Organiser — QR scanner + attendance table
│       │   ├── CheckInClient.tsx
│       │   ├── AttendanceTable.tsx
│       │   ├── loading.tsx
│       │   └── error.tsx
│       └── analytics/
│           ├── page.tsx            Organiser — charts, reports, email log
│           ├── AnalyticsClient.tsx
│           ├── RegistrationBarChart.tsx
│           ├── CategoryPieChart.tsx
│           ├── TrendLineChart.tsx
│           ├── PostEventReport.tsx
│           ├── EmailLogTable.tsx
│           ├── loading.tsx
│           └── error.tsx
├── actions/
│   ├── auth.ts                     Supabase auth server actions
│   └── events.ts                   Event CRUD + registration server actions
├── components/
│   ├── ui/
│   │   ├── index.tsx               Button, Input, Textarea, Select, Modal,
│   │   │                           Badge, StatCard, Toggle, CapacityBar,
│   │   │                           EmptyState, PageHeader, ToastContainer
│   │   ├── PageSkeleton.tsx        Animated loading skeleton
│   │   └── RouteError.tsx          Error boundary with retry button
│   ├── EventCard.tsx               Event listing card
│   ├── MiniBar.tsx                 Inline sparkbar for dashboard trends
│   ├── Navbar.tsx                  Top nav + mobile/tablet bottom nav
│   └── modals/
│       ├── EventDetailModal.tsx    Event info + register/waitlist/cancel
│       ├── QRTicketModal.tsx       QR code ticket display
│       └── FeedbackModal.tsx       Star rating + comments form
├── context/
│   └── AuthContext.tsx             Auth session context ('use client')
├── hooks/
│   ├── useEventSync.ts             Shared useState + server-sync pattern
│   └── useToast.ts                 Singleton toast notification store
├── lib/
│   ├── constants.ts                Routes, categories, thresholds, NOTIF_ITEMS
│   ├── event-utils.ts              Capacity, status, QR token, CSV helpers
│   ├── navigation.ts               Nav link configs (student + organiser)
│   ├── utils.ts                    formatDate, formatTime, downloadCSV…
│   └── supabase/
│       ├── client.ts               Browser Supabase client
│       └── server.ts               Server-side Supabase client
├── types/
│   └── index.ts                    All TS interfaces + DB types
├── public/
│   └── favicon.svg
├── middleware.ts                   Auth redirect guard
├── .env.local                      Supabase env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Features

### Student
- Browse & search events — filter by category (Academic / Social / Career / Workshop)
- Register with capacity enforcement
- Join / leave waitlist — auto-promoted when someone cancels
- QR ticket generation per registration
- Cancel registrations
- Post-event feedback (star rating + open comments)
- My Registrations — upcoming, past, and waitlisted events
- Profile editor + granular notification preferences

### Organiser
- Dashboard — live stats, expandable event cards, mini trend bars
- Analytics — Recharts bar, donut, and 14-day line charts
- Per-event post-event report — attendee table + CSV export
- Email notification log with sent / pending / failed status
- Create new events (all fields + category + capacity)
- QR check-in scanner (real camera via `html5-qrcode`) + manual fallback
- CSV attendance export per event

---

## QR Scanner Notes

- Requires **HTTPS** or `localhost` (browsers block camera on plain HTTP)
- Rear/environment camera is preferred automatically on mobile
- Manual token entry is always available as a fallback
- QR token format: `UNIEVENT:<eventId>:<userId>:<name>`
