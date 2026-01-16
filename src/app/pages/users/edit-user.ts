/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 5/13/25
 */

import { Component, OnInit } from '@angular/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { RoleEnum } from '@/types/types';
import { Select } from 'primeng/select';
import { UserService } from '@/pages/users/user.service';

@Component({
    selector: 'app-edit-user',
    imports: [Button, InputText, NgIf, ReactiveFormsModule, RouterLink, Card, Select],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar {{ name?.value }}</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pages/users"
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
                    <label for="email" class="block mb-2">Email *</label>
                    <input id="email" pInputText class="p-inputtext" formControlName="email" readonly />
                    <small *ngIf="email?.invalid && (email?.dirty || email?.touched)" class="p-error block mt-2">
                        <div *ngIf="email?.errors?.['required']">Email é obrigatório.</div>
                        <div *ngIf="email?.errors?.['email']">Email inválido.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="role" class="block mb-2">Nível de Acesso *</label>
                    <p-select
                        id="role"
                        [options]="roleOptions"
                        formControlName="role"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o nível de acesso"
                    ></p-select>
                    <small *ngIf="role?.invalid && (role?.dirty || role?.touched)" class="p-error block mt-2">
                        <div *ngIf="role?.errors?.['required']">Nível de acesso é obrigatório.</div>
                    </small>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" icon="pi pi-save" [disabled]="form.invalid"></p-button>
                </div>
            </form>
        </p-card>
    `
})
export class EditUserPage implements OnInit {
    form!: FormGroup;
    roleOptions = [
        { label: 'Usuário', value: RoleEnum.ROLE_USER },
        { label: 'Administrador', value: RoleEnum.ROLE_ADMIN }
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly userService: UserService,
        private readonly activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            id: [null, [Validators.required]],
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            role: [RoleEnum.ROLE_USER, [Validators.required]]
        });
        const id = this.activatedRoute.snapshot.paramMap.get('id')!;
        this.userService.findById(id).then((user) => {
            this.form.patchValue(user);
            this.role?.setValue(user.roles.at(-1));
        });
        const user = this.userService.getUser();
        if (user.roles.includes(RoleEnum.ROLE_SUPER)) {
            this.roleOptions.push({ label: 'Super Usuário', value: RoleEnum.ROLE_SUPER });
        }
    }

    get name() {
        return this.form.get('name');
    }

    get email() {
        return this.form.get('email');
    }

    get role() {
        return this.form.get('role');
    }

    onSubmit() {
        const user = { ...this.form.value, roles: [this.form.value.role] };
        this.userService.update(user).then(() => this.router.navigate(['/pages/users']));
    }
}
