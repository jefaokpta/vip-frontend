import {Component, OnInit, ViewChild} from '@angular/core';
import {Table, TableModule} from 'primeng/table';
import {ConfirmationService, MessageService} from 'primeng/api';
import {Card} from 'primeng/card';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';
import {RouterLink} from '@angular/router';
import {ProgressSpinner} from 'primeng/progressspinner';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {Toast} from 'primeng/toast';
import {Moh} from '@/pabx/types/moh';
import {Tooltip} from 'primeng/tooltip';
import {MohService} from '@/pabx/moh/moh.service';
import {Tag} from 'primeng/tag';

@Component({
    selector: 'app-mohs-page',
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
        Tooltip,
        Tag
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Audios do Sistema
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
                        <p-button icon="pi pi-plus" label="Audio" routerLink="new" outlined class="mx-4" rounded />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="mohs"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['name']"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">
                            Nome
                            <p-sortIcon field="name"></p-sortIcon>
                        </th>
                        <th>Audio</th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-moh>
                    <tr>
                        <td>
                            {{ moh.name }}
                            @if (moh.isDefault) {
                                <p-tag value="Padrão" severity="info" class="ml-2" />
                            }
                        </td>
                        <td>
                            @if (moh.audioUrl) {
                                <audio controls [src]="moh.audioUrl" style="height: 2rem"></audio>
                            }
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    [icon]="moh.isDefault ? 'pi pi-star-fill' : 'pi pi-star'"
                                    (click)="toggleDefault(moh)"
                                    outlined
                                    size="small"
                                    [pTooltip]="moh.isDefault ? 'Remover audio de espera padrão' : 'Definir audio de espera padrão'"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', moh.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    (click)="confirmDelete(moh)"
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
                            <td colspan="3" class="text-center p-4">Nenhum Audio encontrado.</td>
                        </tr>
                    }
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog />
        <p-toast />
    `
})
export class MohsPage implements OnInit {
    mohs: Moh[] = [];
    @ViewChild('dataTable') dt!: Table;
    loading = true;

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly mohService: MohService
    ) {}

    ngOnInit(): void {
        this.mohService.findAll().then((mohs) => {
            this.mohs = mohs;
            this.loading = false;
        });
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    toggleDefault(moh: Moh) {
        const request = moh.isDefault ? this.mohService.unsetDefault(moh.id) : this.mohService.setDefault(moh.id);
        request
            .then((updated) => {
                this.mohs = this.mohs.map((m) => ({
                    ...m,
                    isDefault: m.id === updated.id ? updated.isDefault : updated.isDefault ? false : m.isDefault
                }));
                this.messageService.add({
                    severity: 'success',
                    summary: updated.isDefault ? `${moh.name} definido como audio de espera padrão` : 'Audio de espera padrão removido',
                    life: 15_000
                });
            })
            .catch((err) => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Desculpe não foi possível alterar o audio de espera padrão',
                    detail: err?.error?.message || 'Tente novamente mais tarde.',
                    life: 15_000
                });
            });
    }

    confirmDelete(moh: Moh) {
        this.confirmationService.confirm({
            message: `Deletar ${moh.name}?`,
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
                this.mohService
                    .delete(moh.id)
                    .then(() => {
                        this.mohs = this.mohs.filter((m) => m.id !== moh.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Audio removido com sucesso',
                            life: 30_000
                        });
                    })
                    .catch((err) => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Desculpe não foi possível remover o Audio',
                            detail: err?.error?.message || 'Tente novamente mais tarde.',
                            life: 30_000
                        });
                    });
            }
        });
    }
}
