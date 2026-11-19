import { ComponentFixture, TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { BillingRunsPage } from '@/pages/billing/billing-runs.page';
import { BillingService } from '@/pages/billing/billing.service';
import { BillingRunSummary } from '@/pages/billing/types';

describe('BillingRunsPage', () => {
    let service: jasmine.SpyObj<BillingService>;
    let fixture: ComponentFixture<BillingRunsPage>;

    const run = (id: number, status: string): BillingRunSummary => ({
        id,
        mode: 'REAL',
        status,
        periodStart: '2026-10-01',
        periodEnd: '2026-10-31',
        createdBy: 'x',
        createdAt: '2026-11-01T10:00:00',
        finishedAt: null,
        totalClients: 5,
        countsByStatus: { ENVIADO: 2, ERRO: 1 }
    });

    const build = (active: boolean, runs: BillingRunSummary[] = []) => {
        service = jasmine.createSpyObj('BillingService', ['listRuns', 'startRun', 'resume', 'cancel']);
        service.listRuns.and.resolveTo({ active, runs });
        TestBed.configureTestingModule({
            imports: [BillingRunsPage],
            providers: [provideRouter([]), { provide: BillingService, useValue: service }]
        });
        fixture = TestBed.createComponent(BillingRunsPage);
        fixture.detectChanges();
    };

    const settle = () => {
        flushMicrotasks();
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();
    };

    const el = (): HTMLElement => fixture.nativeElement;

    it('executar e simular desabilitados quando active', fakeAsync(() => {
        build(true, [run(1, 'EM_ANDAMENTO')]);
        settle();
        expect(el().querySelector('#btn-executar button')?.hasAttribute('disabled')).toBeTrue();
        expect(el().querySelector('#btn-simular button')?.hasAttribute('disabled')).toBeTrue();
        fixture.destroy();
    }));

    it('executar e simular habilitados quando inativo, com X de N', fakeAsync(() => {
        build(false, [run(1, 'CONCLUIDA')]);
        settle();
        expect(el().querySelector('#btn-executar button')?.hasAttribute('disabled')).toBeFalse();
        expect(el().textContent).toContain('3 de 5');
    }));

    it('retomar e encerrar so em INTERROMPIDA', fakeAsync(() => {
        build(false, [run(1, 'CONCLUIDA'), run(2, 'INTERROMPIDA')]);
        settle();
        expect(el().querySelectorAll('.btn-retomar').length).toBe(1);
        expect(el().querySelectorAll('.btn-encerrar').length).toBe(1);
    }));

    it('polling a cada 10 s so enquanto active e para no destroy', fakeAsync(() => {
        build(true);
        flushMicrotasks();
        expect(service.listRuns).toHaveBeenCalledTimes(1);
        tick(10_000);
        flushMicrotasks();
        expect(service.listRuns).toHaveBeenCalledTimes(2);
        service.listRuns.and.resolveTo({ active: false, runs: [] });
        tick(10_000);
        flushMicrotasks();
        expect(service.listRuns).toHaveBeenCalledTimes(3);
        tick(30_000);
        expect(service.listRuns).toHaveBeenCalledTimes(3);
    }));

    it('polling para no destroy', fakeAsync(() => {
        build(true);
        flushMicrotasks();
        fixture.destroy();
        tick(30_000);
        expect(service.listRuns).toHaveBeenCalledTimes(1);
    }));

    it('nao faz polling quando inativo', fakeAsync(() => {
        build(false);
        flushMicrotasks();
        tick(30_000);
        expect(service.listRuns).toHaveBeenCalledTimes(1);
    }));

    it('toast quando listRuns falha', fakeAsync(() => {
        service = jasmine.createSpyObj('BillingService', ['listRuns']);
        service.listRuns.and.rejectWith({ error: { message: 'falhou' } });
        TestBed.configureTestingModule({
            imports: [BillingRunsPage],
            providers: [provideRouter([]), { provide: BillingService, useValue: service }]
        });
        fixture = TestBed.createComponent(BillingRunsPage);
        const messages = fixture.debugElement.injector.get(MessageService);
        spyOn(messages, 'add');
        fixture.detectChanges();
        flushMicrotasks();
        expect(messages.add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'error', detail: 'falhou' }));
    }));
});
