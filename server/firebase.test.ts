import { describe, expect, it } from "vitest";
import { initializeFirebaseAdmin } from "./firebase";

describe("Firebase Admin Initialization", () => {
  it("should initialize Firebase Admin successfully", async () => {
    const admin = await initializeFirebaseAdmin();
    expect(admin).toBeDefined();
    expect(admin.app()).toBeDefined();
  });

  it("should have auth service available", async () => {
    const admin = await initializeFirebaseAdmin();
    expect(admin.auth()).toBeDefined();
  });
});
