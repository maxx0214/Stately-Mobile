# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

### Stately (`artifacts/stately`)

Mobile-first AI condition coach app built with Expo + React Native.

**Purpose:** Helps users understand their daily physical condition based on activity, sleep, and HRV. Calculates a daily condition score and generates AI coaching advice.

**Tech:**
- Expo SDK 54, React Native, TypeScript
- Firebase Firestore for persistence (primary)
- AsyncStorage as offline fallback
- react-native-svg for charts
- Inter font (Google Fonts)

**Screens:**
- Onboarding — shown once on first launch
- Home (`(tabs)/index`) — score ring, AI advice, metric cards, mini graph
- Input (`(tabs)/input`) — form to enter activity/sleep/HRV data
- Graph (`(tabs)/graph`) — toggleable 7-day SVG line charts per metric
- History (`(tabs)/history`) — scrollable list of past daily records
- Settings (`(tabs)/settings`) — sync status, integration stubs, notifications

**Key files:**
- `lib/firebase.ts` — Firebase app + Firestore instance (singleton)
- `services/firestore.ts` — CRUD: saveDailyRecord, getDailyRecords, getTodayRecord, deleteDailyRecord
- `context/RecordsContext.tsx` — global state; loads from Firestore, falls back to AsyncStorage
- `utils/calculateCondition.ts` — condition score algorithm (activity/sleep/HRV weights)
- `utils/generateAdvice.ts` — rule-based AI coaching advice
- `utils/storage.ts` — AsyncStorage wrapper (offline backup)
- `types/DailyRecord.ts` — shared TypeScript interface

**Firestore path:** `users/{uid}/daily/{YYYY-MM-DD}`
**Current UID:** `demo-user` (hardcoded until Firebase Auth is added)

**Environment variables (EXPO_PUBLIC_):**
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

**Colors:**
- Navy: `#1B2430`
- Mint Sage: `#88D3C3`
- Background: `#F7F9FA`
- Text: `#111827`
- Muted: `#6B7280`
