import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Router, RouterLink } from '@angular/router';
import { Select } from 'primeng/select';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { InputNumber } from 'primeng/inputnumber';
import { NgForOf, NgIf } from '@angular/common';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { Moh, UraActionEnum } from '@/pabx/types';
import { MohService } from '@/pabx/moh/moh.service';
import { UraService } from '@/pabx/ura/ura.service';
import { PeerSelectComponent } from '@/pabx/dialplan/components/peer-select-component';
import { CallGroupService } from '@/pabx/call-group/call-group.service';

@Component({
    selector: 'app-new-ura-page',
    standalone: true,
    providers: [MessageService],
    imports: [
        Card,
        ReactiveFormsModule,
        RouterLink,
        InputText,
        Button,
        Select,
        ToggleSwitch,
        InputNumber,
        NgForOf,
        NgIf,
        Toast,
        PeerSelectComponent
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Nova URA</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/uras"
                        outlined
                        severity="secondary"
                    />
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <!-- Campos básicos -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="field">
                        <label for="name" class="block mb-2">Nome *</label>
                        <input id="name" pInputText formControlName="name" class="w-full" />
                        @if (form.get('name')?.invalid && (form.get('name')?.dirty || form.get('name')?.touched)) {
                            <small class="p-error block mt-2">Nome é obrigatório.</small>
                        }
                    </div>

                    <div class="field">
                        <label for="soundId" class="block mb-2">Áudio (MOH) *</label>
                        <p-select
                            id="soundId"
                            [options]="mohOptions"
                            formControlName="soundId"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecione um áudio"
                            appendTo="body"
                        />
                        @if (
                            form.get('soundId')?.invalid && (form.get('soundId')?.dirty || form.get('soundId')?.touched)
                        ) {
                            <small class="p-error block mt-2">Áudio é obrigatório.</small>
                        }
                    </div>

                    <div class="field">
                        <label for="interactionTimeout" class="block mb-2">Timeout de Interação (s) *</label>
                        <p-input-number
                            id="interactionTimeout"
                            formControlName="interactionTimeout"
                            [min]="1"
                            useGrouping="false"
                        />
                    </div>

                    <div class="field">
                        <label for="digitTimeout" class="block mb-2">Timeout de Dígito (s) *</label>
                        <p-input-number
                            id="digitTimeout"
                            formControlName="digitTimeout"
                            [min]="1"
                            useGrouping="false"
                        />
                    </div>

                    <div class="field flex items-center gap-3 mt-2">
                        <label class="block">Permitir Discagem Direta para Ramal</label>
                        <p-toggleswitch formControlName="isEnableDialPeer" />
                    </div>
                </div>

                <!-- Ação para entrada inválida -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Ação para Entrada Inválida</h3>
                    <div formGroupName="invalidAction" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="field">
                            <label class="block mb-2">Tipo de Ação *</label>
                            <p-select
                                [options]="actionOptions"
                                formControlName="uraActionEnum"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione uma ação"
                                appendTo="body"
                            />
                        </div>
                        <div
                            class="field"
                            *ngIf="form.get('invalidAction.uraActionEnum')?.value === UraActionEnum.DIALPEER"
                        >
                            <app-peer-select-component formControlName="target" [isShowLabel]="true" />
                        </div>
                        <div
                            class="field"
                            *ngIf="form.get('invalidAction.uraActionEnum')?.value === UraActionEnum.CALLGROUP"
                        >
                            <label class="block mb-2">Grupo de Chamada *</label>
                            <p-select
                                [options]="callGroupOptions"
                                formControlName="target"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione o grupo"
                                appendTo="body"
                            />
                        </div>
                        <div
                            class="field"
                            *ngIf="form.get('invalidAction.uraActionEnum')?.value === UraActionEnum.SUBURA"
                        >
                            <label class="block mb-2">Sub URA *</label>
                            <p-select
                                [options]="uraOptions"
                                formControlName="target"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione a URA"
                                appendTo="body"
                            />
                        </div>
                    </div>
                </div>

                <!-- Ação para timeout -->
                <div class="mb-6">
                    <h3 class="text-lg font-semibold mb-3">Ação para Timeout</h3>
                    <div formGroupName="timeoutAction" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="field">
                            <label class="block mb-2">Tipo de Ação *</label>
                            <p-select
                                [options]="actionOptions"
                                formControlName="uraActionEnum"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione uma ação"
                                appendTo="body"
                            />
                        </div>
                        <div
                            class="field"
                            *ngIf="form.get('timeoutAction.uraActionEnum')?.value === UraActionEnum.DIALPEER"
                        >
                            <app-peer-select-component formControlName="target" [isShowLabel]="true" />
                        </div>
                        <div
                            class="field"
                            *ngIf="form.get('timeoutAction.uraActionEnum')?.value === UraActionEnum.CALLGROUP"
                        >
                            <label class="block mb-2">Grupo de Chamada *</label>
                            <p-select
                                [options]="callGroupOptions"
                                formControlName="target"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione o grupo"
                                appendTo="body"
                            />
                        </div>
                        <div
                            class="field"
                            *ngIf="form.get('timeoutAction.uraActionEnum')?.value === UraActionEnum.SUBURA"
                        >
                            <label class="block mb-2">Sub URA *</label>
                            <p-select
                                [options]="uraOptions"
                                formControlName="target"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Selecione a URA"
                                appendTo="body"
                            />
                        </div>
                    </div>
                </div>

                <!-- Ações DTMF -->
                <div class="mb-4">
                    <div class="flex items-center gap-4 mb-3">
                        <h3 class="text-lg font-semibold">Ações DTMF</h3>
                        <p-button
                            type="button"
                            icon="pi pi-plus"
                            label="Adicionar Ação"
                            (onClick)="addAction()"
                            outlined
                            size="small"
                        />
                        @if (actions.errors?.['minlength'] && actions.touched) {
                            <small class="p-error">Ao menos 1 ação é obrigatória.</small>
                        }
                        @if (actions.errors?.['duplicateOptions']) {
                            <small class="p-error">Dígitos repetidos não são permitidos.</small>
                        }
                    </div>

                    <div formArrayName="actions">
                        <div
                            *ngFor="let action of actions.controls; let i = index"
                            [formGroupName]="i"
                            class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 border border-surface-200 dark:border-surface-700 rounded-lg"
                        >
                            <div class="field">
                                <label class="block mb-2">Dígito (0–9) *</label>
                                <p-input-number formControlName="option" [min]="0" [max]="9" useGrouping="false" />
                            </div>
                            <div class="field">
                                <label class="block mb-2">Ação *</label>
                                <p-select
                                    [options]="actionOptions"
                                    formControlName="uraActionEnum"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Selecione uma ação"
                                    appendTo="body"
                                />
                            </div>
                            <div class="field" *ngIf="action.get('uraActionEnum')?.value === UraActionEnum.DIALPEER">
                                <app-peer-select-component formControlName="target" [isShowLabel]="true" />
                            </div>
                            <div class="field" *ngIf="action.get('uraActionEnum')?.value === UraActionEnum.CALLGROUP">
                                <label class="block mb-2">Grupo de Chamada *</label>
                                <p-select
                                    [options]="callGroupOptions"
                                    formControlName="target"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Selecione o grupo"
                                    appendTo="body"
                                />
                            </div>
                            <div class="field" *ngIf="action.get('uraActionEnum')?.value === UraActionEnum.SUBURA">
                                <label class="block mb-2">Sub URA *</label>
                                <p-select
                                    [options]="uraOptions"
                                    formControlName="target"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Selecione a URA"
                                    appendTo="body"
                                />
                            </div>
                            <div class="flex items-end">
                                <p-button
                                    type="button"
                                    icon="pi pi-trash"
                                    severity="danger"
                                    outlined
                                    (onClick)="removeAction(i)"
                                />
                            </div>
                        </div>
                    </div>
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
                    <small class="text-red-500">Erro ao salvar a URA.</small>
                }
            </form>
        </p-card>
        <p-toast />
    `
})
export class NewUraPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    mohOptions: { label: string; value: number }[] = [];
    callGroupOptions: { label: string; value: string }[] = [];
    uraOptions: { label: string; value: string }[] = [];
    readonly UraActionEnum = UraActionEnum;

    actionOptions = [
        { label: 'Desligar', value: UraActionEnum.HANGUP },
        { label: 'Discar para Ramal', value: UraActionEnum.DIALPEER },
        { label: 'Voltar ao Início', value: UraActionEnum.RETURN_TO_START },
        { label: 'Grupo de Chamada', value: UraActionEnum.CALLGROUP },
        { label: 'Sub URA', value: UraActionEnum.SUBURA }
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly uraService: UraService,
        private readonly mohService: MohService,
        private readonly callGroupService: CallGroupService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            interactionTimeout: [5, [Validators.required, Validators.min(1)]],
            digitTimeout: [2, [Validators.required, Validators.min(1)]],
            soundId: [null, [Validators.required]],
            isEnableDialPeer: [false],
            invalidAction: this.fb.group(
                { option: [-2], uraActionEnum: [UraActionEnum.RETURN_TO_START, [Validators.required]], target: [null] },
                { validators: [NewUraPage.requireTargetValidator] }
            ),
            timeoutAction: this.fb.group(
                { option: [-1], uraActionEnum: [UraActionEnum.RETURN_TO_START, [Validators.required]], target: [null] },
                { validators: [NewUraPage.requireTargetValidator] }
            ),
            actions: this.fb.array([], [Validators.minLength(1), NewUraPage.noDuplicateOptions])
        });

        Promise.all([this.mohService.findAll(), this.callGroupService.findAll(), this.uraService.findAll()]).then(
            ([mohs, callGroups, uras]: [Moh[], any[], any[]]) => {
                this.mohOptions = mohs.map((m) => ({ label: m.name, value: m.id }));
                this.callGroupOptions = callGroups.map((g) => ({ label: g.name, value: g.id.toString() }));
                this.uraOptions = uras.map((u) => ({ label: u.name, value: u.id.toString() }));
            }
        );
    }

    static requireTargetValidator(control: AbstractControl) {
        const group = control as FormGroup;
        const actionEnum = group.get('uraActionEnum')?.value;
        const needsTarget = [UraActionEnum.DIALPEER, UraActionEnum.CALLGROUP, UraActionEnum.SUBURA].includes(
            actionEnum
        );
        if (needsTarget && !group.get('target')?.value) {
            return { targetRequired: true };
        }
        return null;
    }

    static noDuplicateOptions(control: AbstractControl) {
        const array = control as FormArray;
        const options = array.controls.map((c) => c.get('option')?.value).filter((v) => v !== null && v !== undefined);
        return options.length === new Set(options).size ? null : { duplicateOptions: true };
    }

    get actions(): FormArray {
        return this.form.get('actions') as FormArray;
    }

    addAction(): void {
        this.actions.push(
            this.fb.group(
                {
                    option: [null, [Validators.required, Validators.min(0), Validators.max(9)]],
                    uraActionEnum: [UraActionEnum.HANGUP, [Validators.required]],
                    target: [null]
                },
                { validators: [NewUraPage.requireTargetValidator] }
            )
        );
    }

    removeAction(index: number): void {
        this.actions.removeAt(index);
    }

    getActionControl(action: AbstractControl, field: string) {
        return (action as FormGroup).get(field);
    }

    onSubmit(): void {
        this.actions.markAllAsTouched();
        if (this.form.invalid || this.actions.length === 0) return;
        this.pending = true;
        this.showError = false;
        this.uraService
            .create(this.form.value)
            .then(() => this.router.navigate(['/pabx/uras']))
            .catch(() => (this.showError = true))
            .finally(() => (this.pending = false));
    }
}
