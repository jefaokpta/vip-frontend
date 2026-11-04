import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {NgIf} from '@angular/common';
import {MessageService} from 'primeng/api';
import {Toast} from 'primeng/toast';
import {DdrFieldComponent} from '@/pabx/ddr/ddr-field.component';
import {DdrService} from '@/pabx/ddr/ddr.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ddrValidator, onlyDigits} from '@/pabx/ddr/ddr-format';

@Component({
    selector: 'app-new-ddr-page',
    standalone: true,
    providers: [MessageService],
    imports: [Card, Button, DdrFieldComponent, NgIf, ReactiveFormsModule, RouterLink, Toast],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Novo DDR</span>
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
                <app-ddr-field [control]="ddrControl"/>

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
export class NewDdrPage implements OnInit {
    form!: FormGroup;
    pending = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly ddrService: DdrService,
        private readonly messageService: MessageService
    ) {}

    get ddrControl() {
        return this.form.get('ddr') as FormControl;
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            ddr: ['', [Validators.required, ddrValidator]]
        });
    }

    onSubmit() {
        this.pending = true;
        this.ddrService
            .create({ ...this.form.value, ddr: onlyDigits(this.form.value.ddr) })
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
