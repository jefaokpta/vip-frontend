import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { Moh, Queue, QueueStrategyEnum } from '@/pabx/types';
import { QueueService } from '@/pabx/queue/queue.service';
import { MohService } from '@/pabx/moh/moh.service';

@Component({
    selector: 'app-edit-queue-page',
    standalone: true,
    imports: [InputTextModule, ButtonModule, CardModule, ReactiveFormsModule, RouterLink, Select, InputNumber],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar {{ queue?.name }}</span>
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

            @if (queue) {
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
                        <label for="ringTimeout" class="block mb-2">Timeout por Ramal (segundos) *</label>
                        <p-input-number
                            id="ringTimeout"
                            mode="decimal"
                            useGrouping="false"
                            formControlName="ringTimeout"
                        />
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
            }
        </p-card>
    `
})
export class EditQueuePage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    mohs: Moh[] = [];
    queue: Queue | null = null;

    strategyOptions = Object.values(QueueStrategyEnum).map((value) => ({
        label: this.strategyLabel(value),
        value
    }));

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
        private readonly queueService: QueueService,
        private readonly mohService: MohService
    ) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id')!;
        Promise.all([this.queueService.findById(id), this.mohService.findAll()]).then(([queue, mohs]) => {
            this.queue = queue;
            this.mohs = mohs;
            this.form = this.fb.group({
                name: [queue.name, [Validators.required]],
                queueStrategy: [queue.queueStrategy, [Validators.required]],
                ringTimeout: [queue.ringTimeout, [Validators.required]],
                queueTimeout: [queue.queueTimeout, [Validators.required]],
                queueSoundId: [queue.queueSoundId, [Validators.required]]
            });
        });
    }

    get name() {
        return this.form?.get('name');
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        const body = { ...this.form.value, id: this.queue!.id, companyId: this.queue!.companyId };
        this.queueService
            .update(this.queue!.id, body)
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
