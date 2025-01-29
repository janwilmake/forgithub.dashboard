import {
  Env,
  getSponsor,
  html,
  middleware,
  getUsage,
  getCookies,
} from "sponsorflare";
import dashboardHtml from "./dashboard.html";
import usageHtml from "./usage.html";

export default {
  fetch: async (request: Request, env: Env) => {
    // Handle sponsorflare auth
    const sponsorflare = await middleware(request, env);
    if (sponsorflare) return sponsorflare;

    const sponsor = await getSponsor(request, env);

    const url = new URL(request.url);
    const { scope, access_token, owner_id } = getCookies(request);

    if (
      url.pathname === "/dashboard" ||
      (sponsor.is_authenticated &&
        sponsor.owner_login &&
        !url.searchParams.get("home") &&
        url.pathname === "/")
    ) {
      if (!sponsor.is_authenticated) {
        // Trick (see https://x.com/janwilmake/status/1884635657131221244)
        return new Response("Redirecting...", {
          status: 307,
          headers: {
            Location:
              url.origin +
              `/login?redirect_uri=${encodeURIComponent(
                "https://dashboard.uithub.com/dashboard",
              )}`,
          },
        });
      }

      // const reposResponse = await fetch(
      //   `https://cache.forgithub.com/repos/${sponsor.owner_login}`,
      //   {
      //     headers: access_token
      //       ? { Authorization: `Bearer ${access_token}` }
      //       : undefined,
      //   },
      // );
      // if (!reposResponse.ok) {
      //   return new Response("Something went wrong: " + reposResponse.status, {
      //     status: reposResponse.status,
      //   });
      // }

      // const repoData = reposResponse.json();

      const repos = [
        {
          name: "api-gateway",
          domain: "uithub.com",
          openapi: {
            summary: "Main API with 25 endpoints",
            version: "3.1.0",
          },
          screenshot: null,
          categories: ["API Gateway", "Node.js", "Redis"],
          actions: { successRate: 0.92, lastRun: "2024-03-16T09:45:00Z" },
          deployment: {
            provider: "Cloudflare",
            logo: "https://www.vectorlogo.zone/logos/cloudflare/cloudflare-icon.svg",
          },
          links: {
            github: "#",
            uithub: "#",
            website: "#",
            openapi: "#",
          },
        },
        {
          name: "auth-service",
          domain: "dashboard.uithub.com",
          openapi: {
            summary: "Authentication API with OAuth2",
            version: "2.4.1",
          },
          screenshot: null,
          categories: ["Authentication", "TypeScript", "PostgreSQL"],
          actions: { successRate: 0.88, lastRun: "2024-03-15T16:20:00Z" },
          deployment: {
            provider: "Vercel",
            logo: "https://www.svgrepo.com/show/327408/logo-vercel.svg",
          },
          links: {
            github: "#",
            uithub: "#",
            website: "#",
            openapi: "#",
          },
        },
        {
          name: "payment-processor",
          domain: "dashboard.uithub.com",
          openapi: {
            summary: "Payment processing endpoints",
            version: "1.2.0",
          },
          screenshot: null,
          categories: ["Payments", "Go", "MySQL"],
          actions: { successRate: 0.95, lastRun: "2024-03-16T11:10:00Z" },
          deployment: {
            provider: "AWS",
            logo: "https://www.vectorlogo.zone/logos/amazon_aws/amazon_aws-icon.svg",
          },
          links: {
            github: "#",
            uithub: "#",
            website: "#",
            openapi: "#",
          },
        },
        {
          name: "analytics-dashboard",
          domain: "analytics.example.com",
          openapi: null,
          screenshot: null,
          categories: ["Analytics", "React", "TypeScript"],
          actions: { successRate: 0.78, lastRun: "2024-03-14T14:15:00Z" },
          deployment: {
            provider: "Netlify",
            logo: "https://www.vectorlogo.zone/logos/netlify/netlify-icon.svg",
          },
          links: {
            github: "#",
            uithub: "#",
            website: "#",
            openapi: "#",
          },
        },
        {
          name: "email-service",
          domain: "uithub.com",
          openapi: {
            summary: "Transactional email service",
            version: "1.0.0",
          },
          screenshot: null,
          categories: ["Communication", "Python", "Redis"],
          actions: { successRate: 0.85, lastRun: "2024-03-16T08:30:00Z" },
          deployment: {
            provider: "Google Cloud",
            logo: "https://www.vectorlogo.zone/logos/google_cloud/google_cloud-icon.svg",
          },
          links: {
            github: "#",
            uithub: "#",
            website: "#",
            openapi: "#",
          },
        },
        {
          name: "cdn-edge",
          domain: "dashboard.uithub.com",
          openapi: null,
          screenshot: null,
          categories: ["CDN", "Rust", "WASM"],
          actions: { successRate: 0.97, lastRun: "2024-03-16T10:00:00Z" },
          deployment: {
            provider: "Cloudflare",
            logo: "https://www.vectorlogo.zone/logos/cloudflare/cloudflare-icon.svg",
          },
          links: {
            github: "#",
            uithub: "#",
            website: "#",
            openapi: "#",
          },
        },
      ];

      return new Response(
        dashboardHtml.replace(
          "<script>",
          `<script>\nconst data = ${JSON.stringify({
            sponsor,
            scope,
            repos,
          })}\n\n`,
        ),
        {
          headers: { "content-type": "text/html" },
        },
      );
    }

    if (url.pathname === "/usage.json") {
      const usage = await getUsage(request, env);
      if (!usage.usage) {
        return new Response(usage.error || "Couldn't get usage", {
          status: 400,
        });
      }
      return new Response(JSON.stringify(usage.usage, undefined, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (url.pathname === "/usage.html" || url.pathname === "/usage") {
      const usage = await getUsage(request, env);
      if (!usage.usage) {
        return new Response(usage.error || "Couldn't get usage", {
          status: 400,
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
            <meta
              name="description"
              content="Become a 1000X Dev by letting AI Agents get to work into your all your repos simultaneously."
            />
            <meta name="robots" content="index, follow" />

            <!-- Facebook Meta Tags -->
            <meta
              property="og:url"
              content="https://https://dashboard.uithub.com"
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
              content="https://quickog.com/screenshot/https://dashboard.uithub.com?b"
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
              content="https://dashboard.uithub.com"
            />
            <meta
              property="twitter:url"
              content="https://https://dashboard.uithub.com"
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
              content="https://quickog.com/screenshot/https://dashboard.uithub.com?b"
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
                    href="${sponsor.is_authenticated
                      ? "/dashboard"
                      : "/login?scope=user:email"}"
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
      { headers: { "content-type": "text/html" } },
    );
  },
};
