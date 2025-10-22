/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 18/08/2025
 */
import { Component, OnInit } from '@angular/core';
import { User } from '@/types/types';
import { HttpClientService } from '@/services/http-client.service';
import { UserService } from '@/services/user.service';
import { ButtonDirective } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { NgForOf, NgIf } from '@angular/common';
import { DealStatusEnum, Pipedrive } from '@/pages/integrations/types';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PrimeTemplate } from 'primeng/api';
import { Select } from 'primeng/select';

@Component({
    selector: 'app-pipedrive-component',
    imports: [
        ButtonDirective,
        Tag,
        NgIf,
        Dialog,
        InputText,
        FormsModule,
        PrimeTemplate,
        ReactiveFormsModule,
        Select,
        NgForOf
    ],
    template: `
        <div class="flex flex-col items-center">
            <span class="inline-flex items-center justify-center rounded-full w-20 h-20 mb-2">
                <svg
                    width="60"
                    height="60"
                    viewBox="0 0 32 32"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <mask
                        id="mask001"
                        mask-type="alpha"
                        maskUnits="userSpaceOnUse"
                        x="0"
                        y="0"
                        width="32"
                        height="32"
                    >
                        <path
                            d="M2.73694 0H29.2631C30.7746 0 32 1.22507 32 2.73695V29.2631C32 30.7746 30.7749 32 29.2631 32H2.73694C1.22537 32 0 30.7749 0 29.2631V2.73695C0 1.22537 1.22508 0 2.73694 0Z"
                            fill="#26292C"
                        ></path>
                    </mask>
                    <g mask="url(#mask001)">
                        <path
                            d="M2.73694 0H29.2631C30.7746 0 32 1.22507 32 2.73695V29.2631C32 30.7746 30.7749 32 29.2631 32H2.73694C1.22537 32 0 30.7749 0 29.2631V2.73695C0 1.22537 1.22508 0 2.73694 0Z"
                            fill="#26292C"
                        ></path>
                    </g>
                    <mask
                        id="mask1"
                        mask-type="alpha"
                        maskUnits="userSpaceOnUse"
                        x="7"
                        y="4"
                        width="18"
                        height="24"
                    >
                        <path
                            d="M13.3348 13.1766C13.3348 15.3194 14.4219 17.6311 16.8141 17.6311C18.5881 17.6311 20.3819 16.2461 20.3819 13.1451C20.3819 10.4264 18.9718 8.60127 16.8731 8.60127C15.163 8.60127 13.3348 9.80258 13.3348 13.1766ZM17.7158 4.63159C22.0051 4.63159 24.8891 8.02873 24.8891 13.0856C24.8891 18.0629 21.8509 21.5378 17.5076 21.5378C15.4368 21.5378 14.1103 20.6509 13.4168 20.0089C13.4217 20.1611 13.425 20.3316 13.425 20.5136V27.2632H8.98164V9.2797C8.98164 9.01824 8.89802 8.93552 8.63897 8.93552H7.11085V4.99729H10.8393C12.556 4.99729 12.9954 5.87097 13.079 6.54444C13.7759 5.76342 15.2204 4.63159 17.7158 4.63159Z"
                        ></path>
                    </mask>
                    <g mask="url(#mask1)">
                        <path
                            d="M13.3348 13.1766C13.3348 15.3194 14.4219 17.6311 16.8141 17.6311C18.5881 17.6311 20.3819 16.2461 20.3819 13.1451C20.3819 10.4264 18.9718 8.60127 16.8731 8.60127C15.163 8.60127 13.3348 9.80258 13.3348 13.1766ZM17.7158 4.63159C22.0051 4.63159 24.8891 8.02873 24.8891 13.0856C24.8891 18.0629 21.8509 21.5378 17.5076 21.5378C15.4368 21.5378 14.1103 20.6509 13.4168 20.0089C13.4217 20.1611 13.425 20.3316 13.425 20.5136V27.2632H8.98164V9.2797C8.98164 9.01824 8.89802 8.93552 8.63897 8.93552H7.11085V4.99729H10.8393C12.556 4.99729 12.9954 5.87097 13.079 6.54444C13.7759 5.76342 15.2204 4.63159 17.7158 4.63159Z"
                            fill="#FFFFFF"
                        ></path>
                    </g>
                </svg>
            </span>
            <div class="text-2xl mb-4 font-medium">Pipedrive</div>
            <small class="text-surface-500 text-center">Enviar dados das chamadas para gestão no Pipedrive</small>
            <ng-container *ngIf="pipedrive?.isActive; else disconnected">
                <p-tag class="mt-2" severity="success" value="Ativado" />
            </ng-container>
            <ng-template #disconnected>
                <p-tag severity="danger" value="Desativado" />
            </ng-template>
            <a class="mt-2" pButton (click)="openDialog()">Configurar</a>
        </div>

        <p-dialog
            [(visible)]="dialogVisible"
            [modal]="true"
            header="Configurar Pipedrive"
            [draggable]="false"
            [style]="{ width: '32rem' }"
        >
            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label class="block text-sm font-medium">Status dos negócios (deal status)</label>
                    <p-select
                        id="dealStatus"
                        [options]="dealStatusOptions"
                        formControlName="dealStatus"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o DDR"
                    ></p-select>
                    <small
                        *ngIf="dealStatus?.invalid && (dealStatus?.dirty || dealStatus?.touched)"
                        class="p-error block mt-2"
                    >
                        <div *ngIf="dealStatus?.errors?.['required']">Deal Status é obrigatório.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label class="block text-sm font-medium">URL</label>
                    <input
                        pInputText
                        class="p-inputted"
                        formControlName="url"
                        placeholder="https://api.pipedrive.com"
                    />
                    <small *ngIf="url?.invalid && (url?.dirty || url?.touched)" class="p-error block mt-2">
                        <div *ngIf="url?.errors?.['required']">Url é obrigatório.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label class="block text-sm font-medium">Token</label>
                    <input pInputText type="text" formControlName="token" placeholder="Token de acesso" />
                    <small *ngIf="token?.invalid && (token?.dirty || token?.touched)" class="p-error block mt-2">
                        <div *ngIf="token?.errors?.['required']">Token é obrigatório.</div>
                    </small>
                </div>
            </form>
            <ng-template pTemplate="footer">
                <button pButton class="p-button-text" (click)="closeDialog()">Cancelar</button>
                <button pButton [disabled]="form.invalid || saving" (click)="onSubmit()">Salvar</button>
            </ng-template>
            <small *ngFor="let error of submitErrors" class="text-red-600">{{ error }}</small>
        </p-dialog>
    `
})
export class PipedriveComponent implements OnInit {
    pipedrive?: Pipedrive;
    form!: FormGroup;
    dialogVisible = false;
    saving = false;
    submitErrors: string[] = [];
    readonly dealStatusOptions = [
        { label: 'Abertos', value: DealStatusEnum.OPEN },
        { label: 'Todos (não deletados)', value: DealStatusEnum.ALL_NOT_DELETED }
    ];
    private readonly user: User;

    constructor(
        private readonly httpClientService: HttpClientService,
        private readonly userService: UserService,
        private readonly fb: FormBuilder
    ) {
        this.user = this.userService.getUser();
    }

    get url() {
        return this.form.get('url');
    }

    get token() {
        return this.form.get('token');
    }

    get dealStatus() {
        return this.form.get('dealStatus');
    }

    ngOnInit(): void {
        this.checkPipedriveInfo();
        this.form = this.fb.group({
            url: ['', [Validators.required]],
            token: ['', [Validators.required]],
            dealStatus: [DealStatusEnum.OPEN, [Validators.required]],
            controlNumber: [this.user.controlNumber, [Validators.required]]
        });
    }

    private checkPipedriveInfo() {
        this.httpClientService
            .getPipedriveInfo(this.user.controlNumber)
            .then((response) => {
                this.pipedrive = response
                this.form.patchValue(response)
            })
            .catch(() => (this.pipedrive = undefined));
    }

    openDialog() {
        this.dialogVisible = true;
    }

    closeDialog() {
        this.dialogVisible = false;
    }

    onSubmit() {
        this.saving = true;
        this.httpClientService
            .createOrUpdatePipedrive(this.form.value)
            .then(() => {
                this.submitErrors = []
                this.closeDialog();
                this.checkPipedriveInfo();
            })
            .catch((err) => {
                this.submitErrors = err.error.message
            })
            .finally(() => {
                this.saving = false;
            });
    }
}
