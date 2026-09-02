import {Component, computed, OnInit, signal, ViewChild} from '@angular/core';
import {Table, TableModule} from 'primeng/table';
import {MessageService} from 'primeng/api';
import {Card} from 'primeng/card';
import {ProgressSpinner} from 'primeng/progressspinner';
import {Toast} from 'primeng/toast';
import {FormsModule} from '@angular/forms';
import {DatePicker} from 'primeng/datepicker';
import {Select} from 'primeng/select';
import {Button} from 'primeng/button';
import {IconField} from 'primeng/iconfield';
import {InputIcon} from 'primeng/inputicon';
import {InputText} from 'primeng/inputtext';
import {Tooltip} from 'primeng/tooltip';
import {
    MemberActivity,
    MemberActivityPause,
    MemberActivityReportResponse,
    MemberActivitySession,
    QueueOption
} from '@/pabx/types/member-activity';
import {MemberActivityReportService} from '@/pabx/member-activity-report/member-activity-report.service';

interface JourneySegment {
    type: 'logged' | 'paused' | 'gap';
    widthPercent: number;
}

interface PauseEntry {
    memberName: string;
    pause: MemberActivityPause;
}

@Component({
    selector: 'app-member-activity-report-page',
    standalone: true,
    providers: [MessageService],
    imports: [
        Card,
        TableModule,
        ProgressSpinner,
        Toast,
        FormsModule,
        DatePicker,
        Select,
        Button,
        IconField,
        InputIcon,
        InputText,
        Tooltip
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div class="mb-4 md:mb-0">
                        <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold">
                            Relatório de Atividade dos Membros
                        </h2>
                        <span class="text-sm text-surface-500 dark:text-surface-400">
                            Monitoramento detalhado de sessões e pausas operacionais.
                        </span>
                    </div>
                    <div class="flex items-center gap-2">
                        <p-select
                            [options]="queues()"
                            [ngModel]="selectedQueue()"
                            (ngModelChange)="selectedQueue.set($event)"
                            optionLabel="name"
                            placeholder="Selecione uma fila"
                            (onChange)="onQueueSelect()"
                        ></p-select>
                        @if (selectedQueue()) {
                            <p-datepicker
                                [ngModel]="date()"
                                (ngModelChange)="date.set($event)"
                                [readonlyInput]="true"
                                [showButtonBar]="true"
                                dateFormat="dd/mm/yy"
                                placeholder="Selecione a data"
                                [maxDate]="today"
                                (onSelect)="onDateSelect()"
                                (onClearClick)="onClearDate()"
                            >
                            </p-datepicker>
                        }
                    </div>
                </div>
            </ng-template>

            @if (!selectedQueue()) {
                <div class="text-center p-4">Selecione uma fila acima pra ver o relatório.</div>
            } @else if (loading()) {
                <div class="flex justify-center p-10">
                    <p-progress-spinner [style]="{ width: '2.5rem', height: '2.5rem' }" />
                </div>
            } @else if (reportError()) {
                <div class="flex flex-col items-center gap-3 p-10 text-center">
                    <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
                    <span class="text-surface-600 dark:text-surface-300"
                        >Não foi possível carregar o relatório. Tente novamente.</span
                    >
                    <p-button icon="pi pi-refresh" label="Tentar novamente" (onClick)="loadReport()" />
                </div>
            } @else if (report()) {
                <!-- KPI cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div
                        class="rounded-xl shadow px-6 py-4 flex flex-col gap-1 border-l-4 border-green-500 bg-white dark:bg-surface-900"
                    >
                        <span class="text-xs font-semibold uppercase tracking-wide text-surface-500"
                            >Tempo Online Total</span
                        >
                        <span class="text-2xl font-bold">{{ formatDuration(totalLoggedSeconds()) }}</span>
                    </div>
                    <div
                        class="rounded-xl shadow px-6 py-4 flex flex-col gap-1 border-l-4 border-red-800 bg-white dark:bg-surface-900"
                    >
                        <span class="text-xs font-semibold uppercase tracking-wide text-surface-500"
                            >Tempo Total em Pausa</span
                        >
                        <span class="text-2xl font-bold">{{ formatDuration(totalPauseSeconds()) }}</span>
                    </div>
                </div>

                <!-- Jornada do Dia -->
                @if (selectedMember(); as member) {
                    <div class="rounded-xl border border-surface-200 dark:border-surface-700 p-4 mb-4">
                        <div class="flex items-center justify-between mb-4">
                            <h3 class="font-semibold text-lg">Jornada do Dia: {{ member.memberName }}</h3>
                            <div class="flex items-center gap-2">
                                <span
                                    class="text-xs font-bold px-2 py-1 rounded-full"
                                    [class]="productivityBadgeClass(member.productivityPercent)"
                                >
                                    Produtividade: {{ member.productivityPercent }}%
                                </span>
                                <p-button
                                    icon="pi pi-times"
                                    label="Ver todos"
                                    text
                                    size="small"
                                    (onClick)="selectedMemberId.set(null)"
                                />
                            </div>
                        </div>

                        <div class="flex w-full h-8 rounded overflow-hidden">
                            @for (segment of journeySegments(); track $index) {
                                <div
                                    [style.width.%]="segment.widthPercent"
                                    [class]="journeySegmentClass(segment.type)"
                                ></div>
                            }
                        </div>
                        <div class="flex justify-between text-xs text-surface-400 mt-1">
                            @for (label of journeyHourLabels(); track $index) {
                                <span>{{ label }}</span>
                            }
                        </div>
                    </div>
                }

                <!-- Detalhamento de Atividade + Registro de Pausas -->
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div class="lg:col-span-2 rounded-xl border border-surface-200 dark:border-surface-700 p-4">
                        <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                            <h3 class="font-semibold text-lg">Detalhamento de Atividade</h3>
                            <p-iconfield>
                                <p-inputicon class="pi pi-search" />
                                <input
                                    pInputText
                                    type="text"
                                    (input)="onFilterGlobal($event)"
                                    placeholder="Filtrar tabela..."
                                    class="w-full"
                                />
                            </p-iconfield>
                        </div>

                        <p-table
                            #dataTable
                            [value]="report()!.members"
                            [paginator]="true"
                            [rows]="10"
                            [globalFilterFields]="['memberName']"
                            [tableStyle]="{ 'min-width': '45rem' }"
                            stripedRows
                        >
                            <ng-template pTemplate="header">
                                <tr>
                                    <th>Membro</th>
                                    <th>Entrada/Saída</th>
                                    <th>Tempo logado</th>
                                    <th>Total de pausas</th>
                                    <th>Produtividade</th>
                                    <th>Ação</th>
                                </tr>
                            </ng-template>

                            <ng-template pTemplate="body" let-member>
                                <tr>
                                    <td class="font-medium">{{ member.memberName }}</td>
                                    <td>{{ formatSessionRange(member.entrada, member.saida) }}</td>
                                    <td>{{ formatDuration(member.loggedSeconds) }}</td>
                                    <td>{{ formatDuration(member.pauseSeconds) }}</td>
                                    <td>
                                        <div class="flex items-center gap-2">
                                            <div class="w-20 h-1.5 rounded-full bg-surface-200 dark:bg-surface-700">
                                                <div
                                                    class="h-1.5 rounded-full"
                                                    [class]="productivityBarClass(member.productivityPercent)"
                                                    [style.width.%]="member.productivityPercent"
                                                ></div>
                                            </div>
                                            <span class="text-sm font-semibold">{{ member.productivityPercent }}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <p-button
                                            icon="pi pi-eye"
                                            outlined
                                            size="small"
                                            pTooltip="Ver detalhes"
                                            (onClick)="selectedMemberId.set(member.memberId)"
                                        />
                                    </td>
                                </tr>
                            </ng-template>

                            <ng-template pTemplate="emptymessage">
                                <tr>
                                    <td colspan="6" class="text-center p-4">Nenhuma atividade encontrada.</td>
                                </tr>
                            </ng-template>
                        </p-table>
                    </div>

                    <div class="lg:col-span-1">
                        <div class="rounded-xl border border-surface-200 dark:border-surface-700 p-4 h-full">
                            <h3 class="font-semibold text-lg mb-4 flex items-center gap-2">
                                <i class="pi pi-history"></i> Registro de Pausas
                            </h3>
                            <div class="flex flex-col gap-4 max-h-[32rem] overflow-y-auto">
                                @for (entry of pauseEntries(); track $index) {
                                    <div class="flex items-start justify-between gap-2">
                                        <div class="flex flex-col">
                                            <span class="font-semibold text-sm uppercase">{{
                                                entry.pause.pauseName ?? 'Pausa'
                                            }}</span>
                                            <span class="text-xs text-surface-400">
                                                {{ formatPauseRange(entry.pause.start, entry.pause.end) }}
                                                @if (selectedMemberId() === null) {
                                                    <span> &bull; {{ entry.memberName }}</span>
                                                }
                                            </span>
                                        </div>
                                        <span class="text-sm font-semibold whitespace-nowrap">{{
                                            formatDuration(entry.pause.durationSeconds)
                                        }}</span>
                                    </div>
                                } @empty {
                                    <div class="text-center text-surface-400 text-sm">Nenhuma pausa registrada.</div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }
        </p-card>
        <p-toast />
    `
})
export class MemberActivityReportPage implements OnInit {
    readonly queues = signal<QueueOption[]>([]);
    readonly selectedQueue = signal<QueueOption | null>(null);
    readonly date = signal<Date>(new Date());
    readonly report = signal<MemberActivityReportResponse | null>(null);
    readonly selectedMemberId = signal<number | null>(null);
    readonly loading = signal<boolean>(false);
    readonly reportError = signal<boolean>(false);

    readonly today = new Date();

    @ViewChild('dataTable') dt!: Table;

    private requestId = 0;

    readonly selectedMember = computed<MemberActivity | null>(() => {
        const r = this.report();
        const id = this.selectedMemberId();
        if (!r || id === null) return null;
        return r.members.find((m) => m.memberId === id) ?? null;
    });

    readonly totalLoggedSeconds = computed(() => {
        const r = this.report();
        if (!r) return 0;
        const member = this.selectedMember();
        if (member) return member.loggedSeconds;
        return r.members.reduce((sum, m) => sum + m.loggedSeconds, 0);
    });

    readonly totalPauseSeconds = computed(() => {
        const r = this.report();
        if (!r) return 0;
        const member = this.selectedMember();
        if (member) return member.pauseSeconds;
        return r.members.reduce((sum, m) => sum + m.pauseSeconds, 0);
    });

    readonly journeySegments = computed<JourneySegment[]>(() => {
        const member = this.selectedMember();
        if (!member) return [];
        const windowStart = member.entrada;
        const windowEnd = this.memberWindowEnd(member);
        const totalMs = Math.max(windowEnd - windowStart, 1);

        const sessions: { start: number; end: number }[] = [...member.sessions]
            .map((s: MemberActivitySession) => ({
                start: Math.max(s.start, windowStart),
                end: Math.min(s.end ?? windowEnd, windowEnd)
            }))
            .filter((s) => s.end > s.start)
            .sort((a, b) => a.start - b.start);

        const pauses = [...member.pauses]
            .map((p) => ({
                start: Math.max(p.start, windowStart),
                end: Math.min(p.end ?? windowEnd, windowEnd)
            }))
            .filter((p) => p.end > p.start)
            .sort((a, b) => a.start - b.start);

        const segments: JourneySegment[] = [];
        const pushSegment = (type: JourneySegment['type'], start: number, end: number) => {
            if (end > start) {
                segments.push({ type, widthPercent: ((end - start) / totalMs) * 100 });
            }
        };

        let cursor = windowStart;
        for (const session of sessions) {
            if (session.start > cursor) {
                pushSegment('gap', cursor, session.start);
            }
            let sessionCursor = Math.max(session.start, cursor);
            const sessionPauses = pauses.filter((p) => p.start < session.end && p.end > session.start);
            for (const pause of sessionPauses) {
                const pauseStart = Math.max(pause.start, sessionCursor);
                const pauseEnd = Math.min(pause.end, session.end);
                if (pauseEnd <= pauseStart) continue;
                pushSegment('logged', sessionCursor, pauseStart);
                pushSegment('paused', pauseStart, pauseEnd);
                sessionCursor = Math.max(sessionCursor, pauseEnd);
            }
            pushSegment('logged', sessionCursor, session.end);
            cursor = session.end;
        }
        if (cursor < windowEnd) {
            pushSegment('gap', cursor, windowEnd);
        }
        return segments;
    });

    readonly journeyHourLabels = computed<string[]>(() => {
        const member = this.selectedMember();
        if (!member) return [];
        const start = new Date(member.entrada);
        start.setMinutes(0, 0, 0);
        const end = new Date(this.memberWindowEnd(member));
        if (end.getMinutes() !== 0 || end.getSeconds() !== 0 || end.getMilliseconds() !== 0) {
            end.setHours(end.getHours() + 1, 0, 0, 0);
        }
        const labels: string[] = [];
        const cursor = new Date(start);
        while (cursor.getTime() <= end.getTime()) {
            labels.push(`${cursor.getHours().toString().padStart(2, '0')}:00`);
            cursor.setHours(cursor.getHours() + 1);
        }
        return labels;
    });

    readonly pauseEntries = computed<PauseEntry[]>(() => {
        const r = this.report();
        if (!r) return [];
        const member = this.selectedMember();
        const entries: PauseEntry[] = member
            ? member.pauses.map((pause) => ({ memberName: member.memberName, pause }))
            : r.members.flatMap((m) => m.pauses.map((pause) => ({ memberName: m.memberName, pause })));
        return entries.sort((a, b) => b.pause.start - a.pause.start);
    });

    constructor(
        private readonly memberActivityReportService: MemberActivityReportService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.memberActivityReportService
            .findQueues()
            .then((queues) => {
                this.queues.set(queues);
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao carregar filas',
                    detail: 'Tente novamente mais tarde.',
                    life: 10_000
                });
            });
    }

    onQueueSelect(): void {
        this.selectedMemberId.set(null);
        this.loadReport();
    }

    onDateSelect(): void {
        if (!this.selectedQueue()) return;
        this.selectedMemberId.set(null);
        this.loadReport();
    }

    onClearDate(): void {
        this.date.set(new Date());
        this.selectedMemberId.set(null);
        this.loadReport();
    }

    onFilterGlobal(event: Event): void {
        const target = event.target as HTMLInputElement | null;
        if (target) {
            this.dt.filterGlobal(target.value, 'contains');
        }
    }

    formatDuration(totalSeconds: number): string {
        const totalMinutes = Math.round(totalSeconds / 60);
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return h > 0 ? `${h}h ${m}m` : `${m}m`;
    }

    formatTime(ms: number): string {
        const d = new Date(ms);
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }

    formatSessionRange(entrada: number, saida: number | null): string {
        return `${this.formatTime(entrada)} - ${saida !== null ? this.formatTime(saida) : '—'}`;
    }

    formatPauseRange(start: number, end: number | null): string {
        return `${this.formatTime(start)} - ${end !== null ? this.formatTime(end) : 'em andamento'}`;
    }

    productivityBand(percent: number): 'high' | 'mid' | 'low' {
        if (percent >= 80) return 'high';
        if (percent >= 60) return 'mid';
        return 'low';
    }

    productivityBadgeClass(percent: number): string {
        switch (this.productivityBand(percent)) {
            case 'high':
                return 'bg-green-100 text-green-700';
            case 'mid':
                return 'bg-orange-100 text-orange-600';
            default:
                return 'bg-red-100 text-red-600';
        }
    }

    productivityBarClass(percent: number): string {
        switch (this.productivityBand(percent)) {
            case 'high':
                return 'bg-green-500';
            case 'mid':
                return 'bg-orange-400';
            default:
                return 'bg-red-500';
        }
    }

    journeySegmentClass(type: JourneySegment['type']): string {
        switch (type) {
            case 'logged':
                return 'bg-green-400';
            case 'paused':
                return 'bg-surface-300';
            default:
                return 'bg-transparent border-x border-dashed border-surface-300 dark:border-surface-600';
        }
    }

    private selectedDayEnd(): number {
        const end = new Date(this.date());
        end.setHours(23, 59, 59, 999);
        return end.getTime();
    }

    private memberWindowEnd(member: MemberActivity): number {
        return member.saida ?? Math.min(Date.now(), this.selectedDayEnd());
    }

    loadReport(): void {
        const queue = this.selectedQueue();
        if (!queue) return;
        const id = ++this.requestId;
        this.loading.set(true);
        this.reportError.set(false);

        const start = new Date(this.date());
        start.setHours(0, 0, 0, 0);
        const end = new Date(this.selectedDayEnd());

        this.memberActivityReportService
            .findReport(queue.id, start, end)
            .then((report) => {
                if (id !== this.requestId) return;
                this.report.set(report);
                this.loading.set(false);
            })
            .catch(() => {
                if (id !== this.requestId) return;
                this.report.set(null);
                this.loading.set(false);
                this.reportError.set(true);
                this.showError();
            });
    }

    private showError(): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Erro ao carregar relatório',
            detail: 'Tente novamente mais tarde.',
            life: 10_000
        });
    }
}
