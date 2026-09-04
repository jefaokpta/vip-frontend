import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { DacReportCallsPage } from '@/pabx/dac-report/dac-report-calls.page';
import { DacReportService } from '@/pabx/dac-report/dac-report.service';
import { CallJourneyEvent, DacCallsResponse } from '@/pabx/types/dac-call-journey';

describe('DacReportCallsPage', () => {
    let dacReportServiceSpy: jasmine.SpyObj<DacReportService>;

    const callsFixture: DacCallsResponse = {
        queueId: 1,
        periodStart: 1000,
        periodEnd: 5000,
        serviceLevelSeconds: 20,
        totalCalls: 1,
        answeredCalls: 1,
        abandonedCalls: 0,
        avgWaitSeconds: 5,
        avgTalkSeconds: 30,
        serviceLevelPercent: 100,
        calls: [
            {
                uniqueId: 'call-1',
                entryTs: 1000,
                callerPeer: '5511999999999',
                status: 'ANSWERED',
                answeredByPeer: '9001',
                hasRecording: true,
                events: []
            }
        ]
    };

    function setup(queryParams: Record<string, string>) {
        dacReportServiceSpy = jasmine.createSpyObj('DacReportService', ['findCalls', 'findRecordingUrl']);
        dacReportServiceSpy.findCalls.and.resolveTo(callsFixture);
        dacReportServiceSpy.findRecordingUrl.and.resolveTo('https://s3.example.com/signed-url');

        TestBed.configureTestingModule({
            imports: [DacReportCallsPage],
            providers: [
                { provide: DacReportService, useValue: dacReportServiceSpy },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { queryParamMap: convertToParamMap(queryParams) } }
                }
            ]
        });

        return TestBed.createComponent(DacReportCallsPage);
    }

    it('le queueId/start/end da query string e carrega a jornada', async () => {
        const fixture = setup({
            queueId: '1',
            queueName: 'Fila Teste',
            start: '1000',
            end: '5000',
            granularity: 'HOUR'
        });
        fixture.componentInstance.ngOnInit();
        await fixture.whenStable();

        expect(dacReportServiceSpy.findCalls).toHaveBeenCalledWith(1, 1000, 5000);
        expect(fixture.componentInstance.response()).toEqual(callsFixture);
        expect(fixture.componentInstance.queueName).toBe('Fila Teste');
    });

    it('playRecording busca a url sob demanda e guarda por uniqueId', async () => {
        const fixture = setup({
            queueId: '1',
            queueName: 'Fila Teste',
            start: '1000',
            end: '5000',
            granularity: 'HOUR'
        });
        fixture.componentInstance.ngOnInit();
        await fixture.whenStable();

        fixture.componentInstance.playRecording(callsFixture.calls[0]);
        await fixture.whenStable();

        expect(dacReportServiceSpy.findRecordingUrl).toHaveBeenCalledWith(1, 'call-1', '9001');
        expect(fixture.componentInstance.recordingUrls()['call-1']).toBe('https://s3.example.com/signed-url');
    });

    it('expande a linha e mostra a jornada de eventos', async () => {
        const events: CallJourneyEvent[] = [
            { eventType: 'CALL_ENTRY', timestamp: 1000, offsetSeconds: 0, memberPeer: null },
            { eventType: 'CALL_ANSWERED', timestamp: 6000, offsetSeconds: 5, memberPeer: '9001' }
        ];
        const callWithEvents = { ...callsFixture.calls[0], events };

        const fixture = setup({
            queueId: '1',
            queueName: 'Fila Teste',
            start: '1000',
            end: '5000',
            granularity: 'HOUR'
        });
        dacReportServiceSpy.findCalls.and.resolveTo({ ...callsFixture, calls: [callWithEvents] });
        fixture.componentInstance.ngOnInit();
        await fixture.whenStable();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        const togglerButton = fixture.nativeElement.querySelector('tbody button') as HTMLElement;
        togglerButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Atendida pelo membro');
    });
});
