import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { WorkersDashboard } from '@/pages/dashboard/workers.dashboard';
import { WorkersDashboardService } from '@/pages/dashboard/workers-dashboard.service';
import { WorkersOverview } from '@/pabx/types/workers-overview';

describe('WorkersDashboard', () => {
    let serviceSpy: jasmine.SpyObj<WorkersDashboardService>;

    const overview: WorkersOverview = {
        totalChannels: 5,
        workers: [
            {
                workerId: 'WORKER1',
                channels: 5,
                companies: [
                    { companyId: '100002', channels: 3 },
                    { companyId: '100001', channels: 2 }
                ]
            }
        ]
    };

    function setup(): ComponentFixture<WorkersDashboard> {
        serviceSpy = jasmine.createSpyObj('WorkersDashboardService', ['getOverview']);
        serviceSpy.getOverview.and.resolveTo(overview);
        TestBed.configureTestingModule({
            imports: [WorkersDashboard],
            providers: [{ provide: WorkersDashboardService, useValue: serviceSpy }]
        });
        return TestBed.createComponent(WorkersDashboard);
    }

    it('renderiza o total, o worker e as empresas ordenadas', fakeAsync(() => {
        const fixture = setup();
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();

        const text: string = fixture.nativeElement.textContent;
        expect(text).toContain('5');
        expect(text).toContain('WORKER1');
        expect(text.indexOf('100002')).toBeLessThan(text.indexOf('100001'));
        fixture.destroy();
    }));

    it('mostra o estado vazio quando nao ha canais', fakeAsync(() => {
        const fixture = setup();
        serviceSpy.getOverview.and.resolveTo({ totalChannels: 0, workers: [] });
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();

        expect(fixture.nativeElement.textContent).toContain('Nenhum canal ativo no momento');
        fixture.destroy();
    }));

    it('repete a consulta a cada 3s e para ao destruir', fakeAsync(() => {
        const fixture = setup();
        fixture.detectChanges();
        flushMicrotasks();
        expect(serviceSpy.getOverview).toHaveBeenCalledTimes(1);

        tick(3000);
        flushMicrotasks();
        expect(serviceSpy.getOverview).toHaveBeenCalledTimes(2);

        fixture.destroy();
        tick(6000);
        expect(serviceSpy.getOverview).toHaveBeenCalledTimes(2);
    }));

    it('mantem os dados e mostra desconectado quando a consulta falha depois de um sucesso', fakeAsync(() => {
        const fixture = setup();
        fixture.detectChanges();
        flushMicrotasks();

        serviceSpy.getOverview.and.rejectWith(new Error('timeout'));
        tick(3000);
        flushMicrotasks();
        fixture.detectChanges();

        const text: string = fixture.nativeElement.textContent;
        expect(text).toContain('WORKER1');
        expect(text).toContain('Desconectado');
        fixture.destroy();
    }));

    it('nao consulta enquanto a aba esta oculta', fakeAsync(() => {
        const fixture = setup();
        fixture.detectChanges();
        flushMicrotasks();
        spyOnProperty(document, 'hidden', 'get').and.returnValue(true);

        tick(6000);
        flushMicrotasks();

        expect(serviceSpy.getOverview).toHaveBeenCalledTimes(1);
        fixture.destroy();
    }));
});
