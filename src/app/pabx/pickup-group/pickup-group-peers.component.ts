import {Component, Input, OnInit} from '@angular/core';
import {PickList} from 'primeng/picklist';
import {PrimeTemplate} from 'primeng/api';
import {PeerService} from '@/pabx/peer/peer.service';
import {PickupGroupService} from '@/pabx/pickup-group/pickup-group.service';
import {Peer} from '@/pabx/types/peer';
import {transferPickListItems} from '@/util/utils';

interface PeerOption {
    readonly id: number;
    readonly name: string;
    readonly peer: string;
    readonly groupName?: string;
}

/** Picklist de ramais do grupo de captura; ramais de outro grupo mostram o nome do grupo atual. */
@Component({
    selector: 'app-pickup-group-peers',
    standalone: true,
    imports: [PickList, PrimeTemplate],
    template: `
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
                filterBy="name,peer,groupName"
                sourceFilterPlaceholder="Pesquisar"
                targetFilterPlaceholder="Pesquisar"
                breakpoint="1200px"
                (onMoveToTarget)="moveToSelected($event.items)"
                (onMoveToSource)="moveToAvailable($event.items)"
                (onMoveAllToTarget)="moveToSelected($event.items)"
                (onMoveAllToSource)="moveToAvailable($event.items)"
            >
                <ng-template let-peer pTemplate="item">
                    <div class="flex items-center gap-2">
                        <i class="pi pi-phone"></i>
                        <span>{{ peer.name }} ({{ peer.peer }})</span>
                        @if (peer.groupName) {
                            <span class="text-sm text-muted-color">— {{ peer.groupName }}</span>
                        }
                    </div>
                </ng-template>
            </p-picklist>
        </div>
    `
})
export class PickupGroupPeersComponent implements OnInit {
    @Input() groupId?: number;
    availablePeers: PeerOption[] = [];
    selectedPeers: PeerOption[] = [];

    constructor(
        private readonly peerService: PeerService,
        private readonly pickupGroupService: PickupGroupService
    ) {
    }

    ngOnInit(): void {
        Promise.all([this.peerService.findAll(), this.pickupGroupService.findAll()]).then(([peers, groups]) => {
            const groupNames = new Map(groups.map((g) => [String(g.id), g.name]));
            const ownGroup = this.groupId === undefined ? undefined : String(this.groupId);
            const sorted = [...peers].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', {numeric: true, sensitivity: 'base'}));
            this.selectedPeers = sorted
                .filter((p) => ownGroup && p.pickUpGroup === ownGroup)
                .map((p) => this.toOption(p));
            this.availablePeers = sorted
                .filter((p) => !ownGroup || p.pickUpGroup !== ownGroup)
                .map((p) => this.toOption(p, p.pickUpGroup ? groupNames.get(p.pickUpGroup) : undefined));
        });
    }

    // O PickList não atualiza a lista filtrada sozinho; ver transferPickListItems.
    moveToSelected(items: PeerOption[]): void {
        [this.availablePeers, this.selectedPeers] = transferPickListItems(items, this.availablePeers, this.selectedPeers);
    }

    moveToAvailable(items: PeerOption[]): void {
        [this.selectedPeers, this.availablePeers] = transferPickListItems(items, this.selectedPeers, this.availablePeers);
    }

    selectedPeerIds(): number[] {
        return this.selectedPeers.map((p) => p.id);
    }

    private toOption(peer: Peer, groupName?: string): PeerOption {
        return {id: peer.id, name: peer.name, peer: peer.peer, groupName};
    }
}
