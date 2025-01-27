# The Agent-Powered GitHub Dashboard For 1000X Devs

> [!NOTE]
> This is a Work in Progress, built out from https://github.com/janwilmake/cloudflare-sponsorware. [Follow the progress in this thread](https://x.com/janwilmake/status/1883817352287924463)

Goal: bring all insights you want to see about your repos/sites/apps in 1 place.

- regular details
- hosted domain (domain.forgithub.com)
- usage stats
- openapi summary
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

Transform to uithub dashboard.

Use sponsorflare as starting point, make uithub client

Ensure cookie is shared between subdomains:
https://stackoverflow.com/questions/18492576/share-cookies-between-subdomain-and-domain

Login choice between only public or public/private.

## githubwatch

1. Actually subscribe to watching all repos upon login (via a waituntil+scheduled api call).
2. Ensure per user I know the source (where/when they logged in)
3. Ensure the watching all lands in cache
4. Watch also triggers calculating all repo stuff, so we end up with a file of all repos + calcs that is refreshed each time something changes. 🐐

At data.forgithub or join.forgithub, idontrememba,.... ensure we have the most fresh data for the important datapoints available

## dashboard

NEED TO LOAD FROM SINGULAR CACHED DATAPOINT STORED ON S3 (r2)!

1. render up-to-date repos at dashboard (superfast) and make it pretty.
2. ensure it shows #tokens and links to interesting contexts and derivations.
3. at https://cf.uithub.com/owner, we need to use the same datapoint but render a more exploration friendly dashboard intended to understand what someone does.

This is POC. This is already cool! Also, useful if it were a plaintext (that would allow you to put it into cursor etc)

Lets focus on making this context super worthy, and useful in order for a LLM to trim down what repos are significant for any given prompt.

# Other great insights

- recent social media / hackernews / news about topics XYZ --> great for GTM

## cycle

After all of the above functions as desired, the dashboard can become the home for initiating agentic work. It's to be a goto place to see how you are doing and what's happening with your work.

- patch
- actions
- cycle!!! overview of cycles from dashboard 🐐🔥
