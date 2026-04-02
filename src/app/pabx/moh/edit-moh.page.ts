import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MohService } from '@/pabx/moh/moh.service';

@Component({
    selector: 'app-edit-moh-page',
    standalone: true,
    imports: [InputTextModule, ButtonModule, CardModule, ReactiveFormsModule, RouterLink],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar {{ name?.value }}</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/mohs"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="block mb-2">Nome *</label>
                    <input id="name" pInputText class="p-inputtext" formControlName="name" />
                    @if (name?.invalid && (name?.dirty || name?.touched)) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Nome é obrigatório.</span>
                        </small>
                    }
                </div>

                @if (audioUrl) {
                    <div class="field mb-4">
                        <label class="block mb-2">Audio</label>
                        <audio controls [src]="audioUrl" class="w-full"></audio>
                    </div>
                }

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
                    <small class="text-red-500"> Erro ao salvar o MOH </small>
                }
            </form>
        </p-card>
    `
})
export class EditMohPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    currentFileName = '';
    audioUrl = '';
    private readonly id: string;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly mohService: MohService,
        private readonly activatedRoute: ActivatedRoute
    ) {
        this.id = this.activatedRoute.snapshot.params['id'];
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            id: [this.id],
            name: ['', [Validators.required]]
        });
        this.mohService.findById(this.id).then((moh) => {
            this.form.patchValue(moh);
            this.currentFileName = moh.fileName;
            this.audioUrl = moh.audioUrl ?? '';
        });
    }

    get name() {
        return this.form.get('name');
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        this.mohService
            .update(this.form.value.id, this.form.value.name)
            .then(() => this.router.navigate(['/pabx/mohs']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
