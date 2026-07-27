# SpikeChat Studio

SpikeChat is a mobile-first, installable PWA for creating private fictional
conversations and social-post mockups. Everything is stored locally in the
browser; the app does not connect to Instagram, Reddit, or a messaging service.

## Modes

- Chat: fictional text and image conversations
- Instagram-style: editable photo-post mockups
- Reddit-style: editable community-post mockups

Images are stored as blobs in IndexedDB. People, messages, and post metadata are
stored in local storage.

## Development

Node 22 is recommended (minimum `20.19`).

```bash
npm install
npm run lint
npm test
npm run build
npm run dev
```

## Deployment

Firebase Hosting serves the generated `dist` directory:

```bash
npm run build
firebase deploy --only hosting
```

SpikeChat creates fictional content and does not scrape or call live social
platform APIs. Use fictional identities and respect other people's privacy.
