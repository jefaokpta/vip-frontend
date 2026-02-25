import { Component, OnInit, ViewChild } from '@angular/core';
import { Card } from 'primeng/card';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Button } from 'primeng/button';
import { Table, TableModule } from 'primeng/table';
import { RouterLink } from '@angular/router';
import { ProgressSpinner } from 'primeng/progressspinner';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { Alias, DialPlan, SrcEnum, Trunk } from '@/pabx/types';
import { NgIf } from '@angular/common';
import { Tooltip } from 'primeng/tooltip';
import { InputText } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialPlanService } from '@/pabx/dialplan/dial-plan.service';
import { dialplanSrcLabel } from '@/pabx/dialplan/utils';
import { TrunkService } from '@/pabx/trunk/trunk.service';
import { AliasService } from '@/pabx/alias/alias.service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-dialplan-page',
    standalone: true,
    imports: [
        Card,
        IconField,
        InputIcon,
        Button,
        TableModule,
        RouterLink,
        ProgressSpinner,
        ConfirmDialog,
        Toast,
        NgIf,
        Tooltip,
        InputText,
        Select,
        FormsModule
    ],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Regras de Discagem
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
                        <p-button icon="pi pi-plus" label="Regra" routerLink="new" outlined class="mx-4" rounded />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="dialplans"
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
                        <th>Origem</th>
                        <th>Destino</th>
                        <th style="width: 10%">Ativo</th>
                        <th style="width: 10%">Prioridade</th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-dialplan>
                    <tr>
                        <td>{{ dialplan.name }}</td>
                        <td>{{ srcLabel(dialplan) }}</td>
                        <td>{{ dstLabel(dialplan) }}</td>
                        <td>
                            @if (dialplan.isActive) {
                                <i class="pi pi-check text-green-500"></i>
                            } @else {
                                <i class="pi pi-times text-red-500"></i>
                            }
                        </td>
                        <td>
                            <p-select
                                [options]="priorityOptions"
                                [(ngModel)]="dialplan.priority"
                                (onChange)="onChangePriority()"
                                optionLabel="label"
                                optionValue="value"
                                size="small"
                            >
                            </p-select>
                        </td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-pencil"
                                    [routerLink]="['edit', dialplan.id]"
                                    outlined
                                    size="small"
                                    pTooltip="Editar"
                                    tooltipPosition="left"
                                />
                                <p-button
                                    icon="pi pi-trash"
                                    severity="danger"
                                    (click)="confirmDelete(dialplan)"
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
                        <td colspan="8" *ngIf="!loading" class="text-center p-4">Nenhuma regra encontrada.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog />
        <p-toast />
    `
})
export class DialplanPage implements OnInit {
    dialplans: DialPlan[] = [];
    @ViewChild('dataTable') dt!: Table;
    loading = true;
    private readonly trunkMap = new Map<string, string>();
    private readonly aliasMap = new Map<string, string>();

    constructor(
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService,
        private readonly dialplanService: DialPlanService,
        private readonly trunkService: TrunkService,
        private readonly aliasService: AliasService
    ) {}

    ngOnInit(): void {
        Promise.all([this.dialplanService.findAll(), this.trunkService.findAll(), this.aliasService.findAll()]).then(
            ([dialplans, trunks, aliases]: [DialPlan[], Trunk[], Alias[]]) => {
                trunks.forEach((trunk) => this.trunkMap.set(String(trunk.id), trunk.name));
                aliases.forEach((alias) => this.aliasMap.set(String(alias.id), alias.name));
                this.dialplans = this.sortDialplansByDstAndPriority(dialplans);
                this.loading = false;
            }
        );
    }

    srcLabel(dialplan: DialPlan): string {
        switch (dialplan.srcEnum) {
            case SrcEnum.ANY:
                return 'TODOS';
            case SrcEnum.PEER: {
                return `${dialplanSrcLabel(dialplan.srcEnum)} -> ${dialplan.srcValue == 'ANY' ? 'TODOS' : dialplan.srcValue}`;
            }
            case SrcEnum.EXPRESSION: {
                return `${dialplanSrcLabel(dialplan.srcEnum)} -> ${dialplan.srcValue}`;
            }
            case SrcEnum.ALIAS: {
                return `${dialplanSrcLabel(dialplan.srcEnum)} -> ${this.findAliasName(dialplan.srcValue!)}`;
            }
            case SrcEnum.TRUNK: {
                return `${dialplanSrcLabel(dialplan.srcEnum)} -> ${dialplan.srcValue == 'ANY' ? 'TODOS' : this.findTrunkName(dialplan.srcValue!)}`;
            }
            default:
                return 'Desconhecido';
        }
    }

    dstLabel(dialplan: DialPlan): string {
        if (dialplan.dst) return dialplan.dst;
        return this.findAliasName(dialplan.dstAlias!.toString());
    }

    private findTrunkName(id: string): string {
        return this.trunkMap.get(id) ?? id;
    }

    private findAliasName(id: string): string {
        return this.aliasMap.get(id) ?? id;
    }

    onFilterGlobal(event: Event) {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    priorityOptions = [
        { value: 0, label: '0' },
        { value: 1, label: '1' },
        { value: 2, label: '2' },
        { value: 3, label: '3' },
        { value: 4, label: '4' }
    ];

    onChangePriority() {
        console.log('reordering');
        this.dialplans = this.sortDialplansByDstAndPriority(this.dialplans);
    }

    private sortDialplansByDstAndPriority(dialplans: DialPlan[]): DialPlan[] {
        return dialplans.sort((a, b) => {
            const dstCompare = (a.dst ?? '').localeCompare(b.dst ?? '');
            if (dstCompare !== 0) return dstCompare;
            return b.priority - a.priority;
        });
    }

    confirmDelete(dialplan: DialPlan) {
        this.confirmationService.confirm({
            message: `Deletar ${dialplan.name}?`,
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
                this.dialplanService
                    .delete(dialplan.id)
                    .then(() => {
                        this.dialplans = this.dialplans.filter((a) => a.id !== dialplan.id);
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Regra removida com sucesso',
                            life: 15_000
                        });
                    })
                    .catch(() => {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Desculpe não foi possível remover a regra',
                            detail: 'Tente novamente mais tarde.',
                            life: 15_000
                        });
                    });
            }
        });
    }
}
