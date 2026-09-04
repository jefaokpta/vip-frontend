import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Card } from 'primeng/card';
import { ProgressSpinner } from 'primeng/progressspinner';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { TableModule, TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { CallJourney, DacCallsResponse } from '@/pabx/types/dac-call-journey';
import { DacReportService } from '@/pabx/dac-report/dac-report.service';
import {
    abandonedPercent,
    answeredPercent,
    eventLabel,
    eventSeverity,
    formatHms,
    percentSeverity
} from '@/pabx/dac-report/dac-report.utils';

@Component({
    selector: 'app-dac-report-calls-page',
    standalone: true,
    providers: [MessageService],
    imports: [Card, ProgressSpinner, Toast, Button, TableModule, Tag, Tooltip],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex items-center gap-3 mb-4">
                    <p-button
                        icon="pi pi-arrow-left"
                        (onClick)="goBack()"
                        outlined
                        rounded
                        size="small"
                        pTooltip="Voltar"
                        tooltipPosition="right"
                    />
                    <div>
                        <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold">
                            Jornada de Chamadas — {{ queueName }}
                        </h2>
                        <span class="text-sm text-surface-500 dark:text-surface-400">{{ periodLabel }}</span>
                    </div>
                </div>
            </ng-template>

            @if (loading()) {
                <div class="flex justify-center p-10">
                    <p-progress-spinner [style]="{ width: '2.5rem', height: '2.5rem' }" />
                </div>
            } @else if (loadError()) {
                <div class="flex flex-col items-center gap-3 p-10 text-center">
                    <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                    <span class="text-surface-600 dark:text-surface-300"
                        >Não foi possível carregar a jornada. Tente novamente.</span
                    >
                    <p-button icon="pi pi-refresh" label="Tentar novamente" (onClick)="loadCalls()" />
                </div>
            } @else {
                @if (response(); as r) {
                    <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-gray-200">
                            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                >TOTAL DE CHAMADAS</span
                            >
                            <span class="text-2xl font-bold">{{ r.totalCalls }}</span>
                        </div>
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-green-500">
                            <span class="text-xs font-semibold uppercase tracking-wide text-green-600">ATENDIDAS</span>
                            <span class="text-2xl font-bold flex items-center justify-between">
                                {{ r.answeredCalls }}
                                <p-tag
                                    [value]="answeredPercent(r) + '%'"
                                    [severity]="percentSeverity(answeredPercent(r))"
                                    styleClass="!text-xs !py-0.5 !px-2 !font-medium"
                                />
                            </span>
                            <span class="text-xs text-surface-500 flex items-center justify-between">
                                Nível de Serviço (≤ {{ r.serviceLevelSeconds }}s):
                                <p-tag
                                    [value]="r.serviceLevelPercent + '%'"
                                    [severity]="percentSeverity(r.serviceLevelPercent)"
                                    styleClass="!text-xs !py-0.5 !px-2 !font-medium"
                                />
                            </span>
                        </div>
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-red-500">
                            <span class="text-xs font-semibold uppercase tracking-wide text-red-500">ABANDONADAS</span>
                            <span class="text-2xl font-bold flex items-center justify-between">
                                {{ r.abandonedCalls }}
                                <p-tag
                                    [value]="abandonedPercent(r) + '%'"
                                    [severity]="percentSeverity(100 - abandonedPercent(r))"
                                    styleClass="!text-xs !py-0.5 !px-2 !font-medium"
                                />
                            </span>
                        </div>
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-orange-400">
                            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">TME MÉDIO</span>
                            <span class="text-2xl font-bold">{{ formatHms(r.avgWaitSeconds) }}</span>
                            <span class="text-xs text-surface-500">Espera</span>
                        </div>
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-indigo-400">
                            <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">TMA MÉDIO</span>
                            <span class="text-2xl font-bold">{{ formatHms(r.avgTalkSeconds) }}</span>
                            <span class="text-xs text-surface-500">Conversação</span>
                        </div>
                    </div>

                    <p-table
                        [value]="r.calls"
                        dataKey="uniqueId"
                        [paginator]="true"
                        [rows]="15"
                        [expandedRowKeys]="expandedRows()"
                        (onRowExpand)="onRowExpand($event)"
                        (onRowCollapse)="onRowCollapse($event)"
                        [tableStyle]="{ 'min-width': '40rem' }"
                        stripedRows
                    >
                        <ng-template pTemplate="header">
                            <tr>
                                <th style="width: 3rem"></th>
                                <th>Data/Hora</th>
                                <th>Telefone</th>
                                <th>Status</th>
                                <th>Gravação</th>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="body" let-call>
                            <tr>
                                <td>
                                    <button
                                        type="button"
                                        pButton
                                        pRowToggler
                                        [pRowToggler]="call"
                                        class="p-button-text p-button-rounded"
                                        [icon]="
                                            expandedRows()[call.uniqueId] ? 'pi pi-chevron-down' : 'pi pi-chevron-right'
                                        "
                                    ></button>
                                </td>
                                <td>{{ formatDateTime(call.entryTs) }}</td>
                                <td>{{ call.callerPeer ?? '—' }}</td>
                                <td>
                                    <p-tag
                                        [value]="call.status === 'ANSWERED' ? 'Atendida' : 'Abandonada'"
                                        [severity]="call.status === 'ANSWERED' ? 'success' : 'warn'"
                                    />
                                </td>
                                <td>
                                    @if (recordingUrls()[call.uniqueId]; as url) {
                                        <audio controls [src]="url" style="height: 2.25rem"></audio>
                                    } @else {
                                        <p-button
                                            icon="pi pi-volume-up"
                                            [disabled]="!call.hasRecording"
                                            [loading]="loadingRecordingFor() === call.uniqueId"
                                            text
                                            rounded
                                            pTooltip="Sem gravação"
                                            [tooltipDisabled]="call.hasRecording"
                                            (onClick)="playRecording(call)"
                                        />
                                    }
                                </td>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="rowexpansion" let-call>
                            <tr>
                                <td colspan="5">
                                    <p-table [value]="call.events" [tableStyle]="{ 'min-width': '30rem' }">
                                        <ng-template pTemplate="header">
                                            <tr>
                                                <th>Membro</th>
                                                <th>Tempo</th>
                                                <th>Evento</th>
                                            </tr>
                                        </ng-template>
                                        <ng-template pTemplate="body" let-event>
                                            <tr>
                                                <td>{{ event.memberPeer ?? '—' }}</td>
                                                <td>{{ formatHms(event.offsetSeconds) }}</td>
                                                <td>
                                                    <p-tag
                                                        [value]="eventLabel(event.eventType)"
                                                        [severity]="eventSeverity(event.eventType)"
                                                    />
                                                </td>
                                            </tr>
                                        </ng-template>
                                    </p-table>
                                </td>
                            </tr>
                        </ng-template>
                        <ng-template pTemplate="emptymessage">
                            <tr>
                                <td colspan="5" class="text-center p-4">Nenhuma chamada nesse período</td>
                            </tr>
                        </ng-template>
                    </p-table>
                }
            }
        </p-card>
        <p-toast />
    `
})
export class DacReportCallsPage implements OnInit {
    readonly response = signal<DacCallsResponse | null>(null);
    readonly loading = signal<boolean>(false);
    readonly loadError = signal<boolean>(false);
    readonly expandedRows = signal<Record<string, boolean>>({});
    readonly recordingUrls = signal<Record<string, string>>({});
    readonly loadingRecordingFor = signal<string | null>(null);

    queueId = 0;
    queueName = '';
    periodLabel = '';
    private start = 0;
    private end = 0;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly location: Location,
        private readonly dacReportService: DacReportService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        const params = this.route.snapshot.queryParamMap;
        this.queueId = Number(params.get('queueId'));
        this.queueName = params.get('queueName') ?? '';
        this.start = Number(params.get('start'));
        this.end = Number(params.get('end'));
        this.periodLabel = this.formatPeriodLabel(this.start, this.end, params.get('granularity'));
        this.loadCalls();
    }

    loadCalls(): void {
        this.loading.set(true);
        this.loadError.set(false);
        this.dacReportService
            .findCalls(this.queueId, this.start, this.end)
            .then((response) => {
                this.response.set(response);
                this.loading.set(false);
            })
            .catch(() => {
                this.loading.set(false);
                this.loadError.set(true);
                this.showError('Erro ao carregar jornada');
            });
    }

    goBack(): void {
        this.location.back();
    }

    onRowExpand(event: TableRowExpandEvent): void {
        const call = event.data as CallJourney;
        this.expandedRows.update((rows) => ({ ...rows, [call.uniqueId]: true }));
    }

    onRowCollapse(event: TableRowCollapseEvent): void {
        const call = event.data as CallJourney;
        this.expandedRows.update((rows) => {
            const next = { ...rows };
            delete next[call.uniqueId];
            return next;
        });
    }

    playRecording(call: CallJourney): void {
        if (!call.hasRecording || !call.answeredByPeer || this.recordingUrls()[call.uniqueId]) return;
        this.loadingRecordingFor.set(call.uniqueId);
        this.dacReportService
            .findRecordingUrl(this.queueId, call.uniqueId, call.answeredByPeer)
            .then((url) => {
                this.recordingUrls.update((urls) => ({ ...urls, [call.uniqueId]: url }));
                this.loadingRecordingFor.set(null);
            })
            .catch(() => {
                this.loadingRecordingFor.set(null);
                this.showError('Erro ao carregar gravação');
            });
    }

    formatDateTime(timestamp: number): string {
        const d = new Date(timestamp);
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }

    private formatPeriodLabel(start: number, end: number, granularity: string | null): string {
        const pad = (n: number) => String(n).padStart(2, '0');
        const startDate = new Date(start);
        if (granularity === 'HOUR') {
            const endDate = new Date(end);
            return `${pad(startDate.getDate())}/${pad(startDate.getMonth() + 1)}/${startDate.getFullYear()} ${pad(startDate.getHours())}:00 – ${pad(endDate.getHours())}:00`;
        }
        return `${pad(startDate.getDate())}/${pad(startDate.getMonth() + 1)}/${startDate.getFullYear()}`;
    }

    private showError(summary: string): void {
        this.messageService.add({ severity: 'error', summary, detail: 'Tente novamente mais tarde.', life: 10_000 });
    }

    protected readonly formatHms = formatHms;
    protected readonly percentSeverity = percentSeverity;
    protected readonly answeredPercent = answeredPercent;
    protected readonly abandonedPercent = abandonedPercent;
    protected readonly eventLabel = eventLabel;
    protected readonly eventSeverity = eventSeverity;
}
