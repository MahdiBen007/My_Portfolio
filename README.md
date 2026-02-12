# Portfolio + Admin Dashboard

This project is a React portfolio website with an admin dashboard and Supabase integration.

## Stack

- Vite
- React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase

## Local development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run preview
```

## Notes

- Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.
- Use Supabase migrations in `supabase/migrations` before first deployment.
