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
import { WorkerInstance } from '@/types/worker-instance';
import { WorkerInstanceService } from '@/pages/worker-instance/worker-instance.service';

@Component({
    selector: 'app-worker-instance-page',
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
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">Workers</h2>
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
                        <p-button icon="pi pi-plus" label="Worker" routerLink="new" outlined class="mx-4" rounded />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="workers"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['name', 'dns', 'internalIp']"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">Nome <p-sortIcon field="name"></p-sortIcon></th>
                        <th>DNS</th>
                        <th>IP interno</th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-worker>
                    <tr>
                        <td>{{ worker.name }}</td>
                        <td>{{ worker.dns }}</td>
                        <td>{{ worker.internalIp }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', worker.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    (click)="confirmDelete(worker)"
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
                            <td colspan="5" class="text-center p-4">Nenhum worker encontrado.</td>
                        </tr>
                    }
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog />
        <p-toast />
    `
})
export class WorkerInstancePage implements OnInit {
    workers: WorkerInstance[] = [];
    @ViewChild('dataTable') dt!: Table;
    loading = true;

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly workerService: WorkerInstanceService
    ) {}

    ngOnInit(): void {
        this.workerService
            .findAll()
            .then((workers) => (this.workers = workers))
            .finally(() => (this.loading = false));
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    confirmDelete(worker: WorkerInstance) {
        this.confirmationService.confirm({
            message: `Deletar ${worker.name}? Os registers deixarão de ter tronco para ele.`,
            header: 'Confirmação',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: { label: 'Deletar', severity: 'danger' },
            rejectButtonProps: { label: 'Fechar', severity: 'secondary', outlined: true },
            accept: () => {
                this.workerService
                    .delete(worker.id)
                    .then(() => {
                        this.workers = this.workers.filter((w) => w.id !== worker.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Worker removido com sucesso',
                            life: 15_000
                        });
                    })
                    .catch((err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Desculpe não foi possível remover o worker',
                            detail: err?.error?.message || 'Tente novamente mais tarde.',
                            life: 15_000
                        });
                    });
            }
        });
    }
}
