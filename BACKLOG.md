# blog

write a supercool blogpost layout out the idea of 'validation looped coding'. put this on wilmake.com and other pages, ensure CTA is sponsorship, and push this to hackernews. go all in on this article going viral and collecting signups. every page from now that i release should have a sign-in button to sign-in with github, after which i know much more about the person.

# githubwatch

1. Actually subscribe to watching all repos upon login (via a waituntil+scheduled api call).
2. Ensure per user I know the source (where/when they logged in)
3. Ensure the watching all lands in cache
4. Watch also triggers calculating all repo stuff, so we end up with a file of all repos + calcs that is refreshed each time something changes. 🐐

# cycle

After all of the above functions as desired, the dashboard can become the home for initiating agentic work. It's to be a goto place to see how you are doing and what's happening with your work.

- patch
- actions
- cycle!!! overview of cycles from dashboard 🐐🔥

# Create powerful worker-creator guide and chat

As a simple first demonstration of the product, create `uithub.chat` which simply proxies to chatcompletions.com/chat/completions but with key of R1, and charges the price needed. I already had docs.uithub.com/upstash-chat. Just use that one. Make it easy to put guides in context using select-boxes.

- DO for schedule, do for queue, do for kv/sql... document DOs with some very good examples and how it works in very few tokens
- create a very good prompt that generates all needed files for a worker besides the template from some simple natural language
- include the sponsorflare.ts
- put this prompt at a URL, easy to find.

Release uithub.chat API and UX with limit to -1.00 balance after signup (redirect oauth after hitting submit with prompt stuck in localstorage)

THIS IS WORTH A BIG AMOUNT OF LIKES IF I SHARE THE PROMPT. OR JUST CHAT?
