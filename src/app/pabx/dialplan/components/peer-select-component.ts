// peer-select.component.ts
import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {NgIf} from '@angular/common';

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
            <small *ngIf="showError" class="p-error block mt-2">
                Ramal é obrigatório.
            </small>
        </div>
    `
})
export class PeerSelectComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;
    @Input() isShowLabel = true;

    value: string = '';
    peerOptions: { label: string; value: string }[] = [];

    private onChange: (value: string) => void = () => {
    };
    private onTouched: () => void = () => {
    };

    ngOnInit() {
        // Carregue as opções de ramais do seu serviço aqui
        this.peerOptions = [
            {label: 'Ramal 1929', value: '1929'},
            {label: 'Ramal 1928', value: '1928'},
            {label: 'Ramal 1927', value: '1927'},
            {label: 'Ramal 1926', value: '1926'},
            {label: 'Ramal 1925', value: '1925'},
            {label: 'Ramal 1924', value: '1924'},
            {label: 'Ramal 1923', value: '1923'},
        ];
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
