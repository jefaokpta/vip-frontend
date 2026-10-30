import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {Subscription} from 'rxjs';
import {WebsocketService} from '@/websocket/stomp/websocket.service';
import {rxStompServiceFactory} from '@/websocket/stomp/rx-stomp-service-factory';
import {ChannelStateEnum} from '@/pabx/types/channel-state-enum';
import {ContactStatusEventEnum} from '@/pabx/types/contact-status-event-enum';
import {PeerRegistry} from '@/pabx/types/peer-registry';
import {PeerDashboardService} from '@/pages/dashboard/peer-dashboard.service';
import {UserService} from '@/pages/users/user.service';
import {NgClass, NgTemplateOutlet} from '@angular/common';
import {Card} from 'primeng/card';
import {Toast} from 'primeng/toast';
import {MessageService} from 'primeng/api';
import {SelectButton} from 'primeng/selectbutton';
import {FormsModule} from '@angular/forms';
import {PickupGroupService} from '@/pabx/pickup-group/pickup-group.service';

const SEM_DEPARTAMENTO = 'Sem departamento';
const VIEW_MODE_KEY = 'peer-dashboard-view-mode';

@Component({
    selector: 'app-components-dashboard',
    providers: [{ provide: WebsocketService, useFactory: rxStompServiceFactory }, MessageService],
    imports: [Toast, NgClass, NgTemplateOutlet, Card, SelectButton, FormsModule],
    template: `
        <p-toast />
        <div class="flex flex-col gap-4">
            <p-card>
                <ng-template #title>
                    <div class="flex justify-between">
                        <span class="font-semibold text-2xl">Painel de Ramais</span>
                    </div>
                </ng-template>

                <div class="flex flex-col gap-4 p-4">
                    <div class="flex gap-6 mb-2 justify-around ">
                        <p-card header="Ramais" class="text-center">
                            <span class="font-bold text-3xl">{{ peerRegistries().length }}</span>
                        </p-card>
                        <p-card header="Registrados" class="text-center">
                            <span class="font-bold text-3xl text-green-600">{{ registeredCount() }}</span>
                        </p-card>
                        <p-card header="Ocupados" class="text-center">
                            <span class="font-bold text-3xl text-red-600">{{ busyChannelsCount() }}</span>
                        </p-card>
                    </div>
                </div>
            </p-card>
            <p-card>
                <ng-template #title>
                    <div class="flex justify-between">
                        <span class="font-semibold">Monitoramento de Ramais</span>
                        <p-selectbutton
                            [options]="viewModeOptions"
                            [ngModel]="viewMode()"
                            (ngModelChange)="setViewMode($event)"
                            optionLabel="label"
                            optionValue="value"
                            [allowEmpty]="false"
                            size="small"
                        ></p-selectbutton>
                    </div>
                </ng-template>

                @if (viewMode() === 'unified') {
                    <div class="flex flex-wrap gap-3">
                        @for (pr of peerRegistries(); track pr.peer.peer) {
                            <ng-container *ngTemplateOutlet="peerCard; context: { $implicit: pr }" />
                        }
                    </div>
                } @else {
                    <div class="flex flex-col gap-6">
                        @for (group of peersByDepartment(); track group.name) {
                            <section class="flex flex-col gap-3">
                                <div class="flex items-baseline gap-2 border-b border-surface-200 dark:border-surface-700 pb-1">
                                    <span class="font-semibold text-lg">{{ group.name }}</span>
                                    <span class="text-sm text-muted-color">{{ group.peers.length }} ramais</span>
                                </div>
                                <div class="flex flex-wrap gap-3">
                                    @for (pr of group.peers; track pr.peer.peer) {
                                        <ng-container *ngTemplateOutlet="peerCard; context: { $implicit: pr }" />
                                    }
                                </div>
                            </section>
                        }
                    </div>
                }

                <ng-template #peerCard let-pr>
                    <div
                        class="rounded-xl shadow px-4 py-3 w-56 flex flex-col gap-1 transition-all duration-300 border-l-4"
                        [ngClass]="peerCardClass(pr)"
                    >
                        <div class="flex items-center justify-between">
                            <span
                                class="text-xs font-semibold uppercase tracking-wide"
                                [ngClass]="peerStatusTextClass(pr)"
                            >
                                {{ peerStatusLabel(pr) }}
                                @if (pr.channel) {
                                    &bull; {{ getCallDuration(pr) }}
                                }
                            </span>
                            <span class="text-xs font-bold px-2 py-0.5 rounded" [ngClass]="peerBadgeClass(pr)">
                                {{ peerBadgeLabel(pr) }}
                            </span>
                        </div>
                        <span class="font-bold text-base">{{ pr.peer.peer }}</span>
                        <span class="text-sm">{{ pr.peer.name }}</span>
                        @if (pr.channel) {
                            <div class="flex items-center gap-2 mt-1">
                                <i class="fas fa-phone"></i>
                                @if (pr.channel.callTypeEnum == 'OUTBOUND') {
                                    <i class="pi pi-arrow-right"></i>
                                } @else {
                                    <i class="pi pi-arrow-left"></i>
                                }
                                <div>
                                    <div class="text-sm font-medium">{{ pr.channel.connectedNumber }}</div>
                                </div>
                            </div>
                        }
                    </div>
                </ng-template>
            </p-card>
        </div>
    `
})
export class PeerDashboard implements OnDestroy, OnInit {
    private readonly subscriptions: Subscription[] = [];
    private readonly peerRegistriesMap = signal(new Map<string, PeerRegistry>());
    private readonly now = signal(Date.now());
    private clockInterval?: ReturnType<typeof setInterval>;
    private readonly pickupGroupNames = signal(new Map<string, string>());

    readonly viewModeOptions = [
        { label: 'Unificada', value: 'unified' },
        { label: 'Departamento', value: 'department' }
    ];
    readonly viewMode = signal<'unified' | 'department'>(this.loadViewMode());

    readonly peerRegistries = computed(() =>
        Array.from(this.peerRegistriesMap().values()).sort((a, b) =>
            a.peer.peer.localeCompare(b.peer.peer, undefined, {numeric: true})
        )
    );

    readonly peersByDepartment = computed(() => {
        const names = this.pickupGroupNames();
        const groups = new Map<string, PeerRegistry[]>();
        for (const pr of this.peerRegistries()) {
            const name = (pr.peer.pickUpGroup && names.get(pr.peer.pickUpGroup)) || SEM_DEPARTAMENTO;
            groups.set(name, [...(groups.get(name) ?? []), pr]);
        }
        return Array.from(groups, ([name, peers]) => ({ name, peers })).sort((a, b) => {
            if (a.name === SEM_DEPARTAMENTO) return 1;
            if (b.name === SEM_DEPARTAMENTO) return -1;
            return a.name.localeCompare(b.name, 'pt-BR', { numeric: true, sensitivity: 'base' });
        });
    });

    readonly busyChannelsCount = computed(
        () => this.peerRegistries().filter((pr) => pr.channel?.channelStateEnum == ChannelStateEnum.UP).length
    );

    readonly registeredCount = computed(
        () =>
            this.peerRegistries().filter(
                (pr) =>
                    pr.contactStatusEventEnum === ContactStatusEventEnum.REACHABLE ||
                    pr.contactStatusEventEnum === ContactStatusEventEnum.CREATED ||
                    pr.contactStatusEventEnum === ContactStatusEventEnum.UPDATED ||
                    pr.contactStatusEventEnum === ContactStatusEventEnum.NONQUALIFIED
            ).length
    );

    constructor(
        private readonly webSocketService: WebsocketService,
        private readonly dashboardService: PeerDashboardService,
        private readonly userService: UserService,
        private readonly pickupGroupService: PickupGroupService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit() {
        this.clockInterval = setInterval(() => this.now.set(Date.now()), 1000);
        const companyId = this.userService.getUser().companyId;

        this.subscriptions.push(
            this.webSocketService.watch(`/topic/peerregistries/${companyId}`).subscribe((message) => {
                const pr: PeerRegistry = JSON.parse(message.body);
                this.peerRegistriesMap.update((map) => {
                    map.set(pr.peer.peer, pr);
                    return new Map(map);
                });
            }),
            this.webSocketService.watch(`/topic/peerregistries-removed/${companyId}`).subscribe((message) => {
                const { peer }: { peer: string } = JSON.parse(message.body);
                this.peerRegistriesMap.update((map) => {
                    map.delete(peer);
                    return new Map(map);
                });
            })
        );

        this.dashboardService
            .findPeerRegistries()
            .then((list) => {
                this.peerRegistriesMap.set(new Map(list.map((pr) => [pr.peer.peer, pr])));
            })
            .catch((error) => console.error('Erro ao carregar ramais', error));

        this.pickupGroupService
            .findAll()
            .then((groups) => this.pickupGroupNames.set(new Map(groups.map((g) => [String(g.id), g.name]))))
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao carregar grupos de captura',
                    detail: 'A visão por departamento pode estar incompleta.',
                    life: 10_000
                });
            });
    }

    setViewMode(mode: 'unified' | 'department'): void {
        this.viewMode.set(mode);
        try {
            localStorage.setItem(VIEW_MODE_KEY, mode);
        } catch {}
    }

    private loadViewMode(): 'unified' | 'department' {
        try {
            return localStorage.getItem(VIEW_MODE_KEY) === 'department' ? 'department' : 'unified';
        } catch {
            return 'unified';
        }
    }


    private isActive(pr: PeerRegistry): boolean {
        return (
            pr.contactStatusEventEnum === ContactStatusEventEnum.REACHABLE ||
            pr.contactStatusEventEnum === ContactStatusEventEnum.CREATED ||
            pr.contactStatusEventEnum === ContactStatusEventEnum.UPDATED ||
            pr.contactStatusEventEnum === ContactStatusEventEnum.NONQUALIFIED
        );
    }

    private getChannelState(pr: PeerRegistry): ChannelStateEnum | null {
        return pr.channel?.channelStateEnum ?? null;
    }

    peerCardClass(pr: PeerRegistry): string {
        const state = this.getChannelState(pr);
        if (state === ChannelStateEnum.UP) return 'border-red-500 bg-red-50 dark:bg-red-500/10';
        if (state === ChannelStateEnum.RINGING) return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-400/10';
        if (state === ChannelStateEnum.DIALING) return 'border-yellow-400 bg-yellow-50 dark:bg-yellow-400/10';
        if (!this.isActive(pr)) {
            if (pr.contactStatusEventEnum === ContactStatusEventEnum.UNREACHABLE) return 'border-orange-400 bg-orange-50 dark:bg-orange-400/10';
            return 'border-gray-200 bg-surface-50 dark:bg-surface-800';
        }
        return 'border-green-500 bg-green-50 dark:bg-green-500/10';
    }

    peerStatusTextClass(pr: PeerRegistry): string {
        const state = this.getChannelState(pr);
        if (state === ChannelStateEnum.UP) return 'text-red-500';
        if (state === ChannelStateEnum.RINGING) return 'text-yellow-500';
        if (state === ChannelStateEnum.DIALING) return 'text-yellow-500';
        if (!this.isActive(pr)) {
            if (pr.contactStatusEventEnum === ContactStatusEventEnum.UNREACHABLE) return 'text-orange-500';
            return 'text-gray-400';
        }
        return 'text-green-600';
    }

    peerStatusLabel(pr: PeerRegistry): string {
        const state = this.getChannelState(pr);
        if (state === ChannelStateEnum.UP) return 'OCUPADO';
        if (state === ChannelStateEnum.RINGING) return 'TOCANDO';
        if (state === ChannelStateEnum.DIALING) return 'DISCANDO';
        if (!this.isActive(pr)) {
            if (pr.contactStatusEventEnum === ContactStatusEventEnum.UNREACHABLE) return 'INALCANÇÁVEL';
            return '';
        }
        return 'DISPONÍVEL';
    }

    peerBadgeClass(pr: PeerRegistry): string {
        const state = this.getChannelState(pr);
        if (state === ChannelStateEnum.UP) return 'bg-red-100 text-red-600';
        if (state === ChannelStateEnum.RINGING) return 'bg-yellow-100 text-yellow-700';
        if (!this.isActive(pr)) {
            if (pr.contactStatusEventEnum === ContactStatusEventEnum.UNREACHABLE)
                return 'bg-orange-100 text-orange-600';
            return 'bg-gray-100 text-gray-500';
        }
        return 'bg-green-100 text-green-700';
    }

    peerBadgeLabel(pr: PeerRegistry): string {
        const state = this.getChannelState(pr);
        if (state === ChannelStateEnum.UP) return '';
        if (state === ChannelStateEnum.RINGING) return '';
        if (state === ChannelStateEnum.DIALING) return '';
        if (!this.isActive(pr)) return 'INATIVO';
        return 'REGISTRADO';
    }

    getCallDuration(pr: PeerRegistry): string {
        const channel = pr.channel;
        if (!channel) return '';
        const elapsedMs = this.now() - channel.timestamp;
        const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
        const mm = Math.floor(totalSeconds / 60)
            .toString()
            .padStart(2, '0');
        const ss = (totalSeconds % 60).toString().padStart(2, '0');
        return `${mm}:${ss}`;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
        clearInterval(this.clockInterval);
    }
}
