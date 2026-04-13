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
import { Queue } from '@/pabx/types';
import { QueueService } from '@/pabx/queue/queue.service';

@Component({
    selector: 'app-queues-page',
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
                        Filas de Atendimento
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
                        <p-button icon="pi pi-plus" label="Fila" routerLink="new" outlined class="mx-4" rounded />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="queues"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['name']"
                [tableStyle]="{ 'min-width': '50rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">
                            Nome
                            <p-sortIcon field="name"></p-sortIcon>
                        </th>
                        <th>Membros</th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-queue>
                    <tr>
                        <td>{{ queue.name }}</td>
                        <td>{{ queue.memberIds.length }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-eye"
                                    [routerLink]="['detail', queue.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Monitorar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', queue.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    (click)="confirmDelete(queue)"
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
                            <td colspan="5" class="text-center p-4">Nenhuma fila de atendimento encontrada.</td>
                        </tr>
                    }
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog />
        <p-toast />
    `
})
export class QueuesPage implements OnInit {
    queues: Queue[] = [];
    @ViewChild('dataTable') dt!: Table;
    loading = true;

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly queueService: QueueService
    ) {}

    ngOnInit(): void {
        this.queueService.findAll().then((queues) => {
            this.queues = queues;
            this.loading = false;
        });
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    confirmDelete(queue: Queue) {
        this.confirmationService.confirm({
            message: `Deletar ${queue.name}?`,
            header: 'Confirmação',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {
                label: 'Deletar',
                severity: 'danger'
            },
            rejectButtonProps: {
                label: 'Fechar',
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                this.queueService
                    .delete(queue.id)
                    .then(() => {
                        this.queues = this.queues.filter((q) => q.id !== queue.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Fila removida com sucesso',
                            life: 15_000
                        });
                    })
                    .catch(() => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Não foi possível remover a fila',
                            detail: 'Tente novamente mais tarde.',
                            life: 15_000
                        });
                    });
            }
        });
    }
}
