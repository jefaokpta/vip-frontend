import { Component, HostListener, OnDestroy, OnInit, signal } from '@angular/core';
import { WorkersDashboardService } from '@/pages/dashboard/workers-dashboard.service';
import { WorkersOverview } from '@/pabx/types/workers-overview';

const TICK_MS = 1000;
const TICKS_PER_REFRESH = 3;

@Component({
    selector: 'app-workers-dashboard',
    standalone: true,
    template: `
        <div class="flex flex-col gap-4">
            <div class="flex items-start justify-between">
                <div>
                    <div class="font-bold text-2xl">Painel de Workers</div>
                    <div class="text-sm text-gray-400">
                        Canais ativos por worker e empresa. Lista apenas workers com canais ativos.
                    </div>
                </div>
                @if (!connected()) {
                    <span class="text-xs font-bold px-2 py-1 rounded bg-red-100 text-red-600">Desconectado</span>
                }
            </div>

            @if (!loaded()) {
                <div class="text-gray-400">
                    {{ connected() ? 'Carregando…' : 'Não foi possível obter os dados' }}
                </div>
            } @else {
                <div class="rounded-xl shadow px-4 py-3 flex flex-col gap-1 border-l-4 border-gray-200 w-fit min-w-48">
                    <span class="text-xs font-semibold uppercase tracking-wide text-gray-400">TOTAL DE CANAIS</span>
                    <span class="text-4xl font-bold" data-testid="total-channels">{{ overview().totalChannels }}</span>
                </div>

                @if (overview().workers.length === 0) {
                    <div class="text-gray-400">Nenhum canal ativo no momento</div>
                } @else {
                    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        @for (worker of overview().workers; track worker.workerId) {
                            <div class="rounded-xl shadow p-4 flex flex-col gap-3">
                                <div class="flex items-end justify-between">
                                    <span class="font-bold text-lg">{{ worker.workerId }}</span>
                                    <span class="text-3xl font-bold" data-testid="worker-channels">{{
                                        worker.channels
                                    }}</span>
                                </div>
                                <div class="h-2 rounded bg-gray-200">
                                    <div
                                        class="h-2 rounded bg-blue-500"
                                        [style.width.%]="percent(worker.channels)"
                                    ></div>
                                </div>
                                <ul class="flex flex-col gap-1 text-sm">
                                    @for (company of worker.companies; track company.companyId) {
                                        <li class="flex justify-between">
                                            <span>Empresa {{ company.companyId }}</span>
                                            <span class="font-semibold">{{ company.channels }}</span>
                                        </li>
                                    }
                                </ul>
                            </div>
                        }
                    </div>
                }

                <div class="text-xs text-gray-400">Atualizado há {{ secondsSinceUpdate() }}s</div>
            }
        </div>
    `
})
export class WorkersDashboard implements OnInit, OnDestroy {
    readonly overview = signal<WorkersOverview>({ totalChannels: 0, workers: [] });
    readonly loaded = signal(false);
    readonly connected = signal(true);
    readonly secondsSinceUpdate = signal(0);

    private ticker?: ReturnType<typeof setInterval>;
    private ticks = 0;
    private loading = false;

    constructor(private readonly service: WorkersDashboardService) {}

    ngOnInit(): void {
        this.refresh();
        this.ticker = setInterval(() => this.onTick(), TICK_MS);
    }

    ngOnDestroy(): void {
        clearInterval(this.ticker);
    }

    @HostListener('document:visibilitychange')
    onVisibilityChange(): void {
        if (!document.hidden) {
            this.refresh();
        }
    }

    percent(channels: number): number {
        const total = this.overview().totalChannels;
        return total === 0 ? 0 : Math.round((channels * 100) / total);
    }

    private onTick(): void {
        this.secondsSinceUpdate.update((seconds) => seconds + 1);
        this.ticks++;
        if (this.ticks % TICKS_PER_REFRESH === 0) {
            this.refresh();
        }
    }

    private async refresh(): Promise<void> {
        if (document.hidden || this.loading) {
            return;
        }
        this.loading = true;
        try {
            this.overview.set(await this.service.getOverview());
            this.secondsSinceUpdate.set(0);
            this.loaded.set(true);
            this.connected.set(true);
        } catch {
            this.connected.set(false);
        } finally {
            this.loading = false;
        }
    }
}
