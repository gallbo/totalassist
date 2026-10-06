import type { DefaultSession } from "next-auth";

type Role = "broker" | "admin";

declare module "next-auth" {
  interface Session {
    error?: string;
    role?: Role;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    role?: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    error?: string;
    role?: Role;
  }
}
