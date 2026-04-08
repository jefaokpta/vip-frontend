import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Router, RouterLink } from '@angular/router';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { PickList } from 'primeng/picklist';
import { Moh, QueueStrategyEnum } from '@/pabx/types';
import { User } from '@/types/types';
import { QueueService } from '@/pabx/queue/queue.service';
import { MohService } from '@/pabx/moh/moh.service';
import { UserService } from '@/pages/users/user.service';

@Component({
    selector: 'app-new-queue-page',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        ReactiveFormsModule,
        RouterLink,
        Select,
        InputNumber,
        PickList
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Nova Fila de Atendimento</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/queues"
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
                    <label for="queueStrategy" class="block mb-2">Estratégia de Distribuição *</label>
                    <p-select
                        id="queueStrategy"
                        [options]="strategyOptions"
                        formControlName="queueStrategy"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione uma estratégia"
                    ></p-select>
                </div>

                <div class="field mb-4">
                    <label for="ringTimeout" class="block mb-2">Timeout por Agente (segundos) *</label>
                    <p-input-number id="ringTimeout" mode="decimal" useGrouping="false" formControlName="ringTimeout" />
                </div>

                <div class="field mb-4">
                    <label for="queueTimeout" class="block mb-2">Timeout da Fila (segundos) *</label>
                    <p-input-number
                        id="queueTimeout"
                        mode="decimal"
                        useGrouping="false"
                        formControlName="queueTimeout"
                    />
                </div>

                <div class="field mb-4">
                    <label for="queueSoundId" class="block mb-2">Áudio da Fila *</label>
                    <p-select
                        id="queueSoundId"
                        [options]="mohs"
                        formControlName="queueSoundId"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Selecione um áudio"
                    ></p-select>
                </div>

                <div class="field mb-4">
                    <label class="block mb-2">Agentes da Fila</label>
                    <p-picklist
                        [source]="availableUsers"
                        [target]="selectedUsers"
                        sourceHeader="Disponíveis"
                        targetHeader="Selecionados"
                        [dragdrop]="true"
                        [responsive]="true"
                        [sourceStyle]="{ height: '20rem' }"
                        [targetStyle]="{ height: '20rem' }"
                        showSourceControls="false"
                        showTargetControls="false"
                        filterBy="name,email"
                        sourceFilterPlaceholder="Pesquisar"
                        targetFilterPlaceholder="Pesquisar"
                        breakpoint="1200px"
                    >
                        <ng-template let-user pTemplate="item">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-user"></i>
                                <span>{{ user.name }} ({{ user.email }})</span>
                            </div>
                        </ng-template>
                    </p-picklist>
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
                    <small class="text-red-500"> Erro ao salvar a fila de atendimento </small>
                }
            </form>
        </p-card>
    `
})
export class NewQueuePage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    mohs: Moh[] = [];
    availableUsers: User[] = [];
    selectedUsers: User[] = [];

    strategyOptions = Object.values(QueueStrategyEnum).map((value) => ({
        label: this.strategyLabel(value),
        value
    }));

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly queueService: QueueService,
        private readonly mohService: MohService,
        private readonly userService: UserService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            queueStrategy: [QueueStrategyEnum.ALL, [Validators.required]],
            ringTimeout: [30, [Validators.required]],
            queueTimeout: [120, [Validators.required]],
            queueSoundId: [null, [Validators.required]]
        });
        Promise.all([this.mohService.findAll(), this.userService.findAll()]).then(([mohs, users]) => {
            this.mohs = mohs;
            this.availableUsers = users;
        });
    }

    get name() {
        return this.form.get('name');
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        const body = { ...this.form.value, memberIds: this.selectedUsers.map((u) => u.id) };
        this.queueService
            .create(body)
            .then(() => this.router.navigate(['/pabx/queues']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }

    private strategyLabel(strategy: QueueStrategyEnum): string {
        const labels: Record<QueueStrategyEnum, string> = {
            [QueueStrategyEnum.ALL]: 'Todos simultaneamente',
            [QueueStrategyEnum.RANDOM]: 'Aleatório',
            [QueueStrategyEnum.LEAST_RECENTLY]: 'Menos recente',
            [QueueStrategyEnum.FEWEST_CALLS]: 'Menos chamadas',
            [QueueStrategyEnum.EQUALLY]: 'Igualmente'
        };
        return labels[strategy] ?? strategy;
    }
}
