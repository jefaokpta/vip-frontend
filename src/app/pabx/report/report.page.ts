/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */

import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatePicker } from 'primeng/datepicker';
import { Tag } from 'primeng/tag';
import { Cdr } from '@/pabx/types';
import { ReportService } from '@/pabx/report/report.service';

@Component({
    selector: 'app-report-page',
    standalone: true,
    providers: [MessageService],
    imports: [Card, TableModule, ProgressSpinner, Toast, NgIf, FormsModule, DatePicker, Tag],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Relatório de Chamadas
                    </h2>
                    <div class="flex items-center gap-2">
                        <p-datepicker
                            [(ngModel)]="dateRange"
                            selectionMode="range"
                            [readonlyInput]="true"
                            [showButtonBar]="true"
                            dateFormat="dd/mm/yy"
                            placeholder="Selecione o período"
                            [maxDate]="maxDate"
                            [minDate]="minDate"
                            (onSelect)="onDateSelect()"
                            (onClearClick)="onClearDate()"
                        >
                        </p-datepicker>
                    </div>
                </div>
            </ng-template>

            <p-table [value]="cdrs" [paginator]="true" [rows]="30" [tableStyle]="{ 'min-width': '50rem' }" stripedRows>
                <ng-template pTemplate="header">
                    <tr>
                        <th pSortableColumn="startTime">
                            Data/Hora
                            <p-sortIcon field="startTime"></p-sortIcon>
                        </th>
                        <th>Origem</th>
                        <th>Destino</th>
                        <th>Status</th>
                        <th pSortableColumn="billableSeconds">
                            Duração
                            <p-sortIcon field="billableSeconds"></p-sortIcon>
                        </th>
                    </tr>
                </ng-template>

                <ng-template pTemplate="body" let-cdr>
                    <tr>
                        <td>{{ formatDate(cdr.startTime) }}</td>
                        <td>{{ cdr.userfield === 'OUTBOUND' ? cdr.peer : cdr.src }}</td>
                        <td>{{ cdr.destination }}</td>
                        <td>
                            <div class="flex items-center gap-2">
                                <i
                                    [class]="
                                        cdr.userfield === 'OUTBOUND'
                                            ? 'pi pi-arrow-right text-green-500'
                                            : 'pi pi-arrow-left text-blue-500'
                                    "
                                ></i>
                                <p-tag
                                    [value]="dispositionTranslate(cdr.disposition)"
                                    [severity]="dispositionSeverity(cdr.disposition)"
                                />
                            </div>
                        </td>
                        <td>{{ formatDuration(cdr.billableSeconds) }}</td>
                    </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="5">
                            <div class="flex justify-center p-4" *ngIf="loading">
                                <p-progress-spinner [style]="{ width: '2rem', height: '2rem' }" />
                            </div>
                            <div class="text-center p-4" *ngIf="!loading">Nenhuma chamada encontrada.</div>
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        <p-toast />
    `
})
export class ReportPage implements OnInit {
    cdrs: Cdr[] = [];
    dateRange: Date[] = [];
    loading = true;

    readonly today = new Date();
    maxDate = new Date();
    readonly minDate: Date = (() => {
        const d = new Date();
        d.setMonth(d.getMonth() - 2);
        return d;
    })();

    constructor(
        private readonly reportService: ReportService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.reportService
            .findLast30()
            .then((cdrs) => {
                this.cdrs = cdrs;
                this.loading = false;
            })
            .catch(() => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao carregar chamadas',
                    detail: 'Tente novamente mais tarde.',
                    life: 10_000
                });
            });
    }

    onDateSelect(): void {
        if (this.dateRange[0] && !this.dateRange[1]) {
            const limit = new Date(this.dateRange[0]);
            limit.setMonth(limit.getMonth() + 2);
            this.maxDate = limit > this.today ? this.today : limit;
            return;
        }

        if (this.dateRange[0] && this.dateRange[1]) {
            this.loading = true;
            const end = new Date(this.dateRange[1]);
            end.setHours(23, 59, 59, 999);
            this.reportService
                .findByDateRange(this.dateRange[0], end)
                .then((cdrs) => {
                    this.cdrs = cdrs;
                    this.loading = false;
                })
                .catch(() => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Erro ao carregar chamadas',
                        detail: 'Tente novamente mais tarde.',
                        life: 10_000
                    });
                });
        }
    }

    onClearDate(): void {
        this.maxDate = new Date(this.today);
        this.loading = true;
        this.reportService
            .findLast30()
            .then((cdrs) => {
                this.cdrs = cdrs;
                this.loading = false;
            })
            .catch(() => {
                this.loading = false;
            });
    }

    formatDate(startTime: Date | string): string {
        const d = new Date(startTime);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    formatDuration(seconds: number): string {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(h)}:${pad(m)}:${pad(s)}`;
    }

    dispositionSeverity(disposition: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
        switch (disposition) {
            case 'ANSWERED':
                return 'success';
            case 'BUSY':
                return 'warn';
            case 'NO ANSWER':
            case 'FAILED':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    dispositionTranslate(disposition: string): string {
        switch (disposition) {
            case 'ANSWERED':
                return 'Atendida';
            case 'BUSY':
                return 'Ocupada';
            case 'NO ANSWER':
                return 'Não atendida';
            case 'FAILED':
                return 'Falha';
            default:
                return 'Desconhecido';
        }
    }
}
