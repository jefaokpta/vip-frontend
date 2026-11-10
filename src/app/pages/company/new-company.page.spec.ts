import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NewCompanyPage } from '@/pages/company/new-company.page';
import { CompanyService } from '@/pages/company/company.service';

describe('NewCompanyPage', () => {
    let fixture: ComponentFixture<NewCompanyPage>;
    let page: NewCompanyPage;
    let companyService: jasmine.SpyObj<CompanyService>;
    let router: Router;

    beforeEach(() => {
        companyService = jasmine.createSpyObj('CompanyService', ['create']);
        TestBed.configureTestingModule({
            imports: [NewCompanyPage],
            providers: [
                { provide: CompanyService, useValue: companyService },
                provideRouter([]),
                provideNoopAnimations()
            ]
        });
        router = TestBed.inject(Router);
        spyOn(router, 'navigate').and.resolveTo(true);
        fixture = TestBed.createComponent(NewCompanyPage);
        page = fixture.componentInstance;
        fixture.detectChanges();
        page.form.patchValue({ name: 'Acme', corporateName: 'Acme LTDA', cnpj: '12.345.678/0001-90' });
    });

    it('checkbox desmarcado envia payload sem autoConfigDdd', async () => {
        companyService.create.and.resolveTo({});
        await page.onSubmit();
        const payload = companyService.create.calls.mostRecent().args[0];
        expect(Object.keys(payload as object)).not.toContain('autoConfigDdd');
    });

    it('marcado com 21 envia autoConfigDdd 21', async () => {
        companyService.create.and.resolveTo({});
        page.form.patchValue({ autoConfig: true, autoConfigDdd: '21' });
        await page.onSubmit();
        expect(companyService.create.calls.mostRecent().args[0].autoConfigDdd).toBe('21');
    });

    it('marcado com DDD inválido deixa o form inválido', () => {
        page.form.patchValue({ autoConfig: true, autoConfigDdd: '01' });
        expect(page.form.invalid).toBeTrue();
        page.form.patchValue({ autoConfigDdd: '2' });
        expect(page.form.invalid).toBeTrue();
        page.form.patchValue({ autoConfigDdd: '' });
        expect(page.form.invalid).toBeTrue();
    });

    it('desmarcar o checkbox torna o DDD não obrigatório', () => {
        page.form.patchValue({ autoConfig: true, autoConfigDdd: '01' });
        page.form.patchValue({ autoConfig: false });
        expect(page.form.valid).toBeTrue();
    });

    it('DDD com espaços é enviado aparado', async () => {
        companyService.create.and.resolveTo({});
        page.form.patchValue({ autoConfig: true, autoConfigDdd: ' 21 ' });
        expect(page.form.valid).toBeTrue();
        await page.onSubmit();
        expect(companyService.create.calls.mostRecent().args[0].autoConfigDdd).toBe('21');
    });

    it('erro da API exibe a mensagem e não navega', async () => {
        companyService.create.and.rejectWith({ error: { message: 'DDD inválido: 2a' } });
        page.form.patchValue({ autoConfig: true, autoConfigDdd: '21' });
        await page.onSubmit();
        fixture.detectChanges();
        expect(router.navigate).not.toHaveBeenCalled();
        expect(page.errorMessage).toBe('DDD inválido: 2a');
        expect(fixture.nativeElement.textContent).toContain('DDD inválido: 2a');
        expect(page.pending).toBeFalse();
    });

    it('sucesso navega para a lista', async () => {
        companyService.create.and.resolveTo({});
        await page.onSubmit();
        expect(router.navigate).toHaveBeenCalledWith(['/pages/companies']);
    });
});
