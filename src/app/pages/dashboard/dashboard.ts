import {Component, OnDestroy} from '@angular/core';
import {Subscription} from "rxjs";
import {WebsocketService} from "@/websocket/stomp/websocket.service";
import {rxStompServiceFactory} from "@/websocket/stomp/rx-stomp-service-factory";
import {Card} from "primeng/card";
import {Channel, Worker} from "@/types/types";

@Component({
    selector: 'app-components-dashboard',
    providers: [{provide: WebsocketService, useFactory: rxStompServiceFactory}],
    imports: [Card],
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
                        <p-card header="Worker 1"/>
                        <p-card header="Worker 2"/>
                    </div>
                </p-card>
            </div>
        </div>
    `
})
export class Dashboard implements OnDestroy {
    private readonly webSocketSubscription: Subscription;
    private readonly workers: Map<string, Worker> = new Map();
    totalCalls: number = 0;

    constructor(private readonly webSocketService: WebsocketService) {
        this.webSocketSubscription = this.webSocketService.watch("/topic/active-channels").subscribe(message => {
            const channel: Channel = JSON.parse(message.body);
            if (channel.action === "ADD_CHANNEL") this.addChannel(channel);
            else this.removeChannel(channel);
            this.totalCalls = Array.from(this.workers.values())
                .reduce((acc, w) => acc + w.channelMessages.length, 0);
        })
    }

    private addChannel(channel: Channel) {
        const worker = this.workers.get(channel.workerId) ?? {
            id: channel.workerId,
            channelMessages: [],
            maxChannels: 0,
            isReady: true
        };
        worker.channelMessages.push(channel);
        this.workers.set(channel.workerId, worker);
    }

    private removeChannel(channel: Channel) {
        const worker = this.workers.get(channel.workerId)
        if (!worker) return;
        const index = worker.channelMessages.findIndex(c => c.channelId === channel.channelId);
        if (index !== -1) worker.channelMessages.splice(index, 1);
    }

    ngOnDestroy(): void {
        this.webSocketSubscription.unsubscribe();
    }
}
