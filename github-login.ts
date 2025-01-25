/*
======GITHUB LOGIN SCRIPT========
This is the most simple version of github oauth.

To use it, ensure to create a github oauth client, then set .dev.vars and wrangler.toml alike with the Env variables required

And navigate to /login from the homepage, with optional parameters ?scope=a,b,c

In localhost this won't work due to your hardcoded redirect url; It's better to simply set your localstorage manually.
*/
declare global {
  var env: Env;
}

export const html = (strings: TemplateStringsArray, ...values: any[]) => {
  return strings.reduce(
    (result, str, i) => result + str + (values[i] || ""),
    "",
  );
};

export interface Env {
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_REDIRECT_URI: string;
  LOGIN_REDIRECT_URI: string;
}

// Helper function to generate a random string
async function generateRandomString(length: number): Promise<string> {
  const randomBytes = new Uint8Array(length);
  crypto.getRandomValues(randomBytes);
  return Array.from(randomBytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);

    // Login page route
    if (url.pathname === "/login") {
      const scope = url.searchParams.get("scope");
      const state = await generateRandomString(16);
      if (
        !env.GITHUB_CLIENT_ID ||
        !env.GITHUB_REDIRECT_URI ||
        !env.GITHUB_CLIENT_SECRET
      ) {
        return new Response("Environment variables are missing");
      }

      // Create a response with HTTP-only state cookie
      return new Response("Redirecting", {
        status: 307,
        headers: {
          Location: `https://github.com/login/oauth/authorize?client_id=${
            env.GITHUB_CLIENT_ID
          }&redirect_uri=${encodeURIComponent(env.GITHUB_REDIRECT_URI)}&scope=${
            scope || "user:email"
          }&state=${state}`,
          "Set-Cookie": `github_oauth_state=${state}; HttpOnly; Path=/; Secure`,
        },
      });
    }

    // GitHub OAuth callback route
    if (url.pathname === "/callback") {
      // Get the state from URL and cookies
      const urlState = url.searchParams.get("state");
      const cookieHeader = request.headers.get("Cookie");
      // Extract state from cookies
      const rows = cookieHeader?.split("; ");
      const stateCookie = rows
        ?.find((row) => row.startsWith("github_oauth_state="))
        ?.split("=")[1];

      // Validate state
      if (!urlState || !stateCookie || urlState !== stateCookie) {
        return new Response(`Invalid state`, { status: 400 });
      }

      const code = url.searchParams.get("code");

      if (!code) {
        return new Response("Missing code", { status: 400 });
      }

      try {
        // Immediately exchange token
        const tokenResponse = await fetch(
          "https://github.com/login/oauth/access_token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              client_id: env.GITHUB_CLIENT_ID,
              client_secret: env.GITHUB_CLIENT_SECRET,
              code: code,
            }),
          },
        );

        const { access_token, scope }: any = await tokenResponse.json();

        // HTML with embedded access token and scope
        const callbackHTML = html`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
              />
              <title>Authentication Successful</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  height: 100vh;
                  margin: 0;
                  background-color: #f0f0f0;
                }
                .loading {
                  text-align: center;
                }
              </style>
            </head>
            <body>
              <div class="loading">
                <h1>Login Successful</h1>
                <p>Redirecting...</p>
                <script>
                  const data = {
                    access_token: "${access_token}",
                    scope: "${scope}",
                  };

                  // Store in localStorage
                  localStorage.setItem(
                    "github_oauth_access_token",
                    data.access_token,
                  );
                  localStorage.setItem("github_oauth_scope", data.scope);

                  // Redirect to home or dashboard
                  window.location.href = "${env.LOGIN_REDIRECT_URI || "/"}";
                </script>
              </div>
            </body>
          </html>
        `;

        return new Response(callbackHTML, {
          headers: {
            "Content-Type": "text/html",
            // Clear the state cookie after successful authentication
            "Set-Cookie": `github_oauth_state=; HttpOnly; Path=/; Secure; Max-Age=0`,
          },
        });
      } catch (error) {
        // Error handling
        return new Response(
          html`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <title>Login Failed</title>
              </head>
              <body>
                <h1>Login Failed</h1>
                <p>Unable to complete authentication.</p>
                <script>
                  alert("Login failed");
                  window.location.href = "/";
                </script>
              </body>
            </html>
          `,
          {
            status: 500,
            headers: {
              "Content-Type": "text/html",
              // Clear the state cookie in case of error
              "Set-Cookie": `github_oauth_state=; HttpOnly; Path=/; Secure; Max-Age=0`,
            },
          },
        );
      }
    }
  },
};
