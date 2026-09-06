# MunifApps — Deploy Netlify + Supabase

Supabase project is already wired in the source.

## Supabase
Project URL:
https://vcustjkniulwxlurznnk.supabase.co

The REST Data API URL is:
https://vcustjkniulwxlurznnk.supabase.co/rest/v1/

For `@supabase/supabase-js`, use the project URL (without `/rest/v1/`) together with the publishable key.

Run `supabase/schema.sql` in Supabase SQL Editor before using Login and history.

## Local
```bash
npm install
npm run dev
```

`.env.local` is already prepared locally and is excluded from Git.

## Netlify
Build command:
```text
npm run build
```

Publish directory:
```text
dist
```

Recommended environment variables:
```text
VITE_SUPABASE_URL=https://vcustjkniulwxlurznnk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

The application also contains a browser-safe publishable-key fallback so the configured project can initialize if Netlify environment variables are not entered. For production, prefer setting the Netlify variables.

Never put a Supabase secret key/service-role key in this frontend.
