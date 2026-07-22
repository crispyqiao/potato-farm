# The Potato Patch

A tiny community garden where visitors draw and plant their own potato in a shared field. Inspired by [Anna's Secret Garden](https://annasgarden.dev).

## Running it locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## How it works

- `app/page.tsx` — the main page: the field, the planted-potato count, and the "Plant a potato" button.
- `components/Field.tsx` — renders the garden bed (`public/images/garden-bed.png`) and positions every planted potato inside the soil area, using a small perspective projection so potatoes near the back of the bed render smaller/higher and ones near the front render bigger/lower.
- `public/images/garden-bed.png` — the wooden raised-bed illustration used as the field background. The sky has been removed (transparent) so it blends cleanly into the page background instead of showing a hard rectangular edge. If you swap in a different bed image, you'll need to re-measure the soil trapezoid coordinates (the `SOIL` constant at the top of `Field.tsx`) against the new image, and likely re-run a similar background removal so it sits flush on the page.
- `components/PlantModal.tsx` — the popup where someone draws their potato, picks a color, adds an optional note.
- `components/DrawCanvas.tsx` — the actual drawing canvas (pointer-based, works with mouse, trackpad, and touch).
- `app/api/potatoes/route.ts` — the API: `GET` returns all planted potatoes, `POST` plants a new one.
- `lib/storage.ts` — where potatoes are saved. Right now this writes to `data/potatoes.json` on disk, which is great for local dev but **will not persist on Vercel** (serverless filesystems reset). See "Deploying" below.
- `lib/validation.ts` / `lib/rate-limit.ts` — basic spam/abuse protection so the field doesn't get flooded.

## Deploying

The JSON-file storage works locally but Vercel's serverless functions have a read-only/ephemeral filesystem, so planted potatoes won't actually stick around in production. Before deploying for real, swap `lib/storage.ts` for a small persistent store. Easiest options:

- **Vercel KV** (Redis-based, integrates directly in the Vercel dashboard) — a few lines of change in `storage.ts`.
- **Supabase** or **Turso** if you want a real database and might add more features later (likes, comments, etc).

Everything else (the API route shape, the components) stays the same — only `lib/storage.ts` needs to change.

## Customizing

- Colors and fonts live in `app/globals.css` (CSS variables) and `app/layout.tsx` (font imports).
- Potato skin color options are in `components/PlantModal.tsx` (`SKIN_COLORS`).
- Max number of potatoes kept in the field is `MAX_POTATOES` in `lib/storage.ts`.
