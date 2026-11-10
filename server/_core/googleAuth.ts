import { createLogger } from "./logger";
const log = createLogger("google-auth");
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";
import crypto from "node:crypto";
import { parse as parseCookieHeader } from "cookie";

const STATE_COOKIE = "google_oauth_state";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

function getRedirectUri(req: Request): string {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto = (Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto)?.split(",")[0].trim() || req.protocol;
  const host = req.get("host");
  return `${proto}://${host}/api/auth/google/callback`;
}

export function registerGoogleAuthRoutes(app: Express) {
  app.get("/api/auth/google", (req: Request, res: Response) => {
    if (!ENV.googleClientId) {
      log.error("[GoogleAuth] GOOGLE_CLIENT_ID is not configured");
      res.status(500).send("تسجيل الدخول بجوجل غير مُفعّل حاليًا");
      return;
    }

    const state = crypto.randomBytes(24).toString("hex");
    const cookieOptions = getSessionCookieOptions(req);
    res.cookie(STATE_COOKIE, state, { ...cookieOptions, maxAge: 10 * 60 * 1000 });

    const params = new URLSearchParams({
      client_id: ENV.googleClientId,
      redirect_uri: getRedirectUri(req),
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    });

    res.redirect(302, `${GOOGLE_AUTH_URL}?${params.toString()}`);
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const parsedCookies = parseCookieHeader(req.headers.cookie || "");
    const expectedState = parsedCookies[STATE_COOKIE];

    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(STATE_COOKIE, { ...cookieOptions, maxAge: -1 });

    if (!code || !state || !expectedState || state !== expectedState) {
      log.warn("[GoogleAuth] Invalid or missing state/code");
      res.redirect(302, "/login?error=google_state");
      return;
    }

    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      log.error("[GoogleAuth] Google OAuth is not configured");
      res.redirect(302, "/login?error=google_not_configured");
      return;
    }

    try {
      const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: ENV.googleClientId,
          client_secret: ENV.googleClientSecret,
          redirect_uri: getRedirectUri(req),
          grant_type: "authorization_code",
        }),
      });

      if (!tokenResponse.ok) {
        const body = await tokenResponse.text();
        log.error("[GoogleAuth] Token exchange failed", { status: tokenResponse.status, body });
        res.redirect(302, "/login?error=google_token");
        return;
      }

      const tokenData = (await tokenResponse.json()) as { access_token: string };

      const userInfoResponse = await fetch(GOOGLE_USERINFO_URL, {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userInfoResponse.ok) {
        log.error("[GoogleAuth] Failed to fetch user info", { status: userInfoResponse.status });
        res.redirect(302, "/login?error=google_userinfo");
        return;
      }

      const userInfo = (await userInfoResponse.json()) as {
        sub: string;
        email?: string;
        email_verified?: boolean;
        name?: string;
      };

      if (!userInfo.sub) {
        res.redirect(302, "/login?error=google_no_sub");
        return;
      }

      const openId = `google:${userInfo.sub}`;
      const existingUser = await db.getUserByOpenId(openId);

      await db.upsertUser({
        openId,
        name: userInfo.name || null,
        email: userInfo.email_verified ? userInfo.email ?? null : null,
        loginMethod: "google",
        lastSignedIn: new Date(),
      });

      // Every Google sign-in is a regular customer - skip the account-type
      // picker entirely. Only set it on first sign-in so it never overwrites
      // a role an admin assigned later (e.g. promoting someone to vendor).
      if (!existingUser?.userType) {
        const createdUser = await db.getUserByOpenId(openId);
        if (createdUser) {
          await db.setUserType(createdUser.id, "customer");
        }
      }

      const sessionToken = await sdk.createSessionToken(openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      log.error("[GoogleAuth] Callback failed", error);
      res.redirect(302, "/login?error=google_failed");
    }
  });
}
