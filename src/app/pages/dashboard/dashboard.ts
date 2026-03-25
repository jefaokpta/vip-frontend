import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from '@/websocket/stomp/websocket.service';
import { rxStompServiceFactory } from '@/websocket/stomp/rx-stomp-service-factory';
import { CallState, Channel, ChannelStateEnum, PeerRegistry } from '@/pabx/types';
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
                    <span class="font-bold text-3xl text-red-600">{{ busyCount() }}</span>
                </div>
                <div class="bg-white rounded-xl shadow p-4 flex flex-col items-center min-w-32">
                    <span class="text-sm text-gray-500">Chamando</span>
                    <span class="font-bold text-3xl text-yellow-600">{{ ringingCount() }}</span>
                </div>
            </div>

            <div class="flex flex-wrap gap-3">
                <div
                    *ngFor="let pr of peerRegistries()"
                    class="rounded-xl shadow px-4 py-3 min-w-28 flex flex-col items-center transition-colors duration-300"
                    [ngClass]="peerCardClass(pr)"
                >
                    <span class="font-bold text-lg">{{ pr.peer.peer }}</span>
                    <span class="text-sm opacity-80">{{ pr.peer.name }}</span>
                    <span class="text-xs mt-1 font-medium">{{ peerStatusLabel(pr) }}</span>
                </div>
            </div>
        </div>
    `
})
export class Dashboard implements OnDestroy, OnInit {
    private readonly subscriptions: Subscription[] = [];
    private readonly peerRegistriesMap = signal(new Map<string, PeerRegistry>());
    private readonly callStatesMap = signal(new Map<string, CallState>());

    readonly peerRegistries = computed(() => Array.from(this.peerRegistriesMap().values()));

    readonly busyPeers = computed(() => {
        const busy = new Set<string>();
        for (const cs of this.callStatesMap().values()) {
            for (const ch of cs.channels) {
                if (ch.channelStateEnum === ChannelStateEnum.UP) {
                    busy.add(ch.peer);
                }
            }
        }
        return busy;
    });

    readonly ringingPeers = computed(() => {
        const ringing = new Set<string>();
        for (const cs of this.callStatesMap().values()) {
            for (const ch of cs.channels) {
                if (ch.channelStateEnum === ChannelStateEnum.RINGING) {
                    ringing.add(ch.peer);
                }
            }
        }
        return ringing;
    });

    readonly registeredCount = computed(() => this.peerRegistries().filter((pr) => !!pr.registerId).length);
    readonly busyCount = computed(() => this.busyPeers().size);
    readonly ringingCount = computed(() => this.ringingPeers().size);

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
                const cs: CallState = JSON.parse(message.body);
                this.callStatesMap.update((map) => {
                    const allChannelsDown = cs.channels.every(
                        (ch: Channel) => ch.channelStateEnum === ChannelStateEnum.DOWN
                    );
                    if (allChannelsDown) {
                        map.delete(cs.uniqueId);
                    } else {
                        map.set(cs.uniqueId, cs);
                    }
                    return new Map(map);
                });
            })
        );

        this.dashboardService.findPeerRegistries().then((list) => {
            this.peerRegistriesMap.set(new Map(list.map((pr) => [pr.peer.peer, pr])));
        });

        this.dashboardService.findCallStates().then((list) => {
            this.callStatesMap.set(new Map(list.map((cs) => [cs.uniqueId, cs])));
        });
    }

    peerCardClass(pr: PeerRegistry): string {
        if (!pr.registerId) return 'bg-gray-200 text-gray-700';
        if (this.busyPeers().has(pr.peer.peer)) return 'bg-red-400 text-white';
        if (this.ringingPeers().has(pr.peer.peer)) return 'bg-yellow-300 text-yellow-900';
        return 'bg-green-400 text-white';
    }

    peerStatusLabel(pr: PeerRegistry): string {
        if (!pr.registerId) return 'Não registrado';
        if (this.busyPeers().has(pr.peer.peer)) return 'Em chamada';
        if (this.ringingPeers().has(pr.peer.peer)) return 'Chamando';
        return 'Disponível';
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach((s) => s.unsubscribe());
    }
}
