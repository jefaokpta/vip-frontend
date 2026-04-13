import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgClass, NgForOf } from '@angular/common';
import { Card } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { QueueDashboardService } from '@/pages/dashboard/queue-dashboard.service';
import { QueueState } from '@/pabx/types';
import { WebsocketService } from '@/websocket/stomp/websocket.service';
import { rxStompServiceFactory } from '@/websocket/stomp/rx-stomp-service-factory';
import { UserService } from '@/pages/users/user.service';

interface AgentStatus {
    name: string;
    extension: string;
    alertType: string;
    duration: string;
}

@Component({
    selector: 'app-queue-dashboard',
    standalone: true,
    providers: [{ provide: WebsocketService, useFactory: rxStompServiceFactory }],
    imports: [NgClass, NgForOf, Card, ChartModule, Button, RouterLink],
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
                        <span class="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-600 mb-1">ALERTA</span>
                    </div>
                </div>

                <!-- TME Global -->
                <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-gray-200">
                    <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">TME GLOBAL</span>
                    <div class="flex items-end gap-1">
                        <span class="text-3xl font-bold">{{ globalTme() }}</span>
                        <span class="text-sm text-gray-400 mb-1">m/s</span>
                    </div>
                </div>

                <!-- Nível de Serviço -->
                <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-green-500">
                    <div class="flex items-center justify-between">
                        <span class="text-xs font-semibold uppercase tracking-wide text-green-600"
                            >NÍVEL DE SERVIÇO</span
                        >
                    </div>
                    <div class="flex items-end gap-2">
                        <span class="text-3xl font-bold">{{ serviceLevel() }}%</span>
                        <span class="text-xs font-bold px-2 py-0.5 rounded bg-green-100 text-green-700 mb-1"
                            >EXCELENTE</span
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
                                            <span class="text-xs font-semibold" [ngClass]="queueStatusTextClass(q)"
                                                >ALERTA (TME)</span
                                            >
                                        </div>
                                    </div>
                                    <i class="pi pi-ellipsis-v text-gray-400 cursor-pointer"></i>
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
                                        <span class="text-xs text-gray-400 uppercase tracking-wide">MAIOR T.</span>
                                        <span class="font-bold text-sm">{{ q.longestHoldTime }}</span>
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
                                </div>
                            </div>
                        </div>
                    </p-card>

                    <!-- Volume de Chamadas Bar Chart -->
                    <p-card>
                        <ng-template #title>
                            <div class="flex flex-col">
                                <span class="font-semibold text-lg">Volume de Chamadas por Fila</span>
                                <span class="text-xs text-gray-400 uppercase tracking-wide">ULTIMAS 6 HORAS</span>
                            </div>
                        </ng-template>
                        <p-chart type="bar" height="260" [data]="barData" [options]="barOptions"></p-chart>
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
                            <div *ngFor="let ag of agentAlerts()" class="flex items-center gap-3">
                                <!-- Initials avatar -->
                                <div
                                    class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                                    [ngClass]="alertAvatarClass(ag.alertType)"
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
                                        [ngClass]="alertBadgeClass(ag.alertType)"
                                        >{{ ag.alertType }}</span
                                    >
                                    <span class="text-xs text-gray-400">{{ ag.duration }}</span>
                                </div>
                            </div>
                        </div>

                        <div class="mt-4">
                            <p-button label="VER TODOS OS AGENTES" [outlined]="true" styleClass="w-full" size="small" />
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
    readonly globalTme = signal('01:24');

    readonly serviceLevel = signal(94.2);

    readonly operacaoCount = computed(() => this.queues().length);
    readonly alertaCount = computed(() => 1);

    readonly disponiveisCount = computed(() => this.queues().reduce((acc, q) => acc + q.loggedMembers.length, 0));
    readonly emChamadaCount = signal(12);
    readonly emPausaCount = signal(3);

    readonly agentAlerts = signal<AgentStatus[]>([
        { name: 'Ricardo S.', extension: 'Est.4055', alertType: 'PAUSA LONGA', duration: '45:12m' },
        { name: 'Fernanda M.', extension: 'Est.4050', alertType: 'CHAMADA +15M', duration: '18:44m' }
    ]);

    readonly agentStatusCards = computed(() => [
        {
            label: 'DISPONÍVEIS',
            value: this.disponiveisCount(),
            subtitle: '62% do total',
            border: 'border-green-500',
            text: 'text-green-600'
        },
        {
            label: 'EM CHAMADA',
            value: this.emChamadaCount(),
            subtitle: '30% do total',
            border: 'border-red-500',
            text: 'text-red-500'
        },
        {
            label: 'EM PAUSA',
            value: this.emPausaCount(),
            subtitle: '98% do total',
            border: 'border-gray-200',
            text: 'text-gray-400'
        }
    ]);

    barData: any;
    barOptions: any;
    constructor(
        private readonly queueDashboardService: QueueDashboardService,
        private readonly webSocketService: WebsocketService,
        private readonly userService: UserService
    ) {}

    ngOnInit(): void {
        this.initChart();
        this.queueDashboardService.findAllQueueStates().then((queueStates) => {
            this.queues.set(queueStates);
        });

        const companyId = this.userService.getUser().companyId;
        this.subscriptions.push(
            this.webSocketService.watch(`/topic/queuestates/${companyId}`).subscribe((message) => {
                const updated: QueueState = JSON.parse(message.body);
                this.queues.update((qs) => qs.map((q) => (q.queue.id === updated.queue.id ? updated : q)));
            })
        );
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }

    private initChart(): void {
        const docStyle = getComputedStyle(document.documentElement);
        const textColor = docStyle.getPropertyValue('--text-color');
        const textColorSecondary = docStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = docStyle.getPropertyValue('--surface-border');

        this.barData = {
            labels: ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00'],
            datasets: [
                {
                    label: 'Atendidas',
                    backgroundColor: docStyle.getPropertyValue('--p-primary-500') || '#334155',
                    barThickness: 14,
                    borderRadius: 6,
                    data: [42, 58, 35, 20, 47, 63]
                },
                {
                    label: 'Abandonadas',
                    backgroundColor: '#22c55e',
                    barThickness: 14,
                    borderRadius: 6,
                    data: [5, 8, 3, 2, 6, 4]
                }
            ]
        };

        this.barOptions = {
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
                    grid: { display: false, drawBorder: false }
                },
                y: {
                    ticks: { color: textColorSecondary },
                    grid: { color: surfaceBorder, drawBorder: false }
                }
            }
        };
    }

    queueBorderClass(q: QueueState): string {
        return q.answeredCalls ? 'border-green-500' : 'border-red-500';
    }

    queueStatusTextClass(q: QueueState): string {
        return q.answeredCalls ? 'text-green-500' : 'text-red-600';
    }

    agentInitials(name: string): string {
        return name
            .split(' ')
            .map((w) => w[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    }

    alertAvatarClass(alertType: string): string {
        return alertType.includes('PAUSA') ? 'bg-yellow-200 text-yellow-800' : 'bg-red-200 text-red-800';
    }

    alertBadgeClass(alertType: string): string {
        return alertType.includes('PAUSA') ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600';
    }

    formatTwoDigits(n: number): string {
        return n.toString().padStart(2, '0');
    }
}
