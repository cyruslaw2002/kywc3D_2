import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "../_core/context";

// Mock Firebase Admin SDK before importing adminRouter
vi.mock("../firebase", () => ({
  initializeFirebaseAdmin: vi.fn(),
  createUserWithEmail: vi.fn(),
  deleteUser: vi.fn(),
  getUserByEmail: vi.fn(),
  getFirebaseAuth: vi.fn(),
}));

import { adminRouter } from "./admin";
import * as firebaseModule from "../firebase";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Admin Router", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should get students list for admin user", async () => {
    const mockAuth = {
      listUsers: vi.fn().mockResolvedValue({
        users: [
          {
            uid: "test-uid-123",
            email: "student@example.com",
            displayName: "Test Student",
            metadata: {
              creationTime: new Date(),
              lastSignInTime: new Date(),
            },
          },
        ],
      }),
    };

    vi.mocked(firebaseModule.initializeFirebaseAdmin).mockResolvedValue({
      auth: vi.fn().mockReturnValue(mockAuth),
    } as any);

    const ctx = createAdminContext();
    const caller = adminRouter.createCaller(ctx);

    const result = await caller.getStudents();

    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  it("should deny access to non-admin users", async () => {
    const ctx = createAdminContext();
    ctx.user!.role = "user";
    const caller = adminRouter.createCaller(ctx);

    try {
      await caller.getStudents();
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.code).toBe("FORBIDDEN");
    }
  });

  it("should reject invalid email format", async () => {
    const ctx = createAdminContext();
    const caller = adminRouter.createCaller(ctx);

    try {
      await caller.createStudent({
        email: "invalid-email",
        password: "password123",
        displayName: "Test",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("無效的電郵格式");
    }
  });

  it("should reject short password", async () => {
    const ctx = createAdminContext();
    const caller = adminRouter.createCaller(ctx);

    try {
      await caller.createStudent({
        email: "student@example.com",
        password: "123",
        displayName: "Test",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("密碼至少需要 6 個字符");
    }
  });
});
