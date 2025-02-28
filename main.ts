import {
  Env,
  getSponsor,
  html,
  middleware,
  getUsage,
  getAuthorization,
} from "sponsorflare";
import dashboardHtml from "./dashboard.html";
import usageHtml from "./usage.html";
import gridHtml from "./grid.html";

export default {
  fetch: async (request: Request, env: Env) => {
    // CORS handling
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
    const url = new URL(request.url);

    const sponsorflare = await middleware(request, env);
    if (sponsorflare) return sponsorflare;

    const sponsor = await getSponsor(request, env);

    const { scope, access_token, owner_id } = getAuthorization(request);

    if (url.pathname === "/usage.json") {
      const usage = await getUsage(request, env);
      if (!usage.usage) {
        return new Response(usage.error || "Couldn't get usage", {
          status: 400,
          headers: corsHeaders,
        });
      }
      return new Response(JSON.stringify(usage.usage, undefined, 2), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (url.pathname === "/usage.html" || url.pathname === "/usage") {
      const usage = await getUsage(request, env);
      if (!usage.usage) {
        return new Response(usage.error || "Couldn't get usage", {
          status: 400,
          headers: corsHeaders,
        });
      }

      return new Response(
        usageHtml.replace(
          "<script>",
          `<script>\nconst data = ${JSON.stringify({
            usage: usage.usage,
          })}\n\n`,
        ),
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        },
      );
    }

    const [owner, page] = url.pathname.split("/").slice(1);

    if (owner && page) {
      const apiKeyPart =
        access_token &&
        owner.toLowerCase() === sponsor.owner_login?.toLowerCase()
          ? `&apiKey=${access_token}`
          : "";
      //&datapoints=details&datapoints=domain&datapoints=openapi
      const joinUrl = `http://nachocache.com/1d/stale/join.forgithub.com/${owner}?datapoints=details${apiKeyPart}`;
      const reposResponse = await fetch(joinUrl);
      console.log({ joinUrl });
      if (!reposResponse.ok) {
        const text = await reposResponse.text();
        console.log({ joinUrl, text });
        return new Response("Something went wrong: " + reposResponse.status, {
          status: reposResponse.status,
        });
      }

      const joinData: {
        errors: any[];
        responses?: {
          [owner: string]: {
            [repo: string]: {
              size: {};
              details: {
                full_name: string;
                description: string;
                url: string;
                homepage: string | null;
                updated_at: string;
                size: number;
              };
            };
          };
        };
      } = await reposResponse.json();

      const ownerResponse = joinData.responses?.[owner];

      const repos = ownerResponse
        ? Object.keys(ownerResponse).map((key) => {
            const item = joinData.responses![owner][key];
            const { full_name, description, homepage, size, updated_at } =
              item.details || {};
            return {
              full_name,
              description,
              homepage,
              size,
              updated_at,
              githubUrl: `https://github.com/${full_name}`,
              chatUrl: `https://githuq.com/${full_name}`,
              contextUrl: `https://uithub.com/${full_name}`,
              screenshotUrl: homepage
                ? `https://quickog.com/screenshot/${homepage}`
                : null,
            };
          })
        : undefined;

      if (page === "dashboard.json") {
        return new Response(
          JSON.stringify({ repos, context: undefined }, undefined, 2),
          {
            status: 200,
            headers: { "content-type": "application/json", ...corsHeaders },
          },
        );
      }

      if (page === "dashboard.md") {
        const focus = url.searchParams.get("focus");
        // If focus is provided, will also show a .md page

        const markdown = repos
          ?.map((item) =>
            Object.keys(item)
              .map((key) => `${key}: ${item[key as keyof typeof item]}`)
              .join("\n"),
          )
          .join("\n\n--------\n\n");
        return new Response(markdown, {
          status: 200,
          headers: { "content-type": "text/markdown", ...corsHeaders },
        });
      }

      if (page === "grid.html") {
        return new Response(
          gridHtml.replace(
            "<script>",
            `<script>\nwindow.data = ${JSON.stringify(
              { grid: repos },
              undefined,
              2,
            )};\n\n`,
          ),
          { headers: { "content-type": "text/html", ...corsHeaders } },
        );
      }

      if (page === "dashboard.html") {
        return new Response(
          dashboardHtml.replace(
            "<script>",
            `<script>\nwindow.data = ${JSON.stringify(
              {
                sponsor,
                scope,
                joinData,
                repos,
                owner,
              },
              undefined,
              2,
            )};\n\n`,
          ),
          { headers: { "content-type": "text/html", ...corsHeaders } },
        );
      }
    }

    const isHome = url.searchParams.get("home") === "true";
    if (sponsor.is_authenticated && !isHome) {
      return new Response("redirecting", {
        status: 302,
        headers: { location: `/${sponsor.owner_login}/dashboard.html` },
      });
    }

    const ctaHref = sponsor.is_authenticated
      ? `/${sponsor.owner_login}/dashboard.html`
      : "/login?scope=user:email";

    return new Response(
      html`<!DOCTYPE html>
        <html lang="en" class="bg-black">
          <head>
            <meta charset="UTF-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1.0"
            />
            <title>The Agent-Powered GitHub Dashboard For 1000X Devs</title>

            <link rel="icon" type="image/x-icon" href="/favicon.ico" />

            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href="/apple-touch-icon.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href="/favicon-32x32.png"
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href="/favicon-16x16.png"
            />
            <link rel="manifest" href="/site.webmanifest" />

            <meta
              name="description"
              content="Become a 1000X Dev by letting AI Agents get to work into your all your repos simultaneously."
            />
            <meta name="robots" content="index, follow" />

            <!-- Facebook Meta Tags -->
            <meta
              property="og:url"
              content="https://https://dashboard.forgithub.com"
            />
            <meta property="og:type" content="website" />
            <meta
              property="og:title"
              content="The Agent-Powered GitHub Dashboard For 1000X Devs"
            />
            <meta
              property="og:description"
              content="Become a 1000X Dev by letting AI Agents get to work into your all your repos simultaneously - even when you're away."
            />
            <meta
              property="og:image"
              content="https://quickog.com/screenshot/https://dashboard.forgithub.com"
            />
            <meta
              property="og:image:alt"
              content="Become a 1000X Dev by letting AI Agents get to work into your all your repos simultaneously  - even when you're away."
            />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />

            <!-- Twitter Meta Tags -->
            <meta name="twitter:card" content="summary_large_image" />
            <meta
              property="twitter:domain"
              content="https://dashboard.forgithub.com"
            />
            <meta
              property="twitter:url"
              content="https://https://dashboard.forgithub.com"
            />
            <meta
              name="twitter:title"
              content="The Agent-Powered GitHub Dashboard For 1000X Devs"
            />
            <meta
              name="twitter:description"
              content="Become a 1000X Dev by letting AI Agents get to work into your all your repos simultaneously - even when you're away."
            />
            <meta
              name="twitter:image"
              content="https://quickog.com/screenshot/https://dashboard.forgithub.com"
            />

            <script src="https://cdn.tailwindcss.com"></script>

            <style>
              @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");
              body {
                font-family: "Inter", sans-serif;
              }
            </style>
          </head>

          <body class="text-gray-100">
            <main class="max-w-6xl mx-auto px-4 py-8 md:py-16">
              <!-- Hero Section -->
              <div class="text-center mb-12 md:mb-20">
                <div
                  class="text-[200px] font-bold bg-gradient-to-r from-purple-600 to-pink-400 text-transparent bg-clip-text"
                >
                  ⌂
                </div>

                <h1
                  class="text-4xl md:text-7xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent leading-tight"
                >
                  The Agent-Powered GitHub Dashboard For 1000X Devs
                </h1>
                <p class="text-xl md:text-2xl text-gray-300 mb-6 md:mb-8">
                  UitHub is Your Home for AI-enhanced Software Development.
                  Become a 1000X Dev by letting AI Agents get to work into your
                  all your repos simultaneously - even when you're away.
                </p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    id="login"
                    href="${ctaHref}"
                    class="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6 py-3 rounded-lg font-medium transition-colors text-center text-white"
                  >
                    ${sponsor.is_authenticated
                      ? "Dashboard"
                      : "Request Early Access"}
                  </a>
                  <a
                    href="https://github.com/janwilmake/uithub.dashboard"
                    target="_blank"
                    class="w-full sm:w-auto border border-purple-500 text-purple-400 px-6 py-3 rounded-lg font-medium hover:bg-purple-500/10 transition-colors text-center"
                  >
                    View on GitHub
                  </a>
                </div>
              </div>

              <!-- Status Alert -->
              <div
                class="bg-purple-900/30 border border-purple-800 rounded-lg p-4 md:p-6 mb-8 md:mb-12"
              >
                <div
                  class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 text-purple-400"
                >
                  <svg
                    class="w-6 h-6 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zm0 16a3 3 0 01-3-3h6a3 3 0 01-3 3z"
                    />
                  </svg>
                  <div>
                    <p class="font-medium">Early Development Preview</p>
                    <p class="text-sm text-purple-300/80">
                      Follow our progress on
                      <a
                        href="https://x.com/janwilmake/status/1883817352287924463"
                        class="underline hover:text-purple-200"
                        >X</a
                      >
                    </p>
                  </div>
                </div>
              </div>

              <!-- Footer -->
              <div
                class="text-center text-gray-500 border-t border-gray-800 pt-8 md:pt-12"
              >
                <p>Built with ❤️ for the Cloudflare ecosystem</p>
              </div>
            </main>
          </body>
        </html>`,
      { headers: { "content-type": "text/html", ...corsHeaders } },
    );
  },
};
