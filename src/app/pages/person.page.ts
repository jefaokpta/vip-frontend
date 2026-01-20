import { Component, OnInit } from '@angular/core';
import { Button, ButtonModule } from 'primeng/button';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { NgForOf, NgIf } from '@angular/common';
import { Password } from 'primeng/password';
import { passwordStrengthValidator } from '@/pages/utils/validators';
import { User } from '@/types/types';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '@/pages/users/user.service';

@Component({
    selector: 'app-empty',
    standalone: true,
    imports: [
        Button,
        ButtonModule,
        Card,
        Divider,
        FormsModule,
        InputText,
        NgIf,
        Password,
        ReactiveFormsModule,
        NgForOf,
        Toast
    ],
    providers: [MessageService],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Perfil de Usuário</span>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="block mb-2">Nome</label>
                    <input id="name" pInputText class="p-inputtext" formControlName="name" />
                    <small *ngIf="name?.invalid && (name?.dirty || name?.touched)" class="p-error block mt-2">
                        <div *ngIf="name?.errors?.['required']">Nome é obrigatório.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="email" class="block mb-2">Email</label>
                    <input id="email" readonly pInputText class="p-inputtext" formControlName="email" />
                </div>

                <div class="field mb-4">
                    <p-button
                        type="button"
                        (onClick)="togglePasswordChange()"
                        [label]="showPasswordFields ? 'Cancelar troca de senha' : 'Trocar senha'"
                        icon="pi pi-key"
                    ></p-button>
                </div>

                <ng-container formArrayName="passwordArray" *ngIf="showPasswordFields">
                    <ng-container *ngFor="let pass of passwordArray.controls; let i = index; first as isFirst">
                        <div *ngIf="isFirst" class="field mb-4">
                            <label for="oldPassword" class="block mb-2">Senha atual</label>
                            <p-password
                                id="oldPassword"
                                [formControlName]="i"
                                [toggleMask]="true"
                                [feedback]="false"
                                promptLabel="Digite a senha atual"
                            ></p-password>
                            <small *ngIf="pass.invalid && (pass.dirty || pass.touched)" class="p-error block mt-2">
                                <div *ngIf="pass.errors?.['required']">Senha atual é obrigatória.</div>
                                <div *ngIf="pass.errors?.['minlength']">Deve ter no mínimo 8 caracteres.</div>
                            </small>
                        </div>

                        <div *ngIf="!isFirst" class="field mb-4">
                            <label for="password" class="block mb-2">Nova senha</label>
                            <p-password
                                id="password"
                                [formControlName]="i"
                                [toggleMask]="true"
                                [feedback]="true"
                                promptLabel="Digite a nova senha"
                                [weakLabel]="'Fraca'"
                                [mediumLabel]="'Média'"
                                [strongLabel]="'Boa'"
                            >
                                <ng-template #footer>
                                    <p-divider />
                                    <ul class="pl-2 ml-2 my-0 leading-normal">
                                        <li *ngIf="pass.errors?.['passwordStrength']?.missingUppercase">
                                            Deve conter ao menos uma letra maiúscula.
                                        </li>
                                        <li *ngIf="pass.errors?.['passwordStrength']?.missingLowercase">
                                            Deve conter ao menos uma letra minúscula.
                                        </li>
                                        <li *ngIf="pass.errors?.['passwordStrength']?.missingNumber">
                                            Deve conter ao menos um número.
                                        </li>
                                        <li *ngIf="pass.errors?.['passwordStrength']?.missingSpecialChar">
                                            Deve conter ao menos um carácter especial.
                                        </li>
                                        <li *ngIf="pass.errors?.['minlength']">Deve ter no mínimo 8 caracteres.</li>
                                    </ul>
                                </ng-template>
                            </p-password>
                            <small *ngIf="pass.invalid && (pass.dirty || pass.touched)" class="p-error block mt-2">
                                <div *ngIf="pass.errors?.['required']">Nova senha é obrigatória.</div>
                            </small>
                        </div>
                    </ng-container>
                </ng-container>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="!pending" class="pi pi-save"></i>
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                    </p-button>
                </div>
            </form>
        </p-card>
        <p-toast />
    `
})
export class PersonPage implements OnInit {
    form!: FormGroup;
    showPasswordFields = false;
    pending = false;
    private readonly user: User;

    constructor(
        private readonly fb: FormBuilder,
        private readonly userService: UserService,
        private readonly messageService: MessageService
    ) {
        this.user = this.userService.getUser();
    }

    get name() {
        return this.form.get('name');
    }
    get passwordArray() {
        return this.form.get('passwordArray') as FormArray;
    }
    get email() {
        return this.form.get('email');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            passwordArray: this.fb.array([])
        });
        this.form.patchValue(this.user);
        this.email?.setValue(this.user.sub);
    }

    onSubmit() {
        this.pending = true;
        this.userService
            .updateProfile(this.form.value)
            .then(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Sucesso',
                    detail: 'Perfil atualizado com sucesso.',
                    life: 15_000
                });
                this.passwordArray.clear();
                this.showPasswordFields = false;
            })
            .catch((err) => {
                console.error(err);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erro ao atualizar perfil',
                    detail: `${err.error.message}`,
                    life: 15_000
                });
            })
            .finally(() => {
                this.pending = false;
            });
    }

    togglePasswordChange() {
        if (this.showPasswordFields) {
            this.passwordArray.clear();
        } else {
            this.passwordArray.push(
                this.fb.control('', [Validators.required, Validators.minLength(8)]),
                this.fb.control('', [Validators.required, Validators.minLength(8), passwordStrengthValidator()])
            );
        }
        this.showPasswordFields = !this.showPasswordFields;
    }
}
