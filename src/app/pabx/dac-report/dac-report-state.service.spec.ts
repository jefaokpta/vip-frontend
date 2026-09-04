import {TestBed} from '@angular/core/testing';
import {DacReportStateService} from '@/pabx/dac-report/dac-report-state.service';
import {DacReportResponse, QueueOption} from '@/pabx/types/dac-report';

describe('DacReportStateService', () => {
    let service: DacReportStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DacReportStateService);
    });

    it('inicia com estado vazio e não carregado', () => {
        expect(service.report()).toBeNull();
        expect(service.loaded()).toBeFalse();
        expect(service.selectedQueue()).toBeNull();
        expect(service.dateRange()).toEqual([]);
    });

    it('setReport atualiza report e marca loaded como true numa única chamada', () => {
        const report = { queueId: 1 } as DacReportResponse;

        service.setReport(report);

        expect(service.report()).toEqual(report);
        expect(service.loaded()).toBeTrue();
    });

    it('selectedQueue e dateRange são graváveis como signals comuns', () => {
        const queue = { id: 1, name: 'Fila 1' } as QueueOption;
        const range = [new Date(2026, 0, 1), new Date(2026, 0, 5)];

        service.selectedQueue.set(queue);
        service.dateRange.set(range);

        expect(service.selectedQueue()).toEqual(queue);
        expect(service.dateRange()).toEqual(range);
    });

    it('reset limpa report, loaded, selectedQueue e dateRange', () => {
        service.setReport({ queueId: 1 } as DacReportResponse);
        service.selectedQueue.set({ id: 1, name: 'Fila 1' } as QueueOption);
        service.dateRange.set([new Date(2026, 0, 1), new Date(2026, 0, 5)]);

        service.reset();

        expect(service.report()).toBeNull();
        expect(service.loaded()).toBeFalse();
        expect(service.selectedQueue()).toBeNull();
        expect(service.dateRange()).toEqual([]);
    });
});
