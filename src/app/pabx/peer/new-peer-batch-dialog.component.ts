import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators
} from '@angular/forms';
import {Dialog} from 'primeng/dialog';
import {Button} from 'primeng/button';
import {NgIf} from '@angular/common';
import {InputNumber} from 'primeng/inputnumber';
import {Select} from 'primeng/select';
import {PeerService} from '@/pabx/peer/peer.service';
import {PickupGroupService} from '@/pabx/pickup-group/pickup-group.service';
import {PickupGroup} from '@/pabx/types/pickup-group';
import {PeerBatchResult} from '@/pabx/types/peer-batch-result';

function rangeOrderValidator(control: AbstractControl): ValidationErrors | null {
    const start = control.get('startRange')?.value;
    const end = control.get('endRange')?.value;
    if (start != null && end != null && start > end) {
        return { rangeInvalid: true };
    }
    return null;
}

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */
@Component({
    selector: 'app-new-peer-batch-dialog',
    standalone: true,
    imports: [Dialog, Button, NgIf, ReactiveFormsModule, InputNumber, Select],
    template: `
        <p-dialog
            header="Ramais em Lote"
            [visible]="visible"
            [modal]="true"
            [style]="{ width: '30rem' }"
            (onHide)="onCancel()"
        >
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="flex gap-4">
                    <div class="field mb-4 flex-1" style="min-width: 0">
                        <label for="startRange" class="block mb-2">Início do Range *</label>
                        <p-input-number
                            id="startRange"
                            mode="decimal"
                            useGrouping="false"
                            formControlName="startRange"
                            [style]="{ width: '100%' }"
                            inputStyleClass="w-full"
                        />
                        <small
                            *ngIf="startRange?.invalid && (startRange?.dirty || startRange?.touched)"
                            class="p-error block mt-2"
                        >
                            <div *ngIf="startRange?.errors?.['required']">Obrigatório.</div>
                            <div *ngIf="startRange?.errors?.['min'] || startRange?.errors?.['max']">
                                Ramal deve ter entre 2 e 4 dígitos.
                            </div>
                        </small>
                    </div>
                    <div class="field mb-4 flex-1" style="min-width: 0">
                        <label for="endRange" class="block mb-2">Fim do Range *</label>
                        <p-input-number
                            id="endRange"
                            mode="decimal"
                            useGrouping="false"
                            formControlName="endRange"
                            [style]="{ width: '100%' }"
                            inputStyleClass="w-full"
                        />
                        <small
                            *ngIf="endRange?.invalid && (endRange?.dirty || endRange?.touched)"
                            class="p-error block mt-2"
                        >
                            <div *ngIf="endRange?.errors?.['required']">Obrigatório.</div>
                            <div *ngIf="endRange?.errors?.['min'] || endRange?.errors?.['max']">
                                Ramal deve ter entre 2 e 4 dígitos.
                            </div>
                        </small>
                    </div>
                </div>
                <small
                    *ngIf="form.errors?.['rangeInvalid'] && (endRange?.dirty || endRange?.touched)"
                    class="p-error block mb-4"
                >
                    Início do range não pode ser maior que o fim.
                </small>

                <div class="field mb-4">
                    <label for="pickUpGroup" class="block mb-2">Grupo de Captura</label>
                    <p-select
                        id="pickUpGroup"
                        [options]="pickUpGroupOptions"
                        formControlName="pickUpGroup"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Selecione um grupo"
                        [showClear]="true"
                    ></p-select>
                </div>

                <small *ngIf="errorMessage" class="text-red-500 block mb-4">{{ errorMessage }}</small>

                <div class="flex justify-end gap-2">
                    <p-button
                        label="Cancelar"
                        severity="secondary"
                        outlined
                        type="button"
                        (click)="onCancel()"
                    ></p-button>
                    <p-button type="submit" label="Criar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                    </p-button>
                </div>
            </form>
        </p-dialog>
    `
})
export class NewPeerBatchDialogComponent implements OnInit {
    @Input() visible = false;
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() created = new EventEmitter<PeerBatchResult>();

    form!: FormGroup;
    pending = false;
    errorMessage = '';
    pickUpGroupOptions: PickupGroup[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly peerService: PeerService,
        private readonly pickupGroupService: PickupGroupService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group(
            {
                startRange: [null, [Validators.required, Validators.min(10), Validators.max(9999)]],
                endRange: [null, [Validators.required, Validators.min(10), Validators.max(9999)]],
                pickUpGroup: [null]
            },
            { validators: rangeOrderValidator }
        );
        this.pickupGroupService.findAll().then((groups) => (this.pickUpGroupOptions = groups));
    }

    onSubmit() {
        this.pending = true;
        this.errorMessage = '';
        this.peerService
            .createBatch(this.form.value)
            .then((result) => {
                this.created.emit(result);
                this.close();
            })
            .catch((err) => {
                this.errorMessage = err.error?.message ?? 'Erro ao criar os ramais em lote.';
            })
            .finally(() => (this.pending = false));
    }

    onCancel() {
        this.close();
    }

    private close() {
        this.form.reset();
        this.errorMessage = '';
        this.visible = false;
        this.visibleChange.emit(false);
    }

    get startRange() {
        return this.form.get('startRange');
    }

    get endRange() {
        return this.form.get('endRange');
    }
}
