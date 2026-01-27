/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 5/2/25
 */
import { Injectable, signal } from '@angular/core';
import { UA, WebSocketInterface } from 'jssip';
import { environment } from '../../environments/environment';
import { PhoneState, PhoneStateEnum } from '@/types/types';
import { RTCSession } from 'jssip/lib/RTCSession';
import { RTCSessionEvent, UnRegisteredEvent } from 'jssip/lib/UA';

@Injectable({
    providedIn: 'root'
})
export class WebphoneService {
    private readonly PABX_URL = environment.PABX_URL;
    private readonly ua: UA;
    private readonly phoneState = signal<PhoneState>({ state: PhoneStateEnum.INITIALIZING });
    private readonly callTimer = signal(0);
    private callTimerInterval: any;
    private readonly audio = new Audio();

    private updatePhoneStatus(newState: Partial<PhoneState>) {
        this.phoneState.update((state) => ({ ...state, ...newState }));
    }
    readonly phoneState$ = this.phoneState.asReadonly();

    constructor() {
        const socket = new WebSocketInterface(`wss://${this.PABX_URL}:8089/ws`);
        const config = {
            uri: `sip:web@${this.PABX_URL}`,
            password: `jefao123`,
            authorization_user: 'credencial',
            sockets: [socket],
            register: true
        };
        this.ua = new UA(config);

        this.ua.on('connected', () => {
            console.log('SIP: ' + new Date().toLocaleString('pt-BR') + ' Conectado ao servidor');
            this.updatePhoneStatus({ state: PhoneStateEnum.CONNECTED });
        });
        this.ua.on('disconnected', () => {
            console.log('SIP: ' + new Date().toLocaleString('pt-BR') + ' Desconectado do servidor');
            this.updatePhoneStatus({ state: PhoneStateEnum.DISCONNECTED });
        });
        this.ua.on('registered', () => {
            console.log('SIP: ' + new Date().toLocaleString('pt-BR') + ' Registrado com sucesso');
            this.updatePhoneStatus({ state: PhoneStateEnum.AVAILABLE });
        });
        this.ua.on('registrationFailed', (event: UnRegisteredEvent) => {
            console.error('SIP: ' + new Date().toLocaleString('pt-BR') + ' Falha no registro', event);
            this.updatePhoneStatus({ state: PhoneStateEnum.REGISTRATION_FAILED });
        });
        this.ua.on('newRTCSession', (event: RTCSessionEvent) => {
            const session = event.session;
            window.addEventListener('beforeunload', () => this.preventCloseInCall(), { once: true });
            if (event.originator === 'local') {
                this.attachAudioToSession(session);
            } else {
                console.trace('SIP: ' + new Date().toLocaleString('pt-BR') + ' Iniciou sessao de entrada');
                this.incommingSession(session);
            }
        });

        this.ua.start();
    }

    async makeCall(telephone: string) {
        if (this.ua) {
            const options = {
                eventHandlers: this.callEventHandlers(),
                mediaConstraints: { audio: true, video: false },
                extraHeaders: [`X-CALL-TOKEN: TOKEN_PLACEHOLDER`]
            };
            const target = `sip:${telephone}@${this.PABX_URL}`;
            this.updatePhoneStatus({ session: this.ua.call(target, options) });
        }
    }

    sendDTMF(digit: string) {
        this.phoneState().session?.sendDTMF(digit);
    }

    hangup() {
        this.phoneState().session?.terminate();
    }

    answerCall() {
        this.phoneState().session?.answer();
    }

    toggleMute() {
        if (this.phoneState().session?.isMuted().audio) {
            this.phoneState().session?.unmute();
        } else {
            this.phoneState().session?.mute();
        }
    }

    callTimeFormated() {
        const minutes = Math.floor(this.callTimer() / 60)
            .toString()
            .padStart(2, '0');
        const seconds = (this.callTimer() % 60).toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }

    private callEventHandlers() {
        return {
            progress: () => {
                console.log('SIP: ' + new Date().toLocaleString('pt-BR') + ' Iniciando chamada');
                this.updatePhoneStatus({ state: PhoneStateEnum.CALLING });
            },
            failed: (e: any) => {
                console.log(
                    'SIP: ' +
                        new Date().toLocaleString('pt-BR') +
                        `Call falhou originator: ${e.originator} cause: ${e.cause}`
                );
                this.audio.src = '/audios/blip.mp3';
                this.audio.play();
                this.updatePhoneStatus({ state: PhoneStateEnum.AVAILABLE, session: undefined });
                this.stopCallTimer();
            },
            ended: (e: any) => {
                console.log(
                    'SIP: ' +
                        new Date().toLocaleString('pt-BR') +
                        `Call terminou originator: ${e.originator} with cause: ${e.cause}`
                );
                this.audio.src = '/audios/blip.mp3';
                this.audio.play();
                this.updatePhoneStatus({ state: PhoneStateEnum.AVAILABLE, session: undefined });
                this.stopCallTimer();
            },
            confirmed: () => {
                console.log('SIP: ' + new Date().toLocaleString('pt-BR') + ' Call atendida');
                this.updatePhoneStatus({ state: PhoneStateEnum.TALKING });
                this.startCallTimer();
            }
        };
    }

    private preventCloseInCall() {
        console.log('Impedindo fechamento da janela durante chamada');
        if (
            this.phoneState().state === PhoneStateEnum.TALKING ||
            this.phoneState().state === PhoneStateEnum.CALLING ||
            this.phoneState().state === PhoneStateEnum.INCOMING_CALL
        ) {
            this.hangup();
        }
    }

    private incommingSession(session: RTCSession) {
        this.audio.src = '/audios/calling.mp3';
        this.audio.play();
        this.updatePhoneStatus({ state: PhoneStateEnum.INCOMING_CALL, session });
        session.on('connecting', () => console.log('connecting'));
        session.on('peerconnection', () => {
            console.log('peerconnection');
            this.attachAudioToSession(session);
        });
        session.on('accepted', () => {
            console.log('accepted');
            this.audio.pause();
            this.updatePhoneStatus({ state: PhoneStateEnum.TALKING });
            this.startCallTimer();
        });
        session.on('confirmed', () => console.log(' confirmed'));
        session.on('ended', () => {
            console.log('ended');
            this.audio.src = '/audios/blip.mp3';
            this.audio.play();
            this.updatePhoneStatus({ state: PhoneStateEnum.AVAILABLE, session: undefined });
            this.stopCallTimer();
        });
        session.on('failed', () => {
            console.log('failed');
            this.audio.pause();
            this.updatePhoneStatus({ state: PhoneStateEnum.AVAILABLE, session: undefined });
            this.stopCallTimer();
        });
    }

    private attachAudioToSession(session: RTCSession) {
        session.connection.addEventListener('addstream', (e: any) => {
            console.log('SIP: ' + new Date().toLocaleString('pt-BR') + ' remote audio stream adicionado');
            const audio = new Audio();
            audio.srcObject = e.stream;
            audio.play();
        });
    }

    private startCallTimer() {
        this.callTimerInterval = setInterval(() => {
            this.callTimer.update((time) => time + 1);
        }, 1000);
    }

    private stopCallTimer() {
        this.callTimer.set(0);
        clearInterval(this.callTimerInterval);
    }
}
