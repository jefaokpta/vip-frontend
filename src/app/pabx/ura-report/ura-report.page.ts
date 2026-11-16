import {Component, OnInit} from '@angular/core';
import {TableModule} from 'primeng/table';
import {MessageService} from 'primeng/api';
import {Card} from 'primeng/card';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Toast} from 'primeng/toast';
import {NgIf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {DatePicker} from 'primeng/datepicker';
import {Select} from 'primeng/select';
import {Ura} from '@/pabx/types/ura';
import {UraSelection} from '@/pabx/types/ura-selection';
import {UraService} from '@/pabx/ura/ura.service';
import {UraReportService} from '@/pabx/ura-report/ura-report.service';
import {buildOptionBarChart, uraOptionLabel} from '@/pabx/ura-report/ura-option';
import {ChartModule} from 'primeng/chart';

interface OptionSummary {
    readonly optionDigit: number;
    readonly label: string;
    readonly count: number;
    readonly percentage: number;
}

@Component({
    selector: 'app-ura-report-page',
    standalone: true,
    providers: [MessageService],
    imports: [Card, TableModule, ProgressSpinner, Toast, NgIf, FormsModule, DatePicker, Select, ChartModule],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Relatório de Estatísticas de URA
                    </h2>
                    <div class="flex items-center gap-2">
                        <p-select
                            [options]="uras"
                            [(ngModel)]="selectedUra"
                            optionLabel="name"
                            placeholder="Selecione uma URA"
                            (onChange)="onUraSelect()"
                        ></p-select>
                        @if (selectedUra) {
                            <p-datepicker
                                [(ngModel)]="dateRange"
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
                        }
                    </div>
                </div>
            </ng-template>

            @if (!selectedUra) {
                <div class="text-center p-4">Selecione uma URA acima pra ver o relatório.</div>
            } @else {
                @if (selections.length > 0) {
                    <div class="rounded-xl border border-surface-200 dark:border-surface-700 p-4 mb-4">
                        <h3 class="font-semibold text-lg mb-2">
                            Seleções por opção ({{ selections.length }} no total)
                        </h3>
                        <p-chart type="bar" height="280" [data]="chartData" [options]="chartOptions"></p-chart>
                    </div>
                }

                <p-table
                    [value]="selections"
                    [paginator]="true"
                    [rows]="30"
                    [tableStyle]="{ 'min-width': '50rem' }"
                    stripedRows
                >
                    <ng-template pTemplate="header">
                        <tr>
                            <th pSortableColumn="createdAt">
                                Data/Hora
                                <p-sortIcon field="createdAt"></p-sortIcon>
                            </th>
                            <th>Telefone</th>
                            <th>Opção</th>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-selection>
                        <tr>
                            <td>{{ formatDate(selection.createdAt) }}</td>
                            <td>{{ selection.callerId }}</td>
                            <td>{{ optionLabel(selection.optionDigit) }}</td>
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="3">
                                <div class="flex justify-center p-4" *ngIf="loading">
                                    <p-progress-spinner [style]="{ width: '2rem', height: '2rem' }" />
                                </div>
                                <div class="text-center p-4" *ngIf="!loading">Nenhuma seleção encontrada.</div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            }
        </p-card>
        <p-toast />
    `
})
export class UraReportPage implements OnInit {
    uras: Ura[] = [];
    selectedUra: Ura | null = null;
    private _selections: UraSelection[] = [];
    chartData: unknown;
    chartOptions: unknown;

    get selections(): UraSelection[] {
        return this._selections;
    }

    set selections(selections: UraSelection[]) {
        this._selections = selections;
        const { data, options } = buildOptionBarChart(
            this.optionSummaries
        );
        this.chartData = data;
        this.chartOptions = options;
    }
    dateRange: Date[] = [];
    loading = false;

    readonly today = new Date();
    maxDate = new Date();
    readonly minDate: Date = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 2);
        return d;
    })();

    constructor(
        private readonly uraService: UraService,
        private readonly uraReportService: UraReportService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.uraService
            .findAll()
            .then((uras) => {
                this.uras = uras;
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao carregar URAs',
                    detail: 'Tente novamente mais tarde.',
                    life: 10_000
                });
            });
    }

    onUraSelect(): void {
        this.selections = [];
        this.dateRange = [];
        this.maxDate = new Date(this.today);
        this.loadLastSelections();
    }

    onDateSelect(): void {
        if (!this.selectedUra) return;

        if (this.dateRange[0] && !this.dateRange[1]) {
            const limit = new Date(this.dateRange[0]);
            limit.setMonth(limit.getMonth() + 2);
            this.maxDate = limit > this.today ? this.today : limit;
            return;
        }

        if (this.dateRange[0] && this.dateRange[1]) {
            const requested = this.selectedUra;
            this.loading = true;
            const end = new Date(this.dateRange[1]);
            end.setHours(23, 59, 59, 999);
            this.uraReportService
                .findByDateRange(requested.id, this.dateRange[0], end)
                .then((selections) => {
                    if (this.selectedUra !== requested) return;
                    this.selections = selections;
                    this.loading = false;
                })
                .catch(() => {
                    if (this.selectedUra !== requested) return;
                    this.selections = [];
                    this.loading = false;
                    this.showError();
                });
        }
    }

    onClearDate(): void {
        this.maxDate = new Date(this.today);
        this.loadLastSelections();
    }

    private loadLastSelections(): void {
        if (!this.selectedUra) return;
        const requested = this.selectedUra;
        this.loading = true;
        this.uraReportService
            .findLastSelections(requested.id)
            .then((selections) => {
                if (this.selectedUra !== requested) return;
                this.selections = selections;
                this.loading = false;
            })
            .catch(() => {
                if (this.selectedUra !== requested) return;
                this.selections = [];
                this.loading = false;
                this.showError();
            });
    }

    private showError(): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar seleções',
            detail: 'Tente novamente mais tarde.',
            life: 10_000
        });
    }

    get optionSummaries(): OptionSummary[] {
        if (!this.selectedUra || this.selections.length === 0) return [];
        const total = this.selections.length;
        const counts = new Map<number, number>();
        for (const action of this.selectedUra.actions) {
            counts.set(action.option, 0);
        }
        for (const selection of this.selections) {
            counts.set(selection.optionDigit, (counts.get(selection.optionDigit) ?? 0) + 1);
        }
        return Array.from(counts.entries())
            .sort(([a], [b]) => a - b)
            .map(([optionDigit, count]) => ({
                optionDigit,
                label: this.optionLabel(optionDigit),
                count,
                percentage: (count / total) * 100
            }));
    }

    optionLabel(optionDigit: number): string {
        return this.selectedUra ? uraOptionLabel(optionDigit, this.selectedUra) : `${optionDigit}`;
    }

    formatDate(createdAt: Date | string): string {
        const d = new Date(createdAt);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
}
