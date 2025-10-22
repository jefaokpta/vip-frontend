import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { Textarea } from 'primeng/textarea';
import { NgIf } from '@angular/common';
import { Select } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { HttpClientService } from '@/services/http-client.service';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/28/25
 */
@Component({
    selector: 'app-guidelines',
    standalone: true,
    imports: [CardModule, InputTextModule, ButtonModule, ReactiveFormsModule, ToastModule, Textarea, NgIf, Select, Tooltip],
    providers: [MessageService],
    template: `
        <p-toast></p-toast>
        <p-card>
            <ng-template #title><span class="font-semibold text-2xl">Diretrizes da empresa para IA</span></ng-template>
            <ng-template #subtitle> Configure as diretrizes para a IA com informações sobre sua empresa. Estas informações ajudarão a IA a entender melhor o
                contexto do seu negócio.
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="field mb-4">
                    <label for="companyName" class="block text-900 font-medium mb-2">Nome da Empresa*</label>
                    <input id="companyName" type="text" pInputText formControlName="companyName" />
                    <small *ngIf="form.get('companyName')?.invalid && form.get('companyName')?.touched" class="p-error block">Nome da empresa é
                        obrigatório</small>
                </div>

                <div class="field mb-4">
                    <label for="activity" class="block text-900 font-medium mb-2">Atividade*</label>
                    <p-select id="activity" [options]="activityOptions" optionLabel="label" optionValue="value" formControlName="activity"
                              placeholder="Selecione a atividade"></p-select>
                    <small *ngIf="form.get('activity')?.invalid && form.get('activity')?.touched" class="p-error block">Atividade é obrigatória</small>
                </div>

                <div class="field mb-4">
                    <label for="actuationArea" class="block text-900 font-medium mb-2">Área de Atuação*</label>
                    <p-select id="actuationArea" [options]="actuationAreaOptions" optionLabel="label" optionValue="value" formControlName="actuationArea"
                              placeholder="Selecione a área de atuação"></p-select>
                    <small *ngIf="form.get('actuationArea')?.invalid && form.get('actuationArea')?.touched" class="p-error block">Área de atuação é
                        obrigatória</small>
                </div>

                <div class="field mb-4">
                    <label for="descriptionUrl" class="block text-900 font-medium mb-2">
                        Link de conteúdo (site ou PDF)
                        <i
                            class="pi pi-question-circle cursor-help"
                            pTooltip="Neste campo, você pode adicionar informações complementares que considera importantes para a Iasmin, como detalhes específicos sobre sua estratégia de vendas, diferenciais da empresa ou particularidades do seu mercado."
                        ></i>
                    </label>
                    <input id="descriptionUrl" type="text" placeholder="Ex: https://www.dominio.com.br" pInputText class="w-full"
                           formControlName="descriptionUrl" />
                    <small *ngIf="form.get('descriptionUrl')?.invalid && form.get('descriptionUrl')?.touched" class="p-error block">URL do website
                        inválida</small>
                </div>

                <div class="field mb-4">
                    <label for="description" class="block text-900 font-medium mb-2">Descrição da Empresa</label>
                    <textarea
                        id="description"
                        pTextarea
                        [rows]="5"
                        [cols]="30"
                        formControlName="description"
                        class="w-full"
                        placeholder="Neste campo, você pode adicionar informações complementares que considera importantes para a Iasmin, como detalhes específicos sobre sua estratégia de vendas, diferenciais da empresa ou particularidades do seu mercado."
                    ></textarea>
                    <small *ngIf="form.get('description')?.invalid && form.get('description')?.touched" class="p-error block">
                        {{ form.get('description')?.errors?.['minlength'] ? 'A descrição deve ter no mínimo 100 caracteres' : '' }}
                    </small>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" icon="pi pi-save" [disabled]="form.invalid"></p-button>
                </div>
            </form>
        </p-card>
    `
})
export class Guidelines implements OnInit {
    form!: FormGroup;
    activityOptions = [
        { label: 'Indústria', value: 'Indústria' },
        { label: 'Serviço', value: 'Serviço' },
        { label: 'Comércio', value: 'Comércio' },
        { label: 'Governo', value: 'Governo' },
        { label: 'Terceiro Setor', value: 'Terceiro Setor' }
    ];
    actuationAreaOptions = [
        { label: 'Administrativo', value: 'Administrativo' },
        { label: 'Alimentação', value: 'Alimentação' },
        { label: 'Automotivo', value: 'Automotivo' },
        { label: 'Beleza', value: 'Beleza' },
        { label: 'Comércio Atacadista', value: 'Comércio Atacadista' },
        { label: 'Comércio Varejista', value: 'Comércio Varejista' },
        { label: 'Contábil', value: 'Contábil' },
        { label: 'Educação', value: 'Educação' },
        { label: 'Financeiro', value: 'Financeiro' },
        { label: 'Gráficas e Impressos', value: 'Gráficas e Impressos' },
        { label: 'Imobiliário', value: 'Imobiliário' },
        { label: 'Jurídico', value: 'Jurídico' },
        { label: 'Marketing e Vendas', value: 'Marketing e Vendas' },
        { label: 'Metalúrgica', value: 'Metalúrgica' },
        { label: 'Pets', value: 'Pets' },
        { label: 'Química', value: 'Química' },
        { label: 'Saúde', value: 'Saúde' },
        { label: 'Tecnologia', value: 'Tecnologia' },
        { label: 'Turismo/Hotelaria', value: 'Turismo/Hotelaria' },
        { label: 'Vestuário', value: 'Vestuário' }
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly messageService: MessageService,
        private readonly httpClientService: HttpClientService
    ) {}

    ngOnInit() {
        this.form = this.fb.group({
            companyName: ['', Validators.required],
            activity: ['', Validators.required],
            actuationArea: ['', Validators.required],
            descriptionUrl: ['', [Validators.pattern('https?://.+')]],
            description: ['', [Validators.minLength(100)]]
        });
        this.httpClientService.findGuideline().then((guideline) => this.form.patchValue(guideline));
    }

    async onSubmit() {
        try {
            await this.httpClientService.updateGuideline(this.form.value);
            this.messageService.add({
                severity: 'success',
                summary: 'Sucesso',
                detail: 'Diretrizes da empresa salvas com sucesso!',
                life: 13000
            });
        } catch (error: any) {
            console.error('atualizar guidelines', error.message);
            this.messageService.add({
                severity: 'error',
                summary: 'Erro',
                detail: 'Por favor, tente novamente.'
            });
        }
    }
}
