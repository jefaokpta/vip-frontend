import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BillingRunDetailPage } from '@/pages/billing/billing-run-detail.page';
import { BillingService } from '@/pages/billing/billing.service';
import { BillingRunDetail } from '@/pages/billing/types';

describe('BillingRunDetailPage', () => {
    let service: jasmine.SpyObj<BillingService>;
    let fixture: ComponentFixture<BillingRunDetailPage>;

    const detail: BillingRunDetail = {
        summary: {
            id: 9,
            mode: 'REAL',
            status: 'CONCLUIDA',
            periodStart: '2026-10-01',
            periodEnd: '2026-10-31',
            createdBy: 'x',
            createdAt: '2026-11-01T10:00:00',
            finishedAt: null,
            totalClients: 1,
            countsByStatus: { ERRO: 1 }
        },
        orphanContracts: ['CONTRATO-123'],
        clients: [
            {
                companyId: 'empresa-1',
                status: 'ERRO',
                errorCode: 'E1',
                errorDetail: 'detalhe',
                calc: null,
                lastSentAt: null
            }
        ]
    };

    const build = (active: boolean) => {
        service = jasmine.createSpyObj('BillingService', ['getRun', 'listRuns', 'rerun']);
        service.getRun.and.resolveTo(detail);
        service.listRuns.and.resolveTo({ active, runs: [] });
        TestBed.configureTestingModule({
            imports: [BillingRunDetailPage],
            providers: [
                provideRouter([]),
                { provide: BillingService, useValue: service },
                { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '9' } } } }
            ]
        });
        fixture = TestBed.createComponent(BillingRunDetailPage);
        fixture.detectChanges();
        for (let i = 0; i < 3; i++) {
            flushMicrotasks();
            fixture.detectChanges();
        }
    };

    it('detail mostra contratos sem empresa', fakeAsync(() => {
        build(false);
        const text = fixture.nativeElement.textContent;
        expect(text).toContain('Contratos sem empresa');
        expect(text).toContain('CONTRATO-123');
        expect(text).toContain('empresa-1');
    }));

    it('reexecutar desabilitado quando active', fakeAsync(() => {
        build(true);
        const btn = fixture.nativeElement.querySelector('.btn-reexecutar button');
        expect(btn.hasAttribute('disabled')).toBeTrue();
        fixture.destroy();
    }));

    it('reexecutar habilitado quando inativo', fakeAsync(() => {
        build(false);
        const btn = fixture.nativeElement.querySelector('.btn-reexecutar button');
        expect(btn.hasAttribute('disabled')).toBeFalse();
    }));
});
