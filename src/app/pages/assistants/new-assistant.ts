/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/28/25
 */
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { Router, RouterLink } from '@angular/router';
import { Textarea } from 'primeng/textarea';
import { HttpClientService } from '@/services/http-client.service';
import { Message } from 'primeng/message';

@Component({
    selector: 'app-new-assistant',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        NgIf,
        NgFor,
        ButtonModule,
        CardModule,
        InputTextModule,
        TooltipModule,
        DividerModule,
        Textarea,
        RouterLink,
        Message
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Novo Assistente</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pages/assistants"
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

                <div class="field mb-4">
                    <label for="objective" class="block text-900 font-medium mb-2">Descrição do Assistente *</label>
                    <textarea id="objective" pTextarea [rows]="14" [cols]="30" class="w-full" formControlName="objective"></textarea>
                    <small *ngIf="form.get('objective')?.invalid && form.get('objective')?.touched" class="p-error block">
                        {{ form.get('objective')?.errors?.['required'] ? 'O Objetivo é obrigatório' : '' }}
                        {{ form.get('objective')?.errors?.['minlength'] ? 'A descrição deve ter no mínimo 50 caracteres' : '' }}
                    </small>
                </div>

                <div class="field mb-4">
                    <div class="flex items-center gap-4 mb-2">
                        <label class="font-medium">Materiais de Apoio (Site ou PDF)</label>
                        <p-button
                            type="button"
                            icon="pi pi-plus"
                            (onClick)="addMaterial()"
                            [disabled]="materiaisDeApoio.length >= 3"
                            pTooltip="Adicionar material de apoio"
                            tooltipPosition="right"
                            outlined
                            size="small"
                        ></p-button>
                    </div>

                    <div formArrayName="materiaisDeApoio">
                        <div *ngFor="let material of materiaisDeApoio.controls; let i = index" class="mb-3">
                            <div class="flex gap-2">
                                <div class="flex-grow-1">
                                    <input [formControlName]="i" type="text" pInputText placeholder="https://exemplo.com" class="w-full" />
                                    <small *ngIf="material.invalid && material.touched" class="p-error block">URL inválida</small>
                                </div>
                                <p-button type="button" icon="pi pi-trash" (onClick)="removeMaterial(i)" severity="danger" outlined></p-button>
                            </div>
                            <p-divider *ngIf="i < materiaisDeApoio.length - 1"></p-divider>
                        </div>

                        <small *ngIf="materiaisDeApoio.length === 0" class="text-500 block">
                            Adicione até 3 sites como materiais de apoio para seu assistente.
                        </small>
                    </div>
                </div>

                <div class="flex gap-4">
                    <p-button type="submit" label="Salvar" icon="pi pi-save" [disabled]="form.invalid"></p-button>
                </div>
                <div class="mt-4">
                    <p-message *ngIf="onSubmitError" severity="error" text="Ocorreu um erro, por favor tente novamente."></p-message>
                </div>
            </form>
        </p-card>
    `
})
export class NewAssistant implements OnInit {
    form!: FormGroup;
    onSubmitError = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly httpClientService: HttpClientService
    ) {}

    get materiaisDeApoio() {
        return this.form.get('materiaisDeApoio') as FormArray;
    }

    ngOnInit() {
        this.form = this.fb.group({
            name: ['', Validators.required],
            objective: ['', [Validators.required, Validators.minLength(50)]],
            materiaisDeApoio: this.fb.array([])
        });
        // Adiciona um campo de material de apoio por padrão
        this.addMaterial();
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
        // Filtrar materiais de apoio vazios
        const materiaisValidos = this.materiaisDeApoio.value.filter((url: string) => url.trim() !== '');
        const formData = {
            ...this.form.value,
            materiaisDeApoio: materiaisValidos
        };
        this.httpClientService
            .createAssistant(formData)
            .then(() => {
                this.router.navigate(['/pages/assistants']);
            })
            .catch((err) => {
                this.onSubmitError = true;
                console.error(err.message);
            });
    }
}
