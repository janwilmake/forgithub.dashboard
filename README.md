---
time: can take days, but is crucial
impact: brings everything i've built together
---

# The Agent-Powered GitHub Dashboard For 1000X Devs

> [!NOTE]
> This is a Work in Progress, built out from https://github.com/janwilmake/cloudflare-sponsorware. [Follow the progress in this thread](https://x.com/janwilmake/status/1883817352287924463)

Goal: bring all insights you want to see about your repos/sites/apps in 1 place.

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

- run sponsorware at localhost:3001 (or elsewhere)
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

# Data

Ensure data.forgithub.com/repos/x shows https://cache.forgithub.com/repos as well as # tokens and links to interesting contexts and derivations.

When logging in into dashboard.uithub.com, ensure I have permission for listening to all webhooks, and do this with the proper callbacks!

Insight: In the end, what I need is an actionschema that knows the dependencies and ensures to call them when an update occurs.

## githubwatch

1. Actually subscribe to watching all repos upon login (via a waituntil+scheduled api call).
2. Ensure per user I know the source (where/when they logged in)
3. Ensure the watching all lands in cache
4. Watch also triggers calculating all repo stuff, so we end up with a file of all repos + calcs that is refreshed each time something changes. 🐐

At data.forgithub or join.forgithub, idontrememba,.... ensure we have the most fresh data for the important datapoints available.

## Dashboard ❗️❗️❗️

2. render data.forgithub.com/repos/x up-to-date repos at dashboard (superfast) and make it pretty.
3. Create text-version for data.forgithub.com for dashboard.uithub.com and for uithub.com/x
4. Focus: file.forgithub.com or config.forgithub.com. select a specific config file (readme, openapi, spec, etc) and view all repos, categorized, with half of space dedicated to this one file.
5. At https://cf.uithub.com/owner, we need to use the same datapoint but render a more exploration friendly dashboard intended to understand what someone does. Can use the same data.forgithub.com/repos/x api!

Lets focus on making this context super worthy, and useful in order for a LLM to trim down what repos are significant for any given prompt.

## Create powerful worker-creator guide and chat

As a simple first demonstration of the product, create `uithub.chat` which simply proxies to chatcompletions.com/chat/completions but with key of R1, and charges the price needed. I already had docs.uithub.com/upstash-chat. Just use that one. Make it easy to put guides in context using select-boxes.

- DO for schedule, do for queue, do for kv/sql... document DOs with some very good examples and how it works in very few tokens
- create a very good prompt that generates all needed files for a worker besides the template from some simple natural language
- include the sponsorflare.ts
- put this prompt at a URL, easy to find.

Release uithub.chat API and UX with limit to -1.00 balance after signup (redirect oauth after hitting submit with prompt stuck in localstorage)

THIS IS WORTH A BIG AMOUNT OF LIKES IF I SHARE THE PROMPT. OR JUST CHAT?

# Pitchdeck

See [pitch-for-fund.md](./pitch-for-fund.md)
