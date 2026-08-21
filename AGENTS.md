# MeghdootPlayground Agent Guide

## Scope

This repository is a two-service Salesforce operations workspace. Keep changes focused on the requested workflow and preserve the existing Next.js, FastAPI, and Prisma boundaries.

- `frontend/`: Next.js App Router client, UI components, client utilities, and Next API routes.
- `backend/`: FastAPI service under `/api/v1`, with SQLAlchemy-based application code.
- `frontend/prisma/schema.prisma`: Prisma schema for the PostgreSQL-backed library, metrics, events, owners, and history models.
- Root scripts in `package.json`: canonical commands for the frontend and backend.

Read [README.md](README.md) for the full architecture overview and local setup instructions.

## Commands

Run from the repository root unless noted:

```text
npm install
npm run dev          # Next.js frontend
npm run build        # Prisma generate + Next.js production build
npm run lint         # ESLint for frontend
npm run backend:dev  # FastAPI with Uvicorn on port 8000
```

Backend setup uses Python 3.10+, `backend/requirements.txt`, and a virtual environment. PostgreSQL is required for Prisma and the backend database configuration. After dependency setup, generate Prisma client artifacts with `npm run prisma:generate`; use `npx prisma db push` for a local schema sync when appropriate.

There is no established test suite in the repository. When changing backend behavior, add or update focused `pytest` coverage where practical and run it from the backend environment.

## Implementation Guidance

- Follow existing TypeScript strictness and the `@/*` path alias in `frontend/tsconfig.json`.
- Reuse components from `frontend/components/ui`, utilities in `frontend/lib`, and existing page patterns before adding abstractions.
- Keep browser-only behavior in client components and avoid moving secrets or database credentials into client code.
- For persisted frontend data, inspect the corresponding Next API route and Prisma model before changing request or response shapes.
- For FastAPI changes, place route wiring in `backend/app/api`, business logic in the relevant service/repository layer, and keep `/api/v1` prefixes consistent with `backend/app/api/__init__.py`.
- Treat SOQL as its own dialect. Preserve template placeholders such as `{{tickets}}` and validate generated output against the existing local behavior.
- Spreadsheet processing should remain local to the existing frontend or backend processing path; preserve supported `.xlsx`, `.xls`, and `.csv` behavior.
- Do not use repair scripts or files named `old_*`, `tmp*`, `scratch/`, or `page_original.tsx` as production implementation sources without verifying that they are intentional and current.
- Avoid broad formatting or generated-file churn. Do not commit build output, local environments, credentials, or database secrets.

## ChatGPT / OpenAI Work

There is currently no ChatGPT, OpenAI SDK, LLM provider, or chat API integration in this repository. The README mentions AI-powered query suggestions only as future roadmap work. If implementing that area:

- First define the provider boundary and configuration contract; do not assume an API key, model, or endpoint already exists.
- Keep provider credentials server-side and validate all user-controlled prompt/query input.
- Preserve the existing offline/local-data expectations documented by the help pages unless the user explicitly changes the product contract.
- Add focused tests for prompt construction, failure handling, and sensitive-data boundaries before wiring UI affordances.

## Validation

For frontend changes, run `npm run lint` and use `npm run build` when the change affects routing, data loading, types, or production compilation. For backend changes, start the FastAPI service or run focused `pytest` tests, and check `/health` plus the affected `/api/v1` route. For schema changes, regenerate Prisma artifacts and verify the migration or local schema-sync strategy before considering the change complete.
