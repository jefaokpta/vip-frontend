/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */

import {Component, computed, effect, inject, OnDestroy, OnInit, signal, ViewChild} from '@angular/core';
import {Table, TableModule} from 'primeng/table';
import {MessageService} from 'primeng/api';
import {Card} from 'primeng/card';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Toast} from 'primeng/toast';
import {CurrencyPipe} from '@angular/common';
import {ChartModule} from 'primeng/chart';
import {Tag} from 'primeng/tag';
import {Button} from 'primeng/button';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {Tooltip} from 'primeng/tooltip';
import {RouterLink} from '@angular/router';
import {debounceTime, Subscription} from 'rxjs';
import {Cdr} from '@/pabx/types/cdr';
import {ReportService} from '@/pabx/report/report.service';
import {
    costCenterLabel,
    dispositionSeverity,
    dispositionTranslate,
    formatDate,
    formatDuration
} from '@/pabx/report/cdr-format';
import {answerRate, avgDurationSeconds, totalTalkSeconds} from '@/pabx/report/cdr-stats';
import {buildCallsChart, dailyBuckets} from '@/pabx/report/cdr-chart';
import {LayoutService} from '@/layout/service/layout.service';
import {AccountCodeService} from '@/pabx/accountcode/account-code.service';

const PERIOD_DAYS = 30;

/** Tela inicial: chamadas feitas e recebidas pelo próprio usuário nos últimos 30 dias. */
@Component({
    selector: 'app-my-calls-dashboard',
    standalone: true,
    providers: [MessageService],
    imports: [
        Card,
        TableModule,
        ProgressSpinner,
        Toast,
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
                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4">
                    Minhas Chamadas
                    <span class="text-base font-normal text-surface-500">(últimos {{ periodDays }} dias)</span>
                </h2>
            </ng-template>

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
                    <span class="text-2xl font-bold">{{ formatDuration(avgDuration()) }}</span>
                </div>
                <div
                    class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-green-500 bg-white dark:bg-surface-900"
                >
                    <span class="text-xs font-semibold uppercase tracking-wide text-surface-500">
                        Taxa de Atendimento
                    </span>
                    <span class="text-2xl font-bold">{{ rate() }}%</span>
                </div>
                <div
                    class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-orange-500 bg-white dark:bg-surface-900"
                >
                    <span class="text-xs font-semibold uppercase tracking-wide text-surface-500"> Total Falado </span>
                    <span class="text-2xl font-bold">{{ formatDuration(talkSeconds()) }}</span>
                </div>
            </div>

            <div class="rounded-xl border border-surface-200 dark:border-surface-700 p-4 mb-4">
                <h3 class="font-semibold text-lg mb-2">Chamadas por Dia</h3>
                <p-chart type="line" height="280" [data]="chartData" [options]="chartOptions"></p-chart>
            </div>

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
                        <td>{{ cdr.costCenter }}</td>
                        <td>{{ formatDuration(cdr.billableSeconds) }}</td>
                        <td>{{ cdr.cost | currency: 'BRL' : true : '1.2-2' }}</td>
                        <td>
                            <p-button
                                icon="pi pi-search"
                                [routerLink]="['/pabx/call-report/detail', cdr.id]"
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
export class MyCallsDashboard implements OnInit, OnDestroy {
    private readonly reportService = inject(ReportService);
    private readonly accountCodeService = inject(AccountCodeService);
    private readonly messageService = inject(MessageService);
    private readonly layoutService = inject(LayoutService);

    readonly periodDays = PERIOD_DAYS;
    readonly cdrs = signal<Cdr[]>([]);
    readonly loading = signal<boolean>(true);
    readonly costCenterLabelsByCode = signal<Map<string, string>>(new Map());

    @ViewChild('dataTable') dt!: Table;

    private readonly themeSubscription: Subscription;

    chartData: any;
    chartOptions: any;

    readonly totalCalls = computed(() => this.cdrs().length);
    readonly avgDuration = computed(() => avgDurationSeconds(this.cdrs()));
    readonly rate = computed(() => answerRate(this.cdrs()));
    readonly talkSeconds = computed(() => totalTalkSeconds(this.cdrs()));

    readonly tableRows = computed(() => {
        const labelsByCode = this.costCenterLabelsByCode();
        return this.cdrs().map((cdr) => ({
            ...cdr,
            dateLabel: formatDate(cdr.startTime),
            displaySrc: cdr.userfield === 'OUTBOUND' ? cdr.peer : cdr.src,
            costCenter: costCenterLabel(cdr.accountCode, labelsByCode)
        }));
    });

    constructor() {
        this.themeSubscription = this.layoutService.configUpdate$.pipe(debounceTime(50)).subscribe(() => {
            this.initChart();
        });
        effect(() => {
            this.cdrs();
            this.initChart();
        });
    }

    ngOnInit(): void {
        this.reportService
            .findMine()
            .then((cdrs) => this.cdrs.set(cdrs))
            .catch(() => this.showError('Erro ao carregar chamadas'))
            .finally(() => this.loading.set(false));

        this.accountCodeService
            .findAll()
            .then((accountCodes) => {
                const labelsByCode = new Map<string, string>();
                for (const accountCode of accountCodes) {
                    if (!labelsByCode.has(accountCode.code)) {
                        labelsByCode.set(accountCode.code, accountCode.title);
                    }
                }
                this.costCenterLabelsByCode.set(labelsByCode);
            })
            .catch(() => this.showError('Erro ao carregar centros de custo'));
    }

    ngOnDestroy(): void {
        this.themeSubscription.unsubscribe();
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

    private initChart(): void {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - (PERIOD_DAYS - 1));
        const { data, options } = buildCallsChart(this.cdrs(), dailyBuckets(start, end), false);
        this.chartData = data;
        this.chartOptions = options;
    }

    private showError(summary: string): void {
        this.messageService.add({ severity: 'error', summary, detail: 'Tente novamente mais tarde.', life: 10_000 });
    }
}
