# Settings Page MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Profile → `/configuracion` 404 with a production-ready MVP Settings page.

**Architecture:** Protected route at `/configuracion` renders a Settings page reusing Profile shell styles. Shared `SettingsMenuItem` handles active vs coming-soon rows. App version comes from a tiny util reading `web/package.json`.

**Tech Stack:** React, React Router, TypeScript, Lucide, `useAppTheme`, existing layout styles.

## Global Constraints

- Edit Profile → `navigate("/perfil")` only (no query/state for edit mode)
- Coming Soon items never navigate
- Spanish UI copy to match Profile (`Configuración`, etc.)
- No breaking changes; reuse design tokens via `useAppTheme`
- Mobile-first, responsive

---

### Task 1: App version util

**Files:**
- Create: `web/src/lib/app-version.ts`
- Modify: `web/src/app/modules/profile/pages/Profile.tsx` (version footer only)

**Produces:** `getAppVersion(): string`

- [ ] Create util that imports `version` from `../../package.json` (resolve from `web/src/lib`)
- [ ] Replace hardcoded `Versión 1.0.0` on Profile with `Versión ${getAppVersion()}`

### Task 2: SettingsMenuItem + Settings page

**Files:**
- Create: `web/src/app/modules/profile/components/SettingsMenuItem.tsx`
- Create: `web/src/app/modules/profile/pages/Settings.tsx`

**Produces:** Settings page with sections Account / Preferences / Legal / About

- [ ] Menu item: icon, label, optional comingSoon badge; `onClick` only when active
- [ ] Page: back via `navigate(-1)`, title Configuración, sections as specified
- [ ] Active: Editar perfil → `/perfil`; Notificaciones → `/notificaciones`
- [ ] Coming Soon: Cambiar contraseña, Idioma, Términos, Privacidad
- [ ] About: app version via `getAppVersion()`

### Task 3: Register route

**Files:**
- Modify: `web/src/app/routes.tsx`

- [ ] Lazy-import Settings
- [ ] Add protected `path: "configuracion"` next to `perfil`

### Task 4: Validate + simplify

- [ ] Playwright: desktop / tablet / mobile — no 404, nav works, disabled rows no-op
- [ ] Cavecrew review + simplify if needed
- [ ] `graphify update .`
