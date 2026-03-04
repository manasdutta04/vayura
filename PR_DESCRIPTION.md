# PR: Add Clear Error Message for Missing Environment Variables (Issue #104)

## Summary
This PR adds a startup-time validation for required environment variables and throws a clear, actionable error when any are missing.

## Problem
When required env vars were missing or misconfigured, the app failed later in feature flows with unclear errors, which made local setup confusing for first-time contributors.

## What Changed
- Added centralized environment validation utility:
  - `src/lib/env-validation.ts`
- Added startup validation call in root app layout so checks happen early:
  - `src/app/layout.tsx`

## Validation Behavior
On startup, the app checks for required variables:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_ADMIN_CLIENT_EMAIL`
- `FIREBASE_ADMIN_PRIVATE_KEY`

If any are missing, it throws a clear message that includes:
- Which variables are missing
- Where to add them (`.env.local` for local, `.env` for Docker)
- A prompt to restart dev server
- Reference to `README.md` and `SETUP.md`

## Notes
- Validation is skipped in `test` environment to avoid disrupting test execution.
- No functional behavior changes when env vars are properly configured.

## Acceptance Criteria Mapping
- App detects missing required environment variables: Implemented.
- Clear error message displayed instead of unclear failures: Implemented.
- No change to existing functionality: Maintained (only fail-fast on invalid setup).

## Labels Suggestion
- `good first issue`
- `enhancement`
- `help wanted`
