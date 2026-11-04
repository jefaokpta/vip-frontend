import {TestBed} from '@angular/core/testing';
import {CALL_HISTORY_STORAGE_KEY, CallHistoryService} from './call-history.service';
import {CallHistoryType} from '@/types/call-history';

describe('CallHistoryService', () => {
    function createService(): CallHistoryService {
        TestBed.resetTestingModule();
        TestBed.configureTestingModule({});
        return TestBed.inject(CallHistoryService);
    }

    beforeEach(() => localStorage.removeItem(CALL_HISTORY_STORAGE_KEY));
    afterEach(() => localStorage.removeItem(CALL_HISTORY_STORAGE_KEY));

    it('começa vazio', () => {
        expect(createService().history()).toEqual([]);
    });

    it('adiciona chamada no topo da lista', () => {
        const service = createService();
        service.add('11999990000', CallHistoryType.OUTGOING);
        service.add('11888880000', CallHistoryType.INCOMING);
        const history = service.history();
        expect(history.map((c) => c.telephone)).toEqual(['11888880000', '11999990000']);
        expect(history[0].type).toBe(CallHistoryType.INCOMING);
    });

    it('não repete número e mantém apenas a chamada mais recente', () => {
        const service = createService();
        service.add('11999990000', CallHistoryType.OUTGOING);
        service.add('11888880000', CallHistoryType.INCOMING);
        service.add('11999990000', CallHistoryType.MISSED);
        const history = service.history();
        expect(history.length).toBe(2);
        expect(history[0]).toEqual(
            jasmine.objectContaining({ telephone: '11999990000', type: CallHistoryType.MISSED })
        );
    });

    it('compara números apenas pelos dígitos', () => {
        const service = createService();
        service.add('(11) 99999-0000', CallHistoryType.OUTGOING);
        service.add('11999990000', CallHistoryType.INCOMING);
        expect(service.history().length).toBe(1);
        expect(service.history()[0].telephone).toBe('11999990000');
    });

    it('ignora número vazio', () => {
        const service = createService();
        service.add('', CallHistoryType.MISSED);
        service.add(undefined, CallHistoryType.MISSED);
        expect(service.history()).toEqual([]);
    });

    it('guarda no máximo 50 números', () => {
        const service = createService();
        for (let i = 0; i < 55; i++) {
            service.add(`1100000${i.toString().padStart(4, '0')}`, CallHistoryType.OUTGOING);
        }
        expect(service.history().length).toBe(50);
        expect(service.history()[0].telephone).toBe('11000000054');
    });

    it('persiste no localStorage e recarrega', () => {
        createService().add('11999990000', CallHistoryType.OUTGOING);
        const reloaded = createService();
        expect(reloaded.history().length).toBe(1);
        expect(reloaded.history()[0].telephone).toBe('11999990000');
    });

    it('tolera localStorage corrompido', () => {
        localStorage.setItem(CALL_HISTORY_STORAGE_KEY, '{nao e json');
        expect(createService().history()).toEqual([]);
    });
});
