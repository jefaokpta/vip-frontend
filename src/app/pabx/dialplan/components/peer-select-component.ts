// peer-select.component.ts
import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {NgIf} from '@angular/common';
import {PeerService} from '@/pabx/peer/peer.service';
import {PeerTransportEnum} from '@/pabx/types/peer-transport-enum';

@Component({
    selector: 'app-peer-select-component',
    standalone: true,
    imports: [Select, NgIf, ReactiveFormsModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PeerSelectComponent),
            multi: true
        }
    ],
    template: `
        <div class="field">
            <label *ngIf="isShowLabel" for="peer" class="block mb-2">Ramal *</label>
            <p-select
                id="peer"
                [options]="peerOptions"
                [(ngModel)]="value"
                (ngModelChange)="onValueChange($event)"
                [filter]="true"
                filterBy="label"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione um ramal"
                appendTo="body"
            ></p-select>
            <small *ngIf="loadError" class="p-error block mt-2"> Erro ao carregar ramais. Tente novamente mais tarde. </small>
            <small *ngIf="showError" class="p-error block mt-2"> Ramal é obrigatório. </small>
        </div>
    `
})
export class PeerSelectComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    @Input() isShowLabel = true;
    @Input() isOnlyWSS = false;
    @Input() isShowAnyPeerLabel = false;
    @Input() isOnDialplanAction = false;
    @Input() isOnlyAvailable = false;

    value: string = '';
    peerOptions: { label: string; value: string }[] = [];
    loadError = false;

    constructor(private readonly peerService: PeerService) {}

    private onChange: (value: string) => void = () => {};
    private onTouched: () => void = () => {};

    ngOnInit() {
        const peers$ = this.isOnlyAvailable ? this.peerService.findAvailable() : this.peerService.findAll();
        peers$.then((unsorted) => {
            const peers = [...unsorted].sort((a, b) =>
                a.peer.localeCompare(b.peer, 'pt-BR', { numeric: true, sensitivity: 'base' })
            );
            this.peerOptions = peers.map((peer) => ({ label: `${peer.peer} (${peer.name})`, value: peer.peer }));
            if (this.isShowAnyPeerLabel) this.peerOptions.unshift({ label: 'TODOS', value: 'ANY' });
            if (this.isOnlyWSS) {
                this.peerOptions = peers
                    .filter((peer) => peer.peerTransportEnums.includes(PeerTransportEnum.WSS))
                    .map((peer) => ({ label: `${peer.peer} (${peer.name})`, value: peer.peer }));
            }
            if (this.isOnDialplanAction) this.peerOptions.unshift({ label: 'DESTINO', value: 'DST' });
        }).catch(() => (this.loadError = true));
    }

    writeValue(value: string): void {
        this.value = value;
    }

    registerOnChange(fn: (value: string) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onValueChange(value: string): void {
        this.value = value;
        this.onChange(value);
        this.onTouched();
    }
}
