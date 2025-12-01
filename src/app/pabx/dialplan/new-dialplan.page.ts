import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {DialPlanService} from './dial-plan.service';
import {DialPlan} from "@/pabx/types";
import {Select} from "primeng/select";

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-new-dialplan-page',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        NgIf,
        ReactiveFormsModule,
        RouterLink,
        Select
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Nova Regra</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/dialplans"
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

                <div class="flex gap-24">
                    <div class="field mb-4">
                        <label for="src" class="block mb-2">Origem *</label>
                        <p-select
                            id="src"
                            [options]="srcOptions"
                            formControlName="src"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecione uma origem"
                            (onChange)="manageSrcValue()"
                        ></p-select>
                        <small *ngIf="src?.invalid && (src?.dirty || src?.touched)" class="p-error block mt-2">
                            <div *ngIf="src?.errors?.['required']">Origem é obrigatória.</div>
                        </small>
                    </div>
                    <div class="field mb-4" *ngIf="src?.value == 'PEER'">
                        <label for="srcValue" class="block mb-2">Ramal *</label>
                        <p-select
                            id="srcValue"
                            [options]="peerOptions"
                            formControlName="srcValue"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecione um ramal"
                        ></p-select>
                        <small *ngIf="srcValue?.invalid && (srcValue?.dirty || srcValue?.touched)"
                               class="p-error block mt-2">
                            <div *ngIf="srcValue?.errors?.['required']">Ramal é obrigatório.</div>
                        </small>
                    </div>
                    <div class="field mb-4" *ngIf="src?.value == 'AGENT'">
                        <label for="srcValue" class="block mb-2">Agente *</label>
                        <p-select
                            id="srcValue"
                            [options]="agentOptions"
                            formControlName="srcValue"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecione um agente"
                        ></p-select>
                        <small *ngIf="srcValue?.invalid && (srcValue?.dirty || srcValue?.touched)"
                               class="p-error block mt-2">
                            <div *ngIf="srcValue?.errors?.['required']">Agente é obrigatório.</div>
                        </small>
                    </div>
                </div>

                <!--                <div class="field mb-4">-->
                <!--                    <div class="flex items-center gap-4 mb-2">-->
                <!--                        <label class="font-medium">Expressões Regulares</label>-->
                <!--                        <p-button-->
                <!--                            type="button"-->
                <!--                            icon="pi pi-plus"-->
                <!--                            (onClick)="addExpression()"-->
                <!--                            pTooltip="Adicionar expressão"-->
                <!--                            tooltipPosition="right"-->
                <!--                            outlined-->
                <!--                            size="small"-->
                <!--                        ></p-button>-->
                <!--                    </div>-->

                <!--                    <div formArrayName="expressions">-->
                <!--                        <div *ngFor="let expression of expressions.controls; let i = index" class="mb-3">-->
                <!--                            <div class="flex gap-2">-->
                <!--                                <div class="flex-grow-1">-->
                <!--                                    <input-->
                <!--                                        [formControlName]="i"-->
                <!--                                        type="text"-->
                <!--                                        pInputText-->
                <!--                                        placeholder="1X[34]"-->
                <!--                                        class="w-full"-->
                <!--                                    />-->
                <!--                                    <small *ngIf="expression.invalid && expression.touched" class="p-error block">-->
                <!--                                        Expressão Obrigatória-->
                <!--                                    </small>-->
                <!--                                </div>-->
                <!--                                <p-button-->
                <!--                                    *ngIf="expressions.length > 1"-->
                <!--                                    type="button"-->
                <!--                                    icon="pi pi-trash"-->
                <!--                                    (onClick)="removeExpression(i)"-->
                <!--                                    severity="danger"-->
                <!--                                    outlined-->
                <!--                                ></p-button>-->
                <!--                            </div>-->
                <!--                        </div>-->
                <!--                    </div>-->
                <!--                </div>-->

                <p-card header="Ações" class="mb-4"></p-card>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>

                <small *ngIf="showError" class="text-red-500">
                    Erro ao salvar a regra
                </small>
            </form>
        </p-card>
    `
})
export class NewDialplanPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    srcOptions = [
        {label: 'Qualquer', value: 'ANY'},
        {label: 'Ramal', value: 'PEER'},
        {label: 'Agente', value: 'AGENT'},
        {label: 'Expressão Regular', value: 'EXPRESSION'},
        {label: 'Alias', value: 'ALIAS'},
        {label: 'Tronco', value: 'TRUNK'},
    ];


    peerOptions = [
        {label: 'Ramal 1929', value: '1929'},
        {label: 'Ramal 1928', value: '1928'},
    ];

    agentOptions = [
        {label: 'Agente 1', value: '1'},
        {label: 'Agente 2', value: '2'},
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly dialPlanService: DialPlanService
    ) {
    }

    get name() {
        return this.form.get('name');
    }

    get src() {
        return this.form.get('src');
    }

    get srcValue() {
        return this.form.get('srcValue');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            src: ['', [Validators.required]],
        });
    }

    manageSrcValue() {
        this.form.removeControl('srcValue');
        if (this.src?.value == 'PEER' || this.src?.value == 'AGENT') {
            this.form.addControl('srcValue', this.fb.control('', [Validators.required]));
        }
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        const dialplan: DialPlan = {
            ...this.form.value,
        };
        console.log(dialplan);
        // this.dialPlanService.create(dialplan)
        //     .then(() => this.router.navigate(['/pabx/dialplans']))
        //     .catch(() => {
        //         this.showError = true;
        //     })
        //     .finally(() => (this.pending = false));
    }
}
