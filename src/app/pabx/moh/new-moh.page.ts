import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router, RouterLink } from '@angular/router';
import { MohService } from '@/pabx/moh/moh.service';

@Component({
    selector: 'app-new-moh-page',
    standalone: true,
    imports: [InputTextModule, ButtonModule, CardModule, ReactiveFormsModule, RouterLink],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Novo Audio</span>
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

                <div class="field mb-4">
                    <label for="file" class="block mb-2">Áudio (mp3 ou wav) *</label>
                    <input
                        id="file"
                        type="file"
                        accept=".mp3,.wav,audio/mpeg,audio/wav"
                        class="p-inputtext w-full"
                        (change)="onFileChange($event)"
                    />
                    @if (fileError) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">{{ fileError }}</span>
                        </small>
                    }
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || !selectedFile || pending">
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
export class NewMohPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    selectedFile: File | null = null;
    fileError = '';

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly mohService: MohService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]]
        });
    }

    onFileChange(event: Event) {
        const input = event.target as HTMLInputElement;
        this.fileError = '';
        this.selectedFile = null;
        if (!input.files?.length) return;
        const file = input.files[0];
        const allowed = ['audio/mpeg', 'audio/wav', 'audio/wave', 'audio/x-wav'];
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (!allowed.includes(file.type) && ext !== 'mp3' && ext !== 'wav') {
            this.fileError = 'Apenas arquivos mp3 e wav são aceitos.';
            return;
        }
        this.selectedFile = file;
    }

    get name() {
        return this.form.get('name');
    }

    onSubmit() {
        if (!this.selectedFile) return;
        this.pending = true;
        this.showError = false;
        this.mohService
            .create(this.form.value.name, this.selectedFile)
            .then(() => this.router.navigate(['/pabx/mohs']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
