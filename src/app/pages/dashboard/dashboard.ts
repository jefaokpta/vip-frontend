import { Component, computed, OnDestroy, OnInit, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { WebsocketService } from '@/websocket/stomp/websocket.service';
import { rxStompServiceFactory } from '@/websocket/stomp/rx-stomp-service-factory';
import { Card } from 'primeng/card';
import { Worker } from '@/types/types';
import { NgForOf } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { DashboardService } from '@/pages/dashboard/dashboard.service';
import { Peer, PeerStateEnum } from '@/pabx/types';

@Component({
    selector: 'app-components-dashboard',
    providers: [{ provide: WebsocketService, useFactory: rxStompServiceFactory }],
    imports: [Card, NgForOf, BadgeModule],
    template: `
        <div class="flex flex-col gap-4">
            <div class="flex justify-around">
                <div>
                    <p-card header="Total de chamadas">
                        <span class="font-semibold text-4xl">{{ totalCalls() }}</span>
                    </p-card>
                </div>
                <div>
                    <p-card header="Máximo de canais">
                        <span class="font-semibold text-4xl">{{ sumMaxChannels() }}</span>
                    </p-card>
                </div>
                <div>
                    <p-card header="Maximo de registros">
                        <span class="font-semibold text-4xl">3000</span>
                    </p-card>
                </div>
            </div>

            <div class="col-span-12 xl:col-span-9">
                <p-card header="Workers">
                    <div class="flex gap-4">
                        <p-card *ngFor="let worker of workers()" header="{{ worker.name }}">
                            <div class="flex flex-col text-center gap-2">
                                <p-badge [severity]="worker.isReady ? 'success' : 'danger'" value="Ativo"></p-badge>
                                <span>Limite: {{ worker.maxChannels }}</span>
                                <span>Ativos</span>
                                <span class="text-2xl">{{ worker.channelIds.length }}</span>
                            </div>
                        </p-card>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class Dashboard implements OnDestroy, OnInit {
    private readonly webSocketSubscription: Subscription;
    private readonly workersMap = signal(new Map<string, Worker>());
    private readonly peersMap = signal(new Map<string, Peer>());
    readonly workers = computed(() => Array.from(this.workersMap().values()));
    readonly peers = computed(() => Array.from(this.peersMap().values()));
    readonly totalCalls = computed(() => this.workers().reduce((acc, w) => acc + w.channelIds.length, 0));

    constructor(
        private readonly webSocketService: WebsocketService,
        private readonly httpClientService: DashboardService
    ) {
        this.webSocketSubscription = this.webSocketService.watch('/topic/workers').subscribe((message) => {
            const worker: Worker = JSON.parse(message.body);
            this.workersMap.update((workers) => {
                workers.set(worker.name, worker);
                return new Map(workers);
            });
        });

        this.webSocketService.watch('/topic/peers').subscribe((message) => {
            const peer: Peer = JSON.parse(message.body);
            this.peersMap.update((peers) => {
                peers.set(peer.peer, peer);
                return new Map(peers);
            });
        });
    }

    ngOnInit() {
        this.httpClientService.findWorkers().then((workers) => {
            this.workersMap.set(new Map(workers.map((worker) => [worker.name, worker])));
        });
        this.httpClientService.findPeersByCompany('100023').then((peers) => {
            this.peersMap.set(new Map(peers.map((peer) => [peer.peer, peer])));
        });
    }

    peerStateSeverity(peerStateEnum: PeerStateEnum) {
        switch (peerStateEnum) {
            case PeerStateEnum.NOT_INUSE:
                return 'success';
            case PeerStateEnum.BUSY:
            case PeerStateEnum.INUSE:
                return 'danger';
            case PeerStateEnum.RINGING:
            case PeerStateEnum.RINGINUSE:
            case PeerStateEnum.ONHOLD:
                return 'warn';
            default:
                return 'info';
        }
    }

    sumMaxChannels() {
        return this.workers()
            .filter((w) => w.isReady)
            .reduce((acc, w) => acc + w.maxChannels, 0);
    }

    ngOnDestroy(): void {
        this.webSocketSubscription.unsubscribe();
    }
}
