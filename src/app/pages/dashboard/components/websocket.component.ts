import {Component, OnDestroy, OnInit} from "@angular/core";
import {WebsocketService} from "@/websocket/stomp/websocket.service";
import {Subscription} from "rxjs";
import {rxStompServiceFactory} from "@/websocket/stomp/rx-stomp-service-factory";

@Component({
    selector: 'app-websocket',
    providers: [{provide: WebsocketService, useFactory: rxStompServiceFactory}],
    template: '<p>websocket works!</p>'
})
export class WebsocketComponent implements OnInit, OnDestroy {

    private readonly webSocketSubscription: Subscription;

    constructor(private readonly webSocketService: WebsocketService) {
        this.webSocketSubscription = this.webSocketService.watch("/topic").subscribe(message => {
            console.log(message);
        })
    }

    ngOnInit(): void {

    }

    ngOnDestroy(): void {
        this.webSocketSubscription.unsubscribe();
    }
}
