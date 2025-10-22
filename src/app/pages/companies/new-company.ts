import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { NgForOf, NgIf } from '@angular/common';
import { HttpClientService } from '@/services/http-client.service';
import { Router, RouterLink } from '@angular/router';
import { Tooltip } from 'primeng/tooltip';
import { Company } from '@/types/types';

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
        ToastModule,
        NgIf,
        ReactiveFormsModule,
        RouterLink,
        NgForOf,
        Tooltip
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
                    <label for="controlNumber" class="block mb-2">Código de Controle *</label>
                    <input
                        id="controlNumber"
                        type="number"
                        pInputText
                        placeholder="Ex: 100021"
                        class="p-inputtext"
                        formControlName="controlNumber"
                    />
                    <small
                        *ngIf="controlNumber?.invalid && (controlNumber?.dirty || controlNumber?.touched)"
                        class="p-error block mt-2"
                    >
                        <div *ngIf="controlNumber?.errors?.['required']">Código da empresa é obrigatório.</div>
                        <div *ngIf="controlNumber?.errors?.['pattern']">
                            Código deve conter exatamente 6 dígitos numéricos.
                        </div>
                    </small>
                </div>

                <div class="field mb-4">
                    <div class="flex items-center gap-4 mb-2">
                        <label class="font-medium">Telefones (DDR)</label>
                        <p-button
                            type="button"
                            icon="pi pi-plus"
                            (onClick)="addPhone()"
                            pTooltip="Adicionar telefones"
                            tooltipPosition="right"
                            outlined
                            size="small"
                        ></p-button>
                    </div>

                    <div formArrayName="phones">
                        <div *ngFor="let phone of phones.controls; let i = index" class="mb-3">
                            <div class="flex gap-2">
                                <div class="flex-grow-1">
                                    <input
                                        [formControlName]="i"
                                        type="text"
                                        pInputText
                                        placeholder="DDD + Telefone"
                                        class="w-full"
                                    />
                                    <small *ngIf="phone.invalid && phone.touched" class="p-error block"
                                        >Telefone inválido</small
                                    >
                                </div>
                                <p-button
                                    *ngIf="phones.length > 1"
                                    type="button"
                                    icon="pi pi-trash"
                                    (onClick)="removePhone(i)"
                                    severity="danger"
                                    outlined
                                ></p-button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>

                <small *ngIf="showError" class="text-red-500"
                    >Houve um erro, verifique se o código de controle já existe.</small
                >
            </form>
        </p-card>
    `
})
export class NewCompanyPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly httpClientService: HttpClientService,
        private readonly router: Router
    ) {}

    get phones() {
        return this.form.get('phones') as FormArray;
    }

    get controlNumber() {
        return this.form.get('controlNumber');
    }

    get name() {
        return this.form.get('name');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            controlNumber: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
            phones: this.fb.array([])
        });
        this.addPhone();
    }

    addPhone() {
        this.phones.push(this.fb.control('', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]));
    }

    removePhone(index: number) {
        this.phones.removeAt(index);
    }

    async onSubmit() {
        this.pending = true;
        this.showError = false;
        const company: Company = {
            ...this.form.value,
            controlNumber: this.form.value.controlNumber.toString(),
            phones: this.form.value.phones.map((phone: string) => {
                return { phone };
            })
        };
        this.httpClientService
            .createCompany(company)
            .then(() => this.router.navigate(['/pages/companies']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
