# Settings Page MVP — Design

## Goal

Replace Profile → Settings 404 (`/configuracion`) with a real MVP Settings page that feels intentional and scalable.

## Decisions

- **Route:** `/configuracion` (preserve existing Profile navigation)
- **Edit Profile:** Navigate to `/perfil` only. No query params, no auto-edit mode.
- **Notifications:** Navigate to existing `/notificaciones`
- **Coming Soon (disabled + badge, no navigation):** Change Password, Language, Terms, Privacy
- **App version:** Read from `web/package.json` via small reusable util; optionally reuse on Profile later
- **UI:** Match Profile shell/tokens; grouped list rows; no full-page Coming Soon; ignore generic purple design-system suggestions

## Architecture

1. Add `Settings` page under `web/src/app/modules/profile/pages/`
2. Register route in `web/src/app/routes.tsx` (ProtectedRoute, same as Profile)
3. Extract reusable `SettingsMenuItem` (or equivalent) for active vs coming-soon rows
4. Keep Profile’s `navigate("/configuracion")` — destination becomes real

## Out of scope

- Password change flow, language picker, Terms/Privacy content pages
- Auto-entering Profile edit mode
- Changing `/ayuda` / `/terminos` dead links on Profile (unless trivial; Settings Legal covers Terms/Privacy)
