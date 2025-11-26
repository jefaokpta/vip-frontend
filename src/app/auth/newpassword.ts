import {Component, computed, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {LayoutService} from '@/layout/service/layout.service';
import {AppConfigurator} from '@/layout/components/app.configurator';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {InputTextModule} from 'primeng/inputtext';
import {PasswordModule} from 'primeng/password';
import {Divider} from 'primeng/divider';
import {NgIf} from '@angular/common';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {matchPasswordValidator, passwordStrengthValidator} from '@/pages/utils/validators';
import {HttpClientService} from '@/services/http-client.service';
import {InputOtp} from 'primeng/inputotp';

@Component({
    selector: 'app-new-password',
    imports: [
        ButtonModule,
        RouterModule,
        AppConfigurator,
        IconFieldModule,
        InputIconModule,
        InputTextModule,
        PasswordModule,
        AppConfigurator,
        Divider,
        NgIf,
        ReactiveFormsModule,
        InputOtp,
        FormsModule
    ],
    standalone: true,
    template: ` <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1600 800"
            class="fixed left-0 top-0 min-h-screen min-w-screen"
            preserveAspectRatio="none"
        >
            <rect [attr.fill]="isDarkTheme() ? 'var(--p-primary-900)' : 'var(--p-primary-500)'" width="1600" height="800" />
            <path
                [attr.fill]="isDarkTheme() ? 'var(--p-primary-800)' : 'var(--p-primary-400)'"
                d="M478.4 581c3.2 0.8 6.4 1.7 9.5 2.5c196.2 52.5 388.7 133.5 593.5 176.6c174.2 36.6 349.5 29.2 518.6-10.2V0H0v574.9c52.3-17.6 106.5-27.7 161.1-30.9C268.4 537.4 375.7 554.2 478.4 581z"
            />
            <path
                [attr.fill]="isDarkTheme() ? 'var(--p-primary-700)' : 'var(--p-primary-300)'"
                d="M181.8 259.4c98.2 6 191.9 35.2 281.3 72.1c2.8 1.1 5.5 2.3 8.3 3.4c171 71.6 342.7 158.5 531.3 207.7c198.8 51.8 403.4 40.8 597.3-14.8V0H0v283.2C59 263.6 120.6 255.7 181.8 259.4z"
            />
            <path
                [attr.fill]="isDarkTheme() ? 'var(--p-primary-600)' : 'var(--p-primary-200)'"
                d="M454.9 86.3C600.7 177 751.6 269.3 924.1 325c208.6 67.4 431.3 60.8 637.9-5.3c12.8-4.1 25.4-8.4 38.1-12.9V0H288.1c56 21.3 108.7 50.6 159.7 82C450.2 83.4 452.5 84.9 454.9 86.3z"
            />
            <path
                [attr.fill]="isDarkTheme() ? 'var(--p-primary-500)' : 'var(--p-primary-100)'"
                d="M1397.5 154.8c47.2-10.6 93.6-25.3 138.6-43.8c21.7-8.9 43-18.8 63.9-29.5V0H643.4c62.9 41.7 129.7 78.2 202.1 107.4C1020.4 178.1 1214.2 196.1 1397.5 154.8z"
            />
        </svg>
        <div class="px-8 min-h-screen flex justify-center items-center">
            <div class="border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 rounded py-16 px-6 md:px-16 z-10">
                <div class="mb-6">
                    <div class="text-surface-900 dark:text-surface-0 text-xl font-bold mb-2">{{ isResetPassword ? 'Redefinir' : 'Criar' }} Senha</div>
                </div>

                <div class="flex flex-col gap-4 mb-4" *ngIf="isResetPassword">
                    <span class="text-surface-600 dark:text-surface-200 font-medium">Digite o código de validação enviado para seu email</span>
                    <div class="flex flex-col gap-4">
                        <p-input-otp [(ngModel)]="code" [integerOnly]="true" [length]="6"></p-input-otp>
                        <small *ngIf="codeError" class="dark:text-surface-200 text-red-500">Complete o código</small>
                    </div>
                </div>

                <span class="text-surface-600 dark:text-surface-200 font-medium">Crie uma senha forte para acesso</span>
                <form [formGroup]="form" (ngSubmit)="onSubmit()">
                    <div class="flex flex-col gap-2">
                        <p-password
                            id="password"
                            formControlName="password"
                            [toggleMask]="true"
                            [feedback]="true"
                            placeholder="Digite uma senha"
                            promptLabel="Começe a digitar sua senha"
                            [weakLabel]="'Fraca'"
                            [mediumLabel]="'Média'"
                            [strongLabel]="'Boa'"
                        >
                            <ng-template #footer>
                                <p-divider />
                                <ul class="pl-2 ml-2 my-0 leading-normal">
                                    <li *ngIf="password.errors?.['passwordStrength']?.missingUppercase">Deve conter ao menos uma letra maiúscula.</li>
                                    <li *ngIf="password.errors?.['passwordStrength']?.missingLowercase">Deve conter ao menos uma letra minúscula.</li>
                                    <li *ngIf="password.errors?.['passwordStrength']?.missingNumber">Deve conter ao menos um número.</li>
                                    <li *ngIf="password.errors?.['passwordStrength']?.missingSpecialChar">
                                        Deve conter ao menos um carácter especial.
                                    </li>
                                    <li *ngIf="password.errors?.['minlength']">Deve ter no mínimo 8 caracteres.</li>
                                </ul>
                            </ng-template>
                        </p-password>

                        <small *ngIf="password.invalid && (password.dirty || password.touched)" class="p-error block">
                            <div *ngIf="password.errors?.['required']">Uma senha é obrigatória.</div>
                        </small>

                        <p-password
                            id="repeatPassword"
                            formControlName="repeatPassword"
                            [toggleMask]="true"
                            [feedback]="false"
                            placeholder="Confirme a senha"
                            class="mt-4"
                        ></p-password>

                        <small *ngIf="repeatPassword.dirty || repeatPassword.touched" class="p-error block">
                            <div *ngIf="form.hasError('passwordMustMatch')">As senhas não são iguais.</div>
                        </small>

                        <div>
                            <p-button type="submit" label="Criar" fluid [disabled]="form.invalid || pending"></p-button>
                        </div>

                        <small *ngIf="submitError" class="text-red-600">Não foi possível criar sua senha, tente novamente mais tarde.</small>
                        <small *ngIf="submitError" class="text-red-600">{{ customErrorMessage }}</small>
                    </div>
                </form>
            </div>
        </div>

        <app-configurator hidden [simple]="true" />`
})
export class NewPassword implements OnInit {
    form!: FormGroup;
    submitError = false;
    isResetPassword = false;
    code?: number;
    codeError = false;
    pending = false;
    customErrorMessage = '';

    constructor(
        private readonly layoutService: LayoutService,
        private readonly fb: FormBuilder,
        private readonly httpClientService: HttpClientService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group(
            {
                email: ['', [Validators.required, Validators.email]],
                password: ['', [Validators.required, passwordStrengthValidator()]],
                repeatPassword: ['', [Validators.required]]
            },
            {
                validators: matchPasswordValidator
            }
        );
        this.form.get('email')!.setValue(this.activatedRoute.snapshot.paramMap.get('email')!);
        this.isResetPassword = this.activatedRoute.snapshot.paramMap.get('reset') === 'true';
    }

    get password() {
        return this.form.get('password')!;
    }

    get repeatPassword() {
        return this.form.get('repeatPassword')!;
    }

    isDarkTheme = computed(() => this.layoutService.isDarkTheme());

    onSubmit() {
        this.pending = true;
        if (this.isResetPassword) {
            if (this.code?.toString().length !== 6) {
                this.codeError = true;
                this.pending = false;
                return;
            }
            this.httpClientService
                .createResetUserPassword({ ...this.form.value, confirmationCode: this.code })
                .then(() => this.router.navigate(['/auth/login']))
                .catch((err) => {
                    this.submitError = true;
                    this.customErrorMessage = err.error.message;
                })
                .finally(() => (this.pending = false));
            return;
        }
        this.httpClientService
            .createResetUserPassword(this.form.value)
            .then(() => this.router.navigate(['/auth/login']))
            .catch((err) => {
                this.submitError = true;
                this.customErrorMessage = err.error.message;
            })
            .finally(() => (this.pending = false));
    }
}
