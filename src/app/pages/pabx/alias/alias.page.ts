import {Component, OnInit, ViewChild} from '@angular/core';
import {Table, TableModule} from "primeng/table";
import {ConfirmationService, MessageService} from "primeng/api";
import {Card} from "primeng/card";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {Button} from "primeng/button";
import {AliasService} from "@/pages/pabx/alias/alias.service";
import {RouterLink} from "@angular/router";
import {ProgressSpinner} from "primeng/progressspinner";
import {ConfirmDialog} from "primeng/confirmdialog";
import {Toast} from "primeng/toast";
import {Alias} from "@/pages/pabx/types";
import {NgIf} from "@angular/common";

@Component({
    selector: 'app-alias-page',
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
        NgIf
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">Alias de
                        Discagem</h2>
                    <div class="inline-flex items-center">
                        <p-iconfield>
                            <p-inputicon class="pi pi-search"/>
                            <input
                                pInputText
                                type="text"
                                (input)="onFilterGlobal($event)"
                                placeholder="Pesquisar"
                                [style]="{ borderRadius: '2rem' }"
                                class="w-full"
                            />
                        </p-iconfield>
                        <p-button icon="pi pi-plus" label="Alias" routerLink="new" outlined class="mx-4" rounded/>
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="aliases"
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
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-alias>
                    <tr>
                        <td>{{ alias.name }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', alias.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    (click)="confirmDelete(alias)"
                                    outlined
                                    size="small"
                                    pTooltip="Remover"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <p-progress-spinner *ngIf="loading" [style]="{ width: '2rem', height: '2rem' }"/>
                    <tr>
                        <td colspan="8" *ngIf="!loading" class="text-center p-4">Nenhum alias encontrado.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog/>
        <p-toast/>
    `
})
export class AliasPage implements OnInit {
    aliases: Alias[] = [];
    @ViewChild('dataTable') dt!: Table;
    loading = true;

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly aliasService: AliasService
    ) {
    }

    ngOnInit(): void {
        this.aliasService.findAllAliases().then((aliases) => {
            this.aliases = aliases;
            this.loading = false;
        });
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    confirmDelete(alias: Alias) {
        this.confirmationService.confirm({
            message: `Deseja realmente apagar ${alias.name}?`,
            header: 'Confirmação',
            closable: true,
            closeOnEscape: true,
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: {
                label: 'Apagar',
                severity: 'danger'
            },
            rejectButtonProps: {
                label: 'Fechar',
                severity: 'secondary',
                outlined: true
            },
            accept: () => {
                this.aliasService.deleteAlias(alias.id).then(() => {
                    this.aliases = this.aliases.filter((a) => a.id !== alias.id);
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Alias removido com sucesso',
                        detail: 'O alias foi removido com sucesso',
                        life: 15_000
                    });
                })
                    .catch(() => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Desculpe não foi possível remover o alias',
                            detail: 'Tente novamente mais tarde.',
                            life: 15_000
                        });
                    });
            }
        });
    }

}
