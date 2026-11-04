import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {CallGroupService} from '@/pabx/call-group/call-group.service';
import {CallGroupStrategyEnum} from '@/pabx/types/call-group-strategy-enum';
import {Peer} from '@/pabx/types/peer';
import {PeerService} from '@/pabx/peer/peer.service';
import {Moh} from '@/pabx/types/moh';
import {MohService} from '@/pabx/moh/moh.service';
import {InputTextModule} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {InputNumber} from 'primeng/inputnumber';
import {PickList} from 'primeng/picklist';
import {transferPickListItems} from '@/util/utils';

const byName = (a: Peer, b: Peer) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true, sensitivity: 'base' });

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
                    <label for="groupTimeout" class="block mb-2">Tempo total do grupo (segundos) *</label>
                    <p-input-number
                        id="groupTimeout"
                        mode="decimal"
                        useGrouping="false"
                        formControlName="groupTimeout"
                    />
                </div>

                <div class="field mb-4">
                    <label for="callGroupSoundId" class="block mb-2">Áudio de espera</label>
                    <p-select
                        id="callGroupSoundId"
                        [options]="mohs"
                        formControlName="callGroupSoundId"
                        optionLabel="name"
                        optionValue="id"
                        [showClear]="true"
                        placeholder="Sem áudio (tom de chamada)"
                    ></p-select>
                </div>

                <div class="field mb-4">
                    <label class="block mb-2">Ramais</label>
                    <p-picklist
                        [source]="availablePeers"
                        [target]="selectedPeers"
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
                        (onMoveToTarget)="moveToSelected($event.items)"
                        (onMoveToSource)="moveToAvailable($event.items)"
                        (onMoveAllToTarget)="moveToSelected($event.items)"
                        (onMoveAllToSource)="moveToAvailable($event.items)"
                    >
                        <ng-template #sourceHeader><span class="font-semibold">Ramais Disponíveis</span></ng-template>
                        <ng-template #targetHeader><span class="font-semibold">Ramais Selecionados</span></ng-template>
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

                @if (loadError) {
                    <small class="text-red-500"> Erro ao carregar os dados </small>
                }
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
    mohs: Moh[] = [];
    loadError = false;
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
        private readonly peerService: PeerService,
        private readonly mohService: MohService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            callGroupStrategyEnum: [CallGroupStrategyEnum.ALL, [Validators.required]],
            timeout: [30, [Validators.required]],
            groupTimeout: [60, [Validators.required]],
            callGroupSoundId: [null]
        });
        this.mohService
            .findAll()
            .then((mohs) => (this.mohs = mohs))
            .catch(() => (this.loadError = true));

        const id = this.activatedRoute.snapshot.paramMap.get('id')!;
        this.groupId = +id;

        Promise.all([this.callGroupService.findById(id), this.peerService.findAll()])
            .then(([group, peers]) => {
                this.form.patchValue({
                    name: group.name,
                    callGroupStrategyEnum: group.callGroupStrategyEnum,
                    timeout: group.timeout,
                    groupTimeout: group.groupTimeout,
                    callGroupSoundId: group.callGroupSoundId
                });
                this.selectedPeers = group.peerIds.map((id) => peers.find((p) => p.id === id)!);
                this.availablePeers = peers.filter((p) => !group.peerIds.includes(p.id)).sort(byName);
            })
            .catch(() => (this.loadError = true));
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

    // O PickList não atualiza a lista filtrada sozinho; ver transferPickListItems.
    moveToSelected(items: Peer[]): void {
        [this.availablePeers, this.selectedPeers] = transferPickListItems(
            items,
            this.availablePeers,
            this.selectedPeers
        );
    }

    moveToAvailable(items: Peer[]): void {
        [this.selectedPeers, this.availablePeers] = transferPickListItems(
            items,
            this.selectedPeers,
            this.availablePeers
        );
    }
}
