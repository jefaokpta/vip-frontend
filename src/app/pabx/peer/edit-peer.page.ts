import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PeerService } from '@/pabx/peer/peer.service';
import { DtmfModeEnum, LanguageEnum, PeerTransportEnum } from '@/pabx/types';
import { Select } from 'primeng/select';
import { dtmfSelectOptions, languageSelectOptions } from '@/pabx/utils';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { InputNumber } from 'primeng/inputnumber';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { Password } from 'primeng/password';
import { SelectButton } from 'primeng/selectbutton';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-edit-peer-page',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        NgIf,
        ReactiveFormsModule,
        RouterLink,
        Select,
        ToggleSwitch,
        InputNumber,
        Accordion,
        AccordionContent,
        AccordionHeader,
        AccordionPanel,
        Password,
        SelectButton
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar {{ name?.value }}</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/peers"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="block mb-2">Nome *</label>
                    <input id="name" pInputText class="p-inputtext" formControlName="name" />
                    <small *ngIf="name?.invalid && (name?.dirty || name?.touched)" class="p-error block mt-2">
                        <div *ngIf="name?.errors?.['required']">Nome é obrigatório.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="peer" class="block mb-2">Ramal *</label>
                    <input id="peer" pInputText class="p-inputtext" formControlName="peer" />
                    <small *ngIf="peer?.invalid && (peer?.dirty || peer?.touched)" class="p-error block mt-2">
                        <div *ngIf="peer?.errors?.['required']">Ramal é obrigatório.</div>
                        <div *ngIf="peer?.errors?.['minlength']">Ramal deve ter pelo menos 2 dígitos.</div>
                        <div *ngIf="peer?.errors?.['maxlength']">Ramal deve ter no máximo 4 dígitos.</div>
                        <div *ngIf="peer?.errors?.['pattern']">Ramal deve ter apenas números.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="featurePassword" class="block mb-2">Senha de Facilidades *</label>
                    <input id="featurePassword" pInputText class="p-inputtext" formControlName="featurePassword" />
                    <small
                        *ngIf="featurePassword?.invalid && (featurePassword?.dirty || featurePassword?.touched)"
                        class="p-error block mt-2"
                    >
                        <div *ngIf="featurePassword?.errors?.['required']">Senha é obrigatória.</div>
                        <div *ngIf="featurePassword?.errors?.['minlength']">Senha deve ter ao menos 2 dígitos.</div>
                        <div *ngIf="featurePassword?.errors?.['maxlength']">Senha deve ter no máximo 4 dígitos.</div>
                        <div *ngIf="featurePassword?.errors?.['pattern']">Senha deve ter apenas números.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="isShowPassword" class="block mb-2">Alterar Senha de Registro</label>
                    <div class="flex gap-4 items-center">
                        <p-toggleswitch formControlName="isShowPassword" (onChange)="toggleMd5Secret()" />
                        @if (md5Secret) {
                            <div class="field">
                                <p-password formControlName="md5Secret" [toggleMask]="true" feedback="false" />
                                <small
                                    *ngIf="md5Secret?.invalid && (md5Secret?.dirty || md5Secret?.touched)"
                                    class="p-error block mt-2"
                                >
                                    <div *ngIf="md5Secret?.errors?.['required']">Senha é obrigatória.</div>
                                    <div *ngIf="md5Secret?.errors?.['minlength']">
                                        Senha deve ter ao menos 2 dígitos.
                                    </div>
                                </small>
                            </div>
                        }
                    </div>
                </div>

                <div class="field mb-4">
                    <label for="language" class="block mb-2">Idioma *</label>
                    <p-select
                        id="language"
                        [options]="languageOptions"
                        formControlName="language"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione um idioma"
                    ></p-select>
                </div>

                <p-accordion>
                    <p-accordion-panel value="0">
                        <p-accordion-header>Configurações Avançadas</p-accordion-header>
                        <p-accordion-content>
                            <div class="field mb-4">
                                <label for="peerTransportEnums" class="block mb-2">Tecnologias *</label>
                                <p-select-button
                                    id="peerTransportEnums"
                                    [options]="transportsOptions"
                                    formControlName="peerTransportEnums"
                                    [multiple]="true"
                                    optionLabel="label"
                                    optionValue="value"
                                />
                                @if (peerTransportEnums?.invalid) {
                                    <small class="p-error block mt-2">
                                        <span class="text-red-500">Ao menos 1 tecnologia é obrigatória.</span>
                                    </small>
                                }
                            </div>

                            <div class="field mb-4">
                                <label for="dtmfMode" class="block mb-2">Tipo de DTMF *</label>
                                <p-select
                                    id="dtmfMode"
                                    [options]="dtmfOptions"
                                    formControlName="dtmfModeEnum"
                                    optionLabel="label"
                                    optionValue="value"
                                    placeholder="Selecione um tipo de origem"
                                ></p-select>
                            </div>

                            <div class="field mb-4">
                                <label for="callLimit" class="block mb-2">Limite de Chamadas *</label>
                                <p-input-number
                                    id="callLimit"
                                    mode="decimal"
                                    useGrouping="false"
                                    formControlName="callLimit"
                                />
                                @if (callLimit?.invalid && (callLimit?.dirty || callLimit?.touched)) {
                                    <small class="p-error block mt-2">
                                        <span class="text-red-500">Limite de chamadas é obrigatório.</span>
                                    </small>
                                }
                            </div>

                            <div class="field">
                                <label for="qualify" class="block mb-2">Testar Alcance</label>
                                <p-toggleswitch formControlName="qualify" />
                            </div>

                            <div class="field">
                                <label for="nat" class="block mb-2">Usar NAT</label>
                                <p-toggleswitch formControlName="nat" />
                            </div>
                        </p-accordion-content>
                    </p-accordion-panel>
                </p-accordion>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>

                <small *ngIf="errorMessage" class="text-red-500"> {{ errorMessage }} </small>
            </form>
        </p-card>
    `
})
export class EditPeerPage implements OnInit {
    form!: FormGroup;
    pending = false;
    errorMessage = '';
    languageOptions = languageSelectOptions();
    dtmfOptions = dtmfSelectOptions();

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly peerService: PeerService,
        private readonly activatedRoute: ActivatedRoute
    ) {}

    transportsOptions = Object.values(PeerTransportEnum).map((value) => ({ label: value, value }));

    ngOnInit(): void {
        this.form = this.fb.group({
            id: [null, [Validators.required]],
            name: ['', [Validators.required]],
            peer: [
                { value: '', disabled: true },
                [Validators.required, Validators.minLength(2), Validators.maxLength(4), Validators.pattern('[0-9]+')]
            ],
            featurePassword: [
                '1234',
                [Validators.required, Validators.minLength(2), Validators.maxLength(4), Validators.pattern('[0-9]+')]
            ],
            language: [LanguageEnum.pt_BR, [Validators.required]],
            peerTransportEnums: [[PeerTransportEnum.UDP], [Validators.required]],
            qualify: [false, [Validators.required]],
            nat: [true, [Validators.required]],
            dtmfModeEnum: [DtmfModeEnum.RFC4733, [Validators.required]],
            callLimit: [1, [Validators.required]],
            isShowPassword: [false]
        });
        const id = this.activatedRoute.snapshot.paramMap.get('id')!;
        this.peerService.findById(id).then((peer) => this.form.patchValue(peer));
    }

    toggleMd5Secret() {
        this.form.removeControl('md5Secret');
        if (this.isShowPassword?.value) {
            this.form.addControl('md5Secret', new FormControl('', [Validators.required, Validators.minLength(2)]));
        }
    }

    onSubmit() {
        this.pending = true;
        this.errorMessage = '';
        this.peerService
            .update(this.form.value)
            .then(() => this.router.navigate(['/pabx/peers']))
            .catch((err) => {
                this.errorMessage = this.handleErrorMessage(err.error?.message);
            })
            .finally(() => (this.pending = false));
    }

    private handleErrorMessage(errorMessage?: string): string {
        if (!errorMessage) return 'Erro ao salvar o ramal.';
        if (errorMessage.includes('Duplicate')) return `Ramal ${this.peer?.value} já existe.`;
        return 'Erro ao salvar o ramal.';
    }

    get name() {
        return this.form.get('name');
    }
    get peer() {
        return this.form.get('peer');
    }
    get featurePassword() {
        return this.form.get('featurePassword');
    }
    get callLimit() {
        return this.form.get('callLimit');
    }
    get md5Secret() {
        return this.form.get('md5Secret');
    }
    get peerTransportEnums() {
        return this.form.get('peerTransportEnums');
    }
    get isShowPassword() {
        return this.form.get('isShowPassword');
    }
}
