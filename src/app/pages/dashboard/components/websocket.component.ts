import {Component, OnDestroy} from "@angular/core";
import {WebsocketService} from "@/websocket/stomp/websocket.service";
import {Subscription} from "rxjs";
import {rxStompServiceFactory} from "@/websocket/stomp/rx-stomp-service-factory";

@Component({
    selector: 'app-websocket',
    providers: [{provide: WebsocketService, useFactory: rxStompServiceFactory}],
    template: '<p>websocket works!</p>'
})
export class WebsocketComponent implements OnDestroy {

    private readonly webSocketSubscription: Subscription;

    constructor(private readonly webSocketService: WebsocketService) {
        this.webSocketSubscription = this.webSocketService.watch("/topic/active-channels").subscribe(message => {
            console.log(message);
            console.log(message.body);
        })
    }

    ngOnDestroy(): void {
        this.webSocketSubscription.unsubscribe();
    }
}
