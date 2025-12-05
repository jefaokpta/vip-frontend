import {Component, EventEmitter, forwardRef, Input, Output} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Panel} from "primeng/panel";
import {PeerSelectComponent} from "@/pabx/dialplan/components/peer-select-component";
import {InputText} from "primeng/inputtext";
import {Message} from "primeng/message";

@Component({
    selector: 'app-peer-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, PeerSelectComponent, InputText, Message],
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
                <app-peer-select-component [(ngModel)]="value" (ngModelChange)="onValueChange($event)"
                                           [isShowLabel]="false" [showError]="showError"/>
                <div class="field">
                    <label for="flags" class="block">Flags</label>
                    <input id="flags" pInputText class="p-inputtext" [(ngModel)]="flags"
                           (ngModelChange)="onFlagsChange($event)"/>
                </div>
                <p-message severity="info">Envia chamada para o ramal selecionado</p-message>
            </div>

        </p-panel>
    `
})
export class PeerActionComponent implements ControlValueAccessor {
    @Input() showError = false;
    @Output() flagsChange = new EventEmitter<string>();
    value: string = '';
    flags: string = '';

    constructor() {
    }

    private onChange: (value: string) => void = () => {
    };

    private onTouched: () => void = () => {
    };

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
}
