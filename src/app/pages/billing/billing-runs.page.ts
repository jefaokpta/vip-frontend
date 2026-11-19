import { Component, OnDestroy, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { BillingService } from '@/pages/billing/billing.service';
import { BillingMode, BillingRunSummary } from '@/pages/billing/types';
import { inclusivePeriodEnd, POLLING_MS, processedCount } from '@/pages/billing/billing.utils';

@Component({
    selector: 'app-billing-runs-page',
    standalone: true,
    imports: [Button, Card, ConfirmDialog, DatePipe, PrimeTemplate, RouterLink, TableModule, Toast],
    providers: [ConfirmationService, MessageService],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4 md:mb-0">
                        Financeiro - Faturamento Omie
                    </h2>
                    <div class="flex gap-2">
                        <p-button
                            id="btn-executar"
                            icon="pi pi-play"
                            label="Executar faturamento"
                            [disabled]="active"
                            (onClick)="confirmStart()"
                        />
                        <p-button
                            id="btn-simular"
                            icon="pi pi-eye"
                            label="Simular"
                            severity="secondary"
                            [disabled]="active"
                            (onClick)="start('SIMULACAO')"
                        />
                        <p-button icon="pi pi-cog" label="Configuração Omie" outlined routerLink="omie-config" />
                    </div>
                </div>
            </ng-template>

            <p-table [value]="runs" [paginator]="true" [rows]="15" stripedRows [tableStyle]="{ 'min-width': '40rem' }">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Data</th>
                        <th>Modo</th>
                        <th>Período</th>
                        <th>Status</th>
                        <th>Processados</th>
                        <th>Erros</th>
                        <th style="width: 16%">Ações</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-run>
                    <tr>
                        <td>{{ run.createdAt | date: 'dd/MM/yyyy HH:mm' }}</td>
                        <td>{{ run.mode }}</td>
                        <td>
                            {{ run.periodStart | date: 'dd/MM/yyyy' }} - {{ periodEndOf(run) | date: 'dd/MM/yyyy' }}
                        </td>
                        <td>{{ run.status }}</td>
                        <td>{{ processed(run) }} de {{ run.totalClients }}</td>
                        <td>{{ run.countsByStatus?.['ERRO'] ?? 0 }}</td>
                        <td>
                            <div class="flex gap-2">
                                <p-button
                                    icon="pi pi-search"
                                    outlined
                                    size="small"
                                    [routerLink]="[run.id]"
                                    ariaLabel="Detalhe"
                                />
                                @if (run.status === 'INTERROMPIDA') {
                                    <p-button
                                        class="btn-retomar"
                                        icon="pi pi-refresh"
                                        label="Retomar"
                                        size="small"
                                        (onClick)="resume(run)"
                                    />
                                    <p-button
                                        class="btn-encerrar"
                                        icon="pi pi-times"
                                        label="Encerrar"
                                        severity="danger"
                                        size="small"
                                        outlined
                                        (onClick)="confirmCancel(run)"
                                    />
                                }
                            </div>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="7" class="text-center p-4">Nenhuma execução encontrada.</td>
                    </tr>
                </ng-template>
            </p-table>
        </p-card>
        <p-confirm-dialog />
        <p-toast />
    `
})
export class BillingRunsPage implements OnInit, OnDestroy {
    runs: BillingRunSummary[] = [];
    active = false;
    private loading = false;
    private loadFailed = false;
    private timer: ReturnType<typeof setInterval> | null = null;

    constructor(
        private readonly billingService: BillingService,
        private readonly confirmationService: ConfirmationService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.load();
    }

    ngOnDestroy(): void {
        this.stopPolling();
    }

    periodEndOf(run: BillingRunSummary): Date {
        return inclusivePeriodEnd(run.periodEnd);
    }

    processed(run: BillingRunSummary): number {
        return processedCount(run);
    }

    load(): Promise<void> {
        if (this.loading) {
            return Promise.resolve();
        }
        this.loading = true;
        return this.billingService
            .listRuns()
            .then((list) => {
                this.runs = list.runs;
                this.active = list.active;
                this.loadFailed = false;
                this.syncPolling();
            })
            .catch((err) => {
                if (!this.loadFailed) {
                    this.error(err, 'Não foi possível carregar as execuções');
                }
                this.loadFailed = true;
            })
            .finally(() => (this.loading = false));
    }

    confirmStart(): void {
        this.confirmationService.confirm({
            message: 'Executar o faturamento real? As faturas serão enviadas ao Omie.',
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: { label: 'Executar' },
            rejectButtonProps: { label: 'Fechar', severity: 'secondary', outlined: true },
            accept: () => this.start('REAL')
        });
    }

    start(mode: BillingMode): Promise<void> {
        return this.billingService
            .startRun(mode)
            .then(() => this.load())
            .catch((err) => this.error(err, 'Não foi possível iniciar a execução'));
    }

    resume(run: BillingRunSummary): Promise<void> {
        return this.billingService
            .resume(run.id)
            .then(() => this.load())
            .catch((err) => this.error(err, 'Não foi possível retomar a execução'));
    }

    confirmCancel(run: BillingRunSummary): void {
        this.confirmationService.confirm({
            message: `Encerrar a execução #${run.id}?`,
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            acceptButtonProps: { label: 'Encerrar', severity: 'danger' },
            rejectButtonProps: { label: 'Fechar', severity: 'secondary', outlined: true },
            accept: () => this.cancel(run)
        });
    }

    cancel(run: BillingRunSummary): Promise<void> {
        return this.billingService
            .cancel(run.id)
            .then(() => this.load())
            .catch((err) => this.error(err, 'Não foi possível encerrar a execução'));
    }

    private syncPolling(): void {
        if (this.active && !this.timer) {
            this.timer = setInterval(() => this.load(), POLLING_MS);
        } else if (!this.active) {
            this.stopPolling();
        }
    }

    private stopPolling(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private error(err: any, summary: string): void {
        this.messageService.add({ severity: 'error', summary, detail: err?.error?.message, life: 15_000 });
    }
}
