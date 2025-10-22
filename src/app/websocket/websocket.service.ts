/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/30/25
 */
import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Observable } from 'rxjs';
import { User, WsEvent } from '@/types/types';
import { UserService } from '@/services/user.service';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {
    user: User;

    constructor(
        private readonly socket: Socket,
        private readonly userService: UserService
    ) {
        this.user = this.userService.getUser();
        if (!this.socket.ioSocket.connected) {
            this.socket.connect();
        }
    }

    sendMessage(msg: string) {
        this.socket.emit('message', msg);
    }

    backendEvent(): Observable<WsEvent> {
        return this.socket.fromEvent(this.user.controlNumber);
    }
}
