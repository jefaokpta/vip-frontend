import {TestBed} from '@angular/core/testing';
import {MyCallsStateService} from '@/pages/dashboard/my-calls-state.service';
import {Cdr} from '@/pabx/types/cdr';

describe('MyCallsStateService', () => {
    let service: MyCallsStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(MyCallsStateService);
    });

    it('inicia com estado vazio e não carregado', () => {
        expect(service.cdrs()).toEqual([]);
        expect(service.loaded()).toBeFalse();
    });

    it('setCdrs atualiza cdrs e marca loaded', () => {
        const cdrs = [{ id: 1 } as Cdr];
        service.setCdrs(cdrs);
        expect(service.cdrs()).toEqual(cdrs);
        expect(service.loaded()).toBeTrue();
    });

    it('reset limpa cdrs e loaded', () => {
        service.setCdrs([{ id: 1 } as Cdr]);
        service.reset();
        expect(service.cdrs()).toEqual([]);
        expect(service.loaded()).toBeFalse();
    });
});
