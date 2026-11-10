import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TrunkPage } from '@/pabx/trunk/trunks.page';
import { TrunkService } from '@/pabx/trunk/trunk.service';
import { Trunk } from '@/pabx/types/trunk';

describe('TrunkPage', () => {
    let fixture: ComponentFixture<TrunkPage>;
    let trunkService: jasmine.SpyObj<TrunkService>;
    let messageService: MessageService;
    const trunk = { id: 12, name: 'Padrao' } as Trunk;

    beforeEach(() => {
        trunkService = jasmine.createSpyObj<TrunkService>('TrunkService', ['findAll', 'delete']);
        trunkService.findAll.and.resolveTo([trunk]);
        TestBed.configureTestingModule({
            imports: [TrunkPage],
            providers: [provideRouter([]), provideNoopAnimations(), { provide: TrunkService, useValue: trunkService }]
        });
        fixture = TestBed.createComponent(TrunkPage);
        const confirmationService = fixture.debugElement.injector.get(ConfirmationService);
        spyOn(confirmationService, 'confirm').and.callFake((c) => {
            c.accept?.();
            return confirmationService;
        });
        messageService = fixture.debugElement.injector.get(MessageService);
        spyOn(messageService, 'add');
    });

    it('exibe a mensagem da API quando o tronco está em uso', fakeAsync(() => {
        const apiMessage = 'Não é possível excluir o tronco pois ele está sendo usado em: Rota (Padrao [100002]).';
        trunkService.delete.and.rejectWith({ error: { message: apiMessage } });

        fixture.componentInstance.confirmDelete(trunk);
        flushMicrotasks();

        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({
                severity: 'error',
                summary: 'Não foi possível remover o tronco',
                detail: apiMessage
            })
        );
    }));

    it('usa texto genérico quando a API não envia mensagem', fakeAsync(() => {
        trunkService.delete.and.rejectWith(new Error('rede'));

        fixture.componentInstance.confirmDelete(trunk);
        flushMicrotasks();

        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'error', detail: 'Tente novamente mais tarde.' })
        );
    }));

    it('remove o tronco da lista e avisa sucesso', fakeAsync(() => {
        fixture.componentInstance.trunks = [trunk];
        trunkService.delete.and.resolveTo();

        fixture.componentInstance.confirmDelete(trunk);
        flushMicrotasks();

        expect(fixture.componentInstance.trunks).toEqual([]);
        expect(messageService.add).toHaveBeenCalledWith(
            jasmine.objectContaining({ severity: 'success', summary: 'Tronco removido com sucesso' })
        );
    }));
});
