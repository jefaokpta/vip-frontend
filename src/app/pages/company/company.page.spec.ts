import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MessageService } from 'primeng/api';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CompanyPage } from '@/pages/company/company.page';
import { CompanyService } from '@/pages/company/company.service';
import { UserService } from '@/pages/users/user.service';
import { RoleEnum } from '@/types/role-enum';
import { ReportStateService } from '@/pabx/report/report-state.service';
import { DacReportStateService } from '@/pabx/dac-report/dac-report-state.service';
import { MyCallsStateService } from '@/pages/dashboard/my-calls-state.service';

describe('CompanyPage - exclusão', () => {
    let fixture: ComponentFixture<CompanyPage>;
    let page: CompanyPage;
    let companyService: jasmine.SpyObj<CompanyService>;
    let messageService: MessageService;
    const acme = { companyId: '100001', name: 'Acme' } as any;
    const beta = { companyId: '100002', name: 'Beta' } as any;

    async function setup(roles: RoleEnum[]) {
        companyService = jasmine.createSpyObj('CompanyService', ['findAll', 'delete']);
        companyService.findAll.and.resolveTo([acme, beta]);
        TestBed.configureTestingModule({
            imports: [CompanyPage],
            providers: [
                { provide: CompanyService, useValue: companyService },
                { provide: UserService, useValue: { getUser: () => ({ companyId: '999', roles }) } },
                { provide: ReportStateService, useValue: {} },
                { provide: DacReportStateService, useValue: {} },
                { provide: MyCallsStateService, useValue: {} },
                provideRouter([]),
                provideNoopAnimations(),
                MessageService
            ]
        });
        messageService = TestBed.inject(MessageService);
        fixture = TestBed.createComponent(CompanyPage);
        page = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
    }

    const deleteButtons = () => fixture.nativeElement.querySelectorAll('.btn-excluir-empresa');

    it('botão excluir só aparece para SAAS_SUPPORT', async () => {
        await setup([RoleEnum.ROLE_SAAS_SUPPORT]);
        expect(deleteButtons().length).toBe(2);
    });

    it('botão excluir não aparece sem SAAS_SUPPORT', async () => {
        await setup([]);
        expect(deleteButtons().length).toBe(0);
    });

    it('confirmação só habilita com o nome idêntico', async () => {
        await setup([RoleEnum.ROLE_SAAS_SUPPORT]);
        page.openDelete(acme);
        expect(page.canConfirmDelete()).toBeFalse();
        page.confirmName = 'acme';
        expect(page.canConfirmDelete()).toBeFalse();
        page.confirmName = 'Acme';
        expect(page.canConfirmDelete()).toBeTrue();
    });

    it('sucesso remove da lista, fecha o modal e mostra toast', async () => {
        await setup([RoleEnum.ROLE_SAAS_SUPPORT]);
        companyService.delete.and.resolveTo();
        const add = spyOn(messageService, 'add');
        page.openDelete(acme);
        page.confirmName = 'Acme';
        await page.confirmDelete();
        expect(companyService.delete).toHaveBeenCalledWith('100001');
        expect(page.companies.map((c) => c.companyId)).toEqual(['100002']);
        expect(page.deleteDialogVisible).toBeFalse();
        expect(add).toHaveBeenCalledWith(jasmine.objectContaining({ severity: 'success' }));
    });

    it('erro mantém o modal aberto com a mensagem do backend', async () => {
        await setup([RoleEnum.ROLE_SAAS_SUPPORT]);
        companyService.delete.and.rejectWith({ error: { message: 'Empresa primária do tenant; exclua o tenant' } });
        page.openDelete(acme);
        page.confirmName = 'Acme';
        await page.confirmDelete();
        expect(page.deleteDialogVisible).toBeTrue();
        expect(page.deleteError).toBe('Empresa primária do tenant; exclua o tenant');
        expect(page.companies.length).toBe(2);
    });

    it('erro sem mensagem usa texto genérico', async () => {
        await setup([RoleEnum.ROLE_SAAS_SUPPORT]);
        companyService.delete.and.rejectWith({});
        page.openDelete(acme);
        page.confirmName = 'Acme';
        await page.confirmDelete();
        expect(page.deleteError).toBe('Não foi possível excluir a empresa. Tente novamente mais tarde.');
    });
});
