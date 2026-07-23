# Baloy — Millbrook Commons (frontend preview)

The full resident flow — Welcome → Sign in → Home → Notices → Vote → Dues → Profile — built
with Tailwind CSS, running on mock data. No database, no auth, no API calls. This is meant to
be reviewed and clicked through locally before we touch a backend.

## Run it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Resize your browser narrow to see the mobile-first layout, or
just open it on your phone on the same network.

## How the theming works (for future multi-tenant support)

Every brand color is a CSS variable, not a hardcoded hex, anywhere in the app:

- `app/globals.css` defines the actual values (`--brand`, `--brand-soft`, `--ink`, etc.) —
  right now these are Millbrook Commons' colors.
- `tailwind.config.js` maps Tailwind utility classes to those variables (`bg-brand` →
  `var(--brand)`), so every component just writes normal Tailwind classes like `bg-brand` or
  `text-brand-strong` and never touches a hex code directly.

When we build the real backend, swapping a client's theme becomes: look up their organization
record, render a `<style>` block (or set variables inline on `<html>`) with their values
before anything else renders. No component code changes.

The logo is the same story — right now `data/mock.ts` hardcodes "MC" as the initials shown in
a colored square; later that becomes an uploaded logo URL per organization, with the initials
as a fallback if no logo's been uploaded yet.

## What's here

- `app/page.tsx` — Welcome (pre-auth, branded)
- `app/login/page.tsx` — Sign in (branded, no real auth — "Sign in" just navigates to `/home`)
- `app/(app)/*` — the five main screens, each fetching from `data/mock.ts`:
  - `home` — status card, open ballot, notice preview
  - `notices` — filterable list
  - `vote` — candidate selection + mock "cast ballot" (in-memory only, resets on refresh)
  - `dues` — balance card + mock "pay now" (in-memory only)
  - `profile` — contact info + notification toggles (not persisted)
- `components/Screen.tsx` — the shell that's full-width on mobile and a centered phone-width
  card on desktop, per the "mobile-first, scales up" decision.
- `components/BottomNav.tsx` — the five-tab bar, highlights the active route.
- `data/mock.ts` — all the fake data for the one demo organization (Millbrook Commons).

## Deliberately not in this drop

- No real backend, database, or auth — everything resets on page refresh.
- No multi-tenant/subdomain logic yet — that's the next real architecture piece once this UI
  is approved.
- No admin/branding settings screen yet.
