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
import {answerBars, buildCountBarChart} from '@/pabx/report/count-bar-chart';
import {ChartModule} from 'primeng/chart';

interface QuestionChart {
    readonly title: string;
    readonly data: unknown;
    readonly options: unknown;
}

@Component({
    selector: 'app-survey-report-page',
    standalone: true,
    providers: [MessageService],
    imports: [Card, TableModule, ProgressSpinner, Toast, NgIf, FormsModule, DatePicker, Select, ChartModule],
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
                @if (responses.length > 0) {
                    <h3 class="font-semibold text-lg mb-2">Respostas por pergunta ({{ responses.length }} no total)</h3>
                    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                        @for (chart of questionCharts; track chart.title) {
                            <div class="rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                                <h4 class="font-semibold mb-2">{{ chart.title }}</h4>
                                <p-chart type="bar" height="240" [data]="chart.data" [options]="chart.options"></p-chart>
                            </div>
                        }
                    </div>
                }

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
                            <td>{{ response.question1Answer ?? 'Não respondeu' }}</td>
                            @if (selectedSurvey.question2AudioId) {
                                <td>{{ response.question2Answer ?? 'Não respondeu' }}</td>
                            }
                            @if (selectedSurvey.question3AudioId) {
                                <td>{{ response.question3Answer ?? 'Não respondeu' }}</td>
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
    private _responses: SurveyResponse[] = [];
    questionCharts: QuestionChart[] = [];

    get responses(): SurveyResponse[] {
        return this._responses;
    }

    set responses(responses: SurveyResponse[]) {
        this._responses = responses;
        this.questionCharts = this.buildQuestionCharts();
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
        private readonly surveyService: SurveyService,
        private readonly surveyReportService: SurveyReportService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.surveyService
            .findAll()
            .then((surveys) => {
                this.surveys = surveys;
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao carregar pesquisas',
                    detail: 'Tente novamente mais tarde.',
                    life: 10_000
                });
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

    private buildQuestionCharts(): QuestionChart[] {
        const survey = this.selectedSurvey;
        if (!survey) return [];
        const questions: (keyof SurveyResponse)[] = ['question1Answer'];
        if (survey.question2AudioId) questions.push('question2Answer');
        if (survey.question3AudioId) questions.push('question3Answer');
        return questions.map((field, index) => {
            const { data, options } = buildCountBarChart(
                answerBars(this._responses.map((r) => r[field] as number | undefined)),
                'Respostas'
            );
            const answers = this._responses.map((r) => r[field] as number | undefined);
            const average = this.averageLabel(this.average(answers));
            return { title: `Pergunta ${index + 1} (média ${average})`, data, options };
        });
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
