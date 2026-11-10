import { Component, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CompanyService } from '@/pages/company/company.service';
import { InputMask } from 'primeng/inputmask';
import { MessageService } from 'primeng/api';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { NewCompany } from '@/types/company';

const DDD_PATTERN = /^[1-9][1-9]$/;

function dddValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.parent?.get('autoConfig')?.value) return null;
    const ddd = String(control.value ?? '').trim();
    if (!ddd) return { required: true };
    return DDD_PATTERN.test(ddd) ? null : { pattern: true };
}

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-new-company',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        NgIf,
        ReactiveFormsModule,
        RouterLink,
        InputMask,
        CheckboxModule,
        MessageModule
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Nova Empresa</span>
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

                <div class="field mb-4 flex items-center gap-2">
                    <p-checkbox inputId="autoConfig" formControlName="autoConfig" [binary]="true" />
                    <label for="autoConfig">Criar configurações automáticas</label>
                </div>

                <div *ngIf="autoConfig?.value" class="field mb-4">
                    <label for="autoConfigDdd" class="block mb-2">DDD *</label>
                    <input
                        id="autoConfigDdd"
                        pInputText
                        class="p-inputtext"
                        formControlName="autoConfigDdd"
                        maxlength="2"
                        placeholder="21"
                    />
                    <small
                        *ngIf="autoConfigDdd?.invalid && (autoConfigDdd?.dirty || autoConfigDdd?.touched)"
                        class="p-error block mt-2"
                    >
                        <div *ngIf="autoConfigDdd?.errors?.['required']">DDD é obrigatório.</div>
                        <div *ngIf="autoConfigDdd?.errors?.['pattern']">DDD deve ter 2 dígitos válidos (ex.: 21).</div>
                    </small>
                    <small class="block mt-2">
                        Serão criados: rota Padrao, 5 alias (fixo/celular local e DDD, gratuitas) e 5 regras de saída.
                    </small>
                </div>

                <div class="flex mt-4">
                    <p-button
                        type="submit"
                        label="Salvar"
                        [disabled]="form.invalid || pending"
                        [loading]="pending"
                        icon="pi pi-save"
                    />
                </div>

                <p-message *ngIf="errorMessage" severity="error" class="mt-4">{{ errorMessage }}</p-message>
            </form>
        </p-card>
    `
})
export class NewCompanyPage implements OnInit {
    form!: FormGroup;
    pending = false;
    errorMessage = '';

    constructor(
        private readonly fb: FormBuilder,
        private readonly companyService: CompanyService,
        private readonly router: Router,
        private readonly messageService: MessageService
    ) {}

    get name() {
        return this.form.get('name');
    }
    get cnpj() {
        return this.form.get('cnpj');
    }
    get autoConfig() {
        return this.form.get('autoConfig');
    }
    get autoConfigDdd() {
        return this.form.get('autoConfigDdd');
    }
    get corporateName() {
        return this.form.get('corporateName');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            corporateName: ['', [Validators.required]],
            cnpj: [
                '',
                [
                    Validators.required,
                    Validators.pattern(String.raw`^[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}-[0-9]{2}$`)
                ]
            ],
            autoConfig: [false],
            autoConfigDdd: ['', [dddValidator]]
        });
        this.autoConfig?.valueChanges.subscribe(() => this.autoConfigDdd?.updateValueAndValidity());
    }

    async onSubmit() {
        this.pending = true;
        this.errorMessage = '';
        const { name, corporateName, cnpj, autoConfig, autoConfigDdd } = this.form.value;
        const company: NewCompany = {
            name,
            corporateName,
            cnpj,
            ...(autoConfig && { autoConfigDdd: String(autoConfigDdd).trim() })
        };
        return this.companyService
            .create(company)
            .then(() => {
                this.messageService.add({ severity: 'success', summary: 'Empresa criada', life: 5_000 });
                return this.router.navigate(['/pages/companies']);
            })
            .catch((error) => {
                this.errorMessage = error?.error?.message ?? 'Houve um erro ao salvar a empresa.';
            })
            .finally(() => (this.pending = false));
    }
}
