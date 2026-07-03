# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repository is currently an empty scaffold for **Tax-Payers**, a full-stack web app. No application code exists yet — this file defines the conventions and architecture to follow once code is added, so that scaffolding is consistent from the first commit.

## Intended architecture

Monorepo with two top-level folders:

- `/frontend` — React (JavaScript, not TypeScript), built with Vite, styled with Tailwind CSS + shadcn/ui component primitives.
- `/backend` — Node.js (JavaScript), Express, organized by feature: `routes/ → controllers/ → services/ → models/`.

The frontend talks to the backend exclusively over a REST API under a configurable base URL (proxied in dev via Vite's dev server proxy). Keep request/response shapes and validation rules defined once on the backend; the frontend should not duplicate business rules.

## Commands (once scaffolded)

These are the commands the template expects to exist per folder — not runnable until the respective `npm init`/Vite/Express scaffolding has happened:

Frontend (`/frontend`):
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — lint
- `npm test` — component tests (Vitest + React Testing Library)

Backend (`/backend`):
- `npm run dev` — dev server with reload
- `npm start` — production start
- `npm run lint` — lint
- `npm test` — Jest + Supertest

## UI design guidance

Good UI is a first-class requirement here, not an afterthought. This repo has the `ui-ux-pro-max-cli` skill pack installed locally (`.claude/skills/`), on top of the global `frontend-design` skill:

- Invoke the `ui-ux-pro-max` skill when planning, building, or reviewing any UI — it has style/palette/font-pairing/UX-guideline databases and stack-specific guidance for React + Tailwind + shadcn/ui. Don't default to generic/templated layouts.
- Invoke the `ui-styling` skill for concrete shadcn/ui + Tailwind implementation details (component patterns, theming, dark mode, responsive utilities, accessibility).
- Use `design-system` if the project needs formal design tokens (primitive → semantic → component layers) rather than ad-hoc Tailwind values.
- Use Tailwind CSS + shadcn/ui as the default styling/component approach.
- Build responsive, accessible components by default (semantic HTML, keyboard navigation, sufficient contrast).
- Use the `verify` skill to actually run the app and look at the result before calling UI work done — type checks and tests confirm correctness, not visual quality.

The pack also includes `design`, `slides`, `banner-design`, and `brand` skills (logos, icons, presentations, brand guidelines) — available if the project needs marketing/brand assets, but not part of the core app-building loop.

## Agents

Custom subagents live in `.claude/agents/`:

- **frontend-engineer** — use for building/refining React components, pages, and styling.
- **backend-engineer** — use for Express routes, controllers, services, and data access.
- **ui-design-reviewer** — use after frontend work to get an independent design/accessibility critique before considering UI work done.

## Quality gates

- Run the `code-review` skill after nontrivial changes.
- Run the `security-review` skill before merging backend changes touching auth, sessions, payments, or tax/financial data.
- Run the `verify` skill to confirm behavior end-to-end (not just tests passing) before reporting a feature complete.

## Conventions

- Plain JavaScript across both frontend and backend — no TypeScript.
- Configuration and secrets live in `.env` files per folder; never commit them.
