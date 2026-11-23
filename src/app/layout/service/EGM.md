# layout/service

## Overview
Estado global do layout (tema, modo de menu, visibilidade de sidebars e menus overlay) baseado em Angular Signals.

## Interface
- `LayoutService` (`layout.service.ts`, `providedIn: 'root'`): signals `layoutConfig` e `layoutState`; observables `configUpdate$` e `overlayOpen$`; métodos `toggleDarkMode(config?)`, `onMenuToggle()`, `onConfigUpdate()`, `onMenuStateChange(event)`, `reset()`, `onOverlaySubmenuOpen()`, `showProfileSidebar()`, `showWebphoneSidebar()`, `showConfigSidebar()`, `hideConfigSidebar()`, `isDesktop()`, `isMobile()`.
- Tipos: `ColorScheme = 'light' | 'dark' | 'dim'`, `layoutConfig` (interface).

## Invariants
- Modo escuro é aplicado pela classe `app-dark` em `document.documentElement` (mesmo seletor configurado em `providePrimeNG` em `app.config.ts`).
- `isDesktop()` é `window.innerWidth > 991`.

## Side Effects
- Altera classes CSS de `document.documentElement`.
- Emite eventos em `configUpdate$`, consumidos por gráficos para se redesenharem com o tema.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
