# Current state

Last reviewed: 2026-08-04

## Stable baseline

- Canonical remote: `git@github.com:craigmullin/spikechat.git`
- Active branch: `develop`
- Stack: React 19, TypeScript, Vite, Vitest, and Firebase Hosting
- Runtime: Node 22 recommended; minimum Node 20.19
- Persistence: local storage and IndexedDB; no live social-platform APIs
- Hosting: Firebase project/site `spikechat-e682a`
- Canonical product name: SpikeChat; the Firebase identifier already matches
  the restored product identity.

## Recently verified

- Lint passed.
- All 12 tests passed.
- Production build and PWA service-worker generation passed.
- About exposes Snapchat-style and Reddit-card editors under an experimental
  disclosure.
- Snapchat caption positioning supports pointer dragging and a keyboard-
  operable range input.

## Next work

1. Verify the installed PWA and deployed content from canonical source before
   considering legacy repository archival.
2. Add interaction coverage for experimental editors when their behavior
   stabilizes.
3. Decide when Snapchat and Reddit-card editors should become primary modes.
