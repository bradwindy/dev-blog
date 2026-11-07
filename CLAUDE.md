# windybank.net

Static personal site. See @README.md.

- Run `npm run lint`, `npm run typecheck` and `npm run build` after changes.
- `next.config.ts` uses `output: "export"`, so no server features (API routes, middleware, dynamic rendering).
- Colours are CSS variables on `:root` in `app/globals.css`. The shader reads `--lo`, `--hi` and `--night` from there, so keep those in sync with the page colours.
- No analytics, cookies or third-party requests. Fonts are self-hosted by `next/font`.
