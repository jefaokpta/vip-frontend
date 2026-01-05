import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router, RouterLink } from '@angular/router';
import { TrunkService } from '@/pabx/trunk/trunk.service';
import { DtmfModeEnum, LanguageEnum, TechnologyEnum } from '@/pabx/types';
import { InputNumber } from 'primeng/inputnumber';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-new-trunk-page',
    standalone: true,
    imports: [InputTextModule, ButtonModule, CardModule, ReactiveFormsModule, RouterLink, InputNumber],
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

    get peerQualify() {
        return this.form.get('peerQualify');
    }
    get callLimit() {
        return this.form.get('callLimit');
    }
    get language() {
        return this.form.get('language');
    }
    get dtmfMode() {
        return this.form.get('dtmfMode');
    }

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
            dtmfMode: [DtmfModeEnum.rfc4733, [Validators.required]],
            technology: [TechnologyEnum.SIP, [Validators.required]],
            techPrefix: ['']
        });
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
