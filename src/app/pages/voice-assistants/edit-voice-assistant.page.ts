/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/28/25
 */
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Textarea } from 'primeng/textarea';
import { HttpClientService } from '@/services/http-client.service';
import { Message } from 'primeng/message';
import { InputSwitch } from 'primeng/inputswitch';
import { VoiceAssistant } from '@/types/types';
import { MultiSelect } from 'primeng/multiselect';

@Component({
    selector: 'app-edit-voice-assistant-page',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NgIf,
        ButtonModule,
        CardModule,
        InputTextModule,
        TooltipModule,
        DividerModule,
        Textarea,
        RouterLink,
        Message,
        InputSwitch,
        FormsModule,
        MultiSelect
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar Assistente de Voz</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pages/voice/assistants"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="field mb-4 mt-4">
                    <label for="name" class="block text-900 font-medium mb-2">Nome *</label>
                    <input id="name" type="text" pInputText formControlName="name" />
                    <small *ngIf="form.get('name')?.invalid && form.get('name')?.touched" class="p-error block">Nome é obrigatório</small>
                </div>

                <div class="field mb-2">
                    <label class="block text-900 font-medium mb-2">Assistente inicia falando</label>
                    <p-inputSwitch [(ngModel)]="startSpeaking" [ngModelOptions]="{ standalone: true }"></p-inputSwitch>
                </div>

                <ng-container *ngIf="startSpeaking">
                    <div class="field mb-4">
                        <label for="name" class="block text-900 font-medium mb-2">Mensagem inicial *</label>
                        <input id="name" type="text" class="w-full" pInputText formControlName="firstMessage" placeholder="Olá! Seja bem vindo!" />
                        <small *ngIf="form.get('firstMessage')?.invalid && form.get('firstMessage')?.touched" class="p-error block"
                            >Mensagem inicial é obrigatória</small
                        >
                    </div>
                </ng-container>

                <div class="field mb-4">
                    <label for="objective" class="block text-900 font-medium mb-2">Descrição do Assistente *</label>
                    <textarea id="objective" pTextarea [rows]="14" [cols]="30" class="w-full" formControlName="objective"></textarea>
                    <small *ngIf="form.get('objective')?.invalid && form.get('objective')?.touched" class="p-error block">
                        {{ form.get('objective')?.errors?.['required'] ? 'O Objetivo é obrigatório' : '' }}
                        {{ form.get('objective')?.errors?.['minlength'] ? 'A descrição deve ter no mínimo 50 caracteres' : '' }}
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="tools" class="block text-900 font-medium mb-2">Integrações</label>
                    <p-multi-select
                        id="tools"
                        [options]="tools"
                        [(ngModel)]="selectedTools"
                        [ngModelOptions]="{ standalone: true }"
                        optionLabel="name"
                        placeholder="Integrações Disponíveis"
                        [maxSelectedLabels]="3"
                        class="w-full md:w-80"
                    ></p-multi-select>
                </div>

                <!--                <div class="field mb-4">-->
                <!--                    <div class="flex items-center gap-4 mb-2">-->
                <!--                        <label class="font-medium">Materiais de Apoio (Site ou PDF)</label>-->
                <!--                        <p-button-->
                <!--                            type="button"-->
                <!--                            icon="pi pi-plus"-->
                <!--                            (onClick)="addMaterial()"-->
                <!--                            [disabled]="materiaisDeApoio.length >= 3"-->
                <!--                            pTooltip="Adicionar material de apoio"-->
                <!--                            tooltipPosition="right"-->
                <!--                            outlined-->
                <!--                            size="small"-->
                <!--                        ></p-button>-->
                <!--                    </div>-->

                <!--                    <div formArrayName="materiaisDeApoio">-->
                <!--                        <div *ngFor="let material of materiaisDeApoio.controls; let i = index" class="mb-3">-->
                <!--                            <div class="flex gap-2">-->
                <!--                                <div class="flex-grow-1">-->
                <!--                                    <input [formControlName]="i" type="text" pInputText placeholder="https://exemplo.com" class="w-full" />-->
                <!--                                    <small *ngIf="material.invalid && material.touched" class="p-error block">URL inválida</small>-->
                <!--                                </div>-->
                <!--                                <p-button type="button" icon="pi pi-trash" (onClick)="removeMaterial(i)" severity="danger" outlined></p-button>-->
                <!--                            </div>-->
                <!--                            <p-divider *ngIf="i < materiaisDeApoio.length - 1"></p-divider>-->
                <!--                        </div>-->

                <!--                        <small *ngIf="materiaisDeApoio.length === 0" class="text-500 block">-->
                <!--                            Adicione até 3 sites como materiais de apoio para seu assistente.-->
                <!--                        </small>-->
                <!--                    </div>-->
                <!--                </div>-->

                <div class="flex gap-4">
                    <p-button type="submit" label="Salvar" icon="pi pi-save" [disabled]="form.invalid || isSubmitting"></p-button>
                </div>
                <div class="mt-4">
                    <p-message *ngIf="onSubmitError" severity="error" text="Ocorreu um erro, por favor tente novamente."></p-message>
                </div>
            </form>
        </p-card>
    `
})
export class EditVoiceAssistantPage implements OnInit {
    form!: FormGroup;
    isSubmitting = false;
    onSubmitError = false;
    startSpeaking = false;
    tools = [{ name: 'Google Calendário', value: 'google-calendar' }];
    selectedTools: { name: string, value: string }[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly httpClientService: HttpClientService
    ) {}

    get materiaisDeApoio() {
        return this.form.get('materiaisDeApoio') as FormArray;
    }

    ngOnInit() {
        const id = this.activatedRoute.snapshot.paramMap.get('id')!;
        this.form = this.fb.group({
            id,
            name: ['', Validators.required],
            firstMessage: [''],
            objective: ['', [Validators.required, Validators.minLength(50)]],
            materiaisDeApoio: this.fb.array([]),
            tools: this.fb.array([])
        });
        this.httpClientService.findVoiceAssistantById(id).then((assistant) => {
            this.form.patchValue(assistant);
            this.startSpeaking = assistant.startSpeaking;
            this.selectedTools = this.tools.filter((tool) => assistant.tools.includes(tool.value));
        });
    }

    addMaterial() {
        if (this.materiaisDeApoio.length < 3) {
            this.materiaisDeApoio.push(this.fb.control('', [Validators.pattern('https?://.+')]));
        }
    }

    removeMaterial(index: number) {
        this.materiaisDeApoio.removeAt(index);
    }

    onSubmit() {
        this.isSubmitting = true;
        // Filtrar materiais de apoio vazios
        const materiaisValidos = this.materiaisDeApoio.value.filter((url: string) => url.trim() !== '');
        const formData: VoiceAssistant = {
            ...this.form.value,
            startSpeaking: this.startSpeaking,
            tools: this.selectedTools.map((tool) => tool.value),
            materiaisDeApoio: materiaisValidos
        };
        this.httpClientService
            .updateVoiceAssistant(formData)
            .then(() => {
                this.router.navigate(['/pages/voice/assistants']);
            })
            .catch((err) => {
                this.onSubmitError = true;
                console.error(err.message);
            })
            .finally(() => this.isSubmitting = false)
    }
}
