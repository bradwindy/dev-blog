# windybank.net

Personal site for Bradley Windybank. A static Next.js export with a WebGL shader that raymarches a shape and dithers it to two colours.

## Commands

- `npm run dev` - local dev server
- `npm run build` - static export to `out/`
- `npm run lint` and `npm run typecheck`

## Layout

- `app/` - the four pages (home, about, projects, contact) and global styles
- `components/shader-stage.tsx` - the WebGL background. Each page morphs it into a different shape, and clicks send ripples across it
- `components/transition-link.tsx` - links that play a dithered wipe between pages
- `vercel.json` - host redirects to www.windybank.net, old blog URLs to the home page, and no Vercel deployments for branches under `renovate/` (CI still checks their pull requests)
