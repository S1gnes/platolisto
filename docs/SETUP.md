# Setup

## Requirements

- Node.js 24 or newer (npm 11).
- Windows, macOS or Linux. The commands below work in PowerShell.

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:5173. On a phone in the same Wi-Fi network, run `npm run dev -- --host` and open the printed network address.

## Checks

```powershell
npm run typecheck
npm test
npm run build
```

`npm run build` writes a static site to `dist/`. It uses relative asset paths and a hash router, so it works from any GitHub Pages path.

## Still to come

- Worker proxy, API keys and live services: milestone 3.
- Cocktail dataset build script: milestone 4.
- GitHub Pages deploy, Worker deploy and `scripts/precompute-presets`: milestone 5.
