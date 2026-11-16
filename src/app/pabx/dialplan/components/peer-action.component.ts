import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { PeerSelectComponent } from '@/pabx/dialplan/components/peer-select-component';
import { InputText } from 'primeng/inputtext';
import { DEFAULT_DIAL_PEER_TIMEOUT } from '@/pabx/utils';

@Component({
    selector: 'app-peer-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, PeerSelectComponent, InputText],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PeerActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Chamar Ramal" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <app-peer-select-component
                    [(ngModel)]="value"
                    (ngModelChange)="onValueChange($event)"
                    [isShowLabel]="false"
                    [showError]="showError"
                    [isOnDialplanAction]="true"
                />
                <div class="field">
                    <label for="flags" class="block">Flags de controle</label>
                    <input
                        id="flags"
                        pInputText
                        class="p-inputtext"
                        [(ngModel)]="flags"
                        (ngModelChange)="onFlagsChange($event)"
                    />
                </div>
                <div class="field">
                    <label for="timeout" class="block">Tempo de toque (segundos)</label>
                    <input
                        id="timeout"
                        pInputText
                        type="number"
                        min="5"
                        max="300"
                        class="p-inputtext"
                        [ngModel]="timeout"
                        (ngModelChange)="onTimeoutChange($event)"
                    />
                </div>
            </div>
        </p-panel>
    `
})
export class PeerActionComponent implements ControlValueAccessor {
    @Input() showError = false;
    @Input() flags: string = '';
    @Output() flagsChange = new EventEmitter<string>();
    @Input() timeout: string = DEFAULT_DIAL_PEER_TIMEOUT;
    @Output() timeoutChange = new EventEmitter<string>();
    value: string = '';

    constructor() {}

    private onChange: (value: string) => void = () => {};

    private onTouched: () => void = () => {};

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

    onFlagsChange(flags: string): void {
        this.flags = flags;
        this.flagsChange.emit(flags);
    }

    onTimeoutChange(timeout: number | string | null): void {
        this.timeout = timeout == null ? '' : String(timeout);
        this.timeoutChange.emit(this.timeout);
    }
}
