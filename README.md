# Total Assist

Portal de gestión de casos para brokers de seguros.

## Requisitos

- Node.js 20+
- pnpm 10+

## Primeros pasos

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Scripts

| Comando           | Descripción                   |
| ----------------- | ----------------------------- |
| `pnpm dev`        | Servidor de desarrollo        |
| `pnpm build`      | Build de producción           |
| `pnpm start`      | Arranca el build              |
| `pnpm lint`       | ESLint                        |
| `pnpm typecheck`  | Type checking con TypeScript  |
| `pnpm format`     | Formatea con Prettier         |
| `pnpm test`       | Tests unitarios (Vitest)      |
| `pnpm test:watch` | Tests unitarios en watch mode |
| `pnpm test:e2e`   | Tests end-to-end (Playwright) |

## Stack

- Next.js 16 (App Router) · TypeScript · pnpm
- Tailwind CSS v4 + shadcn/ui · Inter
- Auth.js v5 (OAuth2 contra Skipper Passport)
- TanStack Query · TanStack Table · axios
- react-hook-form + zod
- Vitest + Testing Library · Playwright
