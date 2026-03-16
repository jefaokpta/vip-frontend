import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Panel } from 'primeng/panel';
import { NgIf } from '@angular/common';
import { Select } from 'primeng/select';
import { MohService } from '@/pabx/moh/moh.service';

@Component({
    selector: 'app-playback-action-component',
    standalone: true,
    imports: [ReactiveFormsModule, FormsModule, Panel, NgIf, Select],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => PlaybackActionComponent),
            multi: true
        }
    ],
    template: `
        <p-panel header="Reproduzir Audio" [toggleable]="true" toggler="header" collapsed>
            <div class="flex flex-col gap-4">
                <div class="field mb-4">
                    <label for="audio" class="block mb-2">Audio *</label>
                    <p-select
                        id="audio"
                        [options]="playbackOptions"
                        [(ngModel)]="value"
                        (ngModelChange)="onValueChange($event)"
                        filter="true"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione um audio"
                        appendTo="body"
                    ></p-select>
                    <small *ngIf="showError" class="p-error block mt-2"> Audio é obrigatório. </small>
                </div>
            </div>
        </p-panel>
    `
})
export class PlaybackActionComponent implements ControlValueAccessor, OnInit {
    constructor(private readonly mohService: MohService) {}

    ngOnInit(): void {
        this.mohService.findAll().then((mohs) => {
            this.playbackOptions = mohs.map((moh) => ({ label: moh.name, value: moh.id.toString() }));
        });
    }

    @Input() showError = false;
    value: string = '';

    private onChange: (value: string) => void = () => {};

    private onTouched: () => void = () => {};
    protected playbackOptions: { label: string; value: string }[] = [];

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
