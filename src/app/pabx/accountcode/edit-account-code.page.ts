/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 5/13/25
 */

import {Component, OnInit} from '@angular/core';
import {Button} from 'primeng/button';
import {InputText} from 'primeng/inputtext';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {Card} from 'primeng/card';
import {AccountCodeService} from '@/pabx/accountcode/account-code.service';
import {AccountCode} from "@/pabx/types";
import {InputNumber} from "primeng/inputnumber";

@Component({
    selector: 'app-edit-account-code-page',
    imports: [Button, InputText, NgIf, ReactiveFormsModule, RouterLink, Card, InputNumber],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar {{ accountCode?.title }}
                        - {{ accountCode?.code }}</span>
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
                    <label for="title" class="block mb-2">Título *</label>
                    <input id="title" pInputText class="p-inputtext" formControlName="acTitle"/>
                    <small *ngIf="acTitle?.invalid && (acTitle?.dirty || acTitle?.touched)" class="p-error block mt-2">
                        <div *ngIf="acTitle?.errors?.['required']">Título é obrigatório.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="cadence" class="block mb-2">Cadência *</label>
                    <p-input-number id="cadence" mode="decimal" useGrouping="false" formControlName="cadence"/>
                    <small *ngIf="cadence?.invalid && (cadence?.dirty || cadence?.touched)" class="p-error block mt-2">
                        <div *ngIf="cadence?.errors?.['required']">Cadência é obrigatória.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="fraction" class="block mb-2">Fração *</label>
                    <p-input-number id="fraction" mode="decimal" useGrouping="false" formControlName="fraction"/>
                    <small *ngIf="fraction?.invalid && (fraction?.dirty || fraction?.touched)"
                           class="p-error block mt-2">
                        <div *ngIf="fraction?.errors?.['required']">Fração é obrigatória.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="cost" class="block mb-2">Custo *</label>
                    <p-input-number id="cost" mode="currency" currency="BRL" currencyDisplay="symbol"
                                    formControlName="cost"/>
                    <small *ngIf="cost?.invalid && (cost?.dirty || cost?.touched)" class="p-error block mt-2">
                        <div *ngIf="cost?.errors?.['required']">Custo é obrigatório.</div>
                    </small>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" icon="pi pi-save" [disabled]="form.invalid"></p-button>
                </div>
            </form>
        </p-card>
    `
})
export class EditAccountCodePage implements OnInit {
    form!: FormGroup;
    private readonly id: string;
    accountCode?: AccountCode

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly accountCodeService: AccountCodeService,
        private readonly activatedRoute: ActivatedRoute
    ) {
        this.id = this.activatedRoute.snapshot.params['id'];
    }


    ngOnInit(): void {
        this.form = this.fb.group({
            id: ['', [Validators.required]],
            code: ['', [Validators.required]],
            acTitle: ['', [Validators.required]],
            fraction: ['', [Validators.required]],
            cost: ['', [Validators.required]],
            cadence: ['', [Validators.required]],
        });
        this.accountCodeService.findById(this.id).then((accountCode) => {
            this.accountCode = accountCode;
            this.form.patchValue(accountCode);
            this.acTitle?.setValue(accountCode.title)
        });
    }

    onSubmit() {
        const accode = {...this.form.value, title: this.acTitle?.value}
        this.accountCodeService.update(accode).then(() => {
            this.router.navigate(['/pabx/accountcodes'])
        })
    }

    get acTitle() {
        return this.form.get('acTitle');
    }

    get cadence() {
        return this.form.get('cadence');
    }

    get fraction() {
        return this.form.get('fraction');
    }

    get cost() {
        return this.form.get('cost');
    }

}
