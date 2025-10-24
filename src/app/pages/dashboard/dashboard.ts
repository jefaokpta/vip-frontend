import {Component, computed, OnDestroy, OnInit, signal} from '@angular/core';
import {Subscription} from "rxjs";
import {WebsocketService} from "@/websocket/stomp/websocket.service";
import {rxStompServiceFactory} from "@/websocket/stomp/rx-stomp-service-factory";
import {Card} from "primeng/card";
import {Channel, Worker} from "@/types/types";
import {NgForOf} from "@angular/common";
import {BadgeModule} from "primeng/badge";
import {HttpClientService} from "@/services/http-client.service";

@Component({
    selector: 'app-components-dashboard',
    providers: [{provide: WebsocketService, useFactory: rxStompServiceFactory}],
    imports: [Card, NgForOf, BadgeModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12 xl:col-span-9">
                <p-card header="Total de chamadas">
                    <span class="font-semibold text-4xl">{{ totalCalls() }}</span>
                </p-card>
            </div>
            <div class="col-span-12 xl:col-span-9">
                <p-card header="Workers">
                    <div class="flex gap-4">
                        <p-card *ngFor="let worker of workers()" header="{{ worker.id }}">
                            <div class="flex flex-col gap-2">
                                <p-badge [severity]="worker.isReady ? 'success' : 'danger'" value="Ativo"></p-badge>
                                <span>Limite: {{ worker.maxChannels }}</span>
                                <span class="text-2xl">Ativos: {{ worker.channelMessages.length }}</span>
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
    readonly workers = computed(() => Array.from(this.workersMap().values()));
    readonly totalCalls = computed(() => this.workers().reduce((acc, w) => acc + w.channelMessages.length, 0));

    constructor(
        private readonly webSocketService: WebsocketService,
        private readonly httpClientService: HttpClientService
    ) {
        this.webSocketSubscription = this.webSocketService.watch("/topic/active-channels").subscribe(message => {
            const channel: Channel = JSON.parse(message.body);
            if (channel.action === "ADD_CHANNEL") this.addChannel(channel);
            else this.removeChannel(channel);
        })
    }

    ngOnInit() {
        this.httpClientService.findWorkers().then(workers => {
            this.workersMap.set(new Map(workers.map(worker => [worker.id, worker])));
        })
    }

    private addChannel(channel: Channel) {
        this.workersMap.update(map => {
            const newMap = new Map(map);
            const worker = newMap.get(channel.workerId);
            if (worker) {
                worker.channelMessages.push(channel);
            } else {
                newMap.set(channel.workerId, {
                    id: channel.workerId,
                    channelMessages: [channel],
                    maxChannels: 0,
                    isReady: true
                });
            }
            return newMap;
        });
    }

    private removeChannel(channel: Channel) {
        this.workersMap.update(map => {
            const newMap = new Map(map);
            const worker = newMap.get(channel.workerId);
            if (!worker) return newMap;
            const index = worker.channelMessages.findIndex(c => c.channelId === channel.channelId);
            if (index !== -1) worker.channelMessages.splice(index, 1);
            return newMap;
        });
    }

    ngOnDestroy(): void {
        this.webSocketSubscription.unsubscribe();
    }
}
