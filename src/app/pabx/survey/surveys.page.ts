import { Component, OnInit, ViewChild } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Tooltip } from 'primeng/tooltip';
import { Survey } from '@/pabx/types/survey';
import { SurveyService } from '@/pabx/survey/survey.service';

@Component({
    selector: 'app-surveys-page',
    standalone: true,
    providers: [ConfirmationService, MessageService],
    imports: [
        Card,
        IconField,
        InputIcon,
        InputText,
        Button,
        TableModule,
        RouterLink,
        ProgressSpinner,
        ConfirmDialog,
        Toast,
        Tooltip
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Pesquisa de Satisfação
                    </h2>
                    <div class="inline-flex items-center">
                        <p-iconfield>
                            <p-inputicon class="pi pi-search" />
                            <input
                                pInputText
                                type="text"
                                (input)="onFilterGlobal($event)"
                                placeholder="Pesquisar"
                                [style]="{ borderRadius: '2rem' }"
                                class="w-full"
                            />
                        </p-iconfield>
                        <p-button icon="pi pi-plus" label="Pesquisa" routerLink="new" outlined class="mx-4" rounded />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="surveys"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['title']"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="title">
                            Título
                            <p-sortIcon field="title"></p-sortIcon>
                        </th>
                        <th>Perguntas configuradas</th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-survey>
                    <tr>
                        <td>{{ survey.title }}</td>
                        <td>{{ countQuestions(survey) }} de 3</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', survey.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    (click)="confirmDelete(survey)"
                                    outlined
                                    size="small"
                                    pTooltip="Remover"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    @if (loading) {
                        <p-progress-spinner [style]="{ width: '2rem', height: '2rem' }" />
                    }
                    @if (!loading) {
                        <tr>
                            <td colspan="3" class="text-center p-4">Nenhuma pesquisa encontrada.</td>
                        </tr>
                    }
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog />
        <p-toast />
    `
})
export class SurveysPage implements OnInit {
    surveys: Survey[] = [];
    @ViewChild('dataTable') dt!: Table;
    loading = true;

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly surveyService: SurveyService
    ) {}

    ngOnInit(): void {
        this.surveyService.findAll().then((surveys) => {
            this.surveys = surveys;
            this.loading = false;
        });
    }

    countQuestions(survey: Survey): number {
        return [survey.question1AudioId, survey.question2AudioId, survey.question3AudioId].filter(Boolean).length;
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) this.dt.filterGlobal(target.value, 'contains');
    }

    confirmDelete(survey: Survey) {
        this.confirmationService.confirm({
            message: `Deletar ${survey.title}?`,
            header: 'Confirmação',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: { label: 'Deletar', severity: 'danger' },
            rejectButtonProps: { label: 'Fechar', severity: 'secondary', outlined: true },
            accept: () => {
                this.surveyService
                    .delete(survey.id)
                    .then(() => {
                        this.surveys = this.surveys.filter((s) => s.id !== survey.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Pesquisa removida com sucesso',
                            life: 15_000
                        });
                    })
                    .catch((err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Não foi possível remover a pesquisa',
                            detail: err?.error?.message || 'Tente novamente mais tarde.',
                            life: 15_000
                        });
                    });
            }
        });
    }
}
