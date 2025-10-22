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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Textarea } from 'primeng/textarea';
import { HttpClientService } from '@/services/http-client.service';
import { Message } from 'primeng/message';

@Component({
    selector: 'app-edit-assistant',
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
            <ng-template #title><span class="font-semibold text-2xl">Editar Assistente</span></ng-template>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
                <div class="field mb-4 mt-4">
                    <label for="name" class="block text-900 font-medium mb-2">Nome *</label>
                    <input id="name" type="text" pInputText formControlName="name" />
                    <small *ngIf="name?.invalid && name?.touched" class="p-error block">Nome é obrigatório</small>
                </div>

                <div class="field mb-4">
                    <label for="objective" class="block text-900 font-medium mb-2">Descrição do Assistente *</label>
                    <textarea id="objective" pTextarea [rows]="14" [cols]="30" class="w-full" formControlName="objective"></textarea>
                    <small *ngIf="objective?.invalid && objective?.touched" class="p-error block">
                        {{ objective?.errors?.['required'] ? 'O Objetivo é obrigatório' : '' }}
                        {{ objective?.errors?.['minlength'] ? 'A descrição deve ter no mínimo 50 caracteres' : '' }}
                    </small>
                </div>

                <div class="field mb-4">
                    <div class="flex items-center gap-4 mb-2">
                        <label class="font-medium">Materiais de Apoio (Site ou PDF)</label>
                        <p-button
                            type="button"
                            icon="pi pi-plus"
                            (onClick)="addMaterial()"
                            [disabled]="materials.length >= 3"
                            pTooltip="Adicionar material de apoio"
                            tooltipPosition="right"
                            outlined
                            size="small"
                        ></p-button>
                    </div>

                    <div formArrayName="materials">
                        <div *ngFor="let material of materials.controls; let i = index" class="mb-3">
                            <div class="flex gap-2">
                                <div class="flex-grow-1">
                                    <input [formControlName]="i" type="text" pInputText placeholder="https://exemplo.com" class="w-full" />
                                    <small *ngIf="material.invalid && material.touched" class="p-error block">URL inválida</small>
                                </div>
                                <p-button type="button" icon="pi pi-trash" (onClick)="removeMaterial(i)" severity="danger" outlined></p-button>
                            </div>
                            <p-divider *ngIf="i < materials.length - 1"></p-divider>
                        </div>

                        <small *ngIf="materials.length === 0" class="text-500 block">
                            Adicione até 3 sites como materiais de apoio para seu assistente.
                        </small>
                    </div>
                </div>

                <div class="flex gap-4">
                    <p-button type="submit" label="Salvar" icon="pi pi-save" [disabled]="form.invalid"></p-button>
                    <p-button
                        type="button"
                        label="Cancelar"
                        icon="pi pi-times"
                        routerLink="/pages/assistants"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
                <div class="mt-4">
                    <p-message *ngIf="onSubmitError" severity="error" text="Ocorreu um erro, por favor tente novamente."></p-message>
                </div>
            </form>
        </p-card>
    `
})
export class EditAssistant implements OnInit {
    form!: FormGroup;
    onSubmitError = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly httpClientService: HttpClientService,
        private readonly activatedRoute: ActivatedRoute
    ) {}

    get materials() {
        return this.form.get('materials') as FormArray;
    }
    get name() {
        return this.form.get('name');
    }
    get objective() {
        return this.form.get('objective');
    }

    ngOnInit() {
        this.form = this.fb.group({
            id: 0,
            name: ['', Validators.required],
            objective: ['', [Validators.required, Validators.minLength(50)]],
            materials: this.fb.array([])
        });
        const id = this.activatedRoute.snapshot.paramMap.get('id')!;
        this.httpClientService.findAssistantById(id).then((assistant) => {
            this.form.patchValue({
                id: assistant.id,
                name: assistant.name,
                objective: assistant.objective
            });
            assistant.descriptionUrls.filter((url) => url.trim()).forEach((url) => this.addMaterial(url));
        });
    }

    addMaterial(url: string = '') {
        if (this.materials.length < 3) {
            this.materials.push(this.fb.control(url, [Validators.pattern('https?://.+')]));
        }
    }

    removeMaterial(index: number) {
        this.materials.removeAt(index);
    }

    onSubmit() {
        // Filtrar materiais de apoio vazios
        const validMaterials = this.materials.value.filter((url: string) => url.trim() !== '');
        const formData = {
            ...this.form.value,
            descriptionUrls: validMaterials
        };
        this.httpClientService
            .updateAssistant(formData)
            .then(() => {
                this.router.navigate(['/pages/assistants']);
            })
            .catch((err) => {
                this.onSubmitError = true;
                console.log(err.message);
            });
    }
}
