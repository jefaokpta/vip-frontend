import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { NgIf } from '@angular/common';
import { MohService } from '@/pabx/moh/moh.service';

@Component({
    selector: 'app-audio-select-component',
    standalone: true,
    imports: [Select, NgIf, ReactiveFormsModule, FormsModule],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AudioSelectComponent),
            multi: true
        }
    ],
    template: `
        <div class="field">
            <label *ngIf="isShowLabel" [for]="inputId" class="block mb-2">{{ label }}{{ required ? ' *' : '' }}</label>
            <p-select
                [id]="inputId"
                [options]="audioOptions"
                [(ngModel)]="value"
                (ngModelChange)="onValueChange($event)"
                [filter]="true"
                filterBy="label"
                optionLabel="label"
                optionValue="value"
                placeholder="Selecione um áudio"
                [showClear]="!required"
                appendTo="body"
            ></p-select>
            <small *ngIf="showError" class="p-error block mt-2">{{ label }} é obrigatório.</small>
            @if (selectedAudioUrl) {
                <audio controls [src]="selectedAudioUrl" style="height: 2rem" class="mt-2"></audio>
            }
        </div>
    `
})
export class AudioSelectComponent implements ControlValueAccessor, OnInit {
    @Input() label = 'Áudio';
    @Input() required = false;
    @Input() showError = false;
    @Input() isShowLabel = true;
    @Input() inputId = 'audio-select';

    value: number | null = null;
    audioOptions: { label: string; value: number; audioUrl?: string }[] = [];

    constructor(private readonly mohService: MohService) {}

    private onChange: (value: number | null) => void = () => {};
    private onTouched: () => void = () => {};

    ngOnInit() {
        this.mohService.findAll().then((mohs) => {
            this.audioOptions = mohs.map((moh) => ({ label: moh.name, value: moh.id, audioUrl: moh.audioUrl }));
        });
    }

    get selectedAudioUrl(): string | undefined {
        return this.audioOptions.find((option) => option.value === this.value)?.audioUrl;
    }

    writeValue(value: number | null): void {
        this.value = value;
    }

    registerOnChange(fn: (value: number | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    onValueChange(value: number | null): void {
        this.value = value;
        this.onChange(value);
        this.onTouched();
    }
}
