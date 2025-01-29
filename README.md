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

✅ `COOKIE_DOMAIN_SHARING=true` should be a configurable param.

✅ Login should just require `user:email`

✅ Ensure the URL is stored for every transaction.

✅ Add endpoint `GET /usage` to get all transactions grouped by date and hostname, like openai does.

✅ Auth idea: Redirect 401 at `/dashboard` to `/login?redirect_uri=CURRENT` (which could redirect to site to callback and back to where i was). never problems logging in anymore! Wow!

✅ Learn more about the behavior of cookies and the specifications that are currently mostly implemented in 99% of used browsers. Write a thread on sponsorflare again and the concepts of sharing login across subdomains and the 'GitHub Automatic Login'.

✅ Become my own sponsor using a different Github Account, for $50/m, to test it works as intended, and test the flow. Especially: how fast does the credit get there?

✅ Fixed a but where the ID couldn't be parsed and we missed a header for github

## Dashboard page

Add ability to logout via `/logout` which removes headers, removes access from client, and takes `?redirect_uri`.

Show username, image, and balance (spent-clv) in a header, which opens `/usage` when clicking where you can see all details, logout, see balance, and see where to sponsor.

Show warning and request to also see private repos if scope didn't include it yet.

Link to `/usage`

## Usage page

In `/usage` render stacked bar graph per date per hostname. Add ability to access it as data via `getUsage` fn.

## sponsorflare as package

Create `wilmake.cftemplate` template which basically just has all basic files for a new repo including a package of sponsorflare, so I can start with `gh repo create --public abcabc -p wilmake.cftemplate`

🔥 For the first time, I feel like I have a very powerful way of measuring work done with workers. Let's start using sponsorflare as a package and create a template.

## Create powerful worker-creator guide and chat

As a simple first demonstration of the product, create `uithub.chat` which simply proxies to chatcompletions.com/chat/completions but with key of R1, and charges the price needed. I already had docs.uithub.com/upstash-chat. Just use that one. Make it easy to put guides in context using select-boxes.

- DO for schedule, do for queue, do for kv/sql... document DOs with some very good examples and how it works in very few tokens
- create a very good prompt that generates all needed files for a worker besides the template from some simple natural language
- include the sponsorflare.ts
- put this prompt at a URL, easy to find.

Release uithub.chat API and UX with limit to -1.00 balance after signup (redirect oauth after hitting submit with prompt stuck in localstorage)

THIS IS WORTH A BIG AMOUNT OF LIKES IF I SHARE THE PROMPT. OR JUST CHAT?

## Dashboard

1. ensure data.forgithub.com/repos/x shows cache.forgithub.com/repos as well as # tokens and links to interesting contexts and derivations.
2. render data.forgithub.com/repos/x up-to-date repos at dashboard (superfast) and make it pretty.
3. Create text-version for data.forgithub.com for dashboard.uithub.com and for uithub.com/x
4. Focus: file.forgithub.com or config.forgithub.com. select a specific config file (readme, openapi, spec, etc) and view all repos, categorized, with half of space dedicated to this one file.
5. At https://cf.uithub.com/owner, we need to use the same datapoint but render a more exploration friendly dashboard intended to understand what someone does. Can use the same data.forgithub.com/repos/x api!!!!

Lets focus on making this context super worthy, and useful in order for a LLM to trim down what repos are significant for any given prompt.

# Pitchdeck

See [pitch-for-fund.md](./pitch-for-fund.md)
