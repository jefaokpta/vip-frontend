import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {InputNumberModule} from 'primeng/inputnumber';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {Pausa} from '@/pabx/types/pausa';
import {PausaService} from '@/pabx/pausa/pausa.service';

@Component({
    selector: 'app-new-pausa-page',
    standalone: true,
    imports: [InputTextModule, InputNumberModule, ButtonModule, CardModule, NgIf, ReactiveFormsModule, RouterLink],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Nova Pausa</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/pausas"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="block mb-2">Nome *</label>
                    <input id="name" pInputText class="p-inputtext" formControlName="name"/>
                    <small *ngIf="name?.invalid && (name?.dirty || name?.touched)" class="p-error block mt-2">
                        <div *ngIf="name?.errors?.['required']">Nome é obrigatório.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="timeLimitMinutes" class="block mb-2">Tempo Limite (minutos)</label>
                    <p-inputNumber
                        id="timeLimitMinutes"
                        formControlName="timeLimitMinutes"
                        [min]="0"
                        [showButtons]="true"
                        class="w-full"
                    />
                    <small class="block mt-2 text-surface-500 dark:text-surface-400">0 = tempo ilimitado</small>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>

                <small *ngIf="showError" class="text-red-500"> Erro ao salvar a pausa </small>
            </form>
        </p-card>
    `
})
export class NewPausaPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly pausaService: PausaService
    ) {
    }

    get name() {
        return this.form.get('name');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            timeLimitMinutes: [0, [Validators.required, Validators.min(0)]]
        });
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        const pausa: Pausa = {...this.form.value};
        this.pausaService
            .create(pausa)
            .then(() => this.router.navigate(['/pabx/pausas']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
