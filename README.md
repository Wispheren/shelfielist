# Shelfielist

Shelfielist is a small household inventory web app for quickly checking what is available at home from either phone.

## What is included

- Shared inventory stored in SQLite
- Mobile-first interface for adding, editing, and deleting items
- Quick `+1` and `-1` controls for common household stock changes
- Phone-friendly barcode scanner with quick add/subtract actions
- Search and low-stock filtering
- Danish and English interface with Danish as the default
- Seed data so the app feels alive on first run

## Run locally

```bash
npm start
```

Then open [http://localhost:3434](http://localhost:3434).

To make it reachable from phones on the same Wi-Fi, start the app and open `http://YOUR-COMPUTER-IP:3434`.

## Development mode

```bash
npm run dev
```

## Notes

- Data lives in `data/shelfielist.db`.
- The app uses only built-in Node.js modules, so no package install step is required for this first MVP.
