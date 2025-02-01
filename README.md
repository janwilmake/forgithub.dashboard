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

# TODO

See [todo](TODO.md)

# Pitchdeck

See [pitch-for-fund.md](./pitch-for-fund.md)
