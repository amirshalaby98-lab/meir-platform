const defaultAppId = process.env.VITE_APP_ID ?? "local-services-company";
const defaultCookieSecret = process.env.JWT_SECRET ?? "dev-secret-change-me";
const defaultOAuthServerUrl =
  process.env.OAUTH_SERVER_URL ?? "http://localhost:3000";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? defaultAppId,
  cookieSecret: process.env.JWT_SECRET ?? defaultCookieSecret,
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? defaultOAuthServerUrl,
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
};
