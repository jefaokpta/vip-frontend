import { Component, OnInit, ViewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { ConfirmDialog, ConfirmDialogModule } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { RouterLink } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { RoleEnum, User } from '@/types/types';
import { Card } from 'primeng/card';
import { Toast } from 'primeng/toast';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProgressSpinner } from 'primeng/progressspinner';
import { UserService } from './user.service';

@Component({
    selector: 'app-users',
    standalone: true,
    imports: [
        Button,
        ConfirmDialog,
        IconField,
        InputIcon,
        InputText,
        PrimeTemplate,
        RouterLink,
        TableModule,
        Tooltip,
        ConfirmDialogModule,
        Card,
        Toast,
        NgIf,
        FormsModule,
        ProgressSpinner
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">Usuários</h2>
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
                        <p-button icon="pi pi-plus" label="Usuário" routerLink="new" outlined class="mx-4" rounded />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="users"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['name', 'email']"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">
                            Nome
                            <p-sortIcon field="name"></p-sortIcon>
                        </th>
                        <th>Email</th>
                        <th pSortableColumn="isVerified">
                            Verificado
                            <p-sortIcon field="isVerified"></p-sortIcon>
                        </th>
                        <th pSortableColumn="roles">
                            Nível de Acesso
                            <p-sortIcon field="roles"></p-sortIcon>
                        </th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-user>
                    <tr>
                        <td>{{ user.name }}</td>
                        <td>{{ user.email }}</td>
                        <td>
                            <i
                                [class]="user.isConfirmed ? 'pi pi-check text-green-500' : 'pi pi-clock text-gray-500'"
                            ></i>
                        </td>
                        <td>{{ translateRole(user) }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', user.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    (click)="confirmDelete(user)"
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
                        <td colspan="8" *ngIf="!loading" class="text-center p-4">Nenhum usuário encontrado.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog />
        <p-toast />
    `
})
export class UsersPage implements OnInit {
    users: User[] = [];
    userLogged: User;
    @ViewChild('dataTable') dt!: Table;
    protected readonly RoleEnum = RoleEnum;
    loading = true;

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly userService: UserService
    ) {
        this.userLogged = userService.getUser();
    }

    ngOnInit(): void {
        this.userService.findAll().then((users) => (this.users = users));
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    confirmDelete(user: User) {
        this.confirmationService.confirm({
            message: `Deseja realmente apagar ${user.name}?`,
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
                this.userService
                    .deleteUser(user.id)
                    .then(() => {
                        this.users = this.users.filter((u) => u.id !== user.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Usuário removido com sucesso',
                            detail: 'O usuário foi removido com sucesso',
                            life: 15_000
                        });
                    })
                    .catch(() => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Desculpe não foi possível remover o usuário',
                            detail: 'Tente novamente mais tarde.',
                            life: 15_000
                        });
                    });
            }
        });
    }

    translateRole(user: User): string {
        const lastRole = user.roles.at(-1);
        switch (lastRole) {
            case 'ROLE_ADMIN':
                return 'Administrador';
            case 'ROLE_USER':
                return 'Usuário';
            case 'ROLE_SUPER':
                return 'Super Usuário';
            case 'ROLE_FREE':
                return this.userService.isUserExpired(user) ? 'Expirado' : 'Avaliação';
            default:
                return 'Desconhecido';
        }
    }
}
