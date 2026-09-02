import {TestBed} from '@angular/core/testing';
import {ReportStateService} from '@/pabx/report/report-state.service';
import {Cdr} from '@/pabx/types/cdr';

describe('ReportStateService', () => {
    let service: ReportStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ReportStateService);
    });

    it('inicia com estado vazio e não carregado', () => {
        expect(service.cdrs()).toEqual([]);
        expect(service.loaded()).toBeFalse();
        expect(service.dateRange()).toEqual([]);
        expect(service.statusFilter()).toBeNull();
    });

    it('setCdrs atualiza cdrs e marca loaded como true numa única chamada', () => {
        const cdrs = [{id: 1} as Cdr];

        service.setCdrs(cdrs);

        expect(service.cdrs()).toEqual(cdrs);
        expect(service.loaded()).toBeTrue();
    });

    it('dateRange e statusFilter são graváveis como signals comuns', () => {
        const range = [new Date(2026, 0, 1), new Date(2026, 0, 5)];

        service.dateRange.set(range);
        service.statusFilter.set('ANSWERED');

        expect(service.dateRange()).toEqual(range);
        expect(service.statusFilter()).toBe('ANSWERED');
    });
});
