import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Subscription} from 'rxjs';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {BadgeModule} from 'primeng/badge';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {Dialog} from 'primeng/dialog';
import {Select} from 'primeng/select';
import {QueueMemberStatusEnum} from '@/pabx/types/queue-member-status-enum';
import {QueueState} from '@/pabx/types/queue-state';
import {QueueMember} from '@/pabx/types/queue-member';
import {Pausa} from '@/pabx/types/pausa';
import {QueueLoginService} from '@/pages/queues/queue-login.service';
import {PausaService} from '@/pabx/pausa/pausa.service';
import {UserService} from '@/pages/users/user.service';
import {WebsocketService} from '@/websocket/stomp/websocket.service';
import {rxStompServiceFactory} from '@/websocket/stomp/rx-stomp-service-factory';

@Component({
    selector: 'app-queue-login',
    providers: [{ provide: WebsocketService, useFactory: rxStompServiceFactory }, MessageService],
    imports: [Card, Button, BadgeModule, Toast, Dialog, Select, FormsModule],
    template: `
        <p-toast />
        <p-card>
            <ng-template #title>
                <span class="font-semibold text-2xl">Minhas Filas</span>
            </ng-template>

            @if (myQueues().length === 0) {
                <p class="text-surface-500 dark:text-surface-400">Você não é membro de nenhuma fila.</p>
            }

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                @for (qs of myQueues(); track qs.queue.id) {
                    <div
                        class="rounded-xl border p-4 flex flex-col gap-3 transition-all duration-300"
                        [class.border-green-500]="isLoggedIn(qs)"
                        [class.border-surface-200]="!isLoggedIn(qs)"
                    >
                        <div class="flex items-center justify-between">
                            <span class="font-semibold text-base">{{ qs.queue.name }}</span>
                            <p-badge
                                [value]="isLoggedIn(qs) ? 'Conectado' : 'Desconectado'"
                                [severity]="isLoggedIn(qs) ? 'success' : 'secondary'"
                            />
                        </div>

                        <div class="flex gap-6 text-sm text-surface-500 dark:text-surface-400">
                            <div class="flex flex-col">
                                <span class="text-xs uppercase tracking-wide">Agentes</span>
                                <span class="font-bold text-surface-700 dark:text-surface-200">{{
                                    qs.loggedMembers.length
                                }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs uppercase tracking-wide">Em Espera</span>
                                <span class="font-bold text-surface-700 dark:text-surface-200">{{
                                    qs.waitingCalls.length
                                }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-xs uppercase tracking-wide">Membros</span>
                                <span class="font-bold text-surface-700 dark:text-surface-200">{{
                                    qs.queue.memberIds.length
                                }}</span>
                            </div>
                        </div>

                        @if (isPaused(qs)) {
                            <div
                                class="flex items-center gap-2 text-sm font-semibold"
                                [class.text-yellow-600]="!isPauseExceeded(qs)"
                                [class.text-red-600]="isPauseExceeded(qs)"
                            >
                                <i class="pi pi-pause-circle"></i>
                                <span
                                >{{ pauseReasonName(qs) }} — {{ pauseDuration(qs) }}
                                    @if (isPauseExceeded(qs)) {
                                        (tempo excedido)
                                    }
                                </span>
                            </div>
                        }

                        <div class="flex gap-2">
                            @if (isLoggedIn(qs)) {
                                <p-button
                                    [label]="isPaused(qs) ? 'Retomar' : 'Pausar'"
                                    [severity]="isPaused(qs) ? 'success' : 'warn'"
                                    [outlined]="true"
                                    styleClass="flex-1"
                                    (onClick)="togglePause(qs)"
                                />
                            }
                            <p-button
                                [label]="isLoggedIn(qs) ? 'Sair da Fila' : 'Entrar na Fila'"
                                [severity]="isLoggedIn(qs) ? 'danger' : 'success'"
                                [outlined]="!isLoggedIn(qs)"
                                styleClass="flex-1"
                                (onClick)="toggleLogin(qs)"
                            />
                        </div>
                    </div>
                }
            </div>
        </p-card>

        <p-dialog
            header="Selecione o motivo da pausa"
            [visible]="pauseDialogVisible()"
            [modal]="true"
            [closable]="true"
            (visibleChange)="closePauseDialog()"
            [style]="{ width: '25rem' }"
        >
            <div class="field mb-4">
                <label for="pausaSelect" class="block mb-2">Pausa *</label>
                <p-select
                    id="pausaSelect"
                    [options]="pausaOptions()"
                    [(ngModel)]="selectedPausaId"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecione uma pausa"
                    styleClass="w-full"
                />
            </div>
            <div class="flex justify-end gap-2">
                <p-button label="Cancelar" severity="secondary" outlined (onClick)="closePauseDialog()"/>
                <p-button label="Pausar" severity="warn" [disabled]="!selectedPausaId" (onClick)="confirmPause()"/>
            </div>
        </p-dialog>
    `
})
export class QueueLoginPage implements OnInit, OnDestroy {
    readonly myQueues = signal<QueueState[]>([]);
    readonly now = signal(Date.now());
    readonly pauseDialogVisible = signal(false);
    readonly pausaOptions = signal<{ label: string; value: number }[]>([]);
    selectedPausaId: number | null = null;
    private pauseDialogQueue: QueueState | null = null;
    private peerId?: number;
    private userId!: number;
    private companyId!: string;
    private readonly subscriptions: Subscription[] = [];
    private clockInterval!: ReturnType<typeof setInterval>;

    constructor(
        private readonly queueLoginService: QueueLoginService,
        private readonly pausaService: PausaService,
        private readonly userService: UserService,
        private readonly webSocketService: WebsocketService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.clockInterval = setInterval(() => this.now.set(Date.now()), 1000);

        const user = this.userService.getUser();
        this.userId = user.id;
        this.companyId = user.companyId;
        this.syncPeerId();

        this.loadMyQueues();
        this.loadPausas();

        this.subscriptions.push(
            this.webSocketService.watch(`/topic/queuestates/${this.companyId}`).subscribe((message) => {
                const updatedState: QueueState = JSON.parse(message.body);
                this.myQueues.update((queues) => {
                    if (!this.userBelongsToQueue(updatedState)) {
                        return queues.filter((qs) => qs.queue.id !== updatedState.queue.id);
                    }
                    const i = queues.findIndex((qs) => qs.queue.id === updatedState.queue.id);
                    if (i >= 0) return queues.map((qs, idx) => (idx === i ? updatedState : qs));
                    return [...queues, updatedState];
                });
            }),
            this.webSocketService.watch(`/topic/queues-removed/${this.companyId}`).subscribe((message) => {
                const { queueId } = JSON.parse(message.body) as { queueId: number };
                this.myQueues.update((queues) => queues.filter((qs) => qs.queue.id !== queueId));
            })
        );
    }

    ngOnDestroy(): void {
        clearInterval(this.clockInterval);
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    isLoggedIn(qs: QueueState): boolean {
        const peerId = this.resolvePeerId();
        if (peerId == null) return false;
        return qs.loggedMembers.some((m) => m.id === peerId);
    }

    isPaused(qs: QueueState): boolean {
        return this.findMember(qs)?.queueMemberStatusEnum === QueueMemberStatusEnum.PAUSED;
    }

    pauseReasonName(qs: QueueState): string {
        return this.findMember(qs)?.pausaName ?? 'Em pausa';
    }

    isPauseExceeded(qs: QueueState): boolean {
        const member = this.findMember(qs);
        if (!member?.pauseTimestamp || !member.pausaTimeLimitMinutes) return false;
        const elapsedMinutes = (this.now() - member.pauseTimestamp) / 60_000;
        return elapsedMinutes > member.pausaTimeLimitMinutes;
    }

    pauseDuration(qs: QueueState): string {
        const ts = this.findMember(qs)?.pauseTimestamp;
        if (!ts) return '';
        const secs = Math.max(0, Math.floor((this.now() - ts) / 1000));
        const h = Math.floor(secs / 3600);
        const m = Math.floor((secs % 3600) / 60);
        const s = secs % 60;
        const pad = (n: number) => n.toString().padStart(2, '0');
        if (h > 0) {
            return `${h}:${pad(m)}:${pad(s)}`;
        }
        return `${pad(m)}:${pad(s)}`;
    }

    togglePause(qs: QueueState): void {
        if (this.isPaused(qs)) {
            this.queueLoginService.unpause(qs.queue.id).catch(() =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível retomar a fila'
                })
            );
            return;
        }
        this.openPauseDialog(qs);
    }

    openPauseDialog(qs: QueueState): void {
        this.pauseDialogQueue = qs;
        this.selectedPausaId = this.pausaOptions()[0]?.value ?? null;
        this.pauseDialogVisible.set(true);
    }

    closePauseDialog(): void {
        this.pauseDialogVisible.set(false);
        this.pauseDialogQueue = null;
        this.selectedPausaId = null;
    }

    confirmPause(): void {
        const qs = this.pauseDialogQueue;
        if (!qs || this.selectedPausaId == null) return;
        this.queueLoginService
            .pause(qs.queue.id, this.selectedPausaId)
            .then(() => this.closePauseDialog())
            .catch(() =>
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro',
                    detail: 'Não foi possível pausar'
                })
            );
    }

    toggleLogin(qs: QueueState): void {
        if (this.isLoggedIn(qs)) {
            this.queueLoginService
                .logout(qs.queue.id)
                .then(() =>
                    this.messageService.add({ severity: 'info', summary: 'Saiu da fila', detail: qs.queue.name })
                )
                .catch(() =>
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Não foi possível sair da fila'
                    })
                );
        } else {
            this.queueLoginService
                .login(qs.queue.id)
                .then(() =>
                    this.messageService.add({ severity: 'success', summary: 'Entrou na fila', detail: qs.queue.name })
                )
                .catch(() =>
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro',
                        detail: 'Não foi possível entrar na fila. Verifique se seu ramal WebPhone está configurado.'
                    })
                );
        }
    }

    private findMember(qs: QueueState): QueueMember | undefined {
        const peerId = this.resolvePeerId();
        if (peerId == null) return undefined;
        return qs.loggedMembers.find((m) => m.id === peerId);
    }

    private userBelongsToQueue(state: QueueState): boolean {
        return state.queue.memberIds.includes(this.userId);
    }

    private loadMyQueues(): void {
        this.queueLoginService.getMyQueues().then((queues) => {
            this.syncPeerId();
            this.myQueues.set(queues);
        });
    }

    private loadPausas(): void {
        this.pausaService.findAll().then((pausas: Pausa[]) => {
            this.pausaOptions.set(pausas.map((p) => ({label: p.name, value: p.id})));
        });
    }

    private syncPeerId(): void {
        const id = this.userService.getWebphoneRegisterSignal().id;
        if (id != null) {
            this.peerId = Number(id);
        }
    }

    private resolvePeerId(): number | undefined {
        if (this.peerId != null) {
            return this.peerId;
        }
        this.syncPeerId();
        return this.peerId;
    }
}
