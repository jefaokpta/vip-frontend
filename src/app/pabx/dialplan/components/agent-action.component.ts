import {Component, forwardRef, Input} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Panel} from "primeng/panel";
import {AgentSelectComponent} from "@/pabx/dialplan/components/agent-select-component";

@Component({
    selector: 'app-agent-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, AgentSelectComponent],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AgentActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Chamar Agente" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <app-agent-select-component [(ngModel)]="value" (ngModelChange)="onValueChange($event)"
                                            [showError]="showError"/>
            </div>

        </p-panel>
    `
})
export class AgentActionComponent implements ControlValueAccessor {
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
