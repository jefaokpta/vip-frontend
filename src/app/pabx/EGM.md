# pabx

## Overview
Módulo de administração do PABX, montado em `/pabx` (lazy, protegido por `moduleGuard(ModuleEnum.PABX)` em `app.routes.ts`). Cada subdiretório é uma entidade ou relatório com seu próprio serviço HTTP, páginas de lista/criação/edição e, quando preciso, componentes. Este diretório guarda a tabela de rotas do módulo e helpers compartilhados.

## Interface
- `pabx.routes.ts` (export default `Routes`): registra estaticamente (sem lazy por entidade) as rotas `register-instances`, `worker-instances`, `peers`, `aliases`, `ddrs`, `dialplans`, `accountcodes`, `trunks`, `routes`, `calendars`, `mohs`, `pickup-groups`, `call-groups`, `uras`, `surveys`, `queues` (com `new`, `edit/:id` e, para filas, `detail/:id`), `pauses`, os relatórios `call-report`, `survey-report`, `ura-report`, `member-activity-report`, `dac-report`, `dac-report-calls` e `**` → `/notfound`. Cada rota define `data.breadcrumb`.
- `utils.ts`: `sortCdrByDate(cdrs)`, `languageSelectOptions()`, `dtmfSelectOptions()`, `actionArg2HasDefaultValue(action)`, `DEFAULT_DIAL_PEER_TIMEOUT = '30'`, `actionArg3DefaultValue(action)`, `actionArg3Validators(action)`, `actionHasArg1(action)`, `generateAlphanumericSecret(length = 16)`.
- Subdiretórios:
  - [accountcode](./accountcode/EGM.md) - centros de custo.
  - [alias](./alias/EGM.md) - alias de discagem (listas de expressões).
  - [calendar](./calendar/EGM.md) - calendários de atendimento.
  - [call-group](./call-group/EGM.md) - grupos de chamada.
  - [dac-report](./dac-report/EGM.md) - relatório DAC e jornada de chamadas.
  - [ddr](./ddr/EGM.md) - números de entrada, formatação e DDR padrão.
  - [dialplan](./dialplan/EGM.md) - regras de discagem, prioridade e ações.
  - [member-activity-report](./member-activity-report/EGM.md) - atividade dos membros de fila.
  - [moh](./moh/EGM.md) - áudios do sistema com upload pré-assinado.
  - [pause](./pause/EGM.md) - motivos de pausa.
  - [peer](./peer/EGM.md) - ramais SIP, lote e credenciais.
  - [pickup-group](./pickup-group/EGM.md) - grupos de captura.
  - [queue](./queue/EGM.md) - filas e detalhe em tempo real.
  - [register-instance](./register-instance/EGM.md) - instâncias de register.
  - [report](./report/EGM.md) - relatório de chamadas, detalhe, transcrições e helpers de CDR/gráficos.
  - [route](./route/EGM.md) - rotas de saída com até 3 troncos.
  - [survey](./survey/EGM.md) - pesquisas de satisfação.
  - [survey-report](./survey-report/EGM.md) - relatório de pesquisas.
  - [trunk](./trunk/EGM.md) - troncos SIP (compartilhados entre empresas).
  - [types](./types/EGM.md) - tipos e enums do PABX.
  - [ura](./ura/EGM.md) - URAs (IVR).
  - [ura-report](./ura-report/EGM.md) - relatório de seleções de URA.
  - [worker-instance](./worker-instance/EGM.md) - instâncias de worker e prontidão.

## Invariants
- As rotas filhas não aplicam guards de role; a restrição por role é feita pelo menu (`app.menu.ts`) e pelo backend. Só o módulo `PABX` é exigido no nível do módulo.
- `DIAL_PEER`: `arg2` default `'t'`, `arg3` é o tempo de toque em segundos (default `'30'`, validado entre 5 e 300; vazio é aceito e o worker usa 30).
- `ANSWER` e `HANGUP` não exigem `arg1`; os demais tipos de ação exigem.
- `generateAlphanumericSecret` usa `crypto.getRandomValues` com amostragem por rejeição (sem viés de módulo) e o mesmo alfabeto alfanumérico do backend.
- Padrão dos serviços: `executeRequest(this.http.<verbo>(`${environment.API_BACKEND_URL}/...`, httpHeaders()))`; após salvar, as páginas de formulário navegam de volta para a lista da entidade.

## Side Effects
- Todos os serviços filhos fazem HTTP autenticado (Bearer) contra `environment.API_BACKEND_URL`; o detalhe de chamada também consulta `environment.IA_BACKEND_URL`; o upload de áudio vai para a URL pré-assinada devolvida pelo backend.
- Detalhe de fila usa STOMP (`/topic/queuestates/{companyId}`, `/topic/queues-removed/{companyId}`).

## Verification
- Run: `npm test` (na raiz de `frontend/`)
