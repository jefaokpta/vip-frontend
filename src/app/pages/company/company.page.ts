import { Component, OnInit, ViewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Router, RouterLink } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { Company } from '@/types/company';
import { User } from '@/types/user';
import { Card } from 'primeng/card';
import { NgIf } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '@/pages/company/company.service';
import { UserService } from '@/pages/users/user.service';
import { ReportStateService } from '@/pabx/report/report-state.service';
import { DacReportStateService } from '@/pabx/dac-report/dac-report-state.service';
import { MyCallsStateService } from '@/pages/dashboard/my-calls-state.service';
import { RoleEnum } from '@/types/role-enum';
import { Dialog } from 'primeng/dialog';

@Component({
    selector: 'app-company-page',
    standalone: true,
    imports: [
        Button,
        IconField,
        InputIcon,
        InputText,
        PrimeTemplate,
        RouterLink,
        TableModule,
        Tooltip,
        Card,
        NgIf,
        ProgressSpinner,
        FormsModule,
        Dialog
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">Empresas</h2>
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
                        <p-button icon="pi pi-plus" label="Empresa" routerLink="new" outlined class="mx-4" rounded />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="companies"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['name', 'companyId', 'tenantName']"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">
                            Nome
                            <p-sortIcon field="name"></p-sortIcon>
                        </th>
                        <th pSortableColumn="companyId">
                            Cod. Controle
                            <p-sortIcon field="companyId"></p-sortIcon>
                        </th>
                        <th pSortableColumn="tenantName">
                            Tenant
                            <p-sortIcon field="tenantName"></p-sortIcon>
                        </th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-company>
                    <tr>
                        <td>{{ company.name }}</td>
                        <td>{{ company.companyId }}</td>
                        <td>{{ company.tenantName ?? '-' }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', company.companyId]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    *ngIf="user.companyId !== company.companyId"
                                    (click)="manageCompany(company.companyId)"
                                    icon="pi pi-sign-in"
                                    outlined
                                    size="small"
                                    pTooltip="Gerenciar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    *ngIf="canDelete"
                                    (click)="openDelete(company)"
                                    class="btn-excluir-empresa"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    outlined
                                    size="small"
                                    pTooltip="Excluir"
                                    tooltipPosition="left"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <p-progress-spinner *ngIf="loading" [style]="{ width: '2rem', height: '2rem' }" />
                    <tr>
                        <td colspan="8" *ngIf="!loading" class="text-center p-4">Nenhuma empresa encontrada.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>

        <p-dialog
            header="Excluir empresa"
            [(visible)]="deleteDialogVisible"
            [modal]="true"
            [style]="{ width: '34rem' }"
            [closable]="!deleting"
        >
            <p class="mb-4">
                Esta ação é irreversível. Todas as configurações da empresa serão apagadas (ramais, áudios, filas,
                grupos de chamada e captura, pausas, pesquisas, calendários, regras, alias, centros de custo, DDRs,
                rotas e usuários). CDRs, relatórios e gravações são preservados.
            </p>
            <label for="confirmCompanyName" class="block mb-2">Digite o nome da empresa para confirmar</label>
            <input
                id="confirmCompanyName"
                pInputText
                type="text"
                class="w-full"
                [placeholder]="companyToDelete?.name ?? ''"
                [(ngModel)]="confirmName"
            />
            <small *ngIf="deleteError" class="p-error block mt-2">{{ deleteError }}</small>
            <ng-template #footer>
                <p-button
                    label="Cancelar"
                    severity="secondary"
                    outlined
                    [disabled]="deleting"
                    (click)="closeDelete()"
                />
                <p-button
                    label="Excluir"
                    severity="danger"
                    [disabled]="!canConfirmDelete() || deleting"
                    [loading]="deleting"
                    (click)="confirmDelete()"
                />
            </ng-template>
        </p-dialog>
    `
})
export class CompanyPage implements OnInit {
    companies: Company[] = [];
    @ViewChild('dataTable') dt!: Table;
    readonly user: User;
    loading = true;
    readonly canDelete: boolean;
    deleteDialogVisible = false;
    companyToDelete: Company | null = null;
    confirmName = '';
    deleting = false;
    deleteError = '';

    constructor(
        private readonly companyService: CompanyService,
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly messageService: MessageService,
        private readonly reportState: ReportStateService,
        private readonly dacReportState: DacReportStateService,
        private readonly myCallsState: MyCallsStateService
    ) {
        this.user = this.userService.getUser();
        this.canDelete = this.user.roles.includes(RoleEnum.ROLE_SAAS_SUPPORT);
    }

    ngOnInit(): void {
        this.companyService.findAll().then((companies) => {
            this.companies = companies;
            this.loading = false;
        });
    }

    manageCompany(companyId: string) {
        this.userService
            .manageOtherCompany(companyId)
            .then(() => {
                this.reportState.reset();
                this.dacReportState.reset();
                this.myCallsState.reset();
                this.router.navigate(['/']);
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Desculpe não foi possível gerenciar a empresa',
                    detail: 'Tente novamente mais tarde.',
                    life: 15_000
                });
            });
    }

    openDelete(company: Company) {
        this.companyToDelete = company;
        this.confirmName = '';
        this.deleteError = '';
        this.deleteDialogVisible = true;
    }

    closeDelete() {
        this.deleteDialogVisible = false;
        this.companyToDelete = null;
    }

    canConfirmDelete(): boolean {
        return !!this.companyToDelete && this.confirmName === this.companyToDelete.name;
    }

    async confirmDelete() {
        const company = this.companyToDelete;
        if (!company || !this.canConfirmDelete()) return;
        this.deleting = true;
        this.deleteError = '';
        try {
            await this.companyService.delete(company.companyId);
            this.companies = this.companies.filter((c) => c.companyId !== company.companyId);
            this.closeDelete();
            this.messageService.add({
                severity: 'success',
                summary: 'Empresa excluída',
                detail: `${company.name} foi excluída com sucesso.`,
                life: 5_000
            });
        } catch (error: any) {
            this.deleteError =
                error?.error?.message ?? 'Não foi possível excluir a empresa. Tente novamente mais tarde.';
        } finally {
            this.deleting = false;
        }
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }
}
