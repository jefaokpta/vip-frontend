import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompanyService } from '@/pages/company/company.service';
import { InputMask } from 'primeng/inputmask';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-edit-company',
    standalone: true,
    imports: [InputTextModule, ButtonModule, CardModule, ToastModule, NgIf, ReactiveFormsModule, RouterLink, InputMask],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar {{ name?.value }}</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pages/companies"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="block mb-2">Nome *</label>
                    <input id="name" pInputText class="p-inputtext" formControlName="name" />
                    <small *ngIf="name?.invalid && (name?.dirty || name?.touched)" class="p-error block mt-2">
                        <div *ngIf="name?.errors?.['required']">Nome é obrigatório.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="corporateName" class="block mb-2">Razão Social *</label>
                    <input id="corporateName" pInputText class="p-inputtext" formControlName="corporateName" />
                    <small
                        *ngIf="corporateName?.invalid && (corporateName?.dirty || corporateName?.touched)"
                        class="p-error block mt-2"
                    >
                        <div *ngIf="corporateName?.errors?.['required']">Razão Social é obrigatório.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="cnpj" class="block mb-2">CNPJ *</label>
                    <p-inputmask mask="**.***.***/****-99" formControlName="cnpj" placeholder="**.***.***/****-99" />
                    <small *ngIf="cnpj?.invalid && (cnpj?.dirty || cnpj?.touched)" class="p-error block mt-2">
                        <div *ngIf="cnpj?.errors?.['required']">CNPJ é obrigatório.</div>
                        <div *ngIf="cnpj?.errors?.['pattern']">
                            CNPJ deve conter apenas números e letras (maiúsculas).
                        </div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="companyId" class="block mb-2">Código de Controle *</label>
                    <p-input-mask mask="999999" formControlName="companyId" placeholder="100054" readonly />
                    <small
                        *ngIf="companyId?.invalid && (companyId?.dirty || companyId?.touched)"
                        class="p-error block mt-2"
                    >
                        <div *ngIf="companyId?.errors?.['required']">Código da empresa é obrigatório.</div>
                        <div *ngIf="companyId?.errors?.['pattern']">
                            Código deve conter exatamente 6 dígitos numéricos.
                        </div>
                    </small>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>

                <small *ngIf="showError" class="text-red-500">
                    Houve um erro, verifique se o código de controle já existe.
                </small>
            </form>
        </p-card>
    `
})
export class EditCompanyPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly companyService: CompanyService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute
    ) {}

    get name() {
        return this.form.get('name');
    }
    get companyId() {
        return this.form.get('companyId');
    }
    get cnpj() {
        return this.form.get('cnpj');
    }
    get corporateName() {
        return this.form.get('corporateName');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            id: ['', [Validators.required]],
            name: ['', [Validators.required]],
            corporateName: ['', [Validators.required]],
            companyId: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
            cnpj: [
                '',
                [
                    Validators.required,
                    Validators.pattern(String.raw`^[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}-[0-9]{2}$`)
                ]
            ]
        });
        const companyId = this.activatedRoute.snapshot.paramMap.get('id')!;
        this.companyService.findCompanyId(companyId).then((company) => {
            this.form.patchValue(company);
        });
    }

    async onSubmit() {
        this.pending = true;
        this.showError = false;
        this.companyService
            .update(this.form.value)
            .then(() => this.router.navigate(['/pages/companies']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
