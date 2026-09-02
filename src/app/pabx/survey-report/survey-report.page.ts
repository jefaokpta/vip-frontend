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
import {Survey} from '@/pabx/types/survey';
import {SurveyResponse} from '@/pabx/types/survey-response';
import {SurveyService} from '@/pabx/survey/survey.service';
import {SurveyReportService} from '@/pabx/survey-report/survey-report.service';

@Component({
    selector: 'app-survey-report-page',
    standalone: true,
    providers: [MessageService],
    imports: [Card, TableModule, ProgressSpinner, Toast, NgIf, FormsModule, DatePicker, Select],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Relatório de Pesquisa de Satisfação
                    </h2>
                    <div class="flex items-center gap-2">
                        <p-select
                            [options]="surveys"
                            [(ngModel)]="selectedSurvey"
                            optionLabel="title"
                            placeholder="Selecione uma pesquisa"
                            (onChange)="onSurveySelect()"
                        ></p-select>
                        @if (selectedSurvey) {
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

            @if (!selectedSurvey) {
                <div class="text-center p-4">Selecione uma pesquisa acima pra ver o relatório.</div>
            } @else {
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div class="p-4 border rounded-border border-surface-200 dark:border-surface-700">
                        <div class="text-surface-500 dark:text-surface-400 text-sm mb-1">Total de respostas</div>
                        <div class="text-2xl font-semibold">{{ responses.length }}</div>
                    </div>
                    <div class="p-4 border rounded-border border-surface-200 dark:border-surface-700">
                        <div class="text-surface-500 dark:text-surface-400 text-sm mb-1">Média Pergunta 1</div>
                        <div class="text-2xl font-semibold">{{ averageLabel(question1Average) }}</div>
                    </div>
                    @if (selectedSurvey.question2AudioId) {
                        <div class="p-4 border rounded-border border-surface-200 dark:border-surface-700">
                            <div class="text-surface-500 dark:text-surface-400 text-sm mb-1">Média Pergunta 2</div>
                            <div class="text-2xl font-semibold">{{ averageLabel(question2Average) }}</div>
                        </div>
                    }
                    @if (selectedSurvey.question3AudioId) {
                        <div class="p-4 border rounded-border border-surface-200 dark:border-surface-700">
                            <div class="text-surface-500 dark:text-surface-400 text-sm mb-1">Média Pergunta 3</div>
                            <div class="text-2xl font-semibold">{{ averageLabel(question3Average) }}</div>
                        </div>
                    }
                </div>

                <p-table
                    [value]="responses"
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
                            <th>Pergunta 1</th>
                            @if (selectedSurvey.question2AudioId) {
                                <th>Pergunta 2</th>
                            }
                            @if (selectedSurvey.question3AudioId) {
                                <th>Pergunta 3</th>
                            }
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="body" let-response>
                        <tr>
                            <td>{{ formatDate(response.createdAt) }}</td>
                            <td>{{ response.callerId }}</td>
                            <td>{{ response.question1Answer ?? '—' }}</td>
                            @if (selectedSurvey.question2AudioId) {
                                <td>{{ response.question2Answer ?? '—' }}</td>
                            }
                            @if (selectedSurvey.question3AudioId) {
                                <td>{{ response.question3Answer ?? '—' }}</td>
                            }
                        </tr>
                    </ng-template>

                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="5">
                                <div class="flex justify-center p-4" *ngIf="loading">
                                    <p-progress-spinner [style]="{ width: '2rem', height: '2rem' }" />
                                </div>
                                <div class="text-center p-4" *ngIf="!loading">Nenhuma resposta encontrada.</div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            }
        </p-card>
        <p-toast />
    `
})
export class SurveyReportPage implements OnInit {
    surveys: Survey[] = [];
    selectedSurvey: Survey | null = null;
    responses: SurveyResponse[] = [];
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
        private readonly surveyService: SurveyService,
        private readonly surveyReportService: SurveyReportService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.surveyService.findAll().then((surveys) => {
            this.surveys = surveys;
        });
    }

    onSurveySelect(): void {
        this.responses = [];
        this.dateRange = [];
        this.maxDate = new Date(this.today);
        this.loadLastResponses();
    }

    onDateSelect(): void {
        if (!this.selectedSurvey) return;

        if (this.dateRange[0] && !this.dateRange[1]) {
            const limit = new Date(this.dateRange[0]);
            limit.setMonth(limit.getMonth() + 2);
            this.maxDate = limit > this.today ? this.today : limit;
            return;
        }

        if (this.dateRange[0] && this.dateRange[1]) {
            const requested = this.selectedSurvey;
            this.loading = true;
            const end = new Date(this.dateRange[1]);
            end.setHours(23, 59, 59, 999);
            this.surveyReportService
                .findByDateRange(requested.id, this.dateRange[0], end)
                .then((responses) => {
                    if (this.selectedSurvey !== requested) return;
                    this.responses = responses;
                    this.loading = false;
                })
                .catch(() => {
                    if (this.selectedSurvey !== requested) return;
                    this.responses = [];
                    this.loading = false;
                    this.showError();
                });
        }
    }

    onClearDate(): void {
        this.maxDate = new Date(this.today);
        this.loadLastResponses();
    }

    private loadLastResponses(): void {
        if (!this.selectedSurvey) return;
        const requested = this.selectedSurvey;
        this.loading = true;
        this.surveyReportService
            .findLastResponses(requested.id)
            .then((responses) => {
                if (this.selectedSurvey !== requested) return;
                this.responses = responses;
                this.loading = false;
            })
            .catch(() => {
                if (this.selectedSurvey !== requested) return;
                this.responses = [];
                this.loading = false;
                this.showError();
            });
    }

    private showError(): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar respostas',
            detail: 'Tente novamente mais tarde.',
            life: 10_000
        });
    }

    get question1Average(): number | null {
        return this.average(this.responses.map((r) => r.question1Answer));
    }

    get question2Average(): number | null {
        return this.average(this.responses.map((r) => r.question2Answer));
    }

    get question3Average(): number | null {
        return this.average(this.responses.map((r) => r.question3Answer));
    }

    private average(values: (number | undefined)[]): number | null {
        const answered = values.filter((v): v is number => v !== undefined && v !== null);
        if (answered.length === 0) return null;
        return Math.round((answered.reduce((sum, v) => sum + v, 0) / answered.length) * 10) / 10;
    }

    averageLabel(value: number | null): string {
        return value === null ? '—' : value.toFixed(1);
    }

    formatDate(createdAt: Date | string): string {
        const d = new Date(createdAt);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
}
