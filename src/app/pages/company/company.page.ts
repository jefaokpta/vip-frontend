import {Component, OnInit, ViewChild} from '@angular/core';
import {Button} from 'primeng/button';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {MessageService, PrimeTemplate} from 'primeng/api';
import {Router, RouterLink} from '@angular/router';
import {Table, TableModule} from 'primeng/table';
import {Tooltip} from 'primeng/tooltip';
import {Company, User} from '@/types/types';
import {HttpClientService} from '@/services/http-client.service';
import {Card} from 'primeng/card';
import {UserService} from '@/services/user.service';
import {NgClass, NgIf} from '@angular/common';
import {Toast} from 'primeng/toast';
import {ProgressSpinner} from 'primeng/progressspinner';
import {FormsModule} from '@angular/forms';
import {telephoneFormat} from '@/util/utils';

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
        Toast,
        ProgressSpinner,
        FormsModule,
        NgClass
    ],
    providers: [MessageService],
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
                [globalFilterFields]="['name', 'controlNumber']"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">
                            Nome
                            <p-sortIcon field="name"></p-sortIcon>
                        </th>
                        <th>DDR</th>
                        <th pSortableColumn="controlNumber">
                            Cod. Controle
                            <p-sortIcon field="controlNumber"></p-sortIcon>
                        </th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-company>
                    <tr>
                        <td>{{ company.name }}</td>
                        <td>
                            <p-virtualscroller
                                [items]="company.phones"
                                scrollHeight="50px"
                                styleClass="border border-surface"
                                [style]="{ width: '130px', height: '100px' }"
                            >
                                <ng-template #item let-item let-options="options">
                                    <div
                                        class="flex items-center p-2"
                                        [ngClass]="{ 'bg-surface-100 dark:bg-surface-700': options.odd }"
                                        style="height: 50px;"
                                    >
                                        {{ telephoneFormat(item.phone) }}
                                    </div>
                                </ng-template>
                            </p-virtualscroller>
                        </td>
                        <td>{{ company.controlNumber }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', company.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    *ngIf="user.controlNumber !== company.controlNumber"
                                    (click)="manageCompany(company.controlNumber)"
                                    icon="pi pi-sign-in"
                                    outlined
                                    size="small"
                                    pTooltip="Gerenciar"
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

        <p-toast />
    `
})
export class CompanyPage implements OnInit {
    companies: Company[] = [];
    @ViewChild('dataTable') dt!: Table;
    readonly user: User;
    loading = true;

    constructor(
        private readonly httpClientService: HttpClientService,
        private readonly userService: UserService,
        private readonly router: Router,
        private readonly messageService: MessageService
    ) {
        this.user = this.userService.getUser();
    }

    ngOnInit(): void {
        this.httpClientService.findAllCompanies().then((companies) => {
            this.companies = companies;
            this.loading = false;
        });
    }

    manageCompany(controlNumber: number) {
        this.userService
            .manageCompany(controlNumber)
            .then(() => this.router.navigate(['/']))
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Desculpe não foi possível gerenciar a empresa',
                    detail: 'Tente novamente mais tarde.',
                    life: 15_000
                });
            });
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    protected readonly telephoneFormat = telephoneFormat;
}
