import {Component, computed, inject, OnInit} from '@angular/core';
import {CheckboxModule} from 'primeng/checkbox';
import {CommonModule} from '@angular/common';
import {InputTextModule} from 'primeng/inputtext';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {LayoutService} from '@/layout/service/layout.service';
import {AppConfigurator} from '@/layout/components/app.configurator';
import {IconFieldModule} from 'primeng/iconfield';
import {InputIconModule} from 'primeng/inputicon';
import {ButtonModule} from 'primeng/button';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {Image} from 'primeng/image';
import {DropdownModule} from 'primeng/dropdown';
import {Password} from 'primeng/password';
import {UserService} from "@/pages/users/user.service";

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CheckboxModule,
        InputTextModule,
        FormsModule,
        RouterModule,
        AppConfigurator,
        IconFieldModule,
        InputIconModule,
        ButtonModule,
        CommonModule,
        ProgressSpinnerModule,
        Image,
        DropdownModule,
        Password,
        ReactiveFormsModule
    ],
    template: `
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1600 800"
            class="fixed left-0 top-0 min-h-screen min-w-[100vw]"
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
                    <div class="mb-4">
                        <a href="https://iasmin.io/" target="_blank" class="app-logo">
                            <p-image src="layout/images/iasmin-black.png" alt="logo iasmin" width="190rem"></p-image>
                        </a>
                    </div>
                    <span class="text-surface-600 dark:text-surface-200 font-medium">Entre com suas credencias</span>
                </div>
                <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                    <div class="field mb-4">
                        <label for="email" class="block mb2 text-surface-600 dark:text-surface-200 font-medium">Email</label>
                        <input id="email" fluid pInputText class="p-inputtext" formControlName="email" />
                        <small *ngIf="email?.invalid && (email?.dirty || email?.touched)" class="p-error block mt-2">
                            <div *ngIf="email?.errors?.['required']">Email é obrigatório.</div>
                            <div *ngIf="email?.errors?.['email']">Email inválido.</div>
                        </small>
                    </div>

                    <div class="flex flex-col gap-2 items-end">
                        <div class="field">
                            <label for="password" class="block mb-2 text-surface-600 dark:text-surface-200 font-medium">Senha</label>
                            <p-password fluid id="password" formControlName="password" [feedback]="false" [toggleMask]="true"></p-password>
                            <small *ngIf="password?.invalid && (password?.dirty || password?.touched)" class="p-error block mt-2">
                                <div *ngIf="password?.errors?.['required']">Senha é obrigatória.</div>
                            </small>
                        </div>
                        <div>
                            <p-button link routerLink="/auth/forgotpassword">
                                <small>Esqueci a senha</small>
                            </p-button>
                        </div>
                    </div>

                    <div>
                        <p-button type="submit" label="Entrar" fluid [disabled]="form.invalid">
                            <i *ngIf="pending" class="pi pi-spinner pi-spin"></i>
                        </p-button>
                        <small *ngIf="errorMessage" class="p-error block mt-2">{{ errorMessage }}</small>
                    </div>
                </form>
            </div>
        </div>

        <app-configurator hidden [simple]="true" />
    `
})
export class Login implements OnInit {
    pending: boolean = false;
    returnUrl: string = '/';
    form!: FormGroup;
    errorMessage: string = '';

    LayoutService = inject(LayoutService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly fb: FormBuilder = inject(FormBuilder);
    private readonly userService = inject(UserService);

    isDarkTheme = computed(() => this.LayoutService.isDarkTheme());

    get email() {
        return this.form.get('email');
    }

    get password() {
        return this.form.get('password');
    }

    ngOnInit() {
        // Capturar returnUrl dos parâmetros de consulta, se existir
        this.route.queryParams.subscribe((params) => {
            this.returnUrl = params['returnUrl'] ?? '/';
        });
        this.form = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]]
        });
    }

    async onSubmit() {
        this.pending = true;
        this.errorMessage = '';
        const { email, password } = this.form.value;
        try {
            const response = await this.userService.authenticate(email, password);
            this.userService.loginSuccess(response.token);
            this.router.navigate([this.returnUrl]);
        } catch (err: any) {
            console.error('validar login', err);
            if (err.error.message.includes('#1')) {
                this.router.navigate(['/auth/verification', { email: encodeURI(email) }]);
            }
            if (err.error.message.includes('#2')) {
                this.router.navigate(['/auth/newpassword', { email: encodeURI(email) }]);
            }
            if (err.error.message.includes('#3')) {
                this.router.navigate(['/auth/newpassword', { email: encodeURI(email), reset: true }]);
            }
            this.errorMessage = 'Usuário ou senha inválidos.';
        } finally {
            this.pending = false;
        }
    }
}
