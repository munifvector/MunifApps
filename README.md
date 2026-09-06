# MunifApps Web

Web version of MunifApps designed for Netlify + Supabase.

## Architecture

- Netlify: React/Vite frontend and SPA hosting.
- Supabase: Auth, Postgres history, Storage.
- FFmpeg WebAssembly: Joiner, Looper, Reels and Metadata run in the user's browser.
- Live RTMP: the web UI is prepared, but production RTMP streaming needs a separate long-running worker/server. Netlify Functions/Supabase Edge Functions are not suitable for continuous FFmpeg streaming.

## Setup

1. Create a Supabase project.
2. Open SQL Editor and run `supabase/schema.sql`.
3. Copy `.env.example` to `.env`.
4. Fill:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
5. Install and run:
   npm install
   npm run dev
6. Deploy to Netlify:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add the same VITE_* environment variables in Netlify.

Supabase's browser client uses the project's URL and publishable key. Keep service-role/secret keys out of browser environment variables.

## Important

Video processing is client-side to avoid pushing large videos through serverless functions. Large files still consume browser RAM/CPU.

For a full cloud processing queue, add a dedicated FFmpeg worker (for example a container/VM service) and let Supabase store jobs/files. Do not put the service-role key in the browser.
