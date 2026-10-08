import {TestBed} from '@angular/core/testing';
import {MyCallsDashboard} from '@/pages/dashboard/my-calls.dashboard';
import {ReportService} from '@/pabx/report/report.service';
import {AccountCodeService} from '@/pabx/accountcode/account-code.service';
import {Cdr} from '@/pabx/types/cdr';

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
});
