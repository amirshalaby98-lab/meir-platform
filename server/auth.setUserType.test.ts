import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the setUserType DB function
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    setUserType: vi.fn().mockResolvedValue(undefined),
  };
});

function createMockContext(user: any = null): TrpcContext {
  return {
    req: {
      headers: {
        "x-forwarded-for": "127.0.0.1",
        "user-agent": "vitest",
      },
      socket: { remoteAddress: "127.0.0.1" },
      protocol: "https",
    } as any,
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as any,
    user,
  };
}

const mockAuthenticatedUser = {
  id: 42,
  openId: "test-user-open-id",
  name: "Test User",
  email: "user@test.com",
  role: "user" as const,
  userType: null,
  loginMethod: "google",
  phone: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("auth.setUserType", () => {
  it("should set userType to 'customer' for authenticated user", async () => {
    const caller = appRouter.createCaller(createMockContext(mockAuthenticatedUser));

    const result = await caller.auth.setUserType({ userType: "customer" });

    expect(result).toEqual({ success: true });
  });

  it("should set userType to 'technician' for authenticated user", async () => {
    const caller = appRouter.createCaller(createMockContext(mockAuthenticatedUser));

    const result = await caller.auth.setUserType({ userType: "technician" });

    expect(result).toEqual({ success: true });
  });

  it("should set userType to 'service_provider' for authenticated user", async () => {
    const caller = appRouter.createCaller(createMockContext(mockAuthenticatedUser));

    const result = await caller.auth.setUserType({ userType: "service_provider" });

    expect(result).toEqual({ success: true });
  });

  it("should reject unauthenticated users", async () => {
    const caller = appRouter.createCaller(createMockContext(null));

    await expect(
      caller.auth.setUserType({ userType: "customer" })
    ).rejects.toThrow();
  });

  it("should reject invalid userType values", async () => {
    const caller = appRouter.createCaller(createMockContext(mockAuthenticatedUser));

    await expect(
      // @ts-expect-error - testing invalid input
      caller.auth.setUserType({ userType: "invalid_type" })
    ).rejects.toThrow();
  });

  it("should reject empty input", async () => {
    const caller = appRouter.createCaller(createMockContext(mockAuthenticatedUser));

    await expect(
      // @ts-expect-error - testing missing input
      caller.auth.setUserType({})
    ).rejects.toThrow();
  });
});
