# Chat operating instructions

## Scope

This repository owns the Chat browser application and PWA. Keep portfolio
coordination in HQ and reusable design-system decisions in Design.

## Before changes

1. Read `NOW.md` and `README.md`.
2. Preserve browser-local data compatibility unless a migration is explicit.
3. Treat experimental editors as intentionally discoverable through About but
   not promoted as primary modes until their feature visibility is approved.

## Validation

Run `npm run lint`, `npm test`, and `npm run build` for substantive changes.
For interaction changes, verify the affected flow in a browser and check the
console. Do not deploy Firebase Hosting without explicit authorization.

## Safety

- Do not remove the `legacy-spikechat` remote or dated backup refs until the
  canonical repository and deployed PWA are fully verified.
- Never commit `.firebase`, `dist`, `node_modules`, secrets, or local browser
  data.
- Keep fictional-content and privacy safeguards visible in product decisions.
