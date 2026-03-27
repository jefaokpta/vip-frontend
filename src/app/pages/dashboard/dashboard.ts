import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from '@/websocket/stomp/websocket.service';
import { rxStompServiceFactory } from '@/websocket/stomp/rx-stomp-service-factory';
import {
    CallMessageActionEnum,
    CallState,
    CallStateMessage,
    ChannelStateEnum,
    ContactStatusEventEnum,
    PeerRegistry
} from '@/pabx/types';
import { DashboardService } from '@/pages/dashboard/dashboard.service';
import { UserService } from '@/pages/users/user.service';
import { NgClass, NgForOf } from '@angular/common';
import { Card } from 'primeng/card';

@Component({
    selector: 'app-components-dashboard',
    providers: [{ provide: WebsocketService, useFactory: rxStompServiceFactory }],
    imports: [NgForOf, NgClass, Card],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Controle de Ramais</span>
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

                <div class="flex flex-wrap gap-3">
                    <div
                        *ngFor="let pr of peerRegistries()"
                        class="rounded-xl shadow px-4 py-3 w-56 flex flex-col gap-1 transition-all duration-300 border-l-4"
                        [ngClass]="peerCardBorderClass(pr)"
                    >
                        <div class="flex items-center justify-between">
                            <span
                                class="text-xs font-semibold uppercase tracking-wide"
                                [ngClass]="peerStatusTextClass(pr)"
                            >
                                {{ peerStatusLabel(pr) }}
                                @if (pr.callState) {
                                    &bull; {{ getCallDuration(pr) }}
                                }
                            </span>
                            <span class="text-xs font-bold px-2 py-0.5 rounded" [ngClass]="peerBadgeClass(pr)">
                                {{ peerBadgeLabel(pr) }}
                            </span>
                        </div>
                        <span class="font-bold text-base">{{ pr.peer.peer }}</span>
                        <span class="text-sm">{{ pr.peer.name }}</span>
                        @if (pr.callState && getOtherPeer(pr)) {
                            <div class="flex items-center gap-2 mt-1">
                                <i class="fas fa-phone"></i>
                                <div>
                                    <div class="text-sm font-medium">{{ getOtherPeer(pr) }}</div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </p-card>
    `
})
export class Dashboard implements OnDestroy, OnInit {
    private readonly subscriptions: Subscription[] = [];
    private readonly peerRegistriesMap = signal(new Map<string, PeerRegistry>());
    private readonly now = signal(Date.now());
    private clockInterval?: ReturnType<typeof setInterval>;

    readonly peerRegistries = computed(() => Array.from(this.peerRegistriesMap().values()));
    readonly channels = computed(() => this.peerRegistries().flatMap((pr) => pr.callState?.channels ?? []));

    readonly busyChannelsCount = computed(() => {
        const seen = new Set<string>();
        return this.channels().filter(
            (ch) =>
                ch.channelStateEnum === ChannelStateEnum.UP &&
                !seen.has(ch.uniqueId) &&
                seen.add(ch.uniqueId) !== undefined
        ).length;
    });

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
        private readonly dashboardService: DashboardService,
        private readonly userService: UserService
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
            })
        );

        this.subscriptions.push(
            this.webSocketService.watch(`/topic/callstates/${companyId}`).subscribe((message) => {
                const callStateMessage: CallStateMessage = JSON.parse(message.body);
                if (callStateMessage.callMessageActionEnum == CallMessageActionEnum.REMOVE) {
                    this.peerRegistriesMap.update((map) => {
                        callStateMessage.callState.channels.forEach((ch) => {
                            const pr = map.get(ch.peer);
                            if (pr != undefined) {
                                pr.callState = undefined;
                            }
                        });
                        return new Map(map);
                    });
                    return;
                }
                this.addCallStateOnPeerRegistries(callStateMessage.callState);
            })
        );

        this.dashboardService.findPeerRegistries().then((list) => {
            this.peerRegistriesMap.set(new Map(list.map((pr) => [pr.peer.peer, pr])));
        });

        this.dashboardService.findCallStates().then((callStateMessages) => {
            callStateMessages.map((csm) => csm.callState).forEach((cs) => this.addCallStateOnPeerRegistries(cs));
        });
    }

    private addCallStateOnPeerRegistries(callState: CallState) {
        this.peerRegistriesMap.update((map) => {
            this.peerRegistries() // zerando todas as chamadas deste callstate, caso channels tenham deixado a call (transferencia)
                .filter((pr) => pr.callState?.uniqueId == callState.uniqueId)
                .forEach((pr) => (pr.callState = undefined));
            callState.channels.forEach((ch) => {
                const pr = map.get(ch.peer);
                if (pr != undefined) {
                    pr.callState = callState;
                }
            });
            return new Map(map);
        });
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
        if (!pr.callState) return null;
        return pr.callState.channels.find((ch) => ch.peer === pr.peer.peer)?.channelStateEnum ?? null;
    }

    peerCardBorderClass(pr: PeerRegistry): string {
        const state = this.getChannelState(pr);
        if (state === ChannelStateEnum.UP) return 'border-red-500';
        if (state === ChannelStateEnum.RINGING) return 'border-yellow-400';
        if (state === ChannelStateEnum.DIALING) return 'border-yellow-400';
        if (!this.isActive(pr)) {
            if (pr.contactStatusEventEnum === ContactStatusEventEnum.UNREACHABLE) return 'border-orange-400';
            return 'border-gray-200';
        }
        return 'border-green-500';
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

    getOtherPeer(pr: PeerRegistry): string | null {
        if (!pr.callState) return null;
        const other = pr.callState.channels.find((ch) => ch.peer !== pr.peer.peer);
        return other?.peer ?? null;
    }

    getCallDuration(pr: PeerRegistry): string {
        if (!pr.callState) return '';
        const ownChannel = pr.callState.channels.find((ch) => ch.peer === pr.peer.peer);
        if (!ownChannel) return '';
        const elapsedMs = this.now() - ownChannel.timestamp;
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
