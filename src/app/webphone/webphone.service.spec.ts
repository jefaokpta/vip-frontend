import {TestBed} from '@angular/core/testing';
import {WebphoneService} from './webphone.service';
import {CallHistoryService} from './call-history.service';
import {UserService} from '@/pages/users/user.service';
import {CallHistoryType} from '@/types/call-history';

class FakeSession {
    private readonly handlers: Record<string, () => void> = {};
    remote_identity = { uri: { user: '11999990000' } };
    on(event: string, handler: () => void) {
        this.handlers[event] = handler;
    }
    emit(event: string) {
        this.handlers[event]?.();
    }
}

describe('WebphoneService histórico de chamadas', () => {
    let service: WebphoneService;
    let callHistory: jasmine.SpyObj<CallHistoryService>;

    beforeEach(() => {
        callHistory = jasmine.createSpyObj('CallHistoryService', ['add']);
        TestBed.configureTestingModule({
            providers: [
                { provide: CallHistoryService, useValue: callHistory },
                { provide: UserService, useValue: {} }
            ]
        });
        service = TestBed.inject(WebphoneService);
        spyOn(HTMLMediaElement.prototype, 'play').and.returnValue(Promise.resolve());
    });

    function receiveCall(): FakeSession {
        const session = new FakeSession();
        (service as any).incommingSession(session);
        return session;
    }

    it('registra chamada recebida quando atendida', () => {
        receiveCall().emit('accepted');
        expect(callHistory.add).toHaveBeenCalledOnceWith('11999990000', CallHistoryType.INCOMING);
    });

    it('registra chamada perdida quando falha sem ser atendida', () => {
        receiveCall().emit('failed');
        expect(callHistory.add).toHaveBeenCalledOnceWith('11999990000', CallHistoryType.MISSED);
    });

    it('registra chamada feita ao discar', async () => {
        (service as any).ua = { call: () => ({}) };
        await service.makeCall('11888880000');
        expect(callHistory.add).toHaveBeenCalledOnceWith('11888880000', CallHistoryType.OUTGOING);
    });

    describe('aviso de fim de chamada', () => {
        let beep: jasmine.Spy;

        beforeEach(() => {
            beep = spyOn((service as any).endCallBeep, 'play');
        });

        it('toca o beep quando chamada recebida termina', () => {
            receiveCall().emit('ended');
            expect(beep).toHaveBeenCalledTimes(1);
            expect((service as any).audio.src).not.toContain('blip');
        });

        it('não toca o beep em chamada recebida perdida', () => {
            receiveCall().emit('failed');
            expect(beep).not.toHaveBeenCalled();
        });

        it('toca o beep quando chamada feita termina ou falha', () => {
            const handlers = (service as any).callEventHandlers();
            handlers.ended({ originator: 'remote', cause: 'Terminated' });
            handlers.failed({ originator: 'remote', cause: 'Busy' });
            expect(beep).toHaveBeenCalledTimes(2);
            expect((service as any).audio.src).not.toContain('blip');
        });
    });
});
