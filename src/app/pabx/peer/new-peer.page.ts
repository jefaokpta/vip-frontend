import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PeerService } from '@/pabx/peer/peer.service';
import { LanguageEnum } from '@/pabx/types';
import { Select } from 'primeng/select';
import { languageSelectOptions } from '@/pabx/utils';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-new-peer-page',
    standalone: true,
    imports: [InputTextModule, ButtonModule, CardModule, NgIf, ReactiveFormsModule, RouterLink, Select],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Novo Ramal</span>
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
                        <div *ngIf="featurePassword?.errors?.['minlength']">Senha deve ter pelo menos 2 dígitos.</div>
                        <div *ngIf="featurePassword?.errors?.['maxlength']">Senha deve ter no máximo 4 dígitos.</div>
                        <div *ngIf="featurePassword?.errors?.['pattern']">Senha deve ter apenas números.</div>
                    </small>
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

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>

                <small *ngIf="showError" class="text-red-500"> Erro ao salvar o ramal </small>
            </form>
        </p-card>
    `
})
export class NewPeerPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    languageOptions = languageSelectOptions();

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly peerService: PeerService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            peer: [
                '',
                [Validators.required, Validators.minLength(2), Validators.maxLength(4), Validators.pattern('[0-9]+')]
            ],
            featurePassword: [
                '1234',
                [Validators.required, Validators.minLength(2), Validators.maxLength(4), Validators.pattern('[0-9]+')]
            ],
            language: [LanguageEnum.pt_BR, [Validators.required]],
            peerTransportEnums: ['', [Validators.required]],
            qualify: ['', [Validators.required]],
            nat: [false, [Validators.required]],
            dtmfModeEnum: ['', [Validators.required]],
            callLimit: [0, [Validators.required]]
        });
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        console.log(this.form.value);
        // this.peerService.create(alias)
        //     .then(() => this.router.navigate(['/pabx/peers']))
        //     .catch(() => {
        //         this.showError = true;
        //     })
        //     .finally(() => (this.pending = false));
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
    get language() {
        return this.form.get('language');
    }
    get peerTransportEnums() {
        return this.form.get('peerTransportEnums');
    }
    get qualify() {
        return this.form.get('qualify');
    }
}
