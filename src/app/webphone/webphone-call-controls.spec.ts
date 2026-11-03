import {TestBed} from '@angular/core/testing';
import {signal} from '@angular/core';
import {WebphoneService} from './webphone.service';
import {WebphoneSidebarComponent} from './webphone-sidebar.component';
import {CallHistoryService} from './call-history.service';
import {UserService} from '@/pages/users/user.service';
import {LayoutService} from '@/layout/service/layout.service';
import {PhoneStateEnum} from '@/types/phone-state-enum';

describe('Webphone controles de chamada', () => {
    let service: WebphoneService;
    let session: { sendDTMF: jasmine.Spy; terminate: jasmine.Spy };

    function setCall(state: PhoneStateEnum) {
        (service as any).updatePhoneStatus({ state, session });
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: CallHistoryService, useValue: { add: () => {}, history: signal([]) } },
                {
                    provide: UserService,
                    useValue: { getUser: () => ({}), getWebphoneRegisterSignal: () => ({}) }
                },
                { provide: LayoutService, useValue: { layoutState: signal({ webphoneSidebarVisible: false }) } }
            ]
        });
        service = TestBed.inject(WebphoneService);
        session = { sendDTMF: jasmine.createSpy('sendDTMF'), terminate: jasmine.createSpy('terminate') };
        setCall(PhoneStateEnum.TALKING);
        jasmine.clock().install();
        jasmine.clock().mockDate(new Date(2026, 10, 3, 10, 0, 0));
    });

    afterEach(() => jasmine.clock().uninstall());

    describe('serviço', () => {
        it('transferência cega envia *1, abre o teclado e marca o modo', () => {
            service.startTransfer('blind');
            expect(session.sendDTMF).toHaveBeenCalledOnceWith('*1');
            expect(service.dialpadVisible()).toBeTrue();
            expect(service.transferMode()).toBe('blind');
        });

        it('transferência assistida envia *2', () => {
            service.startTransfer('attended');
            expect(session.sendDTMF).toHaveBeenCalledOnceWith('*2');
            expect(service.transferMode()).toBe('attended');
        });

        it('estacionar envia *7 sem abrir o teclado', () => {
            service.park();
            expect(session.sendDTMF).toHaveBeenCalledOnceWith('*7');
            expect(service.dialpadVisible()).toBeFalse();
        });

        it('ignora segundo clique em até 1 segundo e aceita depois', () => {
            service.startTransfer('blind');
            jasmine.clock().tick(999);
            service.startTransfer('blind');
            service.park();
            expect(session.sendDTMF).toHaveBeenCalledTimes(1);
            jasmine.clock().tick(1);
            service.startTransfer('blind');
            expect(session.sendDTMF).toHaveBeenCalledTimes(2);
        });

        it('não envia comandos fora de conversa', () => {
            setCall(PhoneStateEnum.INCOMING_CALL);
            service.startTransfer('blind');
            service.park();
            expect(session.sendDTMF).not.toHaveBeenCalled();
            expect(service.transferMode()).toBeNull();
        });

        it('acumula dígitos e não inclui o comando', () => {
            service.startTransfer('blind');
            service.sendDTMF('1');
            service.sendDTMF('2');
            expect(service.dialedDigits()).toBe('12');
        });

        it('nova transferência limpa os dígitos', () => {
            service.sendDTMF('9');
            service.startTransfer('attended');
            expect(service.dialedDigits()).toBe('');
        });

        it('fechar o teclado remove o aviso', () => {
            service.startTransfer('blind');
            service.toggleDialpad();
            expect(service.dialpadVisible()).toBeFalse();
            expect(service.transferMode()).toBeNull();
        });

        it('fim da chamada limpa tudo', () => {
            service.startTransfer('blind');
            service.sendDTMF('1');
            (service as any).updatePhoneStatus({ state: PhoneStateEnum.AVAILABLE, session: undefined });
            expect(service.dialedDigits()).toBe('');
            expect(service.transferMode()).toBeNull();
            expect(service.dialpadVisible()).toBeFalse();
        });
    });

    describe('teclado físico', () => {
        function press(key: string, init: KeyboardEventInit = {}, target: EventTarget = document) {
            target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
        }

        beforeEach(() => {
            TestBed.createComponent(WebphoneSidebarComponent);
        });

        it('envia números, * e # com o painel fechado', () => {
            ['5', '*', '#'].forEach((key) => press(key));
            expect(session.sendDTMF.calls.allArgs()).toEqual([['5'], ['*'], ['#']]);
        });

        it('ignora outras teclas, atalhos e repetição', () => {
            press('a');
            press('1', { ctrlKey: true });
            press('1', { repeat: true });
            expect(session.sendDTMF).not.toHaveBeenCalled();
        });

        it('ignora digitação em campos de formulário', () => {
            const input = document.createElement('input');
            document.body.appendChild(input);
            press('1', {}, input);
            input.remove();
            expect(session.sendDTMF).not.toHaveBeenCalled();
        });

        it('ignora quando não está em conversa', () => {
            setCall(PhoneStateEnum.INCOMING_CALL);
            press('1');
            expect(session.sendDTMF).not.toHaveBeenCalled();
        });
    });
});
