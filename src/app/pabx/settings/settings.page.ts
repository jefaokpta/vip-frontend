import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Card } from 'primeng/card';
import { Select } from 'primeng/select';
import { Toast } from 'primeng/toast';
import { FormsModule } from '@angular/forms';
import { Moh } from '@/pabx/types';
import { MohService } from '@/pabx/moh/moh.service';
import { CompanySettingsService } from '@/pabx/settings/company-settings.service';

@Component({
    selector: 'app-settings-page',
    standalone: true,
    providers: [MessageService],
    imports: [Card, Select, Toast, FormsModule],
    template: `
        <p-card>
            <ng-template #title>
                <h2 class="text-surface-900 dark:text-surface-0 text-2xl font-semibold mb-4">Definições Gerais</h2>
            </ng-template>

            <div class="field mb-4">
                <label class="block mb-2 font-medium">Music on Hold Padrão</label>
                <p-select
                    [options]="mohOptions"
                    [(ngModel)]="selectedMohId"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Selecione um MOH"
                    [style]="{ 'min-width': '20rem' }"
                    (onChange)="onMohChange()"
                ></p-select>
            </div>
        </p-card>
        <p-toast />
    `
})
export class SettingsPage implements OnInit {
    mohOptions: { label: string; value: number | null }[] = [];
    selectedMohId: number | null = null;

    constructor(
        private readonly mohService: MohService,
        private readonly settingsService: CompanySettingsService,
        private readonly messageService: MessageService
    ) {}

    ngOnInit(): void {
        Promise.all([this.mohService.findAll(), this.settingsService.get()]).then(([mohs, settings]) => {
            this.mohOptions = [
                { label: 'Nenhum', value: null },
                ...mohs.map((moh: Moh) => ({ label: moh.name, value: moh.id }))
            ];
            this.selectedMohId = settings.defaultMohId;
        });
    }

    onMohChange(): void {
        this.settingsService
            .update(this.selectedMohId)
            .then(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Configuração salva com sucesso',
                    life: 3000
                });
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao salvar configuração',
                    detail: 'Tente novamente mais tarde.',
                    life: 5000
                });
            });
    }
}
