import axios from "axios";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const SKIPPER_URL =
  process.env.NEXT_PUBLIC_SKIPPER_API_URL ?? "http://localhost:8080";

const BROKER_CLIENT_ID = process.env.SKIPPER_BROKER_CLIENT_ID ?? "";
const BROKER_CLIENT_SECRET = process.env.SKIPPER_BROKER_CLIENT_SECRET ?? "";

// Client separado para /adminConsultas. Skipper lo whitelistea contra
// TotalAssistAdminAccessPolicy (solo el director Manuel hoy), asi que aunque
// alguien conozca las credenciales de otro Usuario de Skipper el password
// grant se rechaza.
const ADMIN_CLIENT_ID = process.env.SKIPPER_ADMIN_CLIENT_ID ?? "";
const ADMIN_CLIENT_SECRET = process.env.SKIPPER_ADMIN_CLIENT_SECRET ?? "";

const REFRESH_LEEWAY_MS = 60_000;

type Role = "broker" | "admin";

type TokenResponse = {
  token_type: "Bearer";
  expires_in: number;
  access_token: string;
  refresh_token: string;
};

async function passwordGrant(
  email: string,
  password: string,
  clientId: string,
  clientSecret: string,
): Promise<TokenResponse> {
  const { data } = await axios.post<TokenResponse>(
    `${SKIPPER_URL}/oauth/token`,
    {
      grant_type: "password",
      client_id: clientId,
      client_secret: clientSecret,
      username: email,
      password,
      scope: "*",
    },
    { timeout: 15_000 },
  );
  return data;
}

async function refreshGrant(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<TokenResponse> {
  const { data } = await axios.post<TokenResponse>(
    `${SKIPPER_URL}/oauth/token`,
    {
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      scope: "*",
    },
    { timeout: 15_000 },
  );
  return data;
}

// Refresh en curso por refresh_token. Al vencer el access_token, varias
// peticiones simultaneas (middleware, server components, proxy) corren el
// callback `jwt` a la vez y todas intentaban renovar con el MISMO
// refresh_token. Passport revoca el refresh viejo en cuanto el primero
// gana, asi que los demas fallaban con "The refresh token is invalid" y la
// sesion quedaba marcada como expirada. Compartiendo la promesa, todas usan
// el resultado del primero. El cache se limpia unos segundos despues para
// que las respuestas que lleguen tarde todavia encuentren el resultado.
const refreshesEnCurso = new Map<string, Promise<TokenResponse>>();

function refreshCompartido(
  refreshToken: string,
  clientId: string,
  clientSecret: string,
): Promise<TokenResponse> {
  let p = refreshesEnCurso.get(refreshToken);
  if (!p) {
    p = refreshGrant(refreshToken, clientId, clientSecret);
    refreshesEnCurso.set(refreshToken, p);
    const limpiar = () => {
      setTimeout(() => refreshesEnCurso.delete(refreshToken), 30_000);
    };
    p.then(limpiar, limpiar);
  }
  return p;
}

function clientCredsPorRol(role: Role): { id: string; secret: string } {
  if (role === "admin") {
    return { id: ADMIN_CLIENT_ID, secret: ADMIN_CLIENT_SECRET };
  }
  return { id: BROKER_CLIENT_ID, secret: BROKER_CLIENT_SECRET };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    // Broker: portal actual /portalBroker (el que ya existia)
    Credentials({
      id: "credentials",
      name: "Broker",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contrasena", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        try {
          const tokens = await passwordGrant(
            email,
            password,
            BROKER_CLIENT_ID,
            BROKER_CLIENT_SECRET,
          );

          return {
            id: email,
            email,
            name: email,
            role: "broker" as Role,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_at: Date.now() + tokens.expires_in * 1000,
          };
        } catch {
          return null;
        }
      },
    }),
    // Admin: /adminConsultas. Mismo endpoint /oauth/token, pero contra el
    // client `totalassist-admin`, que Skipper solo acepta para usuarios
    // listados en App\Support\TotalAssistAdminAccessPolicy.
    Credentials({
      id: "admin-credentials",
      name: "Admin TotalAssist",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contrasena", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        try {
          const tokens = await passwordGrant(
            email,
            password,
            ADMIN_CLIENT_ID,
            ADMIN_CLIENT_SECRET,
          );

          return {
            id: email,
            email,
            name: email,
            role: "admin" as Role,
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
        token.role = (user as { role?: Role }).role ?? "broker";
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

      // Elegimos el client con el que se hizo login: si el JWT trae role admin,
      // renovamos contra el client admin; si no, contra el broker. Esto
      // preserva la whitelist server-side incluso en el refresh.
      const role = (token.role as Role | undefined) ?? "broker";
      const creds = clientCredsPorRol(role);

      try {
        const refreshed = await refreshCompartido(
          refreshToken,
          creds.id,
          creds.secret,
        );
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
      // cookie httpOnly y no se exponen aqui: el cliente nunca debe verlos
      // desde JS. El flag `error` si se expone porque no es secreto y permite
      // detectar refresh fallido desde la UI. `role` se expone para que la UI
      // sepa distinguir entre admin y broker.
      session.error = token.error as string | undefined;
      session.role = (token.role as Role | undefined) ?? "broker";
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
      const role =
        "token" in message
          ? ((message.token?.role as Role | undefined) ?? "broker")
          : "broker";
      if (!token) return;

      // La ruta de logout depende del guard usado: broker → /api/brokers/logout
      // (guard `broker`), admin → /api/totalassist/admin/logout (guard `api`).
      // Fire-and-forget: no bloqueamos el logout local esperando a Skipper.
      // El cleanup de la cookie ocurre de inmediato; la revocacion al backend
      // viaja en paralelo. Si la red falla, el access_token vivira hasta su
      // expiracion natural — preferimos eso a un signOut de varios segundos.
      const url =
        role === "admin"
          ? `${SKIPPER_URL}/api/totalassist/admin/logout`
          : `${SKIPPER_URL}/api/brokers/logout`;

      void axios
        .post(
          url,
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
