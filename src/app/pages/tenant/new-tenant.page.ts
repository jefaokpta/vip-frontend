import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {ToastModule} from 'primeng/toast';
import {NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {Select} from 'primeng/select';
import {TenantService} from '@/pages/tenant/tenant.service';
import {CompanyService} from '@/pages/company/company.service';

@Component({
    selector: 'app-new-tenant',
    standalone: true,
    imports: [InputTextModule, ButtonModule, CardModule, ToastModule, NgIf, ReactiveFormsModule, RouterLink, Select],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Novo Tenant</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pages/tenants"
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
                    <label for="primaryCompanyId" class="block mb-2">Empresa Primária *</label>
                    <p-select
                        id="primaryCompanyId"
                        [options]="companyOptions"
                        formControlName="primaryCompanyId"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione a Company"
                    ></p-select>
                    <small
                        *ngIf="primaryCompanyId?.invalid && (primaryCompanyId?.dirty || primaryCompanyId?.touched)"
                        class="p-error block mt-2"
                    >
                        <div *ngIf="primaryCompanyId?.errors?.['required']">Company primária é obrigatória.</div>
                    </small>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>

                <small *ngIf="showError" class="text-red-500">Houve um erro ao salvar o tenant.</small>
            </form>
        </p-card>
    `
})
export class NewTenantPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    companyOptions: { label: string; value: number }[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly tenantService: TenantService,
        private readonly companyService: CompanyService,
        private readonly router: Router
    ) {}

    get name() {
        return this.form.get('name');
    }
    get primaryCompanyId() {
        return this.form.get('primaryCompanyId');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            primaryCompanyId: [null, [Validators.required]]
        });
        this.companyService.findAll().then((companies) => {
            this.companyOptions = companies.map((company) => ({
                label: `${company.name} (${company.companyId})`,
                value: company.id
            }));
        });
    }

    async onSubmit() {
        this.pending = true;
        this.showError = false;
        this.tenantService
            .create(this.form.value)
            .then(() => this.router.navigate(['/pages/tenants']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
