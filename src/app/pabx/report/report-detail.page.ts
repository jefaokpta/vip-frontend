/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {Tooltip} from 'primeng/tooltip';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Tag} from 'primeng/tag';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {CurrencyPipe} from '@angular/common';
import {CdrDetail} from '@/pabx/types/cdr-detail';
import {ReportService} from '@/pabx/report/report.service';
import {
    costCenterLabel,
    dispositionSeverity,
    dispositionTranslate,
    formatDate,
    formatDuration
} from '@/pabx/report/cdr-format';
import {AccountCodeService} from '@/pabx/accountcode/account-code.service';
import {TranscriptionService} from '@/pabx/report/transcription.service';
import {UserService} from '@/pages/users/user.service';
import {ServiceEnum} from '@/types/service-enum';
import {Transcription} from '@/types/transcription';

@Component({
    selector: 'app-report-detail-page',
    standalone: true,
    providers: [MessageService],
    imports: [Card, Button, Tooltip, ProgressSpinner, Tag, Toast, CurrencyPipe, RouterLink],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex items-center gap-3 mb-4">
                    <p-button
                        icon="pi pi-arrow-left"
                        [routerLink]="backLink"
                        outlined
                        rounded
                        size="small"
                        pTooltip="Voltar"
                        tooltipPosition="right"
                    />
                    <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold">Detalhe da Chamada</h2>
                </div>
            </ng-template>

            @if (loading) {
                <div class="flex justify-center py-10">
                    <p-progress-spinner [style]="{ width: '2.5rem', height: '2.5rem' }" />
                </div>
            }

            @if (!loading && cdr) {
                <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Data/Hora</span>
                        <span class="font-medium">{{ formatDate(cdr.startTime) }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Origem</span>
                        <span class="font-medium">{{ cdr.userfield === 'OUTBOUND' ? cdr.peer : cdr.src }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Destino</span>
                        <span class="font-medium">{{ cdr.destination }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Caller ID</span>
                        <span class="font-medium">{{ cdr.callerId }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Status</span>
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
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Duração</span>
                        <span class="font-medium">{{ formatDuration(cdr.billableSeconds) }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Custo</span>
                        <span class="font-medium">{{ cdr.cost | currency: 'BRL' : true : '1.2-2' }}</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">Centro de Custo</span>
                        <span class="font-medium">{{ costCenterLabel(cdr.accountCode, costCenterLabelsByCode) }}</span>
                    </div>
                </div>

                <h3 class="font-semibold text-lg mb-3">Interações e Gravações</h3>
                @if (cdr.interactions.length === 0) {
                    <div class="text-center p-6 text-gray-400">Nenhuma interação registrada.</div>
                }
                <div class="flex flex-col gap-4">
                    @for (interaction of cdr.interactions; track $index) {
                        <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-3">
                            <div class="flex flex-wrap items-center gap-4">
                                <div class="flex flex-col gap-1">
                                    <span class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                        >Origem</span
                                    >
                                    <span class="font-medium">
                                        {{ interaction.channelSrc.peer }}
                                    </span>
                                </div>
                                @if (interaction.channelDst) {
                                    <div class="flex flex-col gap-1">
                                        <span class="text-xs font-semibold uppercase tracking-wide text-gray-400"
                                            >Destino</span
                                        >
                                        <span class="font-medium">
                                            {{ interaction.channelDst.peer }}
                                            @if (interaction.channelDst.isLeader) {
                                                <p-tag value="Líder" severity="info" class="ml-2" />
                                            }
                                        </span>
                                    </div>
                                }
                            </div>
                            @if (interaction.recordingUrl) {
                                <audio controls [src]="interaction.recordingUrl" style="height: 2.25rem"></audio>
                            } @else {
                                <span class="text-sm text-gray-400">Sem gravação</span>
                            }
                        </div>
                    }
                </div>
            }

            @if (!loading && cdr && hasIa) {
                <h3 class="font-semibold text-lg mt-8 mb-3">Transcrição</h3>
                @if (!loadingTranscriptions && transcriptions.length === 0) {
                    <div class="text-center p-6 text-gray-400">Transcrição indisponível</div>
                }
                <div class="flex flex-col gap-4">
                    @for (transcription of transcriptions; track transcription.summary.id) {
                        <div class="rounded-xl shadow px-4 py-3 whitespace-pre-line">
                            {{ transcription.transcript }}
                        </div>
                    }
                </div>
            }

            @if (!loading && !cdr) {
                <div class="text-center p-10 text-gray-400">Chamada não encontrada.</div>
            }
        </p-card>
        <p-toast />
    `
})
export class ReportDetailPage implements OnInit {
    cdr: CdrDetail | null = null;
    loading = true;
    costCenterLabelsByCode = new Map<string, string>();
    backLink = '/';
    loadingTranscriptions = false;
    hasIa = false;
    transcriptions: Transcription[] = [];

    constructor(
        private readonly route: ActivatedRoute,
        private readonly reportService: ReportService,
        private readonly accountCodeService: AccountCodeService,
        private readonly messageService: MessageService,
        private readonly transcriptionService: TranscriptionService,
        private readonly userService: UserService
    ) {}

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));
        if (this.route.snapshot.queryParamMap.get('from') === 'call-report') {
            this.backLink = '/pabx/call-report';
        }
        this.reportService
            .findById(id)
            .then((cdr) => {
                this.cdr = cdr;
                this.loading = false;
                this.loadTranscriptions(cdr.uniqueId);
            })
            .catch(() => {
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao carregar chamada',
                    detail: 'Tente novamente mais tarde.',
                    life: 10_000
                });
            });

        this.accountCodeService
            .findAll()
            .then((accountCodes) => {
                const labelsByCode = new Map<string, string>();
                for (const accountCode of accountCodes) {
                    if (!labelsByCode.has(accountCode.code)) {
                        labelsByCode.set(accountCode.code, accountCode.title);
                    }
                }
                this.costCenterLabelsByCode = labelsByCode;
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao carregar centros de custo',
                    detail: 'Tente novamente mais tarde.',
                    life: 10_000
                });
            });
    }

    private loadTranscriptions(uniqueId: string): void {
        this.hasIa = this.userService.hasService(ServiceEnum.IA);
        if (!this.hasIa) {
            return;
        }
        this.loadingTranscriptions = true;
        this.transcriptionService
            .findByCdr(uniqueId)
            .then((transcriptions) => (this.transcriptions = transcriptions.filter((t) => !!t.transcript)))
            .catch(() => (this.transcriptions = []))
            .finally(() => (this.loadingTranscriptions = false));
    }

    protected readonly formatDate = formatDate;
    protected readonly formatDuration = formatDuration;
    protected readonly dispositionSeverity = dispositionSeverity;
    protected readonly dispositionTranslate = dispositionTranslate;
    protected readonly costCenterLabel = costCenterLabel;
}
