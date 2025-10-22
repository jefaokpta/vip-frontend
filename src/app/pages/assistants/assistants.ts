/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/28/25
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { RatingModule } from 'primeng/rating';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { HttpClientService } from '@/services/http-client.service';
import { Assistant, RoleEnum, User } from '@/types/types';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { Card } from 'primeng/card';
import { UserService } from '@/services/user.service';
import { NgIf } from '@angular/common';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
    selector: 'app-assistants',
    standalone: true,
    imports: [
        TableModule,
        InputTextModule,
        ButtonModule,
        TagModule,
        RatingModule,
        FormsModule,
        RouterLink,
        IconFieldModule,
        InputIconModule,
        TooltipModule,
        ConfirmDialogModule,
        Card,
        NgIf,
        ProgressSpinner
    ],
    providers: [ConfirmationService],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Assistentes de IA
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
                        <p-button
                            icon="pi pi-plus"
                            label="Assistente"
                            routerLink="new"
                            [disabled]="user.isExpired"
                            outlined
                            class="mx-4"
                            rounded
                        />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="assistants"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['name']"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="name">Nome<p-sortIcon field="name"></p-sortIcon></th>
                        <th *ngIf="isAdmin">Responsável</th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-assistant>
                    <tr>
                        <td>{{ assistant.name }}</td>
                        <td *ngIf="isAdmin">{{ getUserName(assistant.userId) }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', assistant.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                    [disabled]="user.isExpired"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    outlined
                                    size="small"
                                    pTooltip="Remover"
                                    (onClick)="confirmDelete(assistant.id)"
                                />
                            </div>
                        </td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <p-progress-spinner *ngIf="loading" [style]="{ width: '2rem', height: '2rem' }" />
                    <tr>
                        <td *ngIf="!loading" colspan="8" class="text-center p-4">Nenhum assistente encontrado.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog />
    `
})
export class Assistants implements OnInit {
    @ViewChild('dataTable') dt!: Table;
    user: User;
    isAdmin = false;
    users: User[] = [];
    assistants: Assistant[] = [];
    loading = true;

    constructor(
        private readonly httpClientService: HttpClientService,
        private readonly confirmService: ConfirmationService,
        private readonly userService: UserService
    ) {
        this.user = this.userService.getUser();
        this.isAdmin = this.user.roles.includes(RoleEnum.ADMIN);
    }

    ngOnInit(): void {
        this.httpClientService.listAssistants(this.user.controlNumber, this.user.id).then((assistants) => {
            this.assistants = assistants;
            this.loading = false;
        });
        if (this.isAdmin) this.httpClientService.findAllUsers().then((users) => (this.users = users));
    }

    onFilterGlobal(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    confirmDelete(id: string) {
        this.confirmService.confirm({
            message: 'Deseja realmente apagar?',
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
                this.httpClientService.deleteAssistant(+id);
                this.assistants = this.assistants.filter((assistant) => assistant.id !== +id);
            }
        });
    }

    getUserName(userId: number) {
        const user = this.users.find((user) => user.id === userId);
        return user?.name
    }

    protected readonly RoleEnum = RoleEnum;
}
