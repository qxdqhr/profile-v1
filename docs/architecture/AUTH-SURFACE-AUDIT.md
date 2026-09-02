# Auth Surface Audit — main-web DB/API modules

Audit date: 2026-09-02  
Scope: `fitnessPlan`, `comfyPrompt`, `filetransfer`, `mmd`, `skillManager`, `ticketMonitor`, `vocaloidBooth`, `cardMaker`, `mikutap`

Legend for **Auth** column:

| Value | Meaning |
|-------|---------|
| `session` | Requires `getApiSessionUser` / `requireAuthUser` (401 if missing) |
| `session+owner` | Session required; resource ownership (or existing admin role) checked |
| `admin-token\|session` | `TICKET_MONITOR_ADMIN_TOKEN` if set, else logged-in session |
| `cron-secret` | Bearer `TICKET_MONITOR_CRON_SECRET` |
| `public` | Intentionally unauthenticated |

---

## Page / layout guards

| Module | UI guard | Notes |
|--------|----------|-------|
| fitnessPlan | `AuthProvider` + `AuthGuard requireAuth` in module layout | Verified OK |
| comfyPrompt | `AuthProvider` + `AuthGuard requireAuth` in module layout | Verified OK; all API routes use `requireAuthUser` |
| filetransfer | `AuthProvider` + `AuthGuard requireAuth` on page | Fixed (was AuthProvider-only with manual UI check) |
| skillManager | `AuthProvider` + `AuthGuard requireAuth` on page | Fixed |
| cardMaker | `AuthProvider` + `AuthGuard requireAuth` on page | Fixed |
| mikutap config | route wraps `AuthGuard requireAuth` | Fixed for `/testField/.../mikutap/config` |
| mikutap play | public | Game play surface |
| ticketMonitor | public list + admin-token config UI | Config mutations use admin token / session |
| vocaloidBooth | public booth UX | Code-based redeem by design |
| mmd viewer | public read | Writes gated at API |

`testField/layout.tsx` already provides an outer `AuthProvider`.

---

## Route table

| Module | Route | Auth | Notes |
|--------|-------|------|-------|
| fitnessPlan | `/api/fitnessPlan/**` (all) | `session` | Re-exports module handlers; no gaps found |
| comfyPrompt | `/api/comfyPrompt/**` (all) | `session` | All handlers call `requireAuthUser` via `_helpers` |
| filetransfer | `/api/filetransfer/transfers` GET/POST | `session` | Module re-export |
| filetransfer | `/api/filetransfer/transfers/[id]` DELETE | `session` | Implemented in `app/api` (not module re-export) |
| filetransfer | `/api/filetransfer/download/[id]` GET | `session` | Module re-export |
| filetransfer | module `api/config`, `api/collections/**` | `session` | Mounted under `app/api` (re-export) |
| mmd | `/api/mmd/models` GET (no userId) | `public` | Public catalog |
| mmd | `/api/mmd/models` GET `?userId=` | `session+owner` | Must match session user |
| mmd | `/api/mmd/models` POST | `session` | `userId` forced from session |
| mmd | `/api/mmd/models/[id]` GET | `public` / `session+owner` | Private models require owner/admin |
| mmd | `/api/mmd/models/[id]` PUT/DELETE | `session+owner` | Admin via existing `isAdminRole` |
| mmd | `/api/mmd/upload/models` POST | `session` | Upload + create |
| mmd | `/api/mmd/playlists/[id]` GET | `public` | Built from public models |
| mikutap | `/api/mikutap/configs` GET | `public` | Playtime read |
| mikutap | `/api/mikutap/configs` POST/PUT/DELETE | `session` | Fixed |
| mikutap | `/api/mikutap/sound-library` GET | `public` | Playtime read |
| mikutap | `/api/mikutap/sound-library` POST/PUT/DELETE | `session` | Fixed |
| mikutap | `/api/mikutap/background-music` GET | `public` | Play needs audio; `?meta=1` omits `audioData` |
| mikutap | `/api/mikutap/background-music` POST/PUT/DELETE | `session` | Fixed |
| mikutap | `/api/mikutap/background-music/debug` GET | `session` | Fixed (was open dump) |
| mikutap | `/api/mikutap/background-music/test` GET | `session` | Fixed |
| cardMaker | `/api/cardMaker/cards` GET/POST | `session` | List scoped to session user |
| cardMaker | `/api/cardMaker/cards/[id]` GET/PUT/DELETE | `session+owner` | Fixed |
| cardMaker | `/api/cardMaker/assets` GET | `public` | Shared asset catalog |
| cardMaker | `/api/cardMaker/assets/categories` GET | `public` | Shared catalog |
| cardMaker | `/api/cardMaker/assets/upload` POST | `session` | Fixed |
| skillManager | `/api/skill-manager/skills` GET | `public` | Catalog browse |
| skillManager | `/api/skill-manager/skills/[id]` GET | `public` | Detail + content |
| skillManager | `/api/skill-manager/skills/[id]` PUT | `session` (+ `isAdminRole` for `source`) | Fixed: auth was optional before |
| skillManager | `/api/skill-manager/skills/[id]/file` GET | `public` | File read |
| skillManager | `/api/skill-manager/skills/[id]/download` GET | `public` | Zip download |
| skillManager | `/api/skill-manager/skills/download-batch` POST | `public` | Read-like batch zip |
| skillManager | `/api/skill-manager/skills/download-batch/preflight` POST | `public` | Existence check |
| skillManager | `/api/skill-manager/sync/tasks` POST | `session` | Fixed |
| skillManager | `/api/skill-manager/sync/tasks/[taskId]` GET | `session` | Fixed: was public UUID poll |
| skillManager | `/api/skill-manager/sync/tasks/[taskId]/retry` POST | `session` | Fixed |
| skillManager | `/api/skill-manager/sync/tasks/[taskId]/resolve` POST | `session` | Fixed |
| ticketMonitor | `/api/ticket-monitor/events` GET | `public` | Cached ticket list |
| ticketMonitor | `/api/ticket-monitor/sync-status` GET | `public` | Latest sync meta |
| ticketMonitor | `/api/ticket-monitor/config` GET | `public` | Masked secrets |
| ticketMonitor | `/api/ticket-monitor/config` PUT | `admin-token\|session` | Fail-closed when token unset (session required) |
| ticketMonitor | `/api/ticket-monitor/notifications/test` POST | `admin-token\|session` | Same as config PUT |
| ticketMonitor | `/api/ticket-monitor/cron/sync` POST | `cron-secret` | Fail-closed if secret unset |
| vocaloidBooth | `/api/vocaloid-booth` GET | `public` | Health/ready |
| vocaloidBooth | `/api/vocaloid-booth` POST `create`/`redeem` | `public` | Kiosk + match-code design |
| vocaloidBooth | `/api/vocaloid-booth-test` * | `session` (+ prod off) | Fixed: session required; production 404 unless `VOCALOID_BOOTH_TEST_API=1` |
| filetransfer | `/api/filetransfer/config` GET/PUT | `session` | Fixed: mounted thin re-export |
| filetransfer | `/api/filetransfer/collections` GET/POST | `session` | Fixed: mounted thin re-export |
| filetransfer | `/api/filetransfer/collections/[id]` GET/PUT/DELETE | `session` | Fixed: mounted thin re-export |

---

## app/api re-export integrity

Verified thin re-exports still hit module handlers for:

- `fitnessPlan/**`, `comfyPrompt/**`, `ticket-monitor/**`, `mikutap/configs`, `mikutap/sound-library`, `mmd/models` (list)

**Fixed bypass:** `app/api/mmd/models/[id]/route.ts` previously implemented its own unauthenticated `GET` and did **not** export module `PUT`/`DELETE`. It now re-exports `GET, PUT, DELETE` from `@/modules/mmd/api/models/[id]/route`.

`filetransfer/transfers/[id]` and several `mikutap/background-music*` / `cardMaker*` / `skill-manager*` / `mmd/upload` routes live directly under `app/api` (not module re-exports) but now carry session checks where required.

---

## Remaining risks

1. **skillManager public reads** expose full SKILL.md / zip download without login — intentional catalog today; tighten if skills become private.
2. **mikutap background-music GET** (without `?meta=1`) still returns base64 for play surface — bandwidth + content exposure; accepted for public game.
3. **mmd upload** animation/audio creates are session-gated but lack per-record ownership fields on some create paths (legacy).
4. **ticketMonitor GET config** is public (masked) — acceptable; ensure production always sets `TICKET_MONITOR_ADMIN_TOKEN` for stronger admin separation.
5. **Any logged-in user** can mutate shared mikutap configs / skill markdown (except `source` admin-only) — no per-resource ACL beyond session.

---

## D2 follow-up (2026-09-02)

| Item | Action |
|------|--------|
| sync task GET | session required |
| vocaloid-booth-test | session + production disabled by default |
| filetransfer config/collections | mounted under `app/api` |
| mikutap BGM | `?meta=1` for metadata-only lists |
