import { createLogger } from "./logger";
const log = createLogger("audit");
import type { Request } from "express";

export type AuditEvent = {
  at: string;
  requestId?: string;
  ip?: string;
  actorId?: number | null;
  actorRole?: string | null;
  action: string;
  details?: Record<string, unknown>;
};

export function getReqMeta(req: Request) {
  const requestId = (req as any).requestId as string | undefined;
  const xf = req.headers["x-forwarded-for"];
  const ip =
    typeof xf === "string" && xf.length
      ? xf.split(",")[0].trim()
      : req.socket.remoteAddress ?? undefined;

  return { requestId, ip };
}

// For MVP: log to stdout. In prod, wire this to DB/S3/Log service.
export function audit(event: AuditEvent) {
  // eslint-disable-next-line no-console
  log.info(JSON.stringify({ kind: "AUDIT", ...event }));
}
