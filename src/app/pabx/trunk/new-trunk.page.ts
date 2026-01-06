import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router, RouterLink } from '@angular/router';
import { TrunkService } from '@/pabx/trunk/trunk.service';
import { CodecEnum, DtmfModeEnum, LanguageEnum, TechnologyEnum } from '@/pabx/types';
import { InputNumber } from 'primeng/inputnumber';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-new-trunk-page',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        ReactiveFormsModule,
        RouterLink,
        InputNumber,
        ToggleSwitch,
        Select,
        SelectButton
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Novo Tronco</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/trunks"
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
                    <label for="username" class="block mb-2">Username *</label>
                    <input id="username" pInputText class="p-inputtext" formControlName="username" />
                    @if (username?.invalid && (username?.dirty || username?.touched)) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Username é obrigatório.</span>
                        </small>
                    }
                </div>

                <div class="field mb-4">
                    <label for="secret" class="block mb-2">Senha *</label>
                    <input id="secret" pInputText class="p-inputtext" formControlName="secret" />
                    @if (secret?.invalid && (secret?.dirty || secret?.touched)) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Senha é obrigatória.</span>
                        </small>
                    }
                </div>

                <div class="field mb-4">
                    <label for="host" class="block mb-2">Endereço (Host) *</label>
                    <input id="host" pInputText class="p-inputtext" formControlName="host" />
                    @if (host?.invalid && (host?.dirty || host?.touched)) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Endereço (Host) é obrigatório.</span>
                        </small>
                    }
                </div>

                <div class="field mb-4">
                    <label for="port" class="block mb-2">Porta *</label>
                    <p-input-number id="port" mode="decimal" useGrouping="false" formControlName="port" />
                    @if (port?.invalid && (port?.dirty || port?.touched)) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Porta é obrigatória.</span>
                        </small>
                    }
                </div>

                <div class="field mb-4">
                    <label for="callLimit" class="block mb-2">Limite de Chamadas *</label>
                    <p-input-number id="callLimit" mode="decimal" useGrouping="false" formControlName="callLimit" />
                    @if (callLimit?.invalid && (callLimit?.dirty || callLimit?.touched)) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Limite de chamadas é obrigatório.</span>
                        </small>
                    }
                </div>

                <div class="field mb-4">
                    <label for="techPrefix" class="block mb-2">Prefixo de Discagem</label>
                    <input id="techPrefix" pInputText class="p-inputtext" formControlName="techPrefix" />
                </div>

                <div class="field mb-4">
                    <label for="peerQualify" class="block mb-2">Testar Alcance</label>
                    <p-toggleswitch formControlName="peerQualify" />
                </div>

                <div class="field mb-4">
                    <label for="codecs" class="block mb-2">Codecs *</label>
                    <p-select-button
                        id="codecs"
                        [options]="codecsOptions"
                        formControlName="codecs"
                        [multiple]="true"
                        optionLabel="label"
                        optionValue="value"
                    />
                    @if (codecs.invalid) {
                        <small class="p-error block mt-2">
                            <span class="text-red-500">Ao menos 1 codec é obrigatório.</span>
                        </small>
                    }
                </div>

                <div class="field">
                    <label for="dtmfMode" class="block mb-2">Tipo de DTMF *</label>
                    <p-select
                        id="dtmfMode"
                        [options]="dtmfOptions"
                        formControlName="dtmfMode"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione um tipo de origem"
                    ></p-select>
                </div>

                <div class="field">
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
                    <small class="text-red-500"> Erro ao salvar o tronco </small>
                }
            </form>
        </p-card>
    `
})
export class NewTrunkPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly trunkService: TrunkService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            username: ['', [Validators.required]],
            secret: ['', [Validators.required]],
            host: ['', [Validators.required]],
            port: [5060, [Validators.required]],
            peerQualify: [false, [Validators.required]],
            callLimit: [0, [Validators.required]],
            language: [LanguageEnum.pt_BR, [Validators.required]],
            dtmfMode: [DtmfModeEnum.RFC4733, [Validators.required]],
            technology: [TechnologyEnum.SIP, [Validators.required]],
            techPrefix: [''],
            codecs: [[CodecEnum.ALAW], [Validators.required]]
        });
    }

    codecsOptions = [
        { label: CodecEnum.ALAW, value: CodecEnum.ALAW },
        { label: CodecEnum.ULAW, value: CodecEnum.ULAW },
        { label: CodecEnum.G729, value: CodecEnum.G729 },
        { label: CodecEnum.G722, value: CodecEnum.G722 },
        { label: CodecEnum.GSM, value: CodecEnum.GSM }
    ];

    dtmfOptions = [
        { label: 'RFC4733', value: DtmfModeEnum.RFC4733 },
        { label: 'INFO', value: DtmfModeEnum.INFO },
        { label: 'INBAND', value: DtmfModeEnum.INBAND }
    ];

    languageOptions = [
        { label: 'Português', value: LanguageEnum.pt_BR },
        { label: 'Inglês', value: LanguageEnum.en },
        { label: 'Espanhol', value: LanguageEnum.es },
        { label: 'Francês', value: LanguageEnum.fr }
    ];

    get codecs() {
        return this.form.get('codecs') as FormArray;
    }
    get name() {
        return this.form.get('name');
    }
    get username() {
        return this.form.get('username');
    }
    get secret() {
        return this.form.get('secret');
    }
    get host() {
        return this.form.get('host');
    }
    get port() {
        return this.form.get('port');
    }
    get callLimit() {
        return this.form.get('callLimit');
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        const trunk = this.form.value;
        console.log(trunk);
        // this.trunkService.create(trunk)
        //     .then(() => this.router.navigate(['/pabx/trunks']))
        //     .catch(() => {
        //         this.showError = true;
        //     })
        //     .finally(() => (this.pending = false));
    }
}
