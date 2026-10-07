import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {ToastModule} from 'primeng/toast';
import {NgIf} from '@angular/common';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {RegisterInstanceService} from '@/pabx/register-instance/register-instance.service';

const NAME_PATTERN = /^[A-Za-z0-9_-]{1,11}$/;
const HOST_PATTERN = /^[A-Za-z0-9.-]{1,253}$/;

@Component({
    selector: 'app-register-instance-form',
    standalone: true,
    imports: [InputTextModule, ButtonModule, CardModule, ToastModule, NgIf, ReactiveFormsModule, RouterLink],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">{{
                        id ? 'Editar ' + (name?.value ?? '') : 'Novo Register'
                    }}</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/register-instances"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="block mb-2">Nome * (ex.: REGISTER2)</label>
                    <input id="name" pInputText class="p-inputtext" formControlName="name" />
                    <small *ngIf="name?.invalid && (name?.dirty || name?.touched)" class="p-error block mt-2">
                        Use de 1 a 11 caracteres entre letras, números, _ e -.
                    </small>
                </div>
                <div class="field mb-4">
                    <label for="dns" class="block mb-2">DNS *</label>
                    <input id="dns" pInputText class="p-inputtext" formControlName="dns" />
                    <small *ngIf="dns?.invalid && (dns?.dirty || dns?.touched)" class="p-error block mt-2"
                        >DNS inválido.</small
                    >
                </div>
                <div class="field mb-4">
                    <label for="internalIp" class="block mb-2">IP interno *</label>
                    <input id="internalIp" pInputText class="p-inputtext" formControlName="internalIp" />
                    <small
                        *ngIf="internalIp?.invalid && (internalIp?.dirty || internalIp?.touched)"
                        class="p-error block mt-2"
                        >IP interno inválido.</small
                    >
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>
                <small *ngIf="errorMessage" class="text-red-500">{{ errorMessage }}</small>
            </form>
        </p-card>
    `
})
export class RegisterInstanceFormPage implements OnInit {
    form!: FormGroup;
    pending = false;
    errorMessage = '';
    id: number | null = null;

    constructor(
        private readonly fb: FormBuilder,
        private readonly registerService: RegisterInstanceService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute
    ) {}

    get name() {
        return this.form.get('name');
    }
    get dns() {
        return this.form.get('dns');
    }
    get internalIp() {
        return this.form.get('internalIp');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required, Validators.pattern(NAME_PATTERN)]],
            dns: ['', [Validators.required, Validators.pattern(HOST_PATTERN)]],
            internalIp: ['', [Validators.required, Validators.pattern(HOST_PATTERN)]]
        });
        const idParam = this.activatedRoute.snapshot.paramMap.get('id');
        if (idParam) {
            this.id = Number(idParam);
            this.registerService.findById(this.id).then((register) => this.form.patchValue(register));
        }
    }

    onSubmit() {
        this.pending = true;
        this.errorMessage = '';
        const request = this.id
            ? this.registerService.update(this.id, this.form.value)
            : this.registerService.create(this.form.value);
        request
            .then(() => this.router.navigate(['/pabx/register-instances']))
            .catch((err) => (this.errorMessage = err?.error?.message || 'Houve um erro ao salvar o register.'))
            .finally(() => (this.pending = false));
    }
}
