import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountCodeService } from '@/pabx/accountcode/account-code.service';
import { EditAccountCodePage } from '@/pabx/accountcode/edit-account-code.page';
import { AccountCode } from '@/pabx/types/account-code';

describe('EditAccountCodePage', () => {
    let fixture: ComponentFixture<EditAccountCodePage>;
    let service: jasmine.SpyObj<AccountCodeService>;

    const build = async (code: string, specialLabel: '0800' | '4000' | null) => {
        const accountCode: AccountCode = {
            id: 7,
            companyId: 'c',
            code,
            title: 'Titulo',
            cadence: 1,
            fraction: 1,
            cost: 0.1,
            specialLabel
        };
        service = jasmine.createSpyObj('AccountCodeService', ['findById', 'update']);
        service.findById.and.resolveTo(accountCode);
        service.update.and.resolveTo({});
        await TestBed.configureTestingModule({
            imports: [EditAccountCodePage],
            providers: [
                { provide: AccountCodeService, useValue: service },
                { provide: ActivatedRoute, useValue: { snapshot: { params: { id: '7' } } } },
                { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
            ]
        }).compileComponents();
        fixture = TestBed.createComponent(EditAccountCodePage);
        fixture.detectChanges();
        await fixture.whenStable();
        fixture.detectChanges();
        return fixture.componentInstance;
    };

    it('select de label desabilitado quando codigo nao comeca com 1.', async () => {
        const page = await build('2.01', null);
        expect(page.canHaveSpecialLabel).toBeFalse();
        expect(page.form.get('specialLabel')?.disabled).toBeTrue();
    });

    it('select de label habilitado quando codigo comeca com 1.', async () => {
        const page = await build('1.00', '0800');
        expect(page.form.get('specialLabel')?.enabled).toBeTrue();
    });

    it('envia specialLabel no update', async () => {
        const page = await build('1.00', null);
        page.form.get('specialLabel')?.setValue('4000');
        page.onSubmit();
        expect(service.update).toHaveBeenCalledWith(jasmine.objectContaining({ id: 7, specialLabel: '4000' }));
    });
});
