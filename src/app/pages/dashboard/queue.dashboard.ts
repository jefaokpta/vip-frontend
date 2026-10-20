import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgClass, NgForOf } from '@angular/common';
import { Card } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { RouterLink } from '@angular/router';
import { QueueDashboardService } from '@/pages/dashboard/queue-dashboard.service';
import { HourlyCalls } from '@/pabx/types/hourly-calls';
import {
    formatDuration,
    MemberAlert,
    QueueAlert,
    globalServiceLevel,
    globalTmeSeconds,
    memberAlerts,
    memberCounts,
    percentOf,
    queueAlerts,
    queueServiceLevel,
    serviceLevelSeverity
} from '@/pages/dashboard/queue-dashboard.metrics';
import { QueueState } from '@/pabx/types/queue-state';
import { WebsocketService } from '@/websocket/stomp/websocket.service';
import { rxStompServiceFactory } from '@/websocket/stomp/rx-stomp-service-factory';
import { UserService } from '@/pages/users/user.service';

@Component({
    selector: 'app-queue-dashboard',
    standalone: true,
    providers: [{ provide: WebsocketService, useFactory: rxStompServiceFactory }],
    imports: [NgClass, NgForOf, Card, ChartModule, RouterLink],
    template: `
        <div class="flex flex-col gap-4">
            <!-- Page Header -->
            <div>
                <div class="font-bold text-2xl">Visão Geral de Filas</div>
                <div class="text-sm text-gray-400">Monitoramento em tempo real do ecossistema de telefonia.</div>
            </div>

            <!-- Top Summary Strip -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <!-- Filas Ativas -->
                <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-gray-200">
                    <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">FILAS ATIVAS</span>
                    <span class="text-3xl font-bold">{{ activeQueues() }}</span>
                </div>

                <!-- Chamadas em Espera -->
                <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-red-500">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wide text-red-500"
                            >CHAMADAS EM ESPERA</span
                        >
                    </div>
                    <div class="flex items-end gap-2">
                        <span class="text-3xl font-bold">{{ formatTwoDigits(waitingCalls()) }}</span>
                        @if (waitingCalls() > 0) {
                            <span class="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-600 mb-1"
                                >ALERTA</span
                            >
                        }
                    </div>
                </div>

                <!-- TME Global -->
                <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-gray-200">
                    <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">TME GLOBAL</span>
                    <div class="flex items-end gap-1">
                        <span class="text-3xl font-bold" data-testid="global-tme">{{ globalTme() }}</span>
                    </div>
                </div>

                <!-- Nível de Serviço -->
                <div
                    class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4"
                    [ngClass]="serviceLevelStyle().border"
                >
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wide" [ngClass]="serviceLevelStyle().text"
                            >NÍVEL DE SERVIÇO</span
                        >
                    </div>
                    <div class="flex items-end gap-2">
                        <span class="text-3xl font-bold" data-testid="global-sl">{{ serviceLevelLabel() }}</span>
                        <span
                            class="text-xs font-bold px-2 py-0.5 rounded mb-1"
                            [ngClass]="serviceLevelStyle().badge"
                            >{{ serviceLevelStyle().label }}</span
                        >
                    </div>
                </div>
            </div>

            <!-- Main Two-Column Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
                <!-- LEFT COLUMN -->
                <div class="lg:col-span-3 flex flex-col gap-4">
                    <!-- Status das Filas -->
                    <p-card>
                        <ng-template #title>
                            <div class="flex items-center justify-between flex-wrap gap-2">
                                <span class="font-semibold text-lg">Status das Filas</span>
                                <div class="flex gap-3">
                                    <span class="flex items-center gap-1 text-xs font-semibold">
                                        <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                                        {{ formatTwoDigits(operacaoCount()) }} OPERAÇÃO OK
                                    </span>
                                    <span class="flex items-center gap-1 text-xs font-semibold">
                                        <span class="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                                        {{ formatTwoDigits(alertaCount()) }} EM ALERTA
                                    </span>
                                </div>
                            </div>
                        </ng-template>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div
                                *ngFor="let q of queues()"
                                class="rounded-xl shadow px-4 py-3 flex flex-col gap-2 transition-all duration-300 border-l-4 cursor-pointer hover:opacity-80"
                                [ngClass]="queueBorderClass(q)"
                                [routerLink]="['/pabx/queues/detail', q.queue.id]"
                            >
                                <!-- Header row -->
                                <div class="flex items-start justify-between">
                                    <div class="flex items-center gap-2">
                                        <div class="flex flex-col">
                                            <span class="font-bold text-sm">{{ q.queue.name }}</span>
                                            @if (alertsOf(q).length > 0) {
                                                <span class="text-xs font-semibold text-red-600">{{
                                                    alertLabels(q)
                                                }}</span>
                                            } @else {
                                                <span class="text-xs font-semibold text-green-500">OPERAÇÃO OK</span>
                                            }
                                        </div>
                                    </div>
                                </div>

                                <!-- Stats row -->
                                <div class="flex gap-6 mt-1">
                                    <div class="flex flex-col">
                                        <span class="text-xs text-gray-400 uppercase tracking-wide">ESPERA</span>
                                        <span class="font-bold text-sm">
                                            {{
                                                formatTwoDigits(q.waitingCalls.length) +
                                                    '/ ' +
                                                    formatTwoDigits(q.queue.maxCalls)
                                            }}
                                        </span>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-xs text-gray-400 uppercase tracking-wide">MEMBROS</span>
                                        <span class="font-bold text-sm">
                                            {{
                                                formatTwoDigits(q.loggedMembers.length) +
                                                    '/' +
                                                    formatTwoDigits(q.queue.memberIds.length)
                                            }}
                                        </span>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-xs text-gray-400 uppercase tracking-wide">TME</span>
                                        <span class="font-bold text-sm">{{ queueTme(q) }}</span>
                                    </div>
                                    <div class="flex flex-col">
                                        <span class="text-xs text-gray-400 uppercase tracking-wide">NS</span>
                                        <span class="font-bold text-sm">{{ queueSl(q) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </p-card>

                    <!-- Volume de Chamadas Bar Chart -->
                    <p-card>
                        <ng-template #title>
                            <div class="flex flex-col">
                                <span class="font-semibold text-lg">Chamadas do Dia</span>
                                <span class="text-xs text-gray-400 uppercase tracking-wide"
                                    >ATENDIDAS × ABANDONADAS</span
                                >
                            </div>
                        </ng-template>
                        <p-chart type="line" height="260" [data]="lineData()" [options]="lineOptions"></p-chart>
                    </p-card>
                </div>

                <!-- RIGHT COLUMN -->
                <div class="lg:col-span-2 flex flex-col gap-4">
                    <!-- Status dos Membros -->
                    <p-card>
                        <ng-template #title>
                            <span class="font-semibold text-lg">Status dos Membros</span>
                        </ng-template>

                        <div class="flex flex-col gap-3">
                            <div
                                *ngFor="let a of agentStatusCards()"
                                class="rounded-xl shadow px-4 py-3 flex items-center justify-between border-l-4 transition-all duration-300"
                                [ngClass]="a.border"
                            >
                                <div class="flex flex-col">
                                    <span class="text-xs font-semibold uppercase tracking-wide" [ngClass]="a.text">{{
                                        a.label
                                    }}</span>
                                    <span class="text-2xl font-bold">{{ a.value }}</span>
                                </div>
                                <span class="text-xs text-gray-400">{{ a.subtitle }}</span>
                            </div>
                        </div>
                    </p-card>

                    <!-- Alertas de Membros -->
                    <p-card>
                        <ng-template #title>
                            <span class="font-semibold text-base uppercase tracking-wide">Alertas de Membros</span>
                        </ng-template>

                        <div class="flex flex-col gap-4">
                            <div *ngFor="let ag of memberAlertList()" class="flex items-center gap-3">
                                <!-- Initials avatar -->
                                <div
                                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                                    [ngClass]="alertAvatarClass(ag.type)"
                                >
                                    {{ agentInitials(ag.name) }}
                                </div>

                                <!-- Agent info -->
                                <div class="flex flex-col flex-1 min-w-0">
                                    <span class="font-semibold text-sm truncate">{{ ag.name }}</span>
                                    <span class="text-xs text-gray-400">{{ ag.extension }}</span>
                                </div>

                                <!-- Alert badge + duration -->
                                <div class="flex flex-col items-end gap-0.5">
                                    <span
                                        class="text-xs font-bold px-2 py-0.5 rounded"
                                        [ngClass]="alertBadgeClass(ag.type)"
                                        >{{ ag.type === 'LONG_PAUSE' ? 'PAUSA LONGA' : 'CHAMADA LONGA' }}</span
                                    >
                                    <span class="text-xs text-gray-400">{{ duration(ag.elapsedSeconds) }}</span>
                                </div>
                            </div>
                            @if (memberAlertList().length === 0) {
                                <span class="text-sm text-gray-400">Nenhum alerta no momento.</span>
                            }
                        </div>
                    </p-card>
                </div>
            </div>
        </div>
    `
})
export class QueueDashboard implements OnInit, OnDestroy {
    private readonly subscriptions: Subscription[] = [];
    readonly queues = signal<QueueState[]>([]);
    readonly activeQueues = computed(() => this.queues().length);
    readonly waitingCalls = computed(() => this.queues().reduce((acc, q) => acc + q.waitingCalls.length, 0));
    private readonly now = signal(Date.now());
    private readonly hourly = signal<HourlyCalls[]>([]);
    private tickInterval?: ReturnType<typeof setInterval>;
    private chartInterval?: ReturnType<typeof setInterval>;

    readonly globalTme = computed(() => formatDuration(globalTmeSeconds(this.queues())));
    readonly globalSl = computed(() => globalServiceLevel(this.queues()));
    readonly serviceLevelLabel = computed(() => {
        const sl = this.globalSl();
        return sl === null ? '—' : `${sl}%`;
    });
    readonly serviceLevelStyle = computed(() => {
        const styles = {
            ok: {
                border: 'border-green-500',
                text: 'text-green-600',
                badge: 'bg-green-100 text-green-700',
                label: 'EXCELENTE'
            },
            warn: {
                border: 'border-orange-500',
                text: 'text-orange-600',
                badge: 'bg-orange-100 text-orange-700',
                label: 'ATENÇÃO'
            },
            critical: {
                border: 'border-red-500',
                text: 'text-red-500',
                badge: 'bg-red-100 text-red-600',
                label: 'CRÍTICO'
            }
        };
        return styles[serviceLevelSeverity(this.globalSl())];
    });

    readonly alertaCount = computed(() => this.queues().filter((q) => queueAlerts(q).length > 0).length);
    readonly operacaoCount = computed(() => this.activeQueues() - this.alertaCount());

    readonly counts = computed(() => memberCounts(this.queues()));
    readonly agentStatusCards = computed(() => {
        const c = this.counts();
        const sub = (n: number) => `${percentOf(n, c.total)}% dos logados`;
        return [
            {
                label: 'DISPONÍVEIS',
                value: c.available,
                subtitle: sub(c.available),
                border: 'border-green-500',
                text: 'text-green-600'
            },
            {
                label: 'EM CHAMADA',
                value: c.onCall,
                subtitle: sub(c.onCall),
                border: 'border-red-500',
                text: 'text-red-500'
            },
            {
                label: 'EM PAUSA',
                value: c.paused,
                subtitle: sub(c.paused),
                border: 'border-gray-200',
                text: 'text-gray-400'
            }
        ];
    });

    readonly memberAlertList = computed(() => memberAlerts(this.queues(), this.now()));

    readonly lineData = computed(() => {
        const hours = this.hourly();
        return {
            labels: hours.map((h) => `${String(h.hour).padStart(2, '0')}:00`),
            datasets: [
                {
                    label: 'Atendidas',
                    borderColor: '#22c55e',
                    backgroundColor: '#22c55e',
                    tension: 0.3,
                    data: hours.map((h) => h.answeredCalls)
                },
                {
                    label: 'Abandonadas',
                    borderColor: '#ef4444',
                    backgroundColor: '#ef4444',
                    tension: 0.3,
                    data: hours.map((h) => h.abandonedCalls)
                }
            ]
        };
    });

    lineOptions: any;
    constructor(
        private readonly queueDashboardService: QueueDashboardService,
        private readonly webSocketService: WebsocketService,
        private readonly userService: UserService
    ) {}

    ngOnInit(): void {
        this.initChart();
        this.loadHourly();
        this.chartInterval = setInterval(() => this.loadHourly(), 60_000);
        this.tickInterval = setInterval(() => this.now.set(Date.now()), 1000);
        this.queueDashboardService.findAllQueueStates().then((queueStates) => {
            this.queues.set(queueStates);
        });

        const companyId = this.userService.getUser().companyId;
        this.subscriptions.push(
            this.webSocketService.watch(`/topic/queuestates/${companyId}`).subscribe((message) => {
                const updated: QueueState = JSON.parse(message.body);
                this.queues.update((qs) => {
                    const i = qs.findIndex((q) => q.queue.id === updated.queue.id);
                    if (i >= 0) return qs.map((q, idx) => (idx === i ? updated : q));
                    return [...qs, updated];
                });
            }),
            this.webSocketService.watch(`/topic/queues-removed/${companyId}`).subscribe((message) => {
                const { queueId } = JSON.parse(message.body) as { queueId: number };
                this.queues.update((qs) => qs.filter((q) => q.queue.id !== queueId));
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
        clearInterval(this.tickInterval);
        clearInterval(this.chartInterval);
    }

    private loadHourly(): void {
        this.queueDashboardService
            .findTodayHourly()
            .then((h) => this.hourly.set(h))
            .catch(() => undefined);
    }

    private initChart(): void {
        const docStyle = getComputedStyle(document.documentElement);
        const textColor = docStyle.getPropertyValue('--text-color');
        const textColorSecondary = docStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = docStyle.getPropertyValue('--surface-border');

        this.lineOptions = {
            animation: { duration: 1500 },
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        usePointStyle: true,
                        font: { weight: 700 },
                        padding: 20
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary, font: { weight: 500 } },
                    grid: { display: false }
                },
                y: {
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder }
                }
            }
        };
    }

    alertsOf(q: QueueState): QueueAlert[] {
        return queueAlerts(q);
    }

    alertLabels(q: QueueState): string {
        return queueAlerts(q)
            .map((a) => (a === 'SLA_CRITICAL' ? 'NS CRÍTICO' : 'TME ACIMA DO ALVO'))
            .join(' · ');
    }

    queueBorderClass(q: QueueState): string {
        return queueAlerts(q).length > 0 ? 'border-red-500' : 'border-green-500';
    }

    private hasCalls(q: QueueState): boolean {
        return (q.answeredCalls ?? 0) + (q.abandonedCalls ?? 0) > 0;
    }

    queueTme(q: QueueState): string {
        return this.hasCalls(q) ? formatDuration(q.tmeSeconds ?? 0) : '—';
    }

    queueSl(q: QueueState): string {
        const sl = queueServiceLevel(q);
        return sl === null ? '—' : `${sl}%`;
    }

    duration(seconds: number): string {
        return formatDuration(seconds);
    }

    agentInitials(name: string): string {
        return name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    alertAvatarClass(type: MemberAlert['type']): string {
        return type === 'LONG_PAUSE' ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800';
    }

    alertBadgeClass(type: MemberAlert['type']): string {
        return type === 'LONG_PAUSE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600';
    }

    formatTwoDigits(n: number): string {
        return n.toString().padStart(2, '0');
    }
}
