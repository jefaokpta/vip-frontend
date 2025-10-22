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
import { HttpClientService } from '@/services/http-client.service';
import { Router, RouterLink } from '@angular/router';
import { Card } from 'primeng/card';
import { RoleEnum } from '@/types/types';
import { UserService } from '@/services/user.service';
import { Select } from 'primeng/select';

@Component({
    selector: 'app-new-user',
    imports: [Button, InputText, NgIf, ReactiveFormsModule, RouterLink, Card, Select],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Novo Usuário</span>
                    <p-button type="button" label="Voltar" icon="pi pi-arrow-left" routerLink="/pages/users" outlined severity="secondary"></p-button>
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
                    <input id="email" pInputText class="p-inputtext" formControlName="email" />
                    <small *ngIf="email?.invalid && (email?.dirty || email?.touched)" class="p-error block mt-2">
                        <div *ngIf="email?.errors?.['required']">Email é obrigatório.</div>
                        <div *ngIf="email?.errors?.['email']">Email inválido.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="ddr" class="block mb-2">DDR *</label>
                    <p-select
                        id="ddr"
                        [options]="ddrOptions"
                        formControlName="ddr"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o DDR"
                    ></p-select>
                    <small *ngIf="ddr?.invalid && (ddr?.dirty || ddr?.touched)" class="p-error block mt-2">
                        <div *ngIf="ddr?.errors?.['required']">DDR é obrigatório.</div>
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
export class NewUserPage implements OnInit {
    form!: FormGroup;
    roleOptions = [
        { label: 'Usuário', value: RoleEnum.USER },
        { label: 'Administrador', value: RoleEnum.ADMIN }
    ];
    ddrOptions: { label: string; value: string }[] = [];

    constructor(
        private readonly fb: FormBuilder,
        private readonly httpClientService: HttpClientService,
        private readonly router: Router,
        private readonly userService: UserService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            ddr: ['', [Validators.required]],
            role: [RoleEnum.USER, [Validators.required]]
        });
        const user = this.userService.getUser();
        if (user.roles.includes(RoleEnum.SUPER)) {
            this.roleOptions.push({ label: 'Super Usuário', value: RoleEnum.SUPER });
        }
        this.httpClientService.findOneCompanyByControlNumber(user.controlNumber).then((company) => {
            this.ddrOptions = company.phones.map((phone) => ({
                label: phone.phone,
                value: phone.phone
            }));
        });
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

    get ddr() {
        return this.form.get('ddr');
    }

    onSubmit() {
        this.httpClientService
            .createUser({ ...this.form.value, roles: [this.form.value.role] })
            .then(() => this.router.navigate(['/pages/users']))
            .catch((err) => {
                console.error(err.message);
            });
    }
}
