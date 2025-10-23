import {WebsocketService} from "./websocket.service";
import {myRxStompConfig} from "./rx-stomp-config";


export function rxStompServiceFactory() {
    const rxStomp = new WebsocketService()
    rxStomp.configure(myRxStompConfig)
    rxStomp.activate()
    return rxStomp
}
