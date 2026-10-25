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
import { NgIf } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { Ddr } from '@/pabx/types/ddr';
import { DdrService } from '@/pabx/ddr/ddr.service';
import { Tag } from 'primeng/tag';
import { formatDdr } from '@/pabx/ddr/ddr-format';

@Component({
    selector: 'app-ddr-page',
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
        NgIf,
        Tooltip,
        Tag
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">DDRs</h2>
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
                        <p-button icon="pi pi-plus" label="DDR" routerLink="new" outlined class="mx-4" rounded />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="ddrs"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['ddr']"
                [tableStyle]="{ 'min-width': '30rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="ddr">
                            Telefone
                            <p-sortIcon field="ddr"></p-sortIcon>
                        </th>
                        <th style="width: 15%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-ddr>
                    <tr>
                        <td>
                            {{ formatDdr(ddr.ddr) }}
                            @if (ddr.isDefault) {
                                <p-tag value="Padrão" severity="info" class="ml-2" />
                            }
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    [icon]="ddr.isDefault ? 'pi pi-star-fill' : 'pi pi-star'"
                                    (click)="setDefault(ddr)"
                                    [disabled]="ddr.isDefault"
                                    outlined
                                    size="small"
                                    [pTooltip]="ddr.isDefault ? 'DDR padrão' : 'Definir como DDR padrão'"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', ddr.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    (click)="confirmDelete(ddr)"
                                    outlined
                                    size="small"
                                    pTooltip="Remover"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <p-progress-spinner *ngIf="loading" [style]="{ width: '2rem', height: '2rem' }" />
                    <tr>
                        <td colspan="2" *ngIf="!loading" class="text-center p-4">Nenhum DDR encontrado.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog />
        <p-toast />
    `
})
export class DdrPage implements OnInit {
    ddrs: Ddr[] = [];
    @ViewChild('dataTable') dt!: Table;
    loading = true;
    protected readonly formatDdr = formatDdr;

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly ddrService: DdrService
    ) {}

    ngOnInit(): void {
        this.ddrService.findAll().then((ddrs) => {
            this.ddrs = ddrs;
            this.loading = false;
        });
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    setDefault(ddr: Ddr) {
        this.ddrService
            .setDefault(ddr.id)
            .then((updated) => {
                this.ddrs = this.ddrs.map((d) => ({ ...d, isDefault: d.id === updated.id }));
                this.messageService.add({
                    severity: 'success',
                    summary: `${formatDdr(ddr.ddr)} definido como DDR padrão`,
                    life: 15_000
                });
            })
            .catch((err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Desculpe não foi possível alterar o DDR padrão',
                    detail: err?.error?.message || 'Tente novamente mais tarde.',
                    life: 15_000
                });
            });
    }

    confirmDelete(ddr: Ddr) {
        this.confirmationService.confirm({
            message: `Deletar DDR ${formatDdr(ddr.ddr)}?`,
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
                this.ddrService
                    .delete(ddr.id)
                    .then(() => {
                        this.ddrs = this.ddrs.filter((d) => d.id !== ddr.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'DDR removido com sucesso',
                            life: 15_000
                        });
                    })
                    .catch((err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Não foi possível remover o DDR',
                            detail: err?.error?.message || 'Tente novamente mais tarde.',
                            life: 15_000
                        });
                    });
            }
        });
    }
}
