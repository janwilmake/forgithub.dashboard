import login, { html, Env } from "./github-login";

export default {
  fetch: async (request: Request, env: Env) => {
    // Set env globally
    globalThis.env = env;

    // this is all i need for proper login with github!
    const page = await login.fetch(request, env);
    if (page) return page;

    return new Response(html``);
  },
};
