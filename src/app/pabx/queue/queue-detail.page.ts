import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Tooltip } from 'primeng/tooltip';
import { QueueMemberStatusEnum, QueueState } from '@/pabx/types';
import { QueueDashboardService } from '@/pages/dashboard/queue-dashboard.service';
import { WebsocketService } from '@/websocket/stomp/websocket.service';
import { rxStompServiceFactory } from '@/websocket/stomp/rx-stomp-service-factory';
import { UserService } from '@/pages/users/user.service';

@Component({
    selector: 'app-queue-detail-page',
    standalone: true,
    providers: [{ provide: WebsocketService, useFactory: rxStompServiceFactory }],
    imports: [Card, Button, TableModule, Tag, ProgressSpinner, RouterLink, Tooltip],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
                    <div class="flex items-center gap-3">
                        <p-button
                            icon="pi pi-arrow-left"
                            routerLink="/pages/queues"
                            outlined
                            rounded
                            size="small"
                            pTooltip="Voltar"
                            tooltipPosition="right"
                        />
                        @if (queueState()) {
                            <div class="flex flex-col">
                                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold">
                                    {{ queueState()!.queue.name }}
                                </h2>
                                <span class="text-sm text-gray-400 uppercase tracking-wide">
                                    Estratégia: {{ strategyLabel(queueState()!.queue.queueStrategy) }}
                                </span>
                            </div>
                        } @else {
                            <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold">Fila</h2>
                        }
                    </div>
                    @if (queueState()) {
                        <p-button
                            icon="pi pi-pencil"
                            label="Editar"
                            [routerLink]="['/pabx/queues/edit', queueState()!.queue.id]"
                            outlined
                            size="small"
                        />
                    }
                </div>
            </ng-template>

            @if (loading) {
                <div class="flex justify-center py-10">
                    <p-progress-spinner [style]="{ width: '2.5rem', height: '2.5rem' }" />
                </div>
            }

            @if (!loading && queueState()) {
                <!-- KPI Strip -->
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                    <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-green-500">
                        <span class="text-xs font-semibold uppercase tracking-wide text-green-600"
                            >Agentes Logados</span
                        >
                        <span class="text-3xl font-bold">
                            {{ queueState()!.loggedMembers.length
                            }}<span class="text-base text-gray-400">/{{ queueState()!.queue.memberIds.length }}</span>
                        </span>
                    </div>

                    <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-blue-500">
                        <span class="text-xs font-semibold uppercase tracking-wide text-blue-600">Atendidas</span>
                        <span class="text-3xl font-bold">{{ queueState()!.answeredCalls ?? 0 }}</span>
                    </div>

                    <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-red-400">
                        <span class="text-xs font-semibold uppercase tracking-wide text-red-500">Abandonadas</span>
                        <span class="text-3xl font-bold">{{ queueState()!.abandonedCalls ?? 0 }}</span>
                    </div>

                    <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-orange-400">
                        <span class="text-xs font-semibold uppercase tracking-wide text-orange-500">TME</span>
                        <span class="text-3xl font-bold">{{ tme() }}</span>
                    </div>

                    <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1" [class]="serviceLevelBorderClass()">
                        <span class="text-xs font-semibold uppercase tracking-wide" [class]="serviceLevelTextClass()"
                            >Nível de Serviço</span
                        >
                        <span class="text-3xl font-bold">{{ serviceLevel() }}%</span>
                    </div>

                    <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1" [class]="waitingBorderClass()">
                        <span class="text-xs font-semibold uppercase tracking-wide" [class]="waitingTextClass()"
                            >Em Espera</span
                        >
                        <span class="text-3xl font-bold">
                            {{ queueState()!.waitingCalls.length
                            }}<span class="text-base text-gray-400">/{{ queueState()!.queue.maxCalls }}</span>
                        </span>
                    </div>
                </div>

                <!-- Tables -->
                <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <!-- Agents table -->
                    <div class="lg:col-span-3">
                        <h3 class="font-semibold text-lg mb-3">Agentes Logados</h3>
                        <p-table
                            [value]="queueState()!.loggedMembers"
                            [tableStyle]="{ 'min-width': '100%' }"
                            stripedRows
                        >
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Nome</th>
                                    <th>Ramal</th>
                                    <th>Status</th>
                                    <th>Duração</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-member>
                                <tr>
                                    <td class="font-medium">{{ member.name }}</td>
                                    <td class="text-gray-500">{{ member.peerRegistry.peer.peer }}</td>
                                    <td>
                                        <p-tag
                                            [value]="memberStatusLabel(member.queueMemberStatusEnum)"
                                            [severity]="memberStatusSeverity(member.queueMemberStatusEnum)"
                                        />
                                        {{ member.peerRegistry.channel?.connectedNumber }}
                                    </td>
                                    <td class="font-mono text-sm">
                                        {{ member.timestamp ? waitTime(member.timestamp) : '—' }}
                                    </td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td colspan="4" class="text-center p-6 text-gray-400">Nenhum agente logado.</td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>

                    <!-- Waiting calls table -->
                    <div class="lg:col-span-2">
                        <h3 class="font-semibold text-lg mb-3">
                            Chamadas em Espera
                            @if (queueState()!.waitingCalls.length > 0) {
                                <span class="ml-2 text-sm font-normal text-red-500 font-mono">
                                    Maior espera: {{ waitTime(oldestCallTimestamp()) }}
                                </span>
                            }
                        </h3>
                        <p-table
                            [value]="queueState()!.waitingCalls"
                            [tableStyle]="{ 'min-width': '100%' }"
                            stripedRows
                        >
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Caller ID</th>
                                    <th>Tempo em Espera</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-call>
                                <tr>
                                    <td class="font-medium">{{ call.peer }}</td>
                                    <td class="font-mono text-sm text-red-500">{{ waitTime(call.timestamp) }}</td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td colspan="2" class="text-center p-6 text-gray-400">
                                        Nenhuma chamada em espera.
                                    </td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>
                </div>
            }

            @if (!loading && !queueState()) {
                <div class="text-center p-10 text-gray-400">Fila não encontrada.</div>
            }
        </p-card>
    `
})
export class QueueDetailPage implements OnInit, OnDestroy {
    readonly queueState = signal<QueueState | null>(null);
    readonly now = signal(Date.now());
    loading = true;

    private queueId = 0;
    private readonly subscriptions: Subscription[] = [];
    private timer?: ReturnType<typeof setInterval>;

    readonly tme = computed(() => {
        const s = this.queueState()?.longestHoldTime ?? 0;
        return this.formatSeconds(s);
    });

    readonly serviceLevel = computed(() => {
        const answered = this.queueState()?.answeredCalls ?? 0;
        const inSl = this.queueState()?.answeredCallsInServiceLevel ?? 0;
        if (answered === 0) return 0;
        return Math.round((inSl / answered) * 100);
    });

    readonly oldestCallTimestamp = computed(() => {
        const calls = this.queueState()?.waitingCalls ?? [];
        if (calls.length === 0) return Date.now();
        return Math.min(...calls.map((c) => c.timestamp));
    });

    constructor(
        private readonly route: ActivatedRoute,
        private readonly queueDashboardService: QueueDashboardService,
        private readonly webSocketService: WebsocketService,
        private readonly userService: UserService
    ) {}

    ngOnInit(): void {
        this.queueId = Number(this.route.snapshot.paramMap.get('id'));
        this.timer = setInterval(() => this.now.set(Date.now()), 1000);

        this.queueDashboardService.findAllQueueStates().then((states) => {
            const found = states.find((s) => s.queue.id === this.queueId) ?? null;
            this.queueState.set(found);
            this.loading = false;
        });

        const companyId = this.userService.getUser().companyId;
        this.subscriptions.push(
            this.webSocketService.watch(`/topic/queuestates/${companyId}`).subscribe((message) => {
                const updated: QueueState = JSON.parse(message.body);
                if (updated.queue.id === this.queueId) {
                    this.queueState.set(updated);
                }
            })
        );
    }

    ngOnDestroy(): void {
        clearInterval(this.timer);
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    waitTime(timestamp: number): string {
        const secs = Math.max(0, Math.floor((this.now() - timestamp) / 1000));
        return this.formatSeconds(secs);
    }

    private formatSeconds(secs: number): string {
        const m = Math.floor(secs / 60)
            .toString()
            .padStart(2, '0');
        const s = (secs % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    }

    memberStatusLabel(status: QueueMemberStatusEnum): string {
        const labels: Record<QueueMemberStatusEnum, string> = {
            [QueueMemberStatusEnum.AVAILABLE]: 'Disponível',
            [QueueMemberStatusEnum.UP]: 'Em Chamada',
            [QueueMemberStatusEnum.RINGING]: 'Chamando',
            [QueueMemberStatusEnum.DIALING]: 'Discando',
            [QueueMemberStatusEnum.PAUSED]: 'Em Pausa',
            [QueueMemberStatusEnum.COOLDOWN]: 'Cooldown',
            [QueueMemberStatusEnum.UNKNOWN]: 'Desconhecido'
        };
        return labels[status] ?? status;
    }

    memberStatusSeverity(
        status: QueueMemberStatusEnum
    ): 'success' | 'danger' | 'warn' | 'info' | 'secondary' | 'contrast' {
        switch (status) {
            case QueueMemberStatusEnum.AVAILABLE:
                return 'success';
            case QueueMemberStatusEnum.UP:
                return 'danger';
            case QueueMemberStatusEnum.RINGING:
                return 'warn';
            case QueueMemberStatusEnum.DIALING:
                return 'warn';
            case QueueMemberStatusEnum.PAUSED:
                return 'warn';
            case QueueMemberStatusEnum.COOLDOWN:
                return 'info';
            default:
                return 'secondary';
        }
    }

    strategyLabel(strategy: string): string {
        const labels: Record<string, string> = {
            ALL: 'Todos',
            RANDOM: 'Aleatório',
            LEAST_RECENTLY: 'Menos Recente',
            FEWEST_CALLS: 'Menos Chamadas',
            EQUALLY: 'Igualmente'
        };
        return labels[strategy] ?? strategy;
    }

    waitingBorderClass(): string {
        return (this.queueState()?.waitingCalls.length ?? 0) > 0
            ? 'rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-red-500'
            : 'rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-gray-300';
    }

    waitingTextClass(): string {
        return (this.queueState()?.waitingCalls.length ?? 0) > 0 ? 'text-red-500' : 'text-gray-400';
    }

    serviceLevelBorderClass(): string {
        const sl = this.serviceLevel();
        if (sl >= 80) return 'rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-green-500';
        if (sl >= 60) return 'rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-orange-400';
        return 'rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-red-500';
    }

    serviceLevelTextClass(): string {
        const sl = this.serviceLevel();
        if (sl >= 80) return 'text-green-600';
        if (sl >= 60) return 'text-orange-500';
        return 'text-red-500';
    }
}
