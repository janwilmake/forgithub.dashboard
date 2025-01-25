import login, { Env } from "./github-login";

const middleware = (
  ...middlewares: ((
    request: Request,
    env: Env,
  ) => Response | undefined | Promise<Response | undefined>)[]
) => {
  return async (request: Request, env: Env) => {
    for (const fn of middlewares) {
      const response = await fn(request, env);
      if (response) return response;
    }
    return new Response("Method not allowed", {});
  };
};
export default {
  fetch: middleware(login.fetch, (req, env) => {
    return undefined;
  }),
};
