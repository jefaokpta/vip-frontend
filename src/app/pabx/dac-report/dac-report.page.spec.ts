import {TestBed} from '@angular/core/testing';
import {DacReportPage} from '@/pabx/dac-report/dac-report.page';
import {DacReportService} from '@/pabx/dac-report/dac-report.service';
import {DacReportStateService} from '@/pabx/dac-report/dac-report-state.service';
import {DacReportResponse, QueueOption} from '@/pabx/types/dac-report';

describe('DacReportPage', () => {
    let dacReportServiceSpy: jasmine.SpyObj<DacReportService>;

    const queuesFixture: QueueOption[] = [{ id: 1, name: 'Fila 1' }];
    const reportFixture: DacReportResponse = {
        queueId: 1,
        granularity: 'HOUR',
        serviceLevelSeconds: 20,
        totalCalls: 5,
        answeredCalls: 4,
        abandonedCalls: 1,
        avgWaitSeconds: 10,
        avgTalkSeconds: 60,
        serviceLevelPercent: 80,
        partials: []
    };

    beforeEach(() => {
        dacReportServiceSpy = jasmine.createSpyObj('DacReportService', ['findQueues', 'findReport']);
        dacReportServiceSpy.findQueues.and.resolveTo(queuesFixture);
        dacReportServiceSpy.findReport.and.resolveTo(reportFixture);

        TestBed.configureTestingModule({
            imports: [DacReportPage],
            providers: [{ provide: DacReportService, useValue: dacReportServiceSpy }]
        });
    });

    it('primeira visita: sem estado prévio, nenhuma fila selecionada e nenhum relatório carregado', async () => {
        const fixture = TestBed.createComponent(DacReportPage);
        fixture.componentInstance.ngOnInit();
        await fixture.whenStable();

        expect(dacReportServiceSpy.findQueues).toHaveBeenCalledTimes(1);
        expect(fixture.componentInstance.queues()).toEqual(queuesFixture);
        expect(fixture.componentInstance.selectedQueue()).toBeNull();
        expect(fixture.componentInstance.report()).toBeNull();
    });

    it('segunda visita: com estado já carregado, restaura sem buscar o relatório de novo', async () => {
        const dacReportState = TestBed.inject(DacReportStateService);
        const previousQueue = queuesFixture[0];
        const previousRange = [new Date(2026, 0, 1), new Date(2026, 0, 1)];
        dacReportState.selectedQueue.set(previousQueue);
        dacReportState.dateRange.set(previousRange);
        dacReportState.setReport(reportFixture);

        const fixture = TestBed.createComponent(DacReportPage);
        fixture.componentInstance.ngOnInit();
        await fixture.whenStable();

        expect(dacReportServiceSpy.findReport).not.toHaveBeenCalled();
        expect(fixture.componentInstance.selectedQueue()).toEqual(previousQueue);
        expect(fixture.componentInstance.dateRange()).toEqual(previousRange);
        expect(fixture.componentInstance.report()).toEqual(reportFixture);
    });
});
