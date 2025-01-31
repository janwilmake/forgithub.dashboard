---
time: can take days, but is crucial
impact: brings everything i've built together
---

# The Agent-Powered GitHub Dashboard For 1000X Devs

> [!NOTE]
> This is a Work in Progress, built out from https://github.com/janwilmake/cloudflare-sponsorware. [Follow the progress in this thread](https://x.com/janwilmake/status/1883817352287924463)

Goal: bring all useful datapoints together for a subset of repos in a cached JSON and UI. Anything you want to see about your repos/sites/apps. UI where you can switch between different datasets from `forgithub.join`, and view them in several ways.

- regular details
- hosted domain (domain.forgithub.com)
- usage stats
- github oauth client sign-ins
- openapi summary
- SPEC.md
- HACKERNEWS.md (what topics are relevant here?)
- screenshot of homepage
- cost
- last deployment(s)
- size (specifically, number of tokens)
- links to useful views
- links to take agentic actions
- category stack (generated with LLM)
- actions summary / success
- logo of deployment provider

Layout:

- show this in a vercel-like way
- select to fetch any additional datapoint and view it for each repo
- grouped by domain and category
- there's a chatbox to start a new task for one or more repos
- each item has buttons to get datapoint, or go to github/uithub/website/openapi/chat

# How to run this locally

- run `sponsorware` at localhost:3001 (or elsewhere)
- run this at 3000. it will now connect to the real DO in production!

# TODO: THIS IS THE SHIT

## GitHub OAuth & Monetisation (2025-01-28)

✅ Transform to uithub dashboard.

✅ Use sponsorflare as starting point, make uithub client. Take sponsorflare v2 with the right DO reference to `sponsorflare_SponsorDO`

✅ Ensure cookie is shared between subdomains:
https://stackoverflow.com/questions/18492576/share-cookies-between-subdomain-and-domain

✅ It's important that people can login from anywhere on uithub, to the came redirect uri, and then land back where they were. This helps not having to create soooo many clients. Let's confirm this is doable. Added possibility for passing redirect_uri

## Continue (2025-01-29)

✅ To proof this works, try it at `uithub.cf` in production and ensure it actually redirects to `dashboard.uithub.com/callback` after logging in so we can use the same client.

✅ Login should just require `user:email`

✅ Add endpoint `GET /usage` to get all transactions grouped by date and hostname, like openai does.

✅ Auth idea: Redirect 401 at `/dashboard` to `/login?redirect_uri=CURRENT` (which could redirect to site to callback and back to where i was). never problems logging in anymore! Wow!

## Dashboard page (2025-01-29)

✅ Show username, image, and balance (Spent-CLV) in a header, which opens `/usage` when clicking where you can see all details, logout, see balance, and see where to sponsor.

✅ Usage page: render stacked bar graph per date per hostname. Add ability to access it as data via `getUsage` fn.

# Pitchdeck

See [pitch-for-fund.md](./pitch-for-fund.md)
