import {TestBed} from '@angular/core/testing';
import {ActivatedRoute, convertToParamMap, provideRouter} from '@angular/router';
import {ReportDetailPage} from '@/pabx/report/report-detail.page';
import {ReportService} from '@/pabx/report/report.service';
import {TranscriptionService} from '@/pabx/report/transcription.service';
import {AccountCodeService} from '@/pabx/accountcode/account-code.service';
import {UserService} from '@/pages/users/user.service';
import {ServiceEnum} from '@/types/service-enum';
import {CdrDetail} from '@/pabx/types/cdr-detail';
import {Transcription} from '@/types/transcription';

describe('ReportDetailPage', () => {
    let reportServiceSpy: jasmine.SpyObj<ReportService>;
    let transcriptionServiceSpy: jasmine.SpyObj<TranscriptionService>;

    const cdrFixture = {
        id: 42,
        peer: '12',
        src: '12_100023',
        destination: '1132931515',
        callerId: 'teste',
        duration: 40,
        billableSeconds: 40,
        uniqueId: '123.4',
        disposition: 'ANSWERED',
        startTime: new Date(),
        channel: 'PJSIP/WORKER1-1',
        userfield: 'OUTBOUND',
        destinationChannel: 'PJSIP/JPBX-1',
        accountCode: '1.00',
        cost: 1.0,
        interactions: []
    } as CdrDetail;

    const transcriptionFixture = {
        summary: { id: 1, cdrUniqueId: '123.4', status: 'DONE' },
        transcript: 'Olá, tudo bem?',
        language: 'pt',
        model: 'nova-3',
        utterances: []
    } as unknown as Transcription;

    function setup(services: ServiceEnum[]) {
        reportServiceSpy = jasmine.createSpyObj('ReportService', ['findById']);
        reportServiceSpy.findById.and.resolveTo(cdrFixture);
        transcriptionServiceSpy = jasmine.createSpyObj('TranscriptionService', ['findByCdr']);
        transcriptionServiceSpy.findByCdr.and.resolveTo([transcriptionFixture]);

        TestBed.configureTestingModule({
            imports: [ReportDetailPage],
            providers: [
                provideRouter([]),
                { provide: ReportService, useValue: reportServiceSpy },
                { provide: TranscriptionService, useValue: transcriptionServiceSpy },
                { provide: AccountCodeService, useValue: { findAll: () => Promise.resolve([]) } },
                { provide: UserService, useValue: { hasService: (s: ServiceEnum) => services.includes(s) } },
                {
                    provide: ActivatedRoute,
                    useValue: {
                        snapshot: { paramMap: convertToParamMap({ id: '42' }), queryParamMap: convertToParamMap({}) }
                    }
                }
            ]
        });

        return TestBed.createComponent(ReportDetailPage);
    }

    it('sem o servico IA nao busca a transcricao', async () => {
        const fixture = setup([ServiceEnum.PABX]);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(reportServiceSpy.findById).toHaveBeenCalledWith(42);
        expect(transcriptionServiceSpy.findByCdr).not.toHaveBeenCalled();
    });

    it('com o servico IA busca a transcricao pelo uniqueId da cdr', async () => {
        const fixture = setup([ServiceEnum.IA]);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(transcriptionServiceSpy.findByCdr).toHaveBeenCalledWith('123.4');
        expect(fixture.nativeElement.textContent).toContain('Olá, tudo bem?');
    });

    it('mostra "Transcrição indisponível" quando a lista vem vazia', async () => {
        const fixture = setup([ServiceEnum.IA]);
        transcriptionServiceSpy.findByCdr.and.resolveTo([]);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Transcrição indisponível');
    });

    it('nao mostra "Transcrição indisponível" enquanto busca', async () => {
        const fixture = setup([ServiceEnum.IA]);
        transcriptionServiceSpy.findByCdr.and.returnValue(new Promise(() => {}));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).not.toContain('Transcrição indisponível');
    });

    it('voltar vai para a home por padrao', () => {
        const fixture = setup([ServiceEnum.PABX]);
        expect(fixture.componentInstance.backLink).toBe('/');
    });

    it('mostra "Transcrição indisponível" quando a busca falha', async () => {
        const fixture = setup([ServiceEnum.IA]);
        transcriptionServiceSpy.findByCdr.and.rejectWith(new Error('rede'));
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Transcrição indisponível');
    });
});
