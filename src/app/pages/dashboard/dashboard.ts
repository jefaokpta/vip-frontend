import {Component, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";
import {WebsocketService} from "@/websocket/stomp/websocket.service";
import {rxStompServiceFactory} from "@/websocket/stomp/rx-stomp-service-factory";
import {Card} from "primeng/card";
import {Channel, Worker} from "@/types/types";
import {NgForOf} from "@angular/common";
import {BadgeModule} from "primeng/badge";

@Component({
    selector: 'app-components-dashboard',
    providers: [{provide: WebsocketService, useFactory: rxStompServiceFactory}],
    imports: [Card, NgForOf, BadgeModule],
    template: `
        <div class="grid grid-cols-12 gap-8">
            <div class="col-span-12 xl:col-span-9">
                <p-card header="Total de chamadas">
                    <span class="font-semibold text-4xl">{{ totalCalls }}</span>
                </p-card>
            </div>
            <div class="col-span-12 xl:col-span-9">
                <p-card header="Workers">
                    <div class="flex gap-4">
                        <p-card *ngFor="let worker of workers" header="{{ worker.id }}">
                            <div class="flex flex-col gap-2">
                                <p-badge [severity]="worker.isReady ? 'success' : 'danger'" value="Ativo"></p-badge>
                                <span class="text-2xl">Canais: {{ worker.maxChannels }}</span>
                            </div>
                        </p-card>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class Dashboard implements OnDestroy {
    private readonly webSocketSubscription: Subscription;
    private readonly workersMap: Map<string, Worker> = new Map();
    totalCalls: number = 0;
    workers: Worker[] = Array.from(this.workersMap.values())

    // workers: Worker[] = [
    //     {id: "WORKER1", channelMessages: [], maxChannels: 0, isReady: true},
    //     {id: "WORKER2", channelMessages: [], maxChannels: 0, isReady: false}
    // ];

    constructor(private readonly webSocketService: WebsocketService) {
        this.webSocketSubscription = this.webSocketService.watch("/topic/active-channels").subscribe(message => {
            const channel: Channel = JSON.parse(message.body);
            if (channel.action === "ADD_CHANNEL") this.addChannel(channel);
            else this.removeChannel(channel);
            this.totalCalls = Array.from(this.workersMap.values())
                .reduce((acc, w) => acc + w.channelMessages.length, 0);
        })
    }

    private addChannel(channel: Channel) {
        const worker = this.workersMap.get(channel.workerId) ?? {
            id: channel.workerId,
            channelMessages: [],
            maxChannels: 0,
            isReady: true
        };
        worker.channelMessages.push(channel);
        this.workersMap.set(channel.workerId, worker);
    }

    private removeChannel(channel: Channel) {
        const worker = this.workersMap.get(channel.workerId)
        if (!worker) return;
        const index = worker.channelMessages.findIndex(c => c.channelId === channel.channelId);
        if (index !== -1) worker.channelMessages.splice(index, 1);
    }

    ngOnDestroy(): void {
        this.webSocketSubscription.unsubscribe();
    }
}
