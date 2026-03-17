import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PickupGroupService } from '@/pabx/pickup-group/pickup-group.service';

@Component({
    selector: 'app-edit-pickup-group-page',
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
                        routerLink="/pabx/pickup-groups"
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
                    <small class="text-red-500"> Erro ao salvar o grupo de captura </small>
                }
            </form>
        </p-card>
    `
})
export class EditPickupGroupPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    private groupId!: number;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly pickupGroupService: PickupGroupService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]]
        });
        const id = this.activatedRoute.snapshot.paramMap.get('id')!;
        this.groupId = +id;
        this.pickupGroupService.findById(id).then((group) => this.form.patchValue(group));
    }

    get name() {
        return this.form.get('name');
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        this.pickupGroupService
            .update(this.groupId, this.form.value.name)
            .then(() => this.router.navigate(['/pabx/pickup-groups']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
