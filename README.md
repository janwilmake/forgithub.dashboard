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

# TODO: THIS IS THE SHIT

## Login

✅ Transform to uithub dashboard.

Use sponsorflare as starting point, make uithub client. Take sponsorflare v2 with the right DO reference to `sponsorflare_SponsorDO`

Ensure cookie is shared between subdomains:
https://stackoverflow.com/questions/18492576/share-cookies-between-subdomain-and-domain

It's important that people can login from anywhere on uithub, to the came redirect uri, and then land back where they were. This helps not having to create soooo many clients. Let's confirm this is doable.

Login should just require `user:email` and in dashboard show warning and request to also see private repos.

Auth idea: redirect 401 to `/login` (which could redirect to site to callback and back to where i was). never problems logging in anymore!

## Dashboard

1. ensure data.forgithub.com/repos/x shows cache.forgithub.com/repos as well as #tokens and links to interesting contexts and derivations.
2. render data.forgithub.com/repos/x up-to-date repos at dashboard (superfast) and make it pretty.
3. Create text-version for data.forgithub.com for dashboard.uithub.com and for uithub.com/x
4. Focus: file.forgithub.com or config.forgithub.com. select a specific config file (readme, openapi, spec, etc) and view all repos, categorized, with half of space dedicated to this one file.
5. At https://cf.uithub.com/owner, we need to use the same datapoint but render a more exploration friendly dashboard intended to understand what someone does. Can use the same data.forgithub.com/repos/x api!!!!

Lets focus on making this context super worthy, and useful in order for a LLM to trim down what repos are significant for any given prompt.
