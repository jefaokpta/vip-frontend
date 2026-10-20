import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Subject } from 'rxjs';
import { QueueDashboard } from '@/pages/dashboard/queue.dashboard';
import { QueueDashboardService } from '@/pages/dashboard/queue-dashboard.service';
import { WebsocketService } from '@/websocket/stomp/websocket.service';
import { UserService } from '@/pages/users/user.service';
import { QueueState } from '@/pabx/types/queue-state';
import { QueueMemberStatusEnum } from '@/pabx/types/queue-member-status-enum';

describe('QueueDashboard', () => {
    let serviceSpy: jasmine.SpyObj<QueueDashboardService>;

    const emptyQueue = {
        queue: {
            id: 1,
            name: 'Vendas',
            maxCalls: 10,
            memberIds: [1],
            tmeAlertSeconds: 30,
            callDurationAlertMinutes: 30
        },
        loggedMembers: [],
        waitingCalls: []
    } as unknown as QueueState;

    const busyQueue = {
        queue: {
            id: 2,
            name: 'Suporte',
            maxCalls: 10,
            memberIds: [1],
            tmeAlertSeconds: 30,
            callDurationAlertMinutes: 30
        },
        loggedMembers: [
            {
                id: 9,
                name: 'Maria Souza',
                queueMemberStatusEnum: QueueMemberStatusEnum.PAUSED,
                pauseTimestamp: Date.now() - 20 * 60_000,
                pauseTimeLimitMinutes: 5,
                peerRegistry: { peer: { peer: '4001' } }
            }
        ],
        waitingCalls: [],
        answeredCalls: 10,
        abandonedCalls: 0,
        answeredCallsInServiceLevel: 5,
        tmeSeconds: 45,
        totalWaitTimeSeconds: 450
    } as unknown as QueueState;

    function setup(states: QueueState[]): ComponentFixture<QueueDashboard> {
        serviceSpy = jasmine.createSpyObj('QueueDashboardService', ['findAllQueueStates', 'findTodayHourly']);
        serviceSpy.findAllQueueStates.and.resolveTo(states);
        serviceSpy.findTodayHourly.and.resolveTo([
            { hour: 0, answeredCalls: 1, abandonedCalls: 0 },
            { hour: 1, answeredCalls: 2, abandonedCalls: 1 }
        ]);
        TestBed.configureTestingModule({
            imports: [QueueDashboard],
            providers: [
                provideRouter([]),
                { provide: QueueDashboardService, useValue: serviceSpy },
                { provide: UserService, useValue: { getUser: () => ({ companyId: 1 }) } }
            ]
        }).overrideComponent(QueueDashboard, {
            set: { providers: [{ provide: WebsocketService, useValue: { watch: () => new Subject() } }] }
        });
        return TestBed.createComponent(QueueDashboard);
    }

    it('nao exibe valores fixos e mostra dados reais', fakeAsync(() => {
        const fixture = setup([emptyQueue, busyQueue]);
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();

        const text: string = fixture.nativeElement.textContent;
        expect(text).not.toContain('01:24');
        expect(text).not.toContain('Ricardo S.');
        expect(text).not.toContain('Fernanda M.');
        expect(text).toContain('Maria Souza');
        expect(text).toContain('PAUSA LONGA');
        expect(text).toContain('NS CRÍTICO');
        expect(text).toContain('TME ACIMA DO ALVO');
        expect(text).toContain('OPERAÇÃO OK');
        expect(text).not.toContain('VER TODOS OS AGENTES');
        expect(fixture.nativeElement.querySelector('[data-testid="global-sl"]').textContent.trim()).toBe('50%');
        fixture.destroy();
    }));

    it('mostra estado vazio de alertas e travessao sem chamadas', fakeAsync(() => {
        const fixture = setup([emptyQueue]);
        fixture.detectChanges();
        flushMicrotasks();
        fixture.detectChanges();

        const text: string = fixture.nativeElement.textContent;
        expect(text).toContain('Nenhum alerta no momento.');
        expect(fixture.nativeElement.querySelector('[data-testid="global-tme"]').textContent.trim()).toBe('—');
        expect(fixture.nativeElement.querySelector('[data-testid="global-sl"]').textContent.trim()).toBe('—');
        fixture.destroy();
    }));

    it('recarrega o grafico a cada 60s e limpa os intervals ao destruir', fakeAsync(() => {
        const fixture = setup([emptyQueue]);
        fixture.detectChanges();
        flushMicrotasks();
        expect(serviceSpy.findTodayHourly).toHaveBeenCalledTimes(1);

        tick(60_000);
        expect(serviceSpy.findTodayHourly).toHaveBeenCalledTimes(2);

        fixture.destroy();
        tick(120_000);
        expect(serviceSpy.findTodayHourly).toHaveBeenCalledTimes(2);
    }));
});
