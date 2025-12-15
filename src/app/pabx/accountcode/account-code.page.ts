import {Component, OnInit, ViewChild} from "@angular/core";
import {Button} from "primeng/button";
import {Card} from "primeng/card";
import {ConfirmDialog} from "primeng/confirmdialog";
import {IconField} from "primeng/iconfield";
import {InputIcon} from "primeng/inputicon";
import {InputText} from "primeng/inputtext";
import {NgIf} from "@angular/common";
import {ConfirmationService, MessageService, PrimeTemplate} from "primeng/api";
import {ProgressSpinner} from "primeng/progressspinner";
import {RouterLink} from "@angular/router";
import {Table, TableModule} from "primeng/table";
import {Toast} from "primeng/toast";
import {Tooltip} from "primeng/tooltip";
import {AccountCode} from "@/pabx/types";
import {AccountCodeService} from "@/pabx/accountcode/account-code.service";
import {Tag} from "primeng/tag";

@Component({
    selector: 'app-account-code-page',
    standalone: true,
    imports: [
        Button,
        Card,
        ConfirmDialog,
        IconField,
        InputIcon,
        InputText,
        NgIf,
        PrimeTemplate,
        ProgressSpinner,
        RouterLink,
        TableModule,
        Toast,
        Tooltip,
        Tag
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Centro de Custos
                    </h2>
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
                        <p-button icon="pi pi-plus" label="Centro de Custo" routerLink="new" outlined class="mx-4"
                                  rounded/>
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="accountCodes"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['title', 'code']"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th style="width: 10%">Código</th>
                        <th>Título</th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-accountCode>
                    <tr>
                        <td>
                            <p-tag [value]="accountCode.code" severity="danger"></p-tag>
                        </td>
                        <td>{{ accountCode.title }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', accountCode.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    (click)="confirmDelete(accountCode)"
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
                        <td colspan="8" *ngIf="!loading" class="text-center p-4">Nenhum centro de custo encontrado.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog/>
        <p-toast/>
    `
})
export class AccountCodePage implements OnInit {
    accountCodes: AccountCode[] = [];
    @ViewChild('dataTable') dt!: Table;
    loading = true;

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly accountCodeService: AccountCodeService
    ) {
    }

    ngOnInit(): void {
        this.accountCodeService.findAll().then((accountCodes) => {
            this.accountCodes = accountCodes.sort((a, b) => a.code.localeCompare(b.code))
            this.loading = false;
        });
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    confirmDelete(accountCode: AccountCode) {
        this.confirmationService.confirm({
            message: `Deletar ${accountCode.title}?`,
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
                this.accountCodeService.delete(accountCode.id)
                    .then(() => {
                        this.accountCodes = this.accountCodes.filter((a) => a.id !== accountCode.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Centro de custo removido com sucesso',
                            detail: 'O centro de custo foi removido com sucesso',
                            life: 15_000
                        });
                    }).catch(() => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Desculpe não foi possível remover o centro de custo',
                        detail: 'Tente novamente mais tarde.',
                        life: 15_000
                    });
                });
            }
        });
    }
}
