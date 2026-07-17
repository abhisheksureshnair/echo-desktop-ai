# Echo backend

Standalone Node.js API foundation for Echo's desktop app and browser extensions. It uses only Node's built-in modules, so there are no dependencies to install.

## Run

```bash
cd backend
npm run dev
```

Copy `.env.example` to `.env` to customize the host or port. The default port is `7891` because Electron currently hosts its in-process API at `7890`.

## Endpoints

- `GET /health` — service health
- `GET /api/status` — extension connection state
- `POST /api/active` — extension heartbeat/tab metadata
- `POST /api/disconnect` — mark extension disconnected
- `POST /api/chat` — receive a prompt and return a starter reply

When this service replaces the Electron API, configure the extension and Electron app to use the same `PORT`.
