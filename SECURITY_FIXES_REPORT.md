# Security Fixes Report

Date: 2026-03-19
Repository: AutoParts

## Scope

This report summarizes the security issues that were fixed in the latest hardening pass.

## Fixed Issues

### 1) Authorization bypass via permissive permission guard (Critical)

- Problem:
  - Endpoints using `PermissionsGuard` but missing `@RequirePermissions(...)` were allowed by default.
  - This created broad data exposure risks for authenticated users.
- Fix:
  - Changed guard behavior to deny by default when no permission metadata is present.
  - Added explicit class-level `@RequirePermissions(...)` on protected controllers.
- Files updated:
  - `server/src/common/guards/permissions.guard.ts`
  - `server/src/modules/orders/orders.controller.ts`
  - `server/src/modules/customers/customers.controller.ts`
  - `server/src/modules/users/users.controller.ts`
  - `server/src/modules/stock/stock.controller.ts`
  - `server/src/modules/products/products.controller.ts`
  - `server/src/modules/outlets/outlets.controller.ts`
  - `server/src/modules/roles/roles.controller.ts`
  - `server/src/modules/categories/categories.controller.ts`
  - `server/src/modules/store-settings/store-settings.controller.ts`

### 2) Outlet authorization bypass in order creation (Critical)

- Problem:
  - `requestedOutletId` could be trusted directly during order creation.
  - A user could submit orders for outlets not assigned to them.
- Fix:
  - Hardened `resolveOutletId(...)`:
    - Loads user assigned outlets and roles.
    - Rejects non-admin users requesting unassigned outlets.
    - Verifies requested outlet exists.
    - Allows default outlet fallback only for admin users.
- File updated:
  - `server/src/modules/orders/orders.service.ts`

### 3) JWT fallback secret accepted in misconfiguration (High)

- Problem:
  - JWT strategy accepted a fallback secret (`'secret'`) if env config was missing.
- Fix:
  - Removed fallback behavior.
  - Startup now fails if `JWT_ACCESS_SECRET` is not configured.
- File updated:
  - `server/src/modules/auth/jwt.strategy.ts`

### 4) Refresh tokens stored and matched in plaintext (High)

- Problem:
  - Refresh tokens were stored in plaintext in DB and looked up by plaintext value.
- Fix:
  - Tokens are now hashed with SHA-256 before persistence.
  - Refresh and logout hash incoming token before DB lookup/delete.
  - Added required-config checks for JWT secrets in auth service.
- File updated:
  - `server/src/modules/auth/auth.service.ts`

## Validation

- Backend build completed successfully after fixes:
  - `npm.cmd --prefix server run build`

## Operational Impact

- Existing plaintext refresh tokens in database no longer match hashed lookup logic.
- Users with old refresh tokens must sign in again after deployment of these changes.

## Remaining Security Work (Not part of this fix set)

- Add auth endpoint rate limiting / brute-force protections.
- Reduce sensitive authorization logging in production.
- Move browser token handling away from `localStorage` (HttpOnly cookie flow).
