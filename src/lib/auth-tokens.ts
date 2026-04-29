import "server-only";

import { cookies } from "next/headers";
import { decode } from "next-auth/jwt";

const COOKIE_NAMES = ["authjs.session-token", "__Secure-authjs.session-token"];

export async function getServerAccessToken(): Promise<string | null> {
  const jar = await cookies();
  let cookieName: string | null = null;
  let cookieValue: string | undefined;

  for (const name of COOKIE_NAMES) {
    const c = jar.get(name);
    if (c?.value) {
      cookieName = name;
      cookieValue = c.value;
      break;
    }
  }

  if (!cookieValue || !cookieName) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  try {
    const decoded = await decode({
      token: cookieValue,
      secret,
      salt: cookieName,
    });
    const accessToken = decoded?.access_token;
    return typeof accessToken === "string" ? accessToken : null;
  } catch {
    return null;
  }
}
