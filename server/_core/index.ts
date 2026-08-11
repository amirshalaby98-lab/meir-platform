import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import crypto from "crypto";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { setupWebSocket } from "../modules/chat/websocket";
import savedFiltersRouter from "../routes/saved-filters";
import badgesRouter from "../routes/badges";
import { createLogger } from "./logger";

const log = createLogger("server");

// ============================================================
// Rate Limiting
// ============================================================

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

// Periodic cleanup of expired buckets (every 60s)
setInterval(() => {
  const now = Date.now();
  rateBuckets.forEach((bucket, key) => {
    if (now > bucket.resetAt) rateBuckets.delete(key);
  });
}, 60_000);

function getClientIp(req: express.Request): string {
  const xf = req.headers["x-forwarded-for"];
  if (typeof xf === "string" && xf.length) return xf.split(",")[0].trim();
  return req.socket.remoteAddress ?? "unknown";
}

function rateLimit(opts: { windowMs: number; max: number; keyPrefix: string }) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = getClientIp(req);
    const key = `${opts.keyPrefix}:${ip}`;
    const now = Date.now();
    const bucket = rateBuckets.get(key);

    if (!bucket || now > bucket.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + opts.windowMs });
      return next();
    }

    bucket.count += 1;
    if (bucket.count > opts.max) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      res.setHeader("Retry-After", String(retryAfterSec));
      log.warn("Rate limit exceeded", { ip, key, count: bucket.count });
      return res.status(429).json({
        error: "RATE_LIMITED",
        message: "طلبات كثيرة خلال وقت قصير. جرّب بعد قليل.",
      });
    }

    return next();
  };
}

// ============================================================
// Security Headers Middleware (CSP + Standard Headers)
// ============================================================

function securityHeaders(req: express.Request, res: express.Response, next: express.NextFunction) {
  // Standard security headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self), bluetooth=(self), web-share=(self)");
  res.setHeader("X-DNS-Prefetch-Control", "off");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");

  // Content Security Policy - prevents XSS and injection attacks
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://unpkg.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https: http:",
    "connect-src 'self' https://api.stripe.com wss: ws: https:",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
  res.setHeader("Content-Security-Policy", cspDirectives);

  next();
}

// ============================================================
// CORS Middleware
// ============================================================

const ALLOWED_ORIGINS = new Set([
  "https://meir.manus.space",
  "https://servicesco-wemmmnce.manus.space",
]);

// In development, allow localhost origins
if (process.env.NODE_ENV === "development") {
  ALLOWED_ORIGINS.add("http://localhost:3000");
  ALLOWED_ORIGINS.add("http://localhost:5173");
  ALLOWED_ORIGINS.add("http://127.0.0.1:3000");
  ALLOWED_ORIGINS.add("http://127.0.0.1:5173");
}

function corsMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const origin = req.headers.origin;

  if (origin && (ALLOWED_ORIGINS.has(origin) || origin.endsWith(".manus.computer"))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID, X-Requested-With");
    res.setHeader("Access-Control-Max-Age", "86400");
  }

  // Handle preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
}

// ============================================================
// Session Timeout Middleware
// ============================================================

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours
const SESSION_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours idle
const sessionActivity = new Map<string, number>();

// Cleanup idle sessions every 10 minutes
setInterval(() => {
  const now = Date.now();
  sessionActivity.forEach((lastActive, key) => {
    if (now - lastActive > SESSION_IDLE_TIMEOUT_MS) {
      sessionActivity.delete(key);
    }
  });
}, 10 * 60 * 1000);

function sessionTimeout(req: express.Request, res: express.Response, next: express.NextFunction) {
  const sessionCookie = req.cookies?.["manus_session"] || req.headers.authorization;
  if (!sessionCookie) return next();

  const sessionKey = typeof sessionCookie === "string" ? sessionCookie.slice(0, 32) : "unknown";
  const now = Date.now();
  const lastActive = sessionActivity.get(sessionKey);

  if (lastActive && (now - lastActive > SESSION_IDLE_TIMEOUT_MS)) {
    // Session expired due to inactivity
    sessionActivity.delete(sessionKey);
    res.setHeader("X-Session-Expired", "idle-timeout");
    // Don't block the request - let auth middleware handle it
  }

  // Update last activity
  sessionActivity.set(sessionKey, now);
  next();
}

// ============================================================
// Input Sanitization Middleware
// ============================================================

function sanitizeInput(req: express.Request, _res: express.Response, next: express.NextFunction) {
  // Sanitize query parameters
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      const val = req.query[key];
      if (typeof val === "string") {
        // Remove null bytes and control characters
        req.query[key] = val.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
      }
    }
  }

  // Validate Content-Type for POST/PUT/PATCH
  if (["POST", "PUT", "PATCH"].includes(req.method) && req.body !== undefined) {
    const contentType = req.headers["content-type"];
    if (contentType && !contentType.includes("application/json") && !contentType.includes("application/x-www-form-urlencoded") && !contentType.includes("multipart/form-data") && !contentType.includes("text/plain")) {
      // Allow but log unexpected content types
      log.warn("Unexpected content type", { contentType, path: req.path, method: req.method });
    }
  }

  // Check for common injection patterns in URL
  const suspiciousPatterns = /(\.\.\/|\.\.\\|<script|javascript:|data:text\/html|vbscript:)/i;
  if (suspiciousPatterns.test(req.url)) {
    log.warn("Suspicious URL pattern detected", { url: req.url, ip: getClientIp(req) });
    return next(); // Log but don't block - let other middleware handle
  }

  next();
}

// ============================================================
// Request ID Middleware
// ============================================================

function requestId(req: express.Request, _res: express.Response, next: express.NextFunction) {
  (req as any).requestId = req.headers["x-request-id"] || crypto.randomUUID();
  next();
}

// ============================================================
// Request Logging Middleware
// ============================================================

function requestLogger(req: express.Request, res: express.Response, next: express.NextFunction) {
  const start = Date.now();
  const reqId = (req as any).requestId;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
    const entry = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: getClientIp(req),
      requestId: reqId,
    };

    if (level === "error") {
      log.error(`${req.method} ${req.path} ${res.statusCode}`, undefined, entry);
    } else if (level === "warn") {
      log.warn(`${req.method} ${req.path} ${res.statusCode}`, entry);
    } else if (duration > 1000) {
      // Log slow requests
      log.warn(`Slow request: ${req.method} ${req.path}`, entry);
    }
    // Don't log every successful request in production to reduce noise
  });

  next();
}

// ============================================================
// Port Discovery
// ============================================================

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

// ============================================================
// Server Bootstrap
// ============================================================

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Global middleware (order matters)
  app.use(requestId);
  app.use(corsMiddleware);
  app.use(securityHeaders);
  app.use(sessionTimeout);
  app.use(sanitizeInput);
  app.use(requestLogger);

  // Body parsers
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Rate limiting for public API endpoints
  const apiRateLimit = rateLimit({ windowMs: 60_000, max: 100, keyPrefix: "api" });
  const authRateLimit = rateLimit({ windowMs: 300_000, max: 20, keyPrefix: "auth" });
  const bookingRateLimit = rateLimit({ windowMs: 60_000, max: 10, keyPrefix: "booking" });
  const uploadRateLimit = rateLimit({ windowMs: 60_000, max: 5, keyPrefix: "upload" });
  const diagnosticsRateLimit = rateLimit({ windowMs: 60_000, max: 30, keyPrefix: "diag" });

  // Apply rate limits
  app.use("/api/oauth", authRateLimit);
  app.use("/api/saved-filters", apiRateLimit);
  app.use("/api/badges", apiRateLimit);

  // OAuth callback
  registerOAuthRoutes(app);

  // REST API routes
  app.use("/api/saved-filters", savedFiltersRouter);
  app.use("/api/badges", badgesRouter);

  // tRPC API with rate limiting on mutations
  app.use(
    "/api/trpc",
    apiRateLimit,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // WebSocket
  setupWebSocket(server);

  // Vite dev / static serving
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Ensure the SPA entrypoint is served for the root path and other client-side routes.
  app.get(["/", "/index.html", "/home"], (_req, res) => {
    const entryPath = process.env.NODE_ENV === "development"
      ? "/"
      : "/index.html";
    res.redirect(entryPath);
  });

  // Global error handler
  app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const reqId = (req as any).requestId;
    log.error("Unhandled error", err, { requestId: reqId, path: req.path });
    res.status(500).json({
      error: "INTERNAL_SERVER_ERROR",
      message: process.env.NODE_ENV === "production"
        ? "حدث خطأ داخلي. يرجى المحاولة لاحقاً."
        : err.message,
      requestId: reqId,
    });
  });

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    log.info(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    log.info(`Server running on http://localhost:${port}/`, {
      env: process.env.NODE_ENV || "development",
      port,
    });
  });
}

startServer().catch((err) => {
  log.error("Failed to start server", err);
  process.exit(1);
});
