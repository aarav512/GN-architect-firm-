# GN Architects

Editorial homepage for GN Architects, formerly Guru Nanak Architects, New Delhi. Established 2014.

Project photographs on the page are marked placeholders. No street address, phone, or email is shown, because none was supplied for this site.

## Local

```bash
npm install
npm run dev
```

Open http://127.0.0.1:4317

## Cloudflare Pages

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Build output directory | `dist` |

`npm run build` writes a compiled `dist/index.html` with bundled CSS and JavaScript. It also copies that build to the repository root so a static publish of the root still loads styles, scripts, fonts, and images.

Framework preset: Vite. Do not set the output directory to the repository root if a build command is configured — use `dist`.
