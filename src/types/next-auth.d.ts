import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    error?: string;
    user: {
      id?: string;
    } & DefaultSession["user"];
  }

  interface User {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    error?: string;
  }
}
