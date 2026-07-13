# Stately Mobile

Stately is a mobile-first health condition tracker. The Expo app collects daily activity, sleep, and HRV inputs, calculates a condition score, requests AI coaching, and saves daily records to Firestore. The API server exposes the AI coach endpoint and tries providers in this order: Groq, Gemini, OpenAI, then local fallback.

## Tech Stack

- Expo and React Native for the mobile app
- Firebase Auth and Firestore for authentication and daily records
- Express for the API server
- Zod and shared OpenAPI-derived types for API validation
- Groq, Gemini, and OpenAI for AI coaching
- pnpm workspaces for monorepo package management

## Folder Structure

- `artifacts/stately` - Expo app
- `artifacts/api-server` - Express API server
- `lib/api-spec` - OpenAPI schema
- `lib/api-zod` - generated/shared API Zod package
- `lib/api-client-react` - generated/shared React API client package
- `lib/db` - shared database package

## Environment Setup

Copy each example file to a local `.env` file and fill in real values locally:

```sh
cp artifacts/api-server/.env.example artifacts/api-server/.env
cp artifacts/stately/.env.example artifacts/stately/.env
```

Never commit `.env` files, API keys, or `.replit`.

## Run the API Server

Install dependencies from the repository root:

```sh
pnpm install
```

Build the shared API Zod declarations before typechecking the API server:

```sh
pnpm exec tsc --build lib/api-zod
pnpm --filter @workspace/api-server run typecheck
```

Start the API server:

```sh
pnpm --filter @workspace/api-server run dev
```

The server uses `PORT`, defaulting to `3000` in the example configuration.

## Run the Expo App

From the repository root:

```sh
pnpm --filter @workspace/stately run dev
```

For phone testing, set `EXPO_PUBLIC_API_BASE_URL` in `artifacts/stately/.env` to the API server URL reachable from your phone, such as `http://YOUR_LOCAL_IP:3000`. Do not use `localhost` on a physical phone unless the API is actually running on that phone.

## Test POST /api/ai-coach

With the API server running:

```sh
curl -X POST http://localhost:3000/api/ai-coach \
  -H "Content-Type: application/json" \
  -d '{"conditionScore":82,"conditionLabel":"good","activityScore":85,"sleepScore":78,"hrvScore":80,"hrvReliability":"green","weakestMetric":"sleep"}'
```

The response should include `advice` and `source`. When Groq is configured and succeeds, `source` should be `"groq"`.

## Confirm Firestore Saves Groq Source

1. Configure `GROQ_API_KEY` in `artifacts/api-server/.env`.
2. Run the API server and Expo app.
3. Sign in to the app and save a daily record.
4. Open the saved Firestore daily record for that user.
5. Confirm the record contains `ai.source` with value `"groq"`.

## Security

Never commit `.env`, API keys, tokens, service credentials, or `.replit`. Keep real secrets only in local environment files or the deployment platform secret manager.
