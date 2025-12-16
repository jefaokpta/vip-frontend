/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 5/13/25
 */

import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { AccountCodeService } from '@/pabx/accountcode/account-code.service';

@Component({
    selector: 'app-new-account-code-page',
    imports: [Button, InputText, NgIf, ReactiveFormsModule, RouterLink, Card, Select],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Novo Centro de Custo</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/accountcodes"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="code" class="block mb-2">Categoria *</label>
                    <p-select
                        id="code"
                        [options]="codeOptions"
                        formControlName="code"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione a Categoria"
                    ></p-select>
                    <small *ngIf="code?.invalid && (code?.dirty || code?.touched)" class="p-error block mt-2">
                        <div *ngIf="code?.errors?.['required']">Categoria é obrigatória.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="title" class="block mb-2">Título *</label>
                    <input id="title" pInputText class="p-inputtext" formControlName="acTitle" />
                    <small *ngIf="acTitle?.invalid && (acTitle?.dirty || acTitle?.touched)" class="p-error block mt-2">
                        <div *ngIf="acTitle?.errors?.['required']">Título é obrigatório.</div>
                    </small>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" icon="pi pi-save" [disabled]="form.invalid"></p-button>
                </div>
            </form>
        </p-card>
    `
})
export class NewAccountCodePage implements OnInit {
    form!: FormGroup;
    codeOptions: { label: string; value: string }[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly accountCodeService: AccountCodeService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            acTitle: ['', [Validators.required]],
            code: ['', [Validators.required]]
        });
        this.accountCodeService.findAll().then((accountCodes) => {
            this.codeOptions = accountCodes.map((accountCode) => ({
                label: accountCode.title,
                value: accountCode.code
            }));
        });
    }

    get acTitle() {
        return this.form.get('acTitle');
    }

    get code() {
        return this.form.get('code');
    }

    onSubmit() {
        this.accountCodeService
            .create({ ...this.form.value, title: this.acTitle?.value })
            .then(() => this.router.navigate(['/pabx/accountcodes']));
    }
}
