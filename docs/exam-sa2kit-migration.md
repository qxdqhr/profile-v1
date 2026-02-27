# Exam Module Migration to sa2kit (Phase 1-3)

## Scope completed

This phase migrates the existing exam module architecture for current supported question modes (single choice and multiple choice) without adding new product behavior.

### New module layout

- `src/modules/exam/core`
  - Shared domain types and scoring utilities for current selection-question flow.
- `src/modules/exam/services`
  - Platform-agnostic frontend service contracts and HTTP client implementation.
- `src/modules/exam/server`
  - Backend application services and repository functions wrapping DB access.
- `src/modules/exam/ui`
  - Cross-platform UI adapter contracts and platform adapters:
    - web
    - wechat
    - rn
    - desktop

### API routing migration

- `src/app/api/exam/**` now calls `src/modules/exam/server` service layer.
- `src/app/api/testField/(utility)/experiment/config/questions/route.ts` uses module server layer.
- `src/app/api/testField/(utility)/experiment/config/examTypes/route.ts` uses module admin services.

Compatibility is preserved for existing API paths.

## Phase 2 completed

- Added fill blank support in current web exam flow:
  - runtime answer area
  - config panel answer editing
  - scoring fix for text answers
- Removed non-essential realtime/socket scaffolding to keep module focused on exam frontend/backend core flow.

## Phase 3 completed

- Added package candidate module: `packages/sa2kit-exam`
  - `core/`, `services/`, `ui/` extracted copies
  - package name prepared as `@sa2kit/exam`
- Added tsconfig alias mapping for `@sa2kit/exam`.
- `src/modules/exam/index.ts` now re-exports from `@sa2kit/exam` plus local server layer.

## Deferred scope (next phase)

- Short answer/essay end-to-end workflow.
- Additional cross-end rendering refinements for wechat/rn/desktop adapters.

## Layering rules (must keep)

1. Frontend component layer (`ui`) only depends on core types and frontend services.
2. Frontend service layer (`services`) only handles API contracts and transport logic.
3. Backend layer (`server`) encapsulates data access and use-cases; route handlers should be thin wrappers.
4. No direct route-to-db coupling for new functionality.

## sa2kit extraction plan

When extracting into sa2kit SDK package:

1. Move `core` + `services` + `ui/contracts` first into a new package (for frontend reuse).
2. Keep `server` in host app until backend abstractions are fully generalized.
3. Introduce per-platform renderer packages:
   - `@sa2kit/exam-web`
   - `@sa2kit/exam-wechat`
   - `@sa2kit/exam-rn`
   - `@sa2kit/exam-desktop`
4. Keep API DTO and versioning in one shared contract package to prevent cross-end drift.
