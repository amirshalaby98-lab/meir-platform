export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate the OAuth login URL at runtime so the redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl =
    import.meta.env.VITE_OAUTH_PORTAL_URL?.trim() || window.location.origin;
  const appId = import.meta.env.VITE_APP_ID?.trim() || "local-services-company";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const normalizedBaseUrl = oauthPortalUrl.endsWith("/")
    ? oauthPortalUrl.slice(0, -1)
    : oauthPortalUrl;

  const url = new URL(`${normalizedBaseUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
