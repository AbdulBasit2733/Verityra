# Verityra Authentication & Access Control

## 1. Authentication Strategy

Verityra uses NextAuth.js with JWT session strategy:
- **Email & Password**: Custom Credentials provider with `bcryptjs` hashing (12 salt rounds).
- **Google OAuth**: Official Google Provider.
- **Strict Role Assignment**: Public signups are strictly granted the `STUDENT` role on both credentials and Google OAuth. The `ADMIN` role cannot be provisioned through client requests.
- **Session Security**: Session tokens include user ID, role (`STUDENT` or `ADMIN`), and account status (`ACTIVE` or `SUSPENDED`).

## 2. Server-Side Route Protection (`lib/auth-guard.ts`)

Authorization is strictly verified on every protected Server Component and Server Action:
- `getCurrentUser()`: Resolves authenticated session user.
- `requireAuth()`: Redirects unauthenticated requests to `/signin`.
- `requireAdmin()`: Redirects non-admins to `/unauthorized`.
- `requireStudent()`: Ensures valid student or admin credentials.

## 3. Google OAuth Setup

1. Open [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create an **OAuth 2.0 Client ID** (Web Application).
3. Set **Authorized redirect URIs**:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
4. Set credentials in `.env`:
   ```env
   GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="your-client-secret"
   ```

## 4. Initial Administrator Provisioning

The first administrator is provisioned via the seed script using the configured `ADMIN_INITIAL_EMAIL` and `ADMIN_INITIAL_PASSWORD`:
```bash
pnpm exec prisma db seed
```

In development, an offline demo admin session can be reconciled to this configured account after the database reconnects. Provisioning is development-only, requires both variables, and never promotes an existing non-admin account. Database-backed admin actions use the persisted user ID for audit records.
