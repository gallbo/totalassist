import axios from "axios";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const SKIPPER_URL =
  process.env.NEXT_PUBLIC_SKIPPER_API_URL ?? "http://localhost:8080";
const CLIENT_ID = process.env.SKIPPER_BROKER_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.SKIPPER_BROKER_CLIENT_SECRET ?? "";

const REFRESH_LEEWAY_MS = 60_000;

type TokenResponse = {
  token_type: "Bearer";
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

async function passwordGrant(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const { data } = await axios.post<TokenResponse>(
    `${SKIPPER_URL}/oauth/token`,
    {
      grant_type: "password",
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      username: email,
      password,
      scope: "*",
    },
    { timeout: 15_000 },
  );
  return data;
}

async function refreshGrant(refreshToken: string): Promise<TokenResponse> {
  const { data } = await axios.post<TokenResponse>(
    `${SKIPPER_URL}/oauth/token`,
    {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: "*",
    },
    { timeout: 15_000 },
  );
  return data;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        try {
          const tokens = await passwordGrant(email, password);

          return {
            id: email,
            email,
            name: email,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email ?? token.email;
        token.access_token = user.access_token;
        token.refresh_token = user.refresh_token;
        token.expires_at = user.expires_at;
        delete token.error;
        return token;
      }

      const expiresAt = token.expires_at as number | undefined;
      const refreshToken = token.refresh_token as string | undefined;
      if (typeof expiresAt !== "number") return token;
      if (Date.now() < expiresAt - REFRESH_LEEWAY_MS) return token;
      if (!refreshToken) {
        token.error = "RefreshAccessTokenError";
        return token;
      }

      try {
        const refreshed = await refreshGrant(refreshToken);
        token.access_token = refreshed.access_token;
        token.refresh_token = refreshed.refresh_token;
        token.expires_at = Date.now() + refreshed.expires_in * 1000;
        delete token.error;
      } catch {
        token.error = "RefreshAccessTokenError";
      }
      return token;
    },
    async session({ session, token }) {
      // El access_token y el refresh_token se quedan en el JWT cifrado de la
      // cookie httpOnly y no se exponen aquí: el cliente nunca debe verlos
      // desde JS. El flag `error` sí se expone porque no es secreto y permite
      // detectar refresh fallido desde la UI.
      session.error = token.error as string | undefined;
      if (session.user) {
        const email = token.email as string | undefined;
        if (email) {
          session.user.id = email;
          session.user.email = email;
        }
      }
      return session;
    },
  },
  events: {
    async signOut(message) {
      const token =
        "token" in message
          ? (message.token?.access_token as string | undefined)
          : undefined;
      if (!token) return;
      // Fire-and-forget: no bloqueamos el logout local esperando a Skipper.
      // El cleanup de la cookie ocurre de inmediato; la revocación al backend
      // viaja en paralelo. Si la red falla, el access_token vivirá hasta su
      // expiración natural — preferimos eso a un signOut de varios segundos.
      void axios
        .post(
          `${SKIPPER_URL}/api/brokers/logout`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 5_000,
          },
        )
        .catch(() => {});
    },
  },
});
