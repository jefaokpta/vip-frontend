// agent-select.component.ts
import {Component, forwardRef, Input, OnInit} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule} from '@angular/forms';
import {Select} from 'primeng/select';
import {NgIf} from '@angular/common';

@Component({
    selector: 'app-agent-select-component',
    standalone: true,
    imports: [Select, NgIf, ReactiveFormsModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AgentSelectComponent),
            multi: true
        }
    ],
    template: `
        <div class="field mb-4">
            <label for="agent" class="block mb-2">Agente *</label>
            <p-select
                id="agent"
                [options]="agentOptions"
                [(ngModel)]="value"
                (ngModelChange)="onValueChange($event)"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione um agente"
                appendTo="body"
            ></p-select>
            <small *ngIf="showError" class="p-error block mt-2">
                Agente é obrigatório.
            </small>
        </div>
    `
})
export class AgentSelectComponent implements ControlValueAccessor, OnInit {
    @Input() showError = false;

    value: string = '';
    agentOptions: { label: string; value: string }[] = [];

    private onChange: (value: string) => void = () => {
    };
    private onTouched: () => void = () => {
    };

    ngOnInit() {
        // Carregue as opções de agentes do seu serviço aqui
        this.agentOptions = [
            {label: 'Agente 1', value: '1'},
            {label: 'Agente 2', value: '2'}
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
