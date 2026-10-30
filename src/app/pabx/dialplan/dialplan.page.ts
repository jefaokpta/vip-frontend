import {Component, OnInit, ViewChild} from '@angular/core';
import {Card} from 'primeng/card';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {Button} from 'primeng/button';
import {Table, TableModule} from 'primeng/table';
import {RouterLink} from '@angular/router';
import {ProgressSpinner} from 'primeng/progressspinner';
import {ConfirmDialog} from 'primeng/confirmdialog';
import {Toast} from 'primeng/toast';
import {Alias} from '@/pabx/types/alias';
import {DialPlan} from '@/pabx/types/dial-plan';
import {SrcEnum} from '@/pabx/types/src-enum';
import {TrunkOption} from '@/pabx/types/trunk';
import {NgIf} from '@angular/common';
import {Tooltip} from 'primeng/tooltip';
import {InputText} from 'primeng/inputtext';
import {ConfirmationService, MessageService} from 'primeng/api';
import {DialPlanService} from '@/pabx/dialplan/dial-plan.service';
import {dialplanDstLabel, dialplanSrcLabel, sortDialplansByDstAndPriority} from '@/pabx/dialplan/utils';
import {TrunkService} from '@/pabx/trunk/trunk.service';
import {AliasService} from '@/pabx/alias/alias.service';
import {FormsModule} from '@angular/forms';
import {Select} from 'primeng/select';

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
        FormsModule,
        Select
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
                        @if (selectionMode) {
                            <p-button
                                icon="pi pi-check"
                                label="Ativar"
                                severity="success"
                                outlined
                                rounded
                                class="ml-4"
                                [disabled]="!selectedDialplans.length || updatingActive"
                                (click)="updateSelectedActive(true)"
                            />
                            <p-button
                                icon="pi pi-times"
                                label="Desativar"
                                severity="danger"
                                outlined
                                rounded
                                class="ml-2"
                                [disabled]="!selectedDialplans.length || updatingActive"
                                (click)="updateSelectedActive(false)"
                            />
                            <p-button
                                icon="pi pi-ban"
                                severity="secondary"
                                outlined
                                rounded
                                class="ml-2"
                                pTooltip="Cancelar seleção"
                                tooltipPosition="left"
                                (click)="toggleSelectionMode()"
                            />
                        } @else {
                            <p-button
                                icon="pi pi-list-check"
                                label="Selecionar"
                                outlined
                                rounded
                                class="ml-4"
                                pTooltip="Ativar/desativar várias regras"
                                tooltipPosition="left"
                                (click)="toggleSelectionMode()"
                            />
                        }
                        <p-button icon="pi pi-plus" label="Regra" routerLink="new" outlined class="mx-4" rounded />
                    </div>
                </div>
            </ng-template>

            <p-table
                #dataTable
                [value]="dialplans"
                [(selection)]="selectedDialplans"
                dataKey="id"
                [paginator]="true"
                [rows]="15"
                [globalFilterFields]="['name']"
                [tableStyle]="{ 'min-width': '40rem' }"
                stripedRows
            >
                <ng-template pTemplate="header">
                    <tr>
                        @if (selectionMode) {
                            <th style="width: 3rem"><p-tableHeaderCheckbox /></th>
                        }
                        <th>Nome</th>
                        <th>Origem</th>
                        <th>Destino</th>
                        <th style="width: 10%" pSortableColumn="isActive">Ativo <p-sortIcon field="isActive" /></th>
                        <th style="width: 10%">Prioridade</th>
                        <th style="width: 10%">Ações</th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-dialplan>
                    <tr>
                        @if (selectionMode) {
                            <td><p-tableCheckbox [value]="dialplan" /></td>
                        }
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
                                (onChange)="onChangePriority(dialplan)"
                                optionLabel="label"
                                optionValue="value"
                                size="small"
                                appendTo="body"
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
    selectionMode = false;
    selectedDialplans: DialPlan[] = [];
    updatingActive = false;
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
        Promise.all([this.dialplanService.findAll(), this.trunkService.findOptions(), this.aliasService.findAll()])
            .then(([dialplans, trunks, aliases]: [DialPlan[], TrunkOption[], Alias[]]) => {
                trunks.forEach((trunk) => this.trunkMap.set(String(trunk.id), trunk.name));
                aliases.forEach((alias) => this.aliasMap.set(String(alias.id), alias.name));
                this.dialplans = sortDialplansByDstAndPriority(dialplans, this.aliasMap);
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Desculpe não foi possível carregar as regras',
                    detail: 'Tente novamente mais tarde.',
                    life: 15_000
                });
            })
            .finally(() => (this.loading = false));
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
        return dialplanDstLabel(dialplan, this.aliasMap);
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

    onChangePriority(dialplan: DialPlan) {
        this.dialplans = sortDialplansByDstAndPriority(this.dialplans, this.aliasMap);
        this.dialplanService
            .updatePriority(dialplan)
            .then(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Prioridade atualizada com sucesso',
                    life: 15_000
                });
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Desculpe não foi possível atualizar a prioridade',
                    detail: 'Tente novamente mais tarde.',
                    life: 15_000
                });
            });
    }

    toggleSelectionMode() {
        this.selectionMode = !this.selectionMode;
        this.selectedDialplans = [];
    }

    updateSelectedActive(isActive: boolean) {
        const ids = this.selectedDialplans.map((dialplan) => dialplan.id);
        this.updatingActive = true;
        this.dialplanService
            .updateActive(ids, isActive)
            .then(() => {
                this.dialplans = this.dialplans.map((dialplan) =>
                    ids.includes(dialplan.id) ? { ...dialplan, isActive } : dialplan
                );
                this.messageService.add({
                    severity: 'success',
                    summary: `${ids.length} regra(s) ${isActive ? 'ativada(s)' : 'desativada(s)'} com sucesso`,
                    life: 15_000
                });
                this.toggleSelectionMode();
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Desculpe não foi possível atualizar as regras',
                    detail: 'Tente novamente mais tarde.',
                    life: 15_000
                });
            })
            .finally(() => (this.updatingActive = false));
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
