import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router, RouterLink } from '@angular/router';
import { RouteService } from '@/pabx/route/route.service';
import { NgForOf } from '@angular/common';
import { InputNumber } from 'primeng/inputnumber';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-new-route-page',
    standalone: true,
    imports: [InputTextModule, ButtonModule, CardModule, ReactiveFormsModule, RouterLink, NgForOf, InputNumber],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Nova Rota</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/routes"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="block mb-2">Nome *</label>
                    <input id="name" pInputText class="p-inputtext" formControlName="name" />
                    @if (name?.invalid && (name?.dirty || name?.touched)) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Nome é obrigatório.</span>
                        </small>
                    }
                </div>

                <div class="field mb-4">
                    <label for="timeout" class="block mb-2">Tempo limite de discagem *</label>
                    <p-input-number id="timeout" mode="decimal" useGrouping="false" formControlName="timeout" />
                    @if (timeout?.invalid && (timeout?.dirty || timeout?.touched)) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Tempo limite de discagem é obrigatório.</span>
                        </small>
                    }
                </div>

                <p-card>
                    <ng-template #title>
                        <span class="font-semibold text-xl">Ordem dos Troncos</span>
                    </ng-template>

                    <div class="field mb-4">
                        <div formArrayName="routeTrunks">
                            <div
                                *ngFor="let routeTrunk of routeTrunks.controls; let i = index"
                                [formGroupName]="i"
                                class="mb-3"
                            >
                                <div class="flex gap-2">
                                    <span>Local</span>
                                    <div class="flex-1">
                                        <input
                                            formControlName="name"
                                            type="text"
                                            pInputText
                                            placeholder="Nome"
                                            class="w-full"
                                        />
                                    </div>
                                    <div class="flex-1">
                                        <input
                                            formControlName="value"
                                            type="text"
                                            pInputText
                                            placeholder="Valor"
                                            class="w-full"
                                        />
                                    </div>
                                </div>
                                @if (routeTrunk.invalid && (routeTrunk.dirty || routeTrunk.touched)) {
                                    <small class="p-error block mt-2">
                                        <span class="text-red-500">Nome e valor são obrigatórios.</span>
                                    </small>
                                }
                            </div>
                        </div>
                    </div>
                </p-card>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        @if (pending) {
                            <i class="pi pi-spin pi-spinner"></i>
                        } @else {
                            <i class="pi pi-save"></i>
                        }
                    </p-button>
                </div>

                @if (showError) {
                    <small class="text-red-500"> Erro ao salvar o tronco </small>
                }
            </form>
        </p-card>
    `
})
export class NewRoutePage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly routeService: RouteService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            timeout: [60, [Validators.required]],
            flags: ['T'],
            routeTrunks: this.fb.array([])
        });
        this.addRouteTrunk();
    }

    private addRouteTrunk() {
        const routeTrunk = this.fb.group({
            name: ['', [Validators.required]],
            value: ['', [Validators.required]]
        });
        this.routeTrunks.push(routeTrunk);
    }

    get name() {
        return this.form.get('name');
    }
    get timeout() {
        return this.form.get('timeout');
    }
    get routeTrunks() {
        return this.form.get('routeTrunks') as FormArray;
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        console.log(this.form.value);
        // this.routeService
        //     .create(this.form.value)
        //     .then(() => this.router.navigate(['/pabx/routes']))
        //     .catch(() => {
        //         this.showError = true;
        //     })
        //     .finally(() => (this.pending = false));
    }
}
