import { Component, Input, OnChanges, ViewChild } from '@angular/core';
import { RippleModule } from 'primeng/ripple';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { ProductService } from '@/services/product.service';
import { IconFieldModule } from 'primeng/iconfield';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { InputIconModule } from 'primeng/inputicon';
import { TooltipModule } from 'primeng/tooltip';
import { TagModule } from 'primeng/tag';
import { Badge } from 'primeng/badge';
import { Rating } from 'primeng/rating';
import { CallAnalyzeStatusEnum, Cdr, User, UserFieldEnum } from '@/types/types';
import { WebphoneService } from '@/webphone/webphone.service';
import { UserService } from '@/services/user.service';
import { RouterLink } from '@angular/router';
import { getTemperatureSeverity, sortCdrByDate } from '@/util/utils';

@Component({
    standalone: true,
    selector: 'app-last-analysis-component',
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        RippleModule,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        FormsModule,
        TooltipModule,
        TagModule,
        Badge,
        Rating,
        RouterLink
    ],
    template: ` <div class="card">
        <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
            <div class="text-surface-900 dark:text-surface-0 text-xl font-semibold mb-4 md:mb-0">Ultimas Análises</div>
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
            </div>
        </div>

        <p-table
            #dataTable
            [value]="cdrs"
            [paginator]="true"
            [rows]="5"
            [globalFilterFields]="['temperature', 'title', 'destination', 'startTime']"
            [tableStyle]="{ 'min-width': '40rem' }"
            stripedRows
            rowHover
        >
            <ng-template pTemplate="header">
                <tr>
                    <th pSortableColumn="startTime" style="width: 20%">
                        Data/Hora
                        <p-sortIcon field="startTime"></p-sortIcon>
                    </th>
                    <th>Telefone</th>
                    <th style="width: 20%">Título</th>
                    <th pSortableColumn="temperature" style="width: 20%">
                        Temperatura
                        <p-sortIcon field="temperature"></p-sortIcon>
                    </th>
                    <th pSortableColumn="engagement" style="width: 20%">
                        Engajamento
                        <p-sortIcon field="engagement"></p-sortIcon>
                    </th>
                    <th style="width: 10%">Detalhes</th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-cdr>
                <tr>
                    <td>{{ cdr.startTime | date: 'dd/MM/yyyy HH:mm:ss' }}</td>
                    <td>
                        <div class="flex items-center gap-1">
                            <i *ngIf="cdr.userfield === UserFieldEnum.UPLOAD" class="pi pi-upload text-blue-500" title="Upload"></i>
                            <i
                                *ngIf="cdr.userfield === UserFieldEnum.OUTBOUND"
                                class="pi pi-arrow-up"
                                [ngClass]="{ 'text-green-500': cdr.disposition == 'ANSWERED', 'text-red-500': cdr.disposition != 'ANSWERED' }"
                                title="Saída"
                            ></i>
                            <i
                                *ngIf="cdr.userfield === UserFieldEnum.INBOUND"
                                class="pi pi-arrow-down"
                                [ngClass]="{ 'text-green-500': cdr.disposition == 'ANSWERED', 'text-red-500': cdr.disposition != 'ANSWERED' }"
                                title="Entrada"
                            ></i>
                            <p-button
                                *ngIf="cdr.userfield !== UserFieldEnum.UPLOAD"
                                icon="pi pi-phone"
                                [label]="cdr.userfield === UserFieldEnum.INBOUND ? cdr.src : cdr.destination"
                                (click)="dial(cdr.userfield === UserFieldEnum.INBOUND ? cdr.src : cdr.destination)"
                                [link]="true"
                                iconPos="right"
                                [disabled]="user.isExpired"
                            />
                        </div>
                    </td>
                    <td>
                        <ng-container *ngIf="cdr.userfield === UserFieldEnum.INBOUND && cdr.billableSeconds === 0; else normalTitle">
                            <p-badge value="Não atendida" severity="danger" />
                        </ng-container>
                        <ng-template #normalTitle>
                            {{ cdr.title }}
                        </ng-template>
                    </td>
                    <td>
                        <p-tag [value]="cdr.temperature" [severity]="getTemperatureSeverity(cdr.temperature)" />
                    </td>
                    <td>
                        <p-rating [(ngModel)]="cdr.engagement" readonly />
                    </td>
                    <td>
                        <p-button
                            *ngIf="cdr.callRecord && cdr.status === CallAnalyzeStatusEnum.FINISHED"
                            [routerLink]="['pages/analysis/details', cdr.id]"
                            icon="pi pi-search"
                            outlined
                        >
                        </p-button>
                    </td>
                </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="6" class="text-center p-4">Nenhum registro encontrado.</td>
                </tr>
            </ng-template>
        </p-table>
    </div>`,
    providers: [ProductService]
})
export class LastAnalysisComponent implements OnChanges {
    @ViewChild('dataTable') dt!: Table;
    @Input() cdrsInput!: Cdr[];
    cdrs: Cdr[] = [];
    user: User;

    constructor(
        private readonly webphoneService: WebphoneService,
        private readonly userService: UserService
    ) {
        this.user = this.userService.getUser();
    }

    ngOnChanges(): void {
        this.cdrs = sortCdrByDate(this.cdrsInput).filter((cdr) => cdr.status === CallAnalyzeStatusEnum.FINISHED);
    }

    dial(number: string) {
        this.webphoneService.makeCall(number);
    }

    onFilterGlobal(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    protected readonly getTemperatureSeverity = getTemperatureSeverity;
    protected readonly UserFieldEnum = UserFieldEnum;
    protected readonly CallAnalyzeStatusEnum = CallAnalyzeStatusEnum;
}
