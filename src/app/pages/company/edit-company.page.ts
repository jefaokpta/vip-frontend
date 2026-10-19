import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CompanyService } from '@/pages/company/company.service';
import { InputMask } from 'primeng/inputmask';
import { ToggleSwitch } from 'primeng/toggleswitch';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { UserService } from '@/pages/users/user.service';
import { RoleEnum } from '@/types/role-enum';
import { ServiceEnum } from '@/types/service-enum';

/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 4/25/25
 */
@Component({
    selector: 'app-edit-company',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        ToastModule,
        NgIf,
        NgFor,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        InputMask,
        ToggleSwitch,
        ConfirmDialog
    ],
    providers: [ConfirmationService],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar {{ name?.value }}</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pages/companies"
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
                    <label for="corporateName" class="block mb-2">Razão Social *</label>
                    <input id="corporateName" pInputText class="p-inputtext" formControlName="corporateName" />
                    <small
                        *ngIf="corporateName?.invalid && (corporateName?.dirty || corporateName?.touched)"
                        class="p-error block mt-2"
                    >
                        <div *ngIf="corporateName?.errors?.['required']">Razão Social é obrigatório.</div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="cnpj" class="block mb-2">CNPJ *</label>
                    <p-inputmask mask="**.***.***/****-99" formControlName="cnpj" placeholder="**.***.***/****-99" />
                    <small *ngIf="cnpj?.invalid && (cnpj?.dirty || cnpj?.touched)" class="p-error block mt-2">
                        <div *ngIf="cnpj?.errors?.['required']">CNPJ é obrigatório.</div>
                        <div *ngIf="cnpj?.errors?.['pattern']">
                            CNPJ deve conter apenas números e letras (maiúsculas).
                        </div>
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="companyId" class="block mb-2">Código de Controle *</label>
                    <p-input-mask mask="999999" formControlName="companyId" placeholder="100054" readonly />
                    <small
                        *ngIf="companyId?.invalid && (companyId?.dirty || companyId?.touched)"
                        class="p-error block mt-2"
                    >
                        <div *ngIf="companyId?.errors?.['required']">Código da empresa é obrigatório.</div>
                        <div *ngIf="companyId?.errors?.['pattern']">
                            Código deve conter exatamente 6 dígitos numéricos.
                        </div>
                    </small>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>

                <small *ngIf="showError" class="text-red-500">
                    Houve um erro, verifique se o código de controle já existe.
                </small>
            </form>

            <div *ngIf="canManageServices" class="mt-6">
                <h3 class="font-semibold text-xl mb-4">Serviços</h3>
                <div *ngFor="let service of serviceOptions" class="flex items-center gap-3 mb-3">
                    <p-toggleswitch
                        #toggle
                        [inputId]="'service-' + service.value"
                        [ngModel]="hasService(service.value)"
                        (onChange)="onToggleService(service.value, $event.checked, toggle)"
                        [disabled]="pendingServices"
                    />
                    <label [for]="'service-' + service.value">{{ service.label }}</label>
                </div>
                <small *ngIf="servicesError" class="text-red-500">{{ servicesError }}</small>
            </div>
        </p-card>
        <p-confirm-dialog />
    `
})
export class EditCompanyPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    services: ServiceEnum[] = [];
    pendingServices = false;
    servicesError = '';
    readonly canManageServices: boolean;
    readonly serviceOptions = [
        { label: 'PABX', value: ServiceEnum.PABX },
        { label: 'IA', value: ServiceEnum.IA },
        { label: 'Vídeo', value: ServiceEnum.VIDEO },
        { label: 'Vendas', value: ServiceEnum.VENDAS },
        { label: 'SAC', value: ServiceEnum.SAC }
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly companyService: CompanyService,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly confirmationService: ConfirmationService,
        userService: UserService
    ) {
        this.canManageServices = userService.getUser().roles.includes(RoleEnum.ROLE_SAAS_SUPPORT);
    }

    get name() {
        return this.form.get('name');
    }
    get companyId() {
        return this.form.get('companyId');
    }
    get cnpj() {
        return this.form.get('cnpj');
    }
    get corporateName() {
        return this.form.get('corporateName');
    }

    ngOnInit(): void {
        this.form = this.fb.group({
            id: ['', [Validators.required]],
            name: ['', [Validators.required]],
            corporateName: ['', [Validators.required]],
            companyId: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
            cnpj: [
                '',
                [
                    Validators.required,
                    Validators.pattern(String.raw`^[A-Z0-9]{2}\.[A-Z0-9]{3}\.[A-Z0-9]{3}\/[A-Z0-9]{4}-[0-9]{2}$`)
                ]
            ]
        });
        const companyId = this.activatedRoute.snapshot.paramMap.get('id')!;
        this.companyService.findCompanyId(companyId).then((company) => {
            this.form.patchValue(company);
            this.services = company.services ?? [];
        });
    }

    hasService(service: ServiceEnum): boolean {
        return this.services.includes(service);
    }

    onToggleService(service: ServiceEnum, enabled: boolean, toggle: ToggleSwitch) {
        if (enabled) {
            this.saveServices([...this.services, service], toggle, false);
            return;
        }
        this.confirmationService.confirm({
            message: 'Desligar este serviço remove o módulo de todos os usuários da empresa. Continuar?',
            header: 'Confirmação',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Sim',
            rejectLabel: 'Não',
            accept: () =>
                this.saveServices(
                    this.services.filter((s) => s !== service),
                    toggle,
                    true
                ),
            reject: () => toggle.writeValue(true)
        });
    }

    private saveServices(services: ServiceEnum[], toggle: ToggleSwitch, previous: boolean) {
        this.pendingServices = true;
        this.servicesError = '';
        this.companyService
            .updateServices(this.companyId?.value, services)
            .then((company) => (this.services = company.services ?? services))
            .catch(() => {
                this.servicesError = 'Não foi possível atualizar os serviços.';
                toggle.writeValue(previous);
            })
            .finally(() => (this.pendingServices = false));
    }

    async onSubmit() {
        this.pending = true;
        this.showError = false;
        this.companyService
            .update(this.form.value)
            .then(() => this.router.navigate(['/pages/companies']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
