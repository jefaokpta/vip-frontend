import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { RoutePage } from '@/pabx/route/routes.page';
import { RouteService } from '@/pabx/route/route.service';
import { Route } from '@/pabx/types/route';

describe('RoutePage', () => {
    let fixture: ComponentFixture<RoutePage>;
    let routeService: jasmine.SpyObj<RouteService>;
    let messageService: MessageService;
    const route = { id: 12, name: 'Padrao' } as Route;

    beforeEach(() => {
        routeService = jasmine.createSpyObj<RouteService>('RouteService', ['findAll', 'delete']);
        routeService.findAll.and.resolveTo([route]);
        TestBed.configureTestingModule({
            imports: [RoutePage],
            providers: [provideRouter([]), provideNoopAnimations(), { provide: RouteService, useValue: routeService }]
        });
        fixture = TestBed.createComponent(RoutePage);
        const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
        spyOn(confirmationService, 'confirm').and.callFake((c) => {
            c.accept?.();
            return confirmationService;
        });
        messageService = fixture.debugElement.injector.get(MessageService);
        spyOn(messageService, 'add');
    });

    it('exibe a mensagem da API quando a rota está em uso', fakeAsync(() => {
        const apiMessage = 'Não é possível excluir a rota pois ela está sendo usada em: Regra (FIXO LOCAL).';
        routeService.delete.and.rejectWith({ error: { message: apiMessage } });

        fixture.componentInstance.confirmDelete(route);
        flushMicrotasks();

        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({
                severity: 'error',
                summary: 'Não foi possível remover a rota',
                detail: apiMessage
            })
        );
    }));

    it('usa texto genérico quando a API não envia mensagem', fakeAsync(() => {
        routeService.delete.and.rejectWith(new Error('rede'));

        fixture.componentInstance.confirmDelete(route);
        flushMicrotasks();

        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'error', detail: 'Tente novamente mais tarde.' })
        );
    }));

    it('remove a rota da lista e avisa sucesso', fakeAsync(() => {
        fixture.componentInstance.routes = [route];
        routeService.delete.and.resolveTo();

        fixture.componentInstance.confirmDelete(route);
        flushMicrotasks();

        expect(fixture.componentInstance.routes).toEqual([]);
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'success', summary: 'Rota removida com sucesso' })
        );
    }));
});
