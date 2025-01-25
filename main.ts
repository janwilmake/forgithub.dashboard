import login, { Env } from "./github-login";

export default {
  fetch: async (request: Request, env: Env) => {
    const response = await login.fetch(request, env);
    if (response) return response;
    return new Response("Method not allowed", {});
  },
};
