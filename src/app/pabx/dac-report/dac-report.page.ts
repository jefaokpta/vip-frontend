import { Component, OnInit, signal, computed } from '@angular/core';
import { Card } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { Button } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { DacReportResponse, QueueOption } from '@/pabx/types/dac-report';
import { DacPartial } from '@/pabx/types/dac-report';
import { DacReportService } from '@/pabx/dac-report/dac-report.service';

@Component({
    selector: 'app-dac-report-page',
    standalone: true,
    providers: [MessageService],
    imports: [Card, ProgressSpinner, Toast, FormsModule, DatePicker, Select, Button, ChartModule, TableModule],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div class="mb-4 md:mb-0">
                        <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold">
                            Relatório DAC - Fila de Atendimento
                        </h2>
                        <span class="text-sm text-surface-500 dark:text-surface-400">
                            Distribuição Automática de Chamadas e volumetria da fila selecionada.
                        </span>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-select
                            [options]="queues()"
                            [ngModel]="selectedQueue()"
                            (ngModelChange)="selectedQueue.set($event)"
                            optionLabel="name"
                            placeholder="Selecione uma fila"
                            (onChange)="onQueueSelect()"
                        ></p-select>
                        @if (selectedQueue()) {
                            <p-datepicker
                                [ngModel]="dateRange()"
                                (ngModelChange)="dateRange.set($event)"
                                selectionMode="range"
                                [readonlyInput]="true"
                                [showButtonBar]="true"
                                dateFormat="dd/mm/yy"
                                placeholder="Selecione o período"
                                [maxDate]="maxDate()"
                                (onSelect)="onDateSelect()"
                                (onClearClick)="onClearDate()"
                            ></p-datepicker>
                        }
                    </div>
                </div>
            </ng-template>

            @if (!selectedQueue()) {
                <div class="text-center p-4">Selecione uma fila acima pra ver o relatório.</div>
            } @else if (loading()) {
                <div class="flex justify-center p-10">
                    <p-progress-spinner [style]="{ width: '2.5rem', height: '2.5rem' }" />
                </div>
            } @else if (reportError()) {
                <div class="flex flex-col items-center gap-3 p-10 text-center">
                    <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                    <span class="text-surface-600 dark:text-surface-300"
                        >Não foi possível carregar o relatório. Tente novamente.</span
                    >
                    <p-button icon="pi pi-refresh" label="Tentar novamente" (onClick)="loadReport()" />
                </div>
            } @else {
                @if (report(); as r) {
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-gray-200">
                            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">TOTAL DE CHAMADAS</span>
                            <span class="text-2xl font-bold">{{ r.totalCalls }}</span>
                        </div>
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-green-500">
                            <span class="text-xs font-semibold uppercase tracking-wide text-green-600">ATENDIDAS</span>
                            <span class="text-2xl font-bold">{{ r.answeredCalls }} ({{ answeredPercent(r) }}%)</span>
                            <span class="text-xs text-surface-500"
                                >Nível de Serviço: {{ r.serviceLevelPercent }}% (≤ {{ r.serviceLevelSeconds }}s)</span
                            >
                        </div>
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-red-500">
                            <span class="text-xs font-semibold uppercase tracking-wide text-red-500">ABANDONADAS</span>
                            <span class="text-2xl font-bold">{{ r.abandonedCalls }} ({{ abandonedPercent(r) }}%)</span>
                        </div>
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-orange-400">
                            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">TME MÉDIO</span>
                            <span class="text-2xl font-bold">{{ formatHms(r.avgWaitSeconds) }}</span>
                            <span class="text-xs text-surface-500">Espera</span>
                        </div>
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-indigo-400">
                            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">TMA MÉDIO</span>
                            <span class="text-2xl font-bold">{{ formatHms(r.avgTalkSeconds) }}</span>
                            <span class="text-xs text-surface-500">Conversação</span>
                        </div>
                    </div>
                    <div class="rounded-xl border border-surface-200 dark:border-surface-700 p-4 mb-4">
                        <h3 class="font-semibold text-lg mb-2">Volumetria: Atendidas vs. Abandonadas</h3>
                        @if (chartData(); as data) {
                            <p-chart type="line" height="280" [data]="data" [options]="chartOptions"></p-chart>
                        }
                    </div>
                    <div class="rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                        <h3 class="font-semibold text-lg mb-4">Detalhamento por Faixa {{ r.granularity === 'HOUR' ? 'Horária' : 'Diária' }}</h3>
                        <p-table [value]="r.totalCalls > 0 ? r.partials : []" [tableStyle]="{ 'min-width': '45rem' }" stripedRows>
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Período</th>
                                    <th>Chamadas (% Total)</th>
                                    <th>Atendidas (% Faixa)</th>
                                    <th>Abandonadas (% Faixa)</th>
                                    <th>TME (Espera)</th>
                                    <th>TMA (Conversado)</th>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="body" let-partial>
                                <tr>
                                    <td>{{ partialLabel(partial, r.granularity) }}</td>
                                    <td>{{ partial.totalCalls }} ({{ partialPercentOfTotal(partial, r) }}%)</td>
                                    <td>{{ partial.answeredCalls }} ({{ partialAnsweredPercent(partial) }}%)</td>
                                    <td>{{ partial.abandonedCalls }} ({{ partialAbandonedPercent(partial) }}%)</td>
                                    <td>{{ formatHms(partial.avgWaitSeconds) }}</td>
                                    <td>{{ formatHms(partial.avgTalkSeconds) }}</td>
                                </tr>
                            </ng-template>
                            <ng-template pTemplate="footer">
                                @if (r.totalCalls > 0) {
                                    <tr>
                                        <td class="font-semibold">TOTAL GERAL / MÉDIAS</td>
                                        <td class="font-semibold">{{ r.totalCalls }} (100%)</td>
                                        <td class="font-semibold">{{ r.answeredCalls }} ({{ answeredPercent(r) }}%)</td>
                                        <td class="font-semibold">{{ r.abandonedCalls }} ({{ abandonedPercent(r) }}%)</td>
                                        <td class="font-semibold">{{ formatHms(r.avgWaitSeconds) }}</td>
                                        <td class="font-semibold">{{ formatHms(r.avgTalkSeconds) }}</td>
                                </tr>
                            }
                        </ng-template>
                        <ng-template pTemplate="emptymessage">
                            <tr>
                                <td colspan="6" class="text-center p-4">Nenhuma chamada nesse período</td>
                            </tr>
                        </ng-template>
                    </p-table>
                    </div>
                }
            }
        </p-card>
        <p-toast />
    `
})
export class DacReportPage implements OnInit {
    readonly queues = signal<QueueOption[]>([]);
    readonly selectedQueue = signal<QueueOption | null>(null);
    readonly dateRange = signal<Date[]>([]);
    readonly report = signal<DacReportResponse | null>(null);
    readonly loading = signal<boolean>(false);
    readonly reportError = signal<boolean>(false);
    readonly maxDate = signal<Date>(new Date());

    readonly chartData = computed(() => {
        const r = this.report();
        if (!r) return null;
        return {
            labels: r.partials.map((p) => this.partialLabel(p, r.granularity)),
            datasets: [
                {
                    label: 'Atendidas',
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    fill: true,
                    tension: 0.3,
                    data: r.partials.map((p) => p.answeredCalls)
                },
                {
                    label: 'Abandonadas',
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    fill: false,
                    tension: 0.3,
                    data: r.partials.map((p) => p.abandonedCalls)
                }
            ]
        };
    });

    readonly chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' as const } },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true }
        }
    };

    readonly today = new Date();
    private requestId = 0;

    constructor(
        private readonly dacReportService: DacReportService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.dacReportService
            .findQueues()
            .then((queues) => this.queues.set(queues))
            .catch(() => this.showError('Erro ao carregar filas'));
    }

    onQueueSelect(): void {
        this.maxDate.set(new Date(this.today));
        const todayStart = new Date(this.today);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(this.today);
        todayEnd.setHours(23, 59, 59, 999);
        this.dateRange.set([todayStart, todayEnd]);
        this.loadReport();
    }

    onDateSelect(): void {
        const range = this.dateRange();
        if (!range[0]) return;

        if (!range[1]) {
            const limit = new Date(range[0]);
            limit.setDate(limit.getDate() + 31);
            this.maxDate.set(limit > this.today ? new Date(this.today) : limit);
            return;
        }

        this.loadReport();
    }

    onClearDate(): void {
        this.maxDate.set(new Date(this.today));
        this.onQueueSelect();
    }

    loadReport(): void {
        const queue = this.selectedQueue();
        const range = this.dateRange();
        if (!queue || !range[0] || !range[1]) return;

        const id = ++this.requestId;
        this.loading.set(true);
        this.reportError.set(false);

        const start = new Date(range[0]);
        start.setHours(0, 0, 0, 0);
        const end = new Date(range[1]);
        end.setHours(23, 59, 59, 999);

        this.dacReportService
            .findReport(queue.id, start, end)
            .then((report) => {
                if (id !== this.requestId) return;
                this.report.set(report);
                this.loading.set(false);
            })
            .catch(() => {
                if (id !== this.requestId) return;
                this.report.set(null);
                this.loading.set(false);
                this.reportError.set(true);
                this.showError('Erro ao carregar relatório');
            });
    }

    answeredPercent(r: DacReportResponse): number {
        return r.totalCalls === 0 ? 0 : Math.round((r.answeredCalls / r.totalCalls) * 100);
    }

    abandonedPercent(r: DacReportResponse): number {
        return r.totalCalls === 0 ? 0 : Math.round((r.abandonedCalls / r.totalCalls) * 100);
    }

    formatHms(totalSeconds: number): string {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = Math.floor(totalSeconds % 60);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    partialLabel(partial: DacPartial, granularity: 'HOUR' | 'DAY'): string {
        const d = new Date(partial.periodStart);
        const pad = (n: number) => String(n).padStart(2, '0');
        return granularity === 'HOUR'
            ? `${pad(d.getHours())}:00`
            : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
    }

    partialPercentOfTotal(partial: DacPartial, r: DacReportResponse): number {
        return r.totalCalls === 0 ? 0 : Math.round((partial.totalCalls / r.totalCalls) * 100);
    }

    partialAnsweredPercent(partial: DacPartial): number {
        return partial.totalCalls === 0 ? 0 : Math.round((partial.answeredCalls / partial.totalCalls) * 100);
    }

    partialAbandonedPercent(partial: DacPartial): number {
        return partial.totalCalls === 0 ? 0 : Math.round((partial.abandonedCalls / partial.totalCalls) * 100);
    }

    private showError(summary: string): void {
        this.messageService.add({ severity: 'error', summary, detail: 'Tente novamente mais tarde.', life: 10_000 });
    }
}
