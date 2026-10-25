import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { NgIf } from '@angular/common';
import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';
import { DdrService } from '@/pabx/ddr/ddr.service';
import { Ddr } from '@/pabx/types/ddr';
import { HttpErrorResponse } from '@angular/common/http';
import { DDR_MAX_DIGITS, ddrValidator, formatDdr, onlyDigits } from '@/pabx/ddr/ddr-format';

@Component({
    selector: 'app-edit-ddr-page',
    standalone: true,
    providers: [MessageService],
    imports: [Card, Button, InputText, NgIf, ReactiveFormsModule, RouterLink, Toast],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar DDR {{ ddrData ? formatDdr(ddrData.ddr) : '' }}</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/ddrs"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="ddr" class="block mb-2">Telefone *</label>
                    <input
                        id="ddr"
                        pInputText
                        class="p-inputtext"
                        formControlName="ddr"
                        placeholder="Ex: (11) 3212-1234"
                        (input)="onDdrInput($event)"
                    />
                    <small *ngIf="ddr?.invalid && (ddr?.dirty || ddr?.touched)" class="p-error block mt-2">
                        <div *ngIf="ddr?.errors?.['required']">Telefone é obrigatório.</div>
                        <div *ngIf="ddr?.errors?.['ddrFormat']">
                            Formato inválido. Use DDD+número, operadora+DDD+número, 0+operadora+DDD+número ou 0800.
                        </div>
                    </small>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>
            </form>
        </p-card>
        <p-toast />
    `
})
export class EditDdrPage implements OnInit {
    form!: FormGroup;
    pending = false;
    ddrData?: Ddr;
    protected readonly formatDdr = formatDdr;
    private readonly id: string;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly ddrService: DdrService,
        private readonly messageService: MessageService,
        private readonly activatedRoute: ActivatedRoute
    ) {
        this.id = this.activatedRoute.snapshot.params['id'];
    }

    get ddr() {
        return this.form.get('ddr');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            id: ['', [Validators.required]],
            companyId: ['', [Validators.required]],
            ddr: ['', [Validators.required, ddrValidator]]
        });
        this.ddrService.findById(this.id).then((ddrData) => {
            this.ddrData = ddrData;
            this.form.patchValue({ ...ddrData, ddr: formatDdr(ddrData.ddr) });
        });
    }

    onDdrInput(event: Event) {
        const digits = onlyDigits((event.target as HTMLInputElement).value).slice(0, DDR_MAX_DIGITS);
        this.ddr?.setValue(formatDdr(digits));
    }

    onSubmit() {
        this.pending = true;
        this.ddrService
            .update({ ...this.form.value, ddr: onlyDigits(this.form.value.ddr) })
            .then(() => this.router.navigate(['/pabx/ddrs']))
            .catch((error: HttpErrorResponse) => {
                this.messageService.add({
                    severity: 'error',
                    summary: error?.error?.message ?? 'Erro ao salvar o DDR',
                    life: 15_000
                });
            })
            .finally(() => (this.pending = false));
    }
}
