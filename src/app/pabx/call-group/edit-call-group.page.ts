import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CallGroupService } from '@/pabx/call-group/call-group.service';
import { CallGroupStrategyEnum, Peer } from '@/pabx/types';
import { PeerService } from '@/pabx/peer/peer.service';
import { InputTextModule } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { InputNumber } from 'primeng/inputnumber';
import { PickList } from 'primeng/picklist';

@Component({
    selector: 'app-edit-call-group-page',
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
                    <span class="font-semibold text-2xl">Editar {{ name?.value }}</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/call-groups"
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
                    <label for="strategy" class="block mb-2">Distribuição *</label>
                    <p-select
                        id="strategy"
                        [options]="strategyOptions"
                        formControlName="callGroupStrategyEnum"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione uma distribuição"
                    ></p-select>
                </div>

                <div class="field mb-4">
                    <label for="timeout" class="block mb-2">Tempo de chamada (segundos) *</label>
                    <p-input-number id="timeout" mode="decimal" useGrouping="false" formControlName="timeout" />
                </div>

                <div class="field mb-4">
                    <label class="block mb-2">Ramais</label>
                    <p-picklist
                        [source]="availablePeers"
                        [target]="selectedPeers"
                        sourceHeader="Disponíveis"
                        targetHeader="Selecionados"
                        [dragdrop]="true"
                        [responsive]="true"
                        [sourceStyle]="{ height: '20rem' }"
                        [targetStyle]="{ height: '20rem' }"
                        showSourceControls="false"
                        showTargetControls="false"
                        filterBy="name,peer"
                        sourceFilterPlaceholder="Pesquisar"
                        targetFilterPlaceholder="Pesquisar"
                        breakpoint="1200px"
                    >
                        <ng-template let-peer pTemplate="item">
                            <div class="flex items-center gap-2">
                                <i class="pi pi-phone"></i>
                                <span>{{ peer.name }} ({{ peer.peer }})</span>
                            </div>
                        </ng-template>
                    </p-picklist>
                </div>

                @if (selectedPeers.length === 0) {
                    <small class="p-error block mb-2">
                        <span class="text-red-500">Ao menos 1 ramal deve ser selecionado.</span>
                    </small>
                }

                <div class="flex mt-4">
                    <p-button
                        type="submit"
                        label="Salvar"
                        [disabled]="form.invalid || pending || selectedPeers.length === 0"
                    >
                        @if (pending) {
                            <i class="pi pi-spin pi-spinner"></i>
                        } @else {
                            <i class="pi pi-save"></i>
                        }
                    </p-button>
                </div>

                @if (showError) {
                    <small class="text-red-500"> Erro ao salvar o grupo de chamadas </small>
                }
            </form>
        </p-card>
    `
})
export class EditCallGroupPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    availablePeers: Peer[] = [];
    selectedPeers: Peer[] = [];
    private groupId!: number;

    strategyOptions = Object.values(CallGroupStrategyEnum).map((value) => ({
        label: this.strategyLabel(value),
        value
    }));

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly callGroupService: CallGroupService,
        private readonly peerService: PeerService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            callGroupStrategyEnum: [CallGroupStrategyEnum.ALL, [Validators.required]],
            timeout: [30, [Validators.required]]
        });

        const id = this.activatedRoute.snapshot.paramMap.get('id')!;
        this.groupId = +id;

        Promise.all([this.callGroupService.findById(id), this.peerService.findAll()]).then(([group, peers]) => {
            this.form.patchValue({
                name: group.name,
                callGroupStrategyEnum: group.callGroupStrategyEnum,
                timeout: group.timeout
            });
            this.selectedPeers = peers.filter((p) => group.peerIds.includes(p.id));
            this.availablePeers = peers.filter((p) => !group.peerIds.includes(p.id));
        });
    }

    get name() {
        return this.form.get('name');
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        const body = {
            ...this.form.value,
            peerIds: this.selectedPeers.map((p) => p.id)
        };
        this.callGroupService
            .update(this.groupId, body)
            .then(() => this.router.navigate(['/pabx/call-groups']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }

    private strategyLabel(strategy: CallGroupStrategyEnum): string {
        const labels: Record<CallGroupStrategyEnum, string> = {
            [CallGroupStrategyEnum.ALL]: 'Todos',
            [CallGroupStrategyEnum.SEQUENTIAL]: 'Sequencial',
            [CallGroupStrategyEnum.RANDOM]: 'Aleatório'
        };
        return labels[strategy] ?? strategy;
    }
}
