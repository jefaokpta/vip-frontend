import { Component, OnDestroy, OnInit } from '@angular/core';
import { CurrencyPipe, DatePipe, JsonPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService, PrimeTemplate } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { Toast } from 'primeng/toast';
import { BillingService } from '@/pages/billing/billing.service';
import { BillingRunClient, BillingRunDetail, BillingRunSummary } from '@/pages/billing/types';
import { inclusivePeriodEnd, POLLING_MS, processedCount } from '@/pages/billing/billing.utils';

@Component({
    selector: 'app-billing-run-detail-page',
    standalone: true,
    imports: [Button, Card, CurrencyPipe, DatePipe, JsonPipe, PrimeTemplate, RouterLink, TableModule, Toast],
    providers: [MessageService],
    template: `
        @if (detail) {
            <p-card class="block mb-4">
                <ng-template #title>
                    <div class="flex items-center justify-between">
                        <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold">
                            Execução #{{ detail.summary.id }} - {{ detail.summary.mode }}
                        </h2>
                        <p-button icon="pi pi-arrow-left" label="Voltar" outlined routerLink="/pages/billing" />
                    </div>
                </ng-template>
                <p>
                    Período: {{ detail.summary.periodStart | date: 'dd/MM/yyyy' }} -
                    {{ periodEndOf(detail.summary) | date: 'dd/MM/yyyy' }} | Status: {{ detail.summary.status }} |
                    {{ processed }} de {{ detail.summary.totalClients }}
                </p>
            </p-card>

            @if (detail.orphanContracts.length) {
                <p-card class="block mb-4" id="orphan-card">
                    <ng-template #title>Contratos sem empresa</ng-template>
                    <ul class="list-disc pl-6">
                        @for (c of detail.orphanContracts; track c) {
                            <li>{{ c }}</li>
                        }
                    </ul>
                </p-card>
            }

            <p-card>
                <p-table [value]="detail.clients" dataKey="companyId" [tableStyle]="{ 'min-width': '40rem' }">
                    <ng-template pTemplate="header">
                        <tr>
                            <th style="width: 3rem"></th>
                            <th>Empresa</th>
                            <th>Status</th>
                            <th>Erro</th>
                            <th>Valor por item</th>
                            <th style="width: 10%">Ações</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-client let-expanded="expanded">
                        <tr>
                            <td>
                                <p-button
                                    type="button"
                                    [pRowToggler]="client"
                                    [text]="true"
                                    [rounded]="true"
                                    [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'"
                                />
                            </td>
                            <td>{{ client.companyId }}</td>
                            <td>{{ client.status }}</td>
                            <td>{{ errorText(client) }}</td>
                            <td>
                                @for (item of client.calc?.items ?? []; track $index) {
                                    <div>
                                        {{ item.codServico }}/{{ item.codItem }}:
                                        {{ item.value | currency: 'BRL' : 'symbol' : '1.2-2' }}
                                    </div>
                                }
                            </td>
                            <td>
                                <p-button
                                    class="btn-reexecutar"
                                    icon="pi pi-replay"
                                    label="Reexecutar"
                                    size="small"
                                    outlined
                                    [disabled]="active"
                                    (onClick)="rerun(client)"
                                />
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="rowexpansion" let-client>
                        <tr>
                            <td colspan="6">
                                @if (client.calc) {
                                    <pre class="calc">{{ client.calc | json }}</pre>
                                } @else {
                                    <span>Sem cálculo disponível.</span>
                                }
                            </td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td colspan="6" class="text-center p-4">Nenhum cliente nesta execução.</td>
                        </tr>
                    </ng-template>
                </p-table>
            </p-card>
        }
        <p-toast />
    `
})
export class BillingRunDetailPage implements OnInit, OnDestroy {
    detail: BillingRunDetail | null = null;
    active = false;
    private loading = false;
    private loadFailed = false;
    private timer: ReturnType<typeof setInterval> | null = null;
    private readonly id: number;

    constructor(
        private readonly billingService: BillingService,
        private readonly route: ActivatedRoute,
        private readonly messageService: MessageService
    ) {
        this.id = Number(this.route.snapshot.params['id']);
    }

    periodEndOf(run: BillingRunSummary): Date {
        return inclusivePeriodEnd(run.periodEnd);
    }

    get processed(): number {
        return this.detail ? processedCount(this.detail.summary) : 0;
    }

    ngOnInit(): void {
        this.load();
    }

    ngOnDestroy(): void {
        this.stopPolling();
    }

    errorText(client: BillingRunClient): string {
        return [client.errorCode, client.errorDetail].filter(Boolean).join(' - ');
    }

    /**
     * `active` vem de listRuns(): o lock do backend é global, então enquanto qualquer execução
     * estiver ativa o reexecutar é recusado. Ticks de polling são ignorados enquanto há carga pendente.
     */
    load(): Promise<void> {
        if (this.loading) {
            return Promise.resolve();
        }
        this.loading = true;
        return this.billingService
            .getRun(this.id)
            .then(async (detail) => {
                const list = await this.billingService.listRuns();
                this.detail = detail;
                this.active = list.active;
                this.loadFailed = false;
                this.syncPolling();
            })
            .catch((err) => {
                if (!this.loadFailed) {
                    this.error(err, 'Não foi possível carregar a execução');
                }
                this.loadFailed = true;
            })
            .finally(() => (this.loading = false));
    }

    rerun(client: BillingRunClient): Promise<void> {
        return this.billingService
            .rerun(this.id, client.companyId)
            .then(() => this.load())
            .catch((err) => this.error(err, 'Não foi possível reexecutar o cliente'));
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
