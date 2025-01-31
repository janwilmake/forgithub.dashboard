## `/owner/dashboard.json` (2025-01-31)

Create endpoint `dashboard.uithub.com/dashboard.json` that:

- use `join.forgithub.com` but with a `nachocache` in front
- Returns KV value immediately (or loads if not yet or `?refresh=true`)
- Calls `waitUntil` that calls queue to fetch from `join` if KV >1h old or if there was a `?refresh=true`
- has README.md, CHANGELOG.md, SPEC.md, TODO.md, ADR.md, size, and openapiSummary
- has `context: {id:string,title:string,url:string,description:string}[]` which can be used for chat (redirect to `chat.uithub.com?context=https://dashboard.uithub.com/dashboard.json&id=xxx`)

Does this just for all repos from the last 30 days (for now) to prevent ratelimit trouble.

## `/[owner]/dashboard.md?focus=[datapoint]`

Use AI to write a function that just nicely renders it as markdown.

If focus is provided, will also show a .md page

## openapi.json

make openapi that documents the use of `dashboard.json` and `dashboard.md`

## `/[owner]/dashboard.html` UI

- link to show raw data
- at the top, select what to view in the right pane
- at the top, add search that matches on full_name
- show repo card with screenshot on the left, pane at the right that renders a datapoint such as README.md, CHANGELOG.md, SPEC.md, TODO.md, ADR.md, size, and openapiSummary
- clear buttons linking to useful things like uithub, github, website, forgithub (other tools)

## `grid.html`

renders ag-grid which just loads from `dashboard.json`

## https://cf.uithub.com/[owner]

We need to use the same datapoint but render a more exploration friendly dashboard intended to understand what someone does. Can use the same `dashboard.json/md` api!
