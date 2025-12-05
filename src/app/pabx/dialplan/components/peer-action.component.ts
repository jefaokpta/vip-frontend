import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Panel} from "primeng/panel";
import {PeerSelectComponent} from "@/pabx/dialplan/components/peer-select-component";

@Component({
    selector: 'app-peer-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, PeerSelectComponent],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PeerActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Chamar Ramal" [toggleable]="true" toggler="header" collapsed>
            <app-peer-select-component formControlName="value"/>
        </p-panel>
    `
})
export class PeerActionComponent implements ControlValueAccessor {
    @Input() showError = false;
    value: string = '';

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
}
