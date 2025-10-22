/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 04/07/2025
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { NgIf } from '@angular/common';
import { ConfirmationService, PrimeTemplate } from 'primeng/api';
import { ProgressSpinner } from 'primeng/progressspinner';
import { RouterLink } from '@angular/router';
import { Table, TableModule } from 'primeng/table';
import { Tooltip } from 'primeng/tooltip';
import { User, VoiceAssistant } from '@/types/types';
import { HttpClientService } from '@/services/http-client.service';
import { UserService } from '@/services/user.service';
import { WebphoneService } from '@/webphone/webphone.service';

@Component({
    selector: 'app-voice-assistants-page',
    standalone: true,
    imports: [Button, Card, ConfirmDialog, IconField, InputIcon, InputText, NgIf, PrimeTemplate, ProgressSpinner, RouterLink, TableModule, Tooltip],
    providers: [ConfirmationService],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">Assistentes de Voz</h2>
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
                        <p-button icon="pi pi-plus" label="Assistente" routerLink="new" [disabled]="user.isExpired" outlined class="mx-4" rounded />
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
                        <th pSortableColumn="name">
                            Nome
                            <p-sortIcon field="name"></p-sortIcon>
                        </th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-assistant>
                    <tr>
                        <td>{{ assistant.name }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-microphone"
                                    (onClick)="testAssistant(assistant)"
                                    outlined
                                    size="small"
                                    pTooltip="Testar"
                                    tooltipPosition="left"
                                    [disabled]="user.isExpired"
                                />
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
export class VoiceAssistantsPage implements OnInit {
    @ViewChild('dataTable') dt!: Table;
    user: User;
    assistants: VoiceAssistant[] = [];
    loading = true;

    constructor(
        private readonly httpClientService: HttpClientService,
        private readonly confirmService: ConfirmationService,
        private readonly userService: UserService,
        private readonly webphoneService: WebphoneService
    ) {
        this.user = this.userService.getUser();
    }

    ngOnInit(): void {
        this.httpClientService.findAllVoiceAssistants().then((assistants) => {
            this.assistants = assistants;
            this.loading = false;
        });
    }

    onFilterGlobal(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    testAssistant(voiceAssistant: VoiceAssistant) {
        this.httpClientService.updateTestAssistantPhoneNumber(voiceAssistant.vapiAssistantId).then(() => this.webphoneService.makeCall('*12345'));
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
                this.httpClientService.deleteVoiceAssistant(+id);
                this.assistants = this.assistants.filter((assistant) => assistant.id !== +id);
            }
        });
    }
}
