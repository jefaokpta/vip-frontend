import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputNumber } from 'primeng/inputnumber';
import { Toast } from 'primeng/toast';
import { BillingService } from '@/pages/billing/billing.service';
import { OmieConfig } from '@/pages/billing/types';

@Component({
    selector: 'app-omie-config-page',
    standalone: true,
    imports: [Button, Card, InputNumber, ReactiveFormsModule, RouterLink, Toast],
    providers: [MessageService],
    template: `
        <p-card>
            <ng-template #title>
                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4">
                    Configuração Omie - Códigos de serviço
                </h2>
            </ng-template>
            <form [formGroup]="form" (ngSubmit)="save()" class="flex flex-col gap-4 max-w-md">
                @for (f of fields; track f.name) {
                    <div class="flex flex-col gap-2">
                        <label [for]="f.name">{{ f.label }}</label>
                        <p-inputnumber [inputId]="f.name" [formControlName]="f.name" [useGrouping]="false" />
                    </div>
                }
                <div class="flex gap-2">
                    <p-button type="submit" icon="pi pi-save" label="Salvar" [disabled]="form.invalid" />
                    <p-button label="Voltar" severity="secondary" outlined routerLink="/pages/billing" />
                </div>
            </form>
        </p-card>
        <p-toast />
    `
})
export class OmieConfigPage implements OnInit {
    readonly fields: { name: keyof OmieConfig; label: string }[] = [
        { name: 'codServicoConsumo', label: 'Serviço - Consumo' },
        { name: 'codServicoMinutos', label: 'Serviço - Minutos' },
        { name: 'codServicoInternacional', label: 'Serviço - Internacional' },
        { name: 'codServico0800', label: 'Serviço - 0800' },
        { name: 'codServico4000', label: 'Serviço - 4000' }
    ];

    private readonly fb = inject(FormBuilder);

    form: FormGroup = this.fb.group({
        codServicoConsumo: [null as number | null, Validators.required],
        codServicoMinutos: [null as number | null, Validators.required],
        codServicoInternacional: [null as number | null, Validators.required],
        codServico0800: [null as number | null, Validators.required],
        codServico4000: [null as number | null, Validators.required]
    });

    constructor(
        private readonly billingService: BillingService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.billingService
            .getOmieConfig()
            .then((config) => this.form.patchValue(config))
            .catch((err) => this.error(err, 'Não foi possível carregar a configuração'));
    }

    save(): Promise<void> {
        return this.billingService
            .saveOmieConfig(this.form.getRawValue() as OmieConfig)
            .then(() => this.messageService.add({ severity: 'success', summary: 'Configuração salva', life: 15_000 }))
            .catch((err) => this.error(err, 'Não foi possível salvar a configuração'));
    }

    private error(err: any, summary: string): void {
        this.messageService.add({ severity: 'error', summary, detail: err?.error?.message, life: 15_000 });
    }
}
