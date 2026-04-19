// 班主任帳號管理路由
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  initializeFirebaseAdmin,
  createUserWithEmail,
  deleteUser,
  getUserByEmail,
} from "../firebase";

export const adminRouter = router({
  // 獲取所有學生帳號
  getStudents: protectedProcedure.query(async ({ ctx }) => {
    // 檢查是否為班主任（可根據需要調整權限邏輯）
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "只有班主任可以訪問此功能",
      });
    }

    try {
      const admin = await initializeFirebaseAdmin();
      const auth = admin.auth();

      // 獲取所有用戶
      const listUsersResult = await auth.listUsers(1000);
      const users = listUsersResult.users
        .filter(user => user.email && user.email.includes("@")) // 篩選有效電郵
        .map(user => ({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "未設定",
          createdAt: user.metadata?.creationTime || new Date(),
          lastSignIn: user.metadata?.lastSignInTime,
        }));

      return users;
    } catch (error: any) {
      console.error("[Admin] Failed to get students:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "無法獲取學生列表",
      });
    }
  }),

  // 新增學生帳號
  createStudent: protectedProcedure
    .input(
      z.object({
        email: z.string().email("無效的電郵格式"),
        password: z.string().min(6, "密碼至少需要 6 個字符"),
        displayName: z.string().min(1, "名字不能為空"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // 檢查權限
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "只有班主任可以新增帳號",
        });
      }

      try {
        // 檢查帳號是否已存在
        const existingUser = await getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "該電郵已被使用",
          });
        }

        // 建立新帳號
        const newUser = await createUserWithEmail(
          input.email,
          input.password,
          input.displayName
        );

        console.log(`[Admin] Created student account: ${input.email}`);

        return {
          uid: newUser.uid,
          email: newUser.email,
          displayName: newUser.displayName,
          createdAt: newUser.metadata?.creationTime,
        };
      } catch (error: any) {
        console.error("[Admin] Failed to create student:", error);

        // 處理 Firebase 特定錯誤
        if (error.code === "auth/email-already-exists") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "該電郵已被使用",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error.message || "帳號建立失敗",
        });
      }
    }),

  // 刪除學生帳號
  deleteStudent: protectedProcedure
    .input(z.object({ uid: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // 檢查權限
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "只有班主任可以刪除帳號",
        });
      }

      try {
        await deleteUser(input.uid);
        console.log(`[Admin] Deleted student account: ${input.uid}`);

        return { success: true };
      } catch (error: any) {
        console.error("[Admin] Failed to delete student:", error);

        if (error.code === "auth/user-not-found") {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "帳號不存在",
          });
        }

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "帳號刪除失敗",
        });
      }
    }),
});
