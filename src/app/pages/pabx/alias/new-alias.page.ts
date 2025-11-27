import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputTextModule} from 'primeng/inputtext';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {ToastModule} from 'primeng/toast';
import {NgForOf, NgIf} from '@angular/common';
import {Router, RouterLink} from '@angular/router';
import {Tooltip} from 'primeng/tooltip';
import {Alias} from "@/pages/pabx/types";
import {AliasService} from "@/pages/pabx/alias/alias.service";

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-new-alias-page',
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
                    <span class="font-semibold text-2xl">Novo Alias</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pages/pabx/alias"
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
                    <div class="flex items-center gap-4 mb-2">
                        <label class="font-medium">Expressões Regulares</label>
                        <p-button
                            type="button"
                            icon="pi pi-plus"
                            (onClick)="addExpression()"
                            pTooltip="Adicionar expressão"
                            tooltipPosition="right"
                            outlined
                            size="small"
                        ></p-button>
                    </div>

                    <div formArrayName="expressions">
                        <div *ngFor="let expression of expressions.controls; let i = index" class="mb-3">
                            <div class="flex gap-2">
                                <div class="flex-grow-1">
                                    <input
                                        [formControlName]="i"
                                        type="text"
                                        pInputText
                                        placeholder="1X[34]"
                                        class="w-full"
                                    />
                                    <small *ngIf="expression.invalid && expression.touched" class="p-error block">
                                        Expressão Obrigatória
                                    </small>
                                </div>
                                <p-button
                                    *ngIf="expressions.length > 1"
                                    type="button"
                                    icon="pi pi-trash"
                                    (onClick)="removeExpression(i)"
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

                <small *ngIf="showError" class="text-red-500">
                    Erro ao salvar o alias
                </small>
            </form>
        </p-card>
    `
})
export class NewAliasPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly aliasService: AliasService
    ) {
    }

    get expressions() {
        return this.form.get('expressions') as FormArray;
    }

    get name() {
        return this.form.get('name');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            expressions: this.fb.array([])
        });
        this.addExpression();
    }

    addExpression() {
        this.expressions.push(this.fb.control('', [Validators.required]));
    }

    removeExpression(index: number) {
        this.expressions.removeAt(index);
    }

    async onSubmit() {
        this.pending = true;
        this.showError = false;
        const alias: Alias = {
            ...this.form.value,
            expressions: this.form.value.expressions.map((expression: string) => {
                return {expression};
            })
        };
        this.aliasService.createAlias(alias)
            .then(() => this.router.navigate(['/pages/pabx/aliases']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
