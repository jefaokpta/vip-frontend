import {TestBed} from '@angular/core/testing';
import {ReportPage} from '@/pabx/report/report.page';
import {ReportService} from '@/pabx/report/report.service';
import {AccountCodeService} from '@/pabx/accountcode/account-code.service';
import {ReportStateService} from '@/pabx/report/report-state.service';
import {Cdr} from '@/pabx/types/cdr';

describe('ReportPage', () => {
    let reportServiceSpy: jasmine.SpyObj<ReportService>;
    let accountCodeServiceSpy: jasmine.SpyObj<AccountCodeService>;

    const cdrsFixture: Cdr[] = [{id: 1, disposition: 'ANSWERED'} as Cdr];

    beforeEach(() => {
        reportServiceSpy = jasmine.createSpyObj('ReportService', ['findLast30', 'findByDateRange', 'findById']);
        reportServiceSpy.findLast30.and.resolveTo(cdrsFixture);
        reportServiceSpy.findByDateRange.and.resolveTo(cdrsFixture);

        accountCodeServiceSpy = jasmine.createSpyObj('AccountCodeService', ['findAll']);
        accountCodeServiceSpy.findAll.and.resolveTo([]);

        TestBed.configureTestingModule({
            imports: [ReportPage],
            providers: [
                {provide: ReportService, useValue: reportServiceSpy},
                {provide: AccountCodeService, useValue: accountCodeServiceSpy}
            ]
        });
    });

    it('primeira visita: sem estado prévio, busca os últimos 30 dias', async () => {
        const fixture = TestBed.createComponent(ReportPage);
        fixture.componentInstance.ngOnInit();
        await fixture.whenStable();

        expect(reportServiceSpy.findLast30).toHaveBeenCalledTimes(1);
        expect(fixture.componentInstance.cdrs()).toEqual(cdrsFixture);
    });

    it('segunda visita: com estado já carregado, restaura sem chamar o backend de novo', async () => {
        const reportState = TestBed.inject(ReportStateService);
        const previousRange = [new Date(2026, 0, 1), new Date(2026, 0, 5)];
        reportState.setCdrs(cdrsFixture);
        reportState.dateRange.set(previousRange);
        reportState.statusFilter.set('ANSWERED');

        const fixture = TestBed.createComponent(ReportPage);
        fixture.componentInstance.ngOnInit();
        await fixture.whenStable();

        expect(reportServiceSpy.findLast30).not.toHaveBeenCalled();
        expect(reportServiceSpy.findByDateRange).not.toHaveBeenCalled();
        expect(fixture.componentInstance.cdrs()).toEqual(cdrsFixture);
        expect(fixture.componentInstance.dateRange()).toEqual(previousRange);
        expect(fixture.componentInstance.statusFilter()).toBe('ANSWERED');
    });
});
