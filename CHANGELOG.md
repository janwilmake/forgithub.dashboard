## GitHub OAuth & Monetisation (2025-01-28)

✅ Transform to uithub dashboard.

✅ Use sponsorflare as starting point, make uithub client. Take sponsorflare v2 with the right DO reference to `sponsorflare_SponsorDO`

✅ Ensure cookie is shared between subdomains:
https://stackoverflow.com/questions/18492576/share-cookies-between-subdomain-and-domain

✅ It's important that people can login from anywhere on uithub, to the came redirect uri, and then land back where they were. This helps not having to create soooo many clients. Let's confirm this is doable. Added possibility for passing redirect_uri

## Continue (2025-01-29)

✅ To proof this works, try it at `uithub.cf` in production and ensure it actually redirects to `dashboard.forgithub.com/callback` after logging in so we can use the same client.

✅ Login should just require `user:email`

✅ Add endpoint `GET /usage` to get all transactions grouped by date and hostname, like openai does.

✅ Auth idea: Redirect 401 at `/dashboard` to `/login?redirect_uri=CURRENT` (which could redirect to site to callback and back to where i was). never problems logging in anymore! Wow!

## Dashboard page (2025-01-29)

✅ Show username, image, and balance (Spent-CLV) in a header, which opens `/usage` when clicking where you can see all details, logout, see balance, and see where to sponsor.

✅ Usage page: render stacked bar graph per date per hostname. Add ability to access it as data via `getUsage` fn.

## Improve dashboard (2025-01-31)

✅ Put real data inhere and ensure its cached

✅ Created very nice logo (⌂)
