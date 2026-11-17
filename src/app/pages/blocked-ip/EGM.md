# pages/blocked-ip

## Overview
Tela "Controle de IPs" para listar, cadastrar, liberar, bloquear e remover IPs na lista de bloqueio do backend (origem manual ou automática).

## Interface
- Rota (`blocked-ip.routes.ts`): `''` → `BlockedIpPage` (breadcrumb `Controle de IPs`).
- `BlockedIpService` (`blocked-ip.service.ts`): `findAll()`, `create(ip, status?)`, `updateStatus(id, status)`, `delete(id)`.
- `BlockedIpPage` (`app-blocked-ip-page`): `openDialog()`, `save()`, `confirmAllow(item)`, `confirmBlock(item)`, `confirmDelete(item)`.
- Funções exportadas em `blocked-ip.page.ts`: `isLocalhostIp(ip)`, `countByStatus(ips, status)`.
- Tipos usados: `BlockedIp`, `BlockedIpStatus`, `BlockedIpOrigin` (`@/types/blocked-ip`).

## Invariants
- Alterar o status (`BLOCKED`/`ALLOWED`) usa endpoint próprio (`PUT /blocked-ips/{id}/status`), não o update completo.
- Ações destrutivas (liberar, bloquear, remover) passam por diálogo de confirmação.

## Side Effects
- HTTP: `GET /blocked-ips`, `POST /blocked-ips`, `PUT /blocked-ips/{id}/status`, `DELETE /blocked-ips/{id}`.

## Verification
- Run: `npm test` (na raiz de `frontend/`)
