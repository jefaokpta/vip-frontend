import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Button} from 'primeng/button';
import {Card} from 'primeng/card';
import {Router, RouterLink} from '@angular/router';
import {SurveyService} from '@/pabx/survey/survey.service';
import {AudioSelectComponent} from '@/pabx/moh/audio-select.component';

@Component({
    selector: 'app-new-survey-page',
    standalone: true,
    imports: [InputText, Button, Card, ReactiveFormsModule, RouterLink, AudioSelectComponent],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Nova Pesquisa de Satisfação</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/surveys"
                        outlined
                        severity="secondary"
                    />
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="title" class="block mb-2">Título *</label>
                    <input id="title" pInputText formControlName="title" />
                    @if (form.get('title')?.invalid && (form.get('title')?.dirty || form.get('title')?.touched)) {
                        <small class="p-error block mt-2">Título é obrigatório.</small>
                    }
                </div>

                <div class="field mb-4">
                    <app-audio-select-component
                        formControlName="greetingAudioId"
                        label="Áudio de Saudação"
                        inputId="greetingAudioId"
                        [required]="true"
                        [showError]="
                            !!form.get('greetingAudioId')?.invalid &&
                            !!(form.get('greetingAudioId')?.dirty || form.get('greetingAudioId')?.touched)
                        "
                    />
                </div>

                <p class="text-surface-500 dark:text-surface-400 text-sm mb-4">
                    As respostas de cada pergunta serão captadas por DTMF durante a chamada: 1 dígito, nota de 1 a 5.
                </p>

                <div class="field mb-4">
                    <app-audio-select-component
                        formControlName="question1AudioId"
                        label="Pergunta 1"
                        inputId="question1AudioId"
                        [required]="true"
                        [showError]="
                            !!form.get('question1AudioId')?.invalid &&
                            !!(form.get('question1AudioId')?.dirty || form.get('question1AudioId')?.touched)
                        "
                    />
                </div>

                <div class="field mb-4">
                    <app-audio-select-component
                        formControlName="question2AudioId"
                        label="Pergunta 2"
                        inputId="question2AudioId"
                    />
                </div>

                <div class="field mb-4">
                    <app-audio-select-component
                        formControlName="question3AudioId"
                        label="Pergunta 3"
                        inputId="question3AudioId"
                    />
                </div>

                <div class="field mb-4">
                    <app-audio-select-component
                        formControlName="thankYouAudioId"
                        label="Áudio de Agradecimento"
                        inputId="thankYouAudioId"
                    />
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        @if (pending) {
                            <i class="pi pi-spin pi-spinner"></i>
                        } @else {
                            <i class="pi pi-save"></i>
                        }
                    </p-button>
                </div>

                @if (showError) {
                    <small class="text-red-500">Erro ao salvar a pesquisa.</small>
                }
            </form>
        </p-card>
    `
})
export class NewSurveyPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly surveyService: SurveyService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            title: ['', [Validators.required]],
            greetingAudioId: [null, [Validators.required]],
            question1AudioId: [null, [Validators.required]],
            question2AudioId: [null],
            question3AudioId: [null],
            thankYouAudioId: [null]
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;
        this.pending = true;
        this.showError = false;
        this.surveyService
            .create(this.form.value)
            .then(() => this.router.navigate(['/pabx/surveys']))
            .catch(() => (this.showError = true))
            .finally(() => (this.pending = false));
    }
}
