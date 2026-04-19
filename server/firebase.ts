// Firebase Admin SDK 初始化模組
import * as admin from "firebase-admin";

let firebaseApp: admin.app.App | null = null;

export async function initializeFirebaseAdmin(): Promise<typeof admin> {
  if (firebaseApp) {
    return admin;
  }

  try {
    const adminSdkKey = process.env.FIREBASE_ADMIN_SDK_KEY;
    if (!adminSdkKey) {
      throw new Error("FIREBASE_ADMIN_SDK_KEY environment variable is not set");
    }

    const serviceAccount = JSON.parse(adminSdkKey);

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id,
    });

    console.log("[Firebase] Admin SDK initialized successfully");
    return admin;
  } catch (error) {
    console.error("[Firebase] Failed to initialize Admin SDK:", error);
    throw error;
  }
}

export function getFirebaseAuth() {
  if (!firebaseApp) {
    throw new Error("Firebase Admin SDK not initialized");
  }
  return admin.auth(firebaseApp);
}

export async function createUserWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<admin.auth.UserRecord> {
  const auth = getFirebaseAuth();
  return auth.createUser({
    email,
    password,
    displayName,
    emailVerified: false,
  });
}

export async function deleteUser(uid: string): Promise<void> {
  const auth = getFirebaseAuth();
  return auth.deleteUser(uid);
}

export async function getUserByEmail(email: string): Promise<admin.auth.UserRecord | null> {
  const auth = getFirebaseAuth();
  try {
    return await auth.getUserByEmail(email);
  } catch (error: any) {
    if (error.code === "auth/user-not-found") {
      return null;
    }
    throw error;
  }
}

export async function setUserClaims(uid: string, customClaims: Record<string, any>): Promise<void> {
  const auth = getFirebaseAuth();
  return auth.setCustomUserClaims(uid, customClaims);
}
