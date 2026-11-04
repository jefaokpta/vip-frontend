import {TestBed} from '@angular/core/testing';
import {provideRouter} from '@angular/router';
import {MyCallsDashboard} from '@/pages/dashboard/my-calls.dashboard';
import {ReportService} from '@/pabx/report/report.service';
import {AccountCodeService} from '@/pabx/accountcode/account-code.service';
import {Cdr} from '@/pabx/types/cdr';
import {MyCallsStateService} from '@/pages/dashboard/my-calls-state.service';

describe('MyCallsDashboard', () => {
    let reportServiceSpy: jasmine.SpyObj<ReportService>;

    const cdrs = [
        { id: 1, disposition: 'ANSWERED', billableSeconds: 60, startTime: new Date(), userfield: 'OUTBOUND' },
        { id: 2, disposition: 'NO ANSWER', billableSeconds: 0, startTime: new Date(), userfield: 'INBOUND' }
    ] as Cdr[];

    beforeEach(() => {
        reportServiceSpy = jasmine.createSpyObj('ReportService', ['findMine']);
        reportServiceSpy.findMine.and.resolveTo(cdrs);
        const accountCodeServiceSpy = jasmine.createSpyObj('AccountCodeService', ['findAll']);
        accountCodeServiceSpy.findAll.and.resolveTo([]);

        TestBed.configureTestingModule({
            imports: [MyCallsDashboard],
            providers: [
                { provide: ReportService, useValue: reportServiceSpy },
                provideRouter([]),
                { provide: AccountCodeService, useValue: accountCodeServiceSpy }
            ]
        });
    });

    it('carrega as chamadas do usuario e calcula os totais', async () => {
        const fixture = TestBed.createComponent(MyCallsDashboard);
        fixture.detectChanges();
        await fixture.whenStable();

        const page = fixture.componentInstance;
        expect(reportServiceSpy.findMine).toHaveBeenCalledTimes(1);
        expect(page.totalCalls()).toBe(2);
        expect(page.rate()).toBe(50);
        expect(page.talkSeconds()).toBe(60);
        expect(page.loading()).toBeFalse();
    });

    it('usa o cache e nao recarrega ao voltar para a tela', async () => {
        TestBed.inject(MyCallsStateService).setCdrs(cdrs);

        const fixture = TestBed.createComponent(MyCallsDashboard);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(reportServiceSpy.findMine).not.toHaveBeenCalled();
        expect(fixture.componentInstance.totalCalls()).toBe(2);
        expect(fixture.componentInstance.loading()).toBeFalse();
    });

    it('refresh recarrega os dados do servidor', async () => {
        TestBed.inject(MyCallsStateService).setCdrs([]);
        const fixture = TestBed.createComponent(MyCallsDashboard);
        fixture.detectChanges();

        fixture.componentInstance.refresh();
        await fixture.whenStable();

        expect(reportServiceSpy.findMine).toHaveBeenCalledTimes(1);
        expect(fixture.componentInstance.totalCalls()).toBe(2);
    });
});
