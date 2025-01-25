## /index.html:

Show a simple screen with a button to login with github.

It uses the ?client_id&redirect_uri params to link to the right google login page.

Submit navigates to /client/authorize?client_id=shufflesite&redirect_uri={redirect_uri} where redirect uri is encoded
version of https://shufflesite.com/client/callback?url={encoded_url_from_form}

---

## /callback.html:

1 | Looks at "?code" param and submits this to POST "/exchange?code={code}" and retrieves {access_token} with
this, saving that to localStorage:access_token
2 |
3 | After that, looks at "?url=" param and submits this into "POST /new?url={url}" which shall respond with {url:string}
4 |
5 | Show a loading indicator during this process. Once we have the URL, redirect the user to "{url}?code={code}"
6 |

///exchangeCode:

````ts

import { client } from "../../src/sdk/client.js";

export const tryGetFormData = async (request: Request) => {
try {
const formData = await request.formData();
return formData;
} catch (e) {
const contentType = request.headers.get("Content-Type");
return contentType || "No content-type";
}
};
/** Gets access_token for ActionSchema auth.
* Can be called from the frontend using a code.
* The rest will be found.
* Wraps access_token endpoint
*
* This endpoint isn't safe. The client should create this endpoint themselves, them having the client_secret and calling
auth.actionschema.com/client/access_token
*/
export async function POST(request: Request) {
// Parse the query parameters from the request URL

const formData = await tryGetFormData(request);

if (typeof formData === "string") {
return new Response(
JSON.stringify({
error: "Missing FormData. Provide 'code=xyz' as formdata!",
}),
{ status: 400, headers: { "Content-Type": "application/json" } },
);
}

const origin = new URL(request.url).origin;

const code = formData.get("code")?.toString();

if (!code) {
return new Response(
JSON.stringify({
error: "Missing required parameters. Provide 'code=xyz' as formdata!",
}),
{ status: 400, headers: { "Content-Type": "application/json" } },
);
}

const stateItem = (
await client.oauth2ClientFlowState("read", { rowIds: [code] })
).items?.[code];

if (!stateItem) {
return new Response(JSON.stringify({ error: "State not found" }), {
status: 404,
headers: { "Content-Type": "application/json" },
});
}

try {
const tokenResult = await exchangeCodeForToken(
origin,
stateItem.client_id,
stateItem.client_secret,
code,
);

return new Response(JSON.stringify(tokenResult), {
status: 200,
headers: { "Content-Type": "application/json" },
});
} catch (e) {
return new Response(JSON.stringify({ error: (e as any).message }), {
status: 500,
headers: { "Content-Type": "application/json" },
});
}
}

interface TokenExchangeResponse {
access_token: string;
token_type: string;
expires_in: number;
scope: string;
}

async function exchangeCodeForToken(
origin: string,
client_id: string,
client_secret: string,
code: string,
): Promise<TokenExchangeResponse | string> {
    const url = origin + "/client/access_token";
    console.log({ url });
    const formData = new FormData();
    formData.append("code", code);
    formData.append("client_id", client_id);
    formData.append("client_secret", client_secret);

    try {
    const response = await fetch(url, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
    });

    if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to exchange token");
    }

    const data: TokenExchangeResponse = await response.json();
    console.log({ data });
    return data;
    } catch (error) {
    return (error as any).message;
    }
    }


```

    --------------------------------------------------------------------------------
    main.ts:
    --------------------------------------------------------------------------------
    This POST endpoint gets access_token for ActionSchema auth.

    Its input is a JSON containing {code:string}

    With that code and CLIENT_ID and CLIENT_SECRET from process.env it calls
    https://auth.actionschema.com/client/access_token via the oauth2 way

    The resulting access_token is returned to the user in a JSON object


    POST:/access_token:

    ```typescript

    import { generateRandomString } from "edge-util";
    import { client } from "../../src/sdk/client.js";

    /**
    * The post request that ChatGPT calls.
    */
    export async function POST(request: Request) {
    // Parse the query parameters from the request URL
    // const url = new URL(request.url);

    const formData = await request.formData();

    const client_id = formData.get("client_id")?.toString();
    const client_secret = formData.get("client_secret")?.toString();
    const code = formData.get("code")?.toString();

    console.log(`incoming code to exchange (from third party):`, {
    client_id,
    client_secret,
    code,
    });

    // Validate required parameters
    if (!client_id || !client_secret || !code) {
    return new Response(
    JSON.stringify({ error: "Missing required parameters" }),
    { status: 400, headers: { "Content-Type": "application/json" } },
    );
    }

    const adminUserId = (
    await client.adminClientIndex("read", { rowIds: [client_id] })
    ).items?.[client_id]?.adminUserId;

    const admin = adminUserId
    ? (
    await client.admin("read", {
    rowIds: [adminUserId],
    })
    ).items?.[adminUserId]
    : undefined;

    if (!adminUserId || !admin) {
    return new Response(
    JSON.stringify({
    error: "no_admin",
    error_description: "No admin",
    }),
    { status: 500 },
    );
    }

    const stateItem = (
    await client.oauth2ClientFlowState("read", { rowIds: [code] })
    ).items?.[code];

    console.log("access_token stateItem", { stateItem });

    if (!stateItem) {
    return new Response(JSON.stringify({ error: "State not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
    });
    }

    if (
    !stateItem.response_type ||
    !stateItem.adminUserId ||
    !stateItem.client_id ||
    !stateItem.client_secret ||
    !stateItem.redirect_uri ||
    stateItem.scope === undefined
    ) {
    return new Response(
    JSON.stringify({
    error: !stateItem.adminUserId ? "No Auth token" : "Not sufficient",
    }),
    {
    status: 403,
    headers: { "Content-Type": "application/json" },
    },
    );
    }

    const user = (
    await client.admin("read", {
    rowIds: [stateItem.adminUserId],
    })
    ).items?.[stateItem.adminUserId];

    const clientItem = admin?.clients?.find(
    (x) => x.clientId === stateItem.client_id,
    );

    const newAuthToken = generateRandomString(64);

    const key = user?.clientPermissions?.find(
    (x) => x.clientId === clientItem?.clientId,
    );

    if (!clientItem?.retrieveDirectAccessToken) {
    // we didn't get a direct one so are creating a new access token

    await client.adminClientPermissionIndex("update", {
    id: newAuthToken,
    partialItem: { adminUserId: stateItem.adminUserId },
    });

    const newClientPermissions = (user?.clientPermissions || []).concat({
    access_token: newAuthToken,
    providerSlug: "actionschema-auth",
    token_type: "Bearer",
    clientId: stateItem.client_id,
    createdAt: Date.now(),
    scope: key?.scope || "admin",
    });

    await client.admin("update", {
    id: stateItem.adminUserId,
    partialItem: { clientPermissions: newClientPermissions },
    });
    }

    const access_token = clientItem?.retrieveDirectAccessToken
    ? key?.access_token
    : newAuthToken;

    const hasInvalidParams = stateItem.client_id !== client_id;

    console.log({
    clientItem,
    retrieveDirectAccessToken: clientItem?.retrieveDirectAccessToken,
    access_token,
    hasInvalidParams,
    });

    if (!access_token) {
    return new Response(JSON.stringify({ error: "Couldn't find key" }), {
    status: 404,
    headers: { "Content-Type": "application/json" },
    });
    }

    if (hasInvalidParams) {
    return new Response(JSON.stringify({ error: "Invalid params" }), {
    status: 403,
    headers: { "Content-Type": "application/json" },
    });
    }

    const tokenResult = {
    access_token,
    token_type: "Bearer",
    expires_in: 86400,
    scope: "",
    };

    console.log("access_token", { tokenResult });

    const removeResult = await client.oauth2ProviderFlowState("remove", {
    rowIds: [code],
    });

    if (!removeResult.isSuccessful) {
    return new Response(JSON.stringify({ error: "Couldn't remove state" }), {
    status: 500,
    headers: { "Content-Type": "application/json" },
    });
    }

    return new Response(JSON.stringify(tokenResult), {
    status: 200,
    headers: {
    "Content-Type": "application/json",
    },
    });
    }
    ```

    POST /authorize

    ```
    import { generateRandomString } from "edge-util";
    import { client } from "../../src/sdk/client.js";
    import { ModelItem } from "../../src/sdk/provider.js";
    import { getAuthTokenCookie } from "../../src/getAuthTokenCookie.js";
    import { fetchProviders } from "../../src/fetchProviders.js";

    /**
    Endpoint to authenticate a user into a provider (oauth server)

    This endpoint redirects the user to the login service provider and ties the state to the user.

    Steps:

    - Call `auth.actionschema.com/client/authorize` with client_id
    - Admin.clients.find() -> downstream authorization could happen
    - Redirect to client callbackUrl or redirect_uri with code
    - Client should call `POST /client/access_token` which should respond with the access_token that was needed.


    NB: made the HTML using Claude: https://claude.ai/chat/d1334a1c-8b87-4cf3-9a73-e099c1be04fe
    */
    export const GET = async (request: Request) => {
    const url = new URL(request.url);
    const client_id = url.searchParams.get("client_id");
    const response_type = url.searchParams.get("response_type") || "code";
    const stateParameter = url.searchParams.get("state");
    const redirect_uri = url.searchParams.get("redirect_uri");
    const state = stateParameter || generateRandomString(64);
    const providers = await fetchProviders();
    // if given, overwrites default scope
    const scope = url.searchParams.get("scope");

    if (!client_id) {
    return callbackResponse({
    finalRedirectUrl: redirect_uri,
    state: state || "",
    error_description: "missing client_id",
    });
    }

    if (response_type !== "code") {
    return callbackResponse({
    finalRedirectUrl: redirect_uri,
    state: state || "",
    error_description:
    "only response_type 'code' is supported. you used " + response_type,
    });
    }

    const adminUserId = (
    await client.adminClientIndex("read", { rowIds: [client_id] })
    ).items?.[client_id]?.adminUserId;

    if (!adminUserId) {
    return callbackResponse({
    finalRedirectUrl: redirect_uri,
    state: state || "",
    error_description: "No index found for " + client_id,
    });
    }

    const adminResult = (
    await client.admin("read", {
    rowIds: [adminUserId],
    })
    )?.items?.[adminUserId];

    if (!adminResult) {
    return callbackResponse({
    finalRedirectUrl: redirect_uri,
    state: state || "",
    error_description: "No admin found for " + client_id,
    });
    }

    const oauthClient = adminResult.clients?.find(
    (item) => item.clientId === client_id,
    );

    if (!oauthClient) {
    console.log({ clients: adminResult.clients, client_id });
    return callbackResponse({
    finalRedirectUrl: redirect_uri,
    state: state || "",
    error_description:
    "No admin found or no client found for client_id=" + client_id,
    });
    }

    const finalRedirectUrl = redirect_uri || oauthClient?.callbackUrl;

    if (!finalRedirectUrl) {
    return callbackResponse({
    finalRedirectUrl: redirect_uri,
    state: state || "",
    error_description:
    "Please provide a redirect_uri or a default callbackUrl in the client. client_id=" +
    client_id,
    });
    }

    //////////////////////////////////
    // NB: we now have the client & provider!
    //////////////////////////////////

    const cookie = request.headers.get("Cookie");
    const authToken = getAuthTokenCookie(cookie);

    const permission = authToken
    ? (await client.adminClientPermissionIndex("read", { rowIds: [authToken] }))
    ?.items?.[authToken]
    : undefined;

    console.log({ cookie, authToken, permission });

    // NB: if you give a bearer token, it must be a valid one, connected to an existing user
    const user = permission?.adminUserId
    ? (await client.admin("read", { rowIds: [permission.adminUserId] }))
    ?.items?.[permission.adminUserId]
    : undefined;

    const requiredProviders = oauthClient.requiredProviders?.map((item) => ({
    ...item,
    provider: providers[item.providerSlug as keyof typeof providers] as
    | ModelItem
    | undefined,

    adminProvider: adminResult.providers?.find(
    (x) => x.providerSlug === item.providerSlug,
    ),

    providerPermission: user?.providerPermissions?.filter(
    (x) => x.providerSlug === item.providerSlug,
    // TODO: for now just the first permission we find, later can filter on scope if needed.
    )?.[0],
    }));

    if (!user) {
    // We need to login with either the requiredProviders if one of them is a trusted provider, otherwise just with the
    first best trusted provider.
    // Result: we are logged in as a user and can assess permissions. Now we get a page to approve further things.

    const requiredTrustedProviders = requiredProviders?.filter(
    (x) => x.provider?.isTrustedOauthLink,
    );
    const trustedProviders =
    requiredTrustedProviders && requiredTrustedProviders.length > 0
    ? requiredTrustedProviders
    : [
    {
    provider: providers.github,
    adminProvider: adminResult.providers?.find(
    (x) => x.providerSlug === "github",
    ),
    providerPermissioin: undefined,
    providerSlug: "github",
    scope: "read:email",
    reason: "You need to Login into ActionSchema",
    },
    ];

    const loginHtml = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Login - ActionSchema</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet">
    </head>

    <body class="bg-gray-100 min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6 text-center">Login to ActionSchema</h1>
            <ul class="space-y-4">
                ${trustedProviders
                ?.map(
                (item) => `
                <li class="border rounded-lg p-4">
                    <h2 class="text-lg font-semibold mb-2">${
                        item.providerSlug
                        }</h2>
                    <p class="text-sm text-gray-600 mb-2">
                        <span class="font-medium">Scope:</span> ${
                        item.scope
                        }
                    </p>
                    <p class="text-sm text-gray-600 mb-4">
                        <span class="font-medium">Reason:</span> ${
                        item.reason || "N/A"
                        }
                    </p>
                    <a href="https://auth.actionschema.com/provider/authorize?client_id=${
                                item.adminProvider?.clientId
                              }&response_type=code&scope=${
                            item.scope
                          }&redirect_uri=${encodeURIComponent(request.url)}"
                        class="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                        <i class="fab fa-${item.providerSlug.toLowerCase()} mr-2"></i> Authorize with ${
                        item.providerSlug
                        }
                    </a>
                </li>
                `,
                )
                .join("")}
            </ul>
        </div>
    </body>

    </html>`;

    return new Response(loginHtml, {
    status: 200,
    headers: { "Content-Type": "text/html" },
    });
    }

    const finalScope = scope || oauthClient.scope || "";

    const isScopeAllowed = true;
    if (!isScopeAllowed) {
    //TODO: calculate if scope given is valid scope for the provider
    return;
    }

    const allRequiredProvidersPermitted =
    !requiredProviders ||
    requiredProviders.every((item) => !!item.providerPermission?.access_token);

    const code = generateRandomString(64);

    const updateResult = await client.oauth2ClientFlowState("update", {
    id: code,
    partialItem: {
    client_id,
    client_secret: oauthClient.clientSecret,
    response_type,
    redirect_uri: finalRedirectUrl,
    scope: finalScope,
    adminUserId: permission?.adminUserId,
    state,
    },
    });

    if (!updateResult.isSuccessful) {
    console.log({ updateResult });
    return callbackResponse({
    state,
    finalRedirectUrl,
    error_description: "Setting state went wrong",
    });
    }

    const autoApprove = false;

    if (allRequiredProvidersPermitted && autoApprove) {
    // Successful callback that includes code!
    return callbackResponse({ state, code, finalRedirectUrl });
    }

    const fullRedirectUrl = new URL(finalRedirectUrl);
    fullRedirectUrl.searchParams.append("state", state);
    fullRedirectUrl.searchParams.append("code", code);

    // Show form with buttons to authorize for each required provider
    // Some can also just be an API key with links
    const requiredProvidersOverviewHtml = `
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Authorize Providers - ActionSchema</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" rel="stylesheet">
    </head>

    <body class="bg-gray-100 min-h-screen flex items-center justify-center">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold mb-6 text-center">Authorize Providers</h1>
            <ul class="space-y-4 mb-6">
                ${requiredProviders
                ?.map((item) => {
                const isOAuth = item.provider?.hasOauth2;

                const isAuthorized =
                !!item.providerPermission &&
                (!item.providerPermission.expires_in ||
                item.providerPermission.expires_in * 1000 +
                (item.providerPermission as any).createdAt >
                Date.now());

                const oauth2Authorization = isAuthorized
                ? `<p class="text-green-500 font-medium"><i class="fas fa-check-circle mr-2"></i>Already authorized!</p>
                `
                : `<a href="https://auth.actionschema.com/provider/authorize?client_id=${
                      item.adminProvider?.clientId
                    }&response_type=code&scope=${
                      item.scope
                    }&redirect_uri=${encodeURIComponent(request.url)}"
                    class="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                    <i class="fab fa-${item.providerSlug.toLowerCase()} mr-2"></i> Authorize ${
                    item.providerSlug
                    }
                </a>`;

                const secretAuthorization = isAuthorized
                ? `<p class="text-green-500 font-medium"><i class="fas fa-check-circle mr-2"></i>Secret provided</p>`
                : `<a href="https://auth.actionschema.com/provider/secret?providerSlug=${
                      item.providerSlug
                    }&redirect_uri=${encodeURIComponent(request.url)}"
                    class="block w-full text-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300">
                    <i class="fab fa-${item.providerSlug.toLowerCase()} mr-2"></i> Authorize ${
                    item.providerSlug
                    }
                </a>`;
                const authorizationSection = isOAuth
                ? oauth2Authorization
                : secretAuthorization;

                return `
                <li class="border rounded-lg p-4">
                    <h2 class="text-lg font-semibold mb-2">${
                        item.providerSlug
                        }</h2>
                    <p class="text-sm text-gray-600 mb-2">
                        <span class="font-medium">Scope:</span> ${item.scope}
                    </p>
                    <p class="text-sm text-gray-600 mb-4">
                        <span class="font-medium">Reason:</span> ${
                        item.reason || "N/A"
                        }
                    </p>
                    ${authorizationSection}
                </li>
                `;
                })
                .join("")}
            </ul>
            ${
            allRequiredProvidersPermitted
            ? `<a href="${fullRedirectUrl.toString()}"
                class="block w-full text-center bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded transition duration-300">
                <i class="fas fa-check-circle mr-2"></i> Approve and Continue
            </a>`
            : `<p class="text-center text-red-500 font-medium"><i class="fas fa-exclamation-triangle mr-2"></i>Please
                authorize all required providers first</p>`
            }
        </div>
    </body>

    </html>`;

    return new Response(requiredProvidersOverviewHtml, {
    status: 200,
    headers: { "Content-Type": "text/html" },
    });
    };

    const callbackResponse = (context: {
    finalRedirectUrl?: string | null;
    error_description?: string;
    code?: string;
    state: string;
    }) => {
    const { finalRedirectUrl, code, error_description, state } = context;

    if (!finalRedirectUrl) {
    return new Response(error_description || "Error: something went wrong", {
    status: 400,
    });
    }

    const fullRedirectUrl = new URL(finalRedirectUrl);

    fullRedirectUrl.searchParams.append("state", state);

    if (code) {
    fullRedirectUrl.searchParams.append("code", code);
    } else {
    fullRedirectUrl.searchParams.append("error", "error");
    if (error_description) {
    fullRedirectUrl.searchParams.append(
    "error_description",
    error_description,
    );
    }
    }

    return new Response("Redirecting..", {
    status: 302,
    headers: { Location: fullRedirectUrl.toString() },
    });
    };
    ```
````
