/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */

import { Component, computed, effect, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Select } from 'primeng/select';
import { ChartModule } from 'primeng/chart';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Tooltip } from 'primeng/tooltip';
import { RouterLink } from '@angular/router';
import { debounceTime, Subscription } from 'rxjs';
import { Cdr } from '@/pabx/types/cdr';
import { ReportService } from '@/pabx/report/report.service';
import {
    costCenterLabel,
    dispositionSeverity,
    dispositionTranslate,
    formatDate,
    formatDuration
} from '@/pabx/report/cdr-format';
import { LayoutService } from '@/layout/service/layout.service';
import { AccountCodeService } from '@/pabx/accountcode/account-code.service';

interface StatusOption {
    label: string;
    value: string | null;
}

interface ChartBucket {
    key: string;
    label: string;
}

@Component({
    selector: 'app-report-page',
    standalone: true,
    providers: [MessageService],
    imports: [
        Card,
        TableModule,
        ProgressSpinner,
        Toast,
        FormsModule,
        DatePicker,
        Select,
        ChartModule,
        Tag,
        CurrencyPipe,
        Button,
        IconField,
        InputIcon,
        InputText,
        Tooltip,
        RouterLink
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4 gap-3">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold">Relatório de Chamadas</h2>
                    <div class="flex flex-col sm:flex-row items-start sm:items-end gap-3">
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold uppercase tracking-wide text-surface-500">
                                Período
                            </label>
                            <p-datepicker
                                [ngModel]="dateRange()"
                                (ngModelChange)="dateRange.set($event)"
                                selectionMode="range"
                                [readonlyInput]="true"
                                [showButtonBar]="true"
                                dateFormat="dd/mm/yy"
                                placeholder="Selecione o período"
                                [maxDate]="maxDate"
                                [minDate]="minDate"
                                (onSelect)="onDateSelect()"
                                (onClearClick)="onClearDate()"
                            >
                            </p-datepicker>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-xs font-semibold uppercase tracking-wide text-surface-500">
                                Status da Chamada
                            </label>
                            <p-select
                                [options]="statusOptions()"
                                [ngModel]="statusFilter()"
                                (ngModelChange)="statusFilter.set($event)"
                                optionLabel="label"
                                optionValue="value"
                                styleClass="w-44"
                            ></p-select>
                        </div>
                    </div>
                </div>
            </ng-template>

            <!-- KPI cards -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div
                    class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-blue-500 bg-white dark:bg-surface-900"
                >
                    <span class="text-xs font-semibold uppercase tracking-wide text-surface-500">
                        Total de Chamadas
                    </span>
                    <span class="text-2xl font-bold">{{ totalCalls() }}</span>
                </div>
                <div
                    class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-purple-500 bg-white dark:bg-surface-900"
                >
                    <span class="text-xs font-semibold uppercase tracking-wide text-surface-500"> Duração Média </span>
                    <span class="text-2xl font-bold">{{ formatDuration(avgDurationSeconds()) }}</span>
                </div>
                <div
                    class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-green-500 bg-white dark:bg-surface-900"
                >
                    <span class="text-xs font-semibold uppercase tracking-wide text-surface-500">
                        Taxa de Atendimento
                    </span>
                    <span class="text-2xl font-bold">{{ answerRate() }}%</span>
                </div>
                <div
                    class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-orange-500 bg-white dark:bg-surface-900"
                >
                    <span class="text-xs font-semibold uppercase tracking-wide text-surface-500"> Total Falado </span>
                    <span class="text-2xl font-bold">{{ formatDuration(totalTalkSeconds()) }}</span>
                </div>
            </div>

            <!-- Chart -->
            <div class="rounded-xl border border-surface-200 dark:border-surface-700 p-4 mb-4">
                <h3 class="font-semibold text-lg mb-2">{{ chartTitle() }}</h3>
                <p-chart type="bar" height="280" [data]="chartData" [options]="chartOptions"></p-chart>
            </div>

            <!-- Search -->
            <div class="flex justify-end mb-2">
                <p-iconfield>
                    <p-inputicon class="pi pi-search" />
                    <input
                        pInputText
                        type="text"
                        (input)="onFilterGlobal($event)"
                        placeholder="Pesquisar"
                        class="w-full"
                    />
                </p-iconfield>
            </div>

            <p-table
                #dataTable
                [value]="tableRows()"
                [paginator]="true"
                [rows]="30"
                [globalFilterFields]="['dateLabel', 'displaySrc', 'destination']"
                [tableStyle]="{ 'min-width': '50rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="startTime">
                            Data/Hora
                            <p-sortIcon field="startTime"></p-sortIcon>
                        </th>
                        <th>Origem</th>
                        <th>Destino</th>
                        <th>Status</th>
                        <th>Tipo</th>
                        <th pSortableColumn="billableSeconds">
                            Duração
                            <p-sortIcon field="billableSeconds"></p-sortIcon>
                        </th>
                        <th pSortableColumn="cost">
                            Custo
                            <p-sortIcon field="cost"></p-sortIcon>
                        </th>
                        <th>Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-cdr>
                    <tr>
                        <td>{{ cdr.dateLabel }}</td>
                        <td>{{ cdr.displaySrc }}</td>
                        <td>{{ cdr.destination }}</td>
                        <td>
                            <div class="flex items-center gap-2">
                                <i
                                    [class]="
                                        cdr.userfield === 'OUTBOUND'
                                            ? 'pi pi-arrow-right text-green-500'
                                            : 'pi pi-arrow-left text-blue-500'
                                    "
                                ></i>
                                <p-tag
                                    [value]="dispositionTranslate(cdr.disposition)"
                                    [severity]="dispositionSeverity(cdr.disposition)"
                                />
                            </div>
                        </td>
                        <td>{{ cdr.costCenterLabel }}</td>
                        <td>{{ formatDuration(cdr.billableSeconds) }}</td>
                        <td>{{ cdr.cost | currency: 'BRL' : true : '1.2-2' }}</td>
                        <td>
                            <p-button
                                icon="pi pi-search"
                                [routerLink]="['detail', cdr.id]"
                                outlined
                                size="small"
                                pTooltip="Detalhes"
                                tooltipPosition="left"
                            />
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="8">
                            @if (loading()) {
                                <div class="flex justify-center p-4">
                                    <p-progress-spinner [style]="{ width: '2rem', height: '2rem' }" />
                                </div>
                            }
                            @if (!loading()) {
                                <div class="text-center p-4">Nenhuma chamada encontrada.</div>
                            }
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        <p-toast />
    `
})
export class ReportPage implements OnInit, OnDestroy {
    readonly cdrs = signal<Cdr[]>([]);
    readonly dateRange = signal<Date[]>([]);
    readonly statusFilter = signal<string | null>(null);
    readonly loading = signal<boolean>(true);
    readonly costCenterLabelsByCode = signal<Map<string, string>>(new Map());

    @ViewChild('dataTable') dt!: Table;

    private requestId = 0;
    private themeSubscription: Subscription;

    readonly today = new Date();
    maxDate = new Date();
    readonly minDate: Date = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 2);
        return d;
    })();

    chartData: any;
    chartOptions: any;

    readonly filteredCdrs = computed(() => {
        const status = this.statusFilter();
        const all = this.cdrs();
        return status ? all.filter((c) => c.disposition === status) : all;
    });

    readonly statusOptions = computed<StatusOption[]>(() => {
        const dispositions = Array.from(new Set(this.cdrs().map((c) => c.disposition))).sort();
        return [
            { label: 'Todos', value: null },
            ...dispositions.map((d) => ({ label: dispositionTranslate(d), value: d }))
        ];
    });

    readonly totalCalls = computed(() => this.filteredCdrs().length);

    readonly avgDurationSeconds = computed(() => {
        const list = this.filteredCdrs();
        if (!list.length) return 0;
        return Math.round(list.reduce((sum, c) => sum + c.billableSeconds, 0) / list.length);
    });

    readonly answerRate = computed(() => {
        const list = this.filteredCdrs();
        if (!list.length) return 0;
        const answered = list.filter((c) => c.disposition === 'ANSWERED').length;
        return Math.round((answered / list.length) * 1000) / 10;
    });

    readonly totalTalkSeconds = computed(() => this.filteredCdrs().reduce((sum, c) => sum + c.billableSeconds, 0));

    readonly isSingleDay = computed(() => {
        const range = this.dateRange();
        if (range.length === 2 && range[0] && range[1]) {
            return this.isSameDay(range[0], range[1]);
        }
        return false;
    });

    readonly chartTitle = computed(() => (this.isSingleDay() ? 'Chamadas por Hora' : 'Chamadas por Dia'));

    readonly chartDispositions = computed(() =>
        Array.from(new Set(this.filteredCdrs().map((c) => c.disposition))).sort()
    );

    readonly chartBuckets = computed<ChartBucket[]>(() => {
        if (this.isSingleDay()) {
            return Array.from({ length: 24 }, (_, h) => ({
                key: String(h),
                label: `${String(h).padStart(2, '0')}:00`
            }));
        }

        const range = this.dateRange();
        const list = this.filteredCdrs();
        let start: Date;
        let end: Date;
        if (range.length === 2 && range[0] && range[1]) {
            start = new Date(range[0]);
            end = new Date(range[1]);
        } else if (list.length) {
            const times = list.map((c) => new Date(c.startTime).getTime());
            start = new Date(Math.min(...times));
            end = new Date(Math.max(...times));
        } else {
            start = new Date();
            end = new Date();
        }

        const buckets: ChartBucket[] = [];
        const cursor = new Date(start);
        cursor.setHours(0, 0, 0, 0);
        const last = new Date(end);
        last.setHours(0, 0, 0, 0);
        while (cursor.getTime() <= last.getTime()) {
            buckets.push({
                key: this.dayKey(cursor),
                label: `${String(cursor.getDate()).padStart(2, '0')}/${String(cursor.getMonth() + 1).padStart(2, '0')}`
            });
            cursor.setDate(cursor.getDate() + 1);
        }
        return buckets;
    });

    readonly tableRows = computed(() => {
        const labelsByCode = this.costCenterLabelsByCode();
        return this.filteredCdrs().map((cdr) => ({
            ...cdr,
            dateLabel: formatDate(cdr.startTime),
            displaySrc: cdr.userfield === 'OUTBOUND' ? cdr.peer : cdr.src,
            costCenterLabel: costCenterLabel(cdr.accountCode, labelsByCode)
        }));
    });

    constructor(
        private readonly reportService: ReportService,
        private readonly accountCodeService: AccountCodeService,
        private readonly messageService: MessageService,
        private readonly layoutService: LayoutService
    ) {
        this.themeSubscription = this.layoutService.configUpdate$.pipe(debounceTime(50)).subscribe(() => {
            this.initChart();
        });
        effect(() => {
            this.filteredCdrs();
            this.isSingleDay();
            this.chartBuckets();
            this.chartDispositions();
            this.initChart();
        });
    }

    ngOnInit(): void {
        this.load(() => this.reportService.findLast30());
        this.accountCodeService
            .findAll()
            .then((accountCodes) => {
                this.costCenterLabelsByCode.set(new Map(accountCodes.map((a) => [a.code, a.title])));
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao carregar centros de custo',
                    detail: 'Tente novamente mais tarde.',
                    life: 10_000
                });
            });
    }

    ngOnDestroy(): void {
        this.themeSubscription.unsubscribe();
    }

    onDateSelect(): void {
        const range = this.dateRange();
        if (range[0] && !range[1]) {
            const limit = new Date(range[0]);
            limit.setMonth(limit.getMonth() + 2);
            this.maxDate = limit > this.today ? this.today : limit;
            return;
        }

        if (range[0] && range[1]) {
            const end = new Date(range[1]);
            end.setHours(23, 59, 59, 999);
            this.statusFilter.set(null);
            this.load(() => this.reportService.findByDateRange(range[0], end));
        }
    }

    onClearDate(): void {
        this.maxDate = new Date(this.today);
        this.dateRange.set([]);
        this.statusFilter.set(null);
        this.load(() => this.reportService.findLast30());
    }

    onFilterGlobal(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    protected readonly formatDuration = formatDuration;
    protected readonly dispositionSeverity = dispositionSeverity;
    protected readonly dispositionTranslate = dispositionTranslate;

    private load(fetch: () => Promise<Cdr[]>): void {
        const id = ++this.requestId;
        this.loading.set(true);
        fetch()
            .then((cdrs) => {
                if (id !== this.requestId) return;
                this.cdrs.set(cdrs);
                this.loading.set(false);
            })
            .catch(() => {
                if (id !== this.requestId) return;
                this.loading.set(false);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao carregar chamadas',
                    detail: 'Tente novamente mais tarde.',
                    life: 10_000
                });
            });
    }

    private initChart(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        const buckets = this.chartBuckets();
        const dispositions = this.chartDispositions();
        const list = this.filteredCdrs();

        this.chartData = {
            labels: buckets.map((b) => b.label),
            datasets: dispositions.map((d) => ({
                label: dispositionTranslate(d),
                backgroundColor: this.severityColor(d, documentStyle),
                barThickness: 14,
                borderRadius: 6,
                data: buckets.map(
                    (b) =>
                        list.filter((c) => c.disposition === d && this.dayKey(new Date(c.startTime)) === b.key).length
                )
            }))
        };

        this.chartOptions = {
            animation: { duration: 1000 },
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
                    grid: { color: surfaceBorder, drawBorder: false },
                    beginAtZero: true
                }
            }
        };
    }

    private severityColor(disposition: string, documentStyle: CSSStyleDeclaration): string {
        switch (dispositionSeverity(disposition)) {
            case 'success':
                return documentStyle.getPropertyValue('--p-green-500');
            case 'warn':
                return documentStyle.getPropertyValue('--p-yellow-500');
            case 'danger':
                return documentStyle.getPropertyValue('--p-red-500');
            default:
                return documentStyle.getPropertyValue('--p-surface-400');
        }
    }

    private dayKey(date: Date): string {
        if (this.isSingleDay()) return String(date.getHours());
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    private isSameDay(a: Date, b: Date): boolean {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }
}
