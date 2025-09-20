2XKOMBO — Share and save 2XKO combos. Built with Next.js 15, Tailwind v4, Supabase.

## Getting Started

1. Install deps and run

```bash
npm i
npm run dev
```

2. Env

Create `.env.local` and add your environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Site URL Configuration
# For development: leave empty to use localhost automatically
# For production: set to your domain
NEXT_PUBLIC_SITE_URL=https://2xkombo.app
```

3. Discord OAuth Setup

In your Supabase project dashboard:
1. Go to Authentication > Providers > Discord
2. Enable Discord provider
3. Add your Discord Client ID and Client Secret
4. Set the redirect URL to: `https://2xkombo.app/auth/callback` (production) or `http://localhost:3000/auth/callback` (development)

In your Discord Developer Portal:
1. Go to your Discord application settings
2. Under OAuth2 > Redirects, add: `https://yoursupabaseproject.supabase.co/auth/v1/callback`

Open http://localhost:3000 to view.
