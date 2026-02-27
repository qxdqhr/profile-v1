# @sa2kit/exam

Shared exam SDK module extracted from profile-v1.

## Layers

- core: domain types and scoring
- services: frontend API clients and service wrappers
- ui: cross-platform adapter contracts and platform adapters
- server: backend service factories (dependency-injected)

Profile app keeps only server wiring (db adapters), and routes consume the wired services.
