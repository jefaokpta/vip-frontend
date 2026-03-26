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

@Component({
    selector: 'app-components-dashboard',
    providers: [{ provide: WebsocketService, useFactory: rxStompServiceFactory }],
    imports: [NgForOf, NgClass],
    template: `
        <div class="flex flex-col gap-4 p-4">
            <div class="flex gap-6 mb-2">
                <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-32">
                    <span class="text-sm text-gray-500">Ramais</span>
                    <span class="font-bold text-3xl">{{ peerRegistries().length }}</span>
                </div>
                <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-32">
                    <span class="text-sm text-gray-500">Registrados</span>
                    <span class="font-bold text-3xl text-green-600">{{ registeredCount() }}</span>
                </div>
                <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-32">
                    <span class="text-sm text-gray-500">Em chamada</span>
                    <span class="font-bold text-3xl text-red-600">33</span>
                </div>
                <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-32">
                    <span class="text-sm text-gray-500">Chamando</span>
                    <span class="font-bold text-3xl text-yellow-600">22</span>
                </div>
            </div>

            <div class="flex flex-wrap gap-3">
                <div
                    *ngFor="let pr of peerRegistries()"
                    class="rounded-xl shadow px-4 py-3 min-w-28 flex flex-col items-center transition-colors duration-300"
                    [ngClass]="peerCardClass(pr, pr.peer.peer)"
                >
                    <span class="font-bold text-lg">{{ pr.peer.peer }}</span>
                    <span class="text-sm opacity-80">{{ pr.peer.name }}</span>
                    <span class="text-xs mt-1 font-medium">{{ peerStatusLabel(pr) }}</span>
                    <span class="text-xs mt-1 font-medium">{{ pr.callState?.channels?.length ?? 0 }}</span>
                </div>
            </div>
        </div>
    `
})
export class Dashboard implements OnDestroy, OnInit {
    private readonly subscriptions: Subscription[] = [];
    private readonly peerRegistriesMap = signal(new Map<string, PeerRegistry>());

    readonly peerRegistries = computed(() => Array.from(this.peerRegistriesMap().values()));

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
                console.log(callStateMessage); //todo: remove this
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
            callStateMessages.map((csm) => csm.callState).forEach(this.addCallStateOnPeerRegistries);
        });
    }

    private addCallStateOnPeerRegistries(callState: CallState) {
        console.log('ADD Call state'); //todo: remove
        this.peerRegistriesMap.update((map) => {
            callState.channels.forEach((ch) => {
                const pr = map.get(ch.peer);
                if (pr != undefined) {
                    pr.callState = callState;
                }
            });
            return map;
        });
    }

    peerCardClass(pr: PeerRegistry, peer: string): string {
        if (pr.callState) return this.peerCardClassOnCall(pr.callState, peer);
        const active =
            pr.contactStatusEventEnum === ContactStatusEventEnum.REACHABLE ||
            pr.contactStatusEventEnum === ContactStatusEventEnum.CREATED ||
            pr.contactStatusEventEnum === ContactStatusEventEnum.UPDATED ||
            pr.contactStatusEventEnum === ContactStatusEventEnum.NONQUALIFIED;

        if (!active) {
            if (pr.contactStatusEventEnum === ContactStatusEventEnum.UNREACHABLE) return 'bg-orange-400 text-white';
            return 'bg-gray-200 text-gray-700';
        }
        return 'bg-green-400 text-white';
    }

    peerCardClassOnCall(callState: CallState, peer: string): string {
        const channel = callState.channels.find((ch) => ch.peer === peer);
        if (!channel) return 'bg-gray-200 text-gray-700';
        switch (channel.channelStateEnum) {
            case ChannelStateEnum.RINGING:
                return 'bg-yellow-400 text-white';
            case ChannelStateEnum.UP:
                return 'bg-red-400 text-white';
            case ChannelStateEnum.DOWN:
                return 'bg-gray-400 text-gray-700';
            default:
                return 'bg-green-400 text-white';
        }
    }

    peerStatusLabel(pr: PeerRegistry): string {
        switch (pr.contactStatusEventEnum) {
            case ContactStatusEventEnum.REACHABLE:
            case ContactStatusEventEnum.CREATED:
            case ContactStatusEventEnum.UPDATED:
            case ContactStatusEventEnum.NONQUALIFIED:
                return 'Disponível';
            case ContactStatusEventEnum.UNREACHABLE:
                return 'Inacessível';
            case ContactStatusEventEnum.REMOVED:
                return 'Removido';
            default:
                return 'Desconhecido';
        }
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }
}
