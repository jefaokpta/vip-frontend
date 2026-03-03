import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgForOf, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import { SelectButton } from 'primeng/selectbutton';
import { Calendar, CalendarTypeEnum } from '@/pabx/types';
import { CalendarService } from '@/pabx/calendar/calendar.service';
import { calendarTypeOptions, calendarWeekDays } from '@/pabx/calendar/utils';
import { RadioButton } from 'primeng/radiobutton';

@Component({
    selector: 'app-new-calendar-page',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        NgIf,
        ReactiveFormsModule,
        RouterLink,
        DatePicker,
        SelectButton,
        NgForOf,
        RadioButton
    ],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Novo Calendário</span>
                    <p-button
                        type="button"
                        label="Voltar"
                        icon="pi pi-arrow-left"
                        routerLink="/pabx/calendars"
                        outlined
                        severity="secondary"
                    ></p-button>
                </div>
            </ng-template>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-fluid">
                <div class="field mb-4">
                    <label for="name" class="block mb-2">Nome *</label>
                    <input id="name" pInputText class="p-inputtext" formControlName="name" />
                    <small
                        *ngIf="form.get('name')?.invalid && (form.get('name')?.dirty || form.get('name')?.touched)"
                        class="p-error block mt-2"
                    >
                        Nome é obrigatório.
                    </small>
                </div>

                <div class="field mb-4">
                    <label for="calendarTypeEnum" class="block mb-2">Tipo de Agendamento *</label>
                    <div class="flex gap-4">
                        <div *ngFor="let type of calendarTypes" class="field-checkbox">
                            <p-radiobutton
                                [inputId]="type.label"
                                [value]="type.value"
                                formControlName="calendarTypeEnum"
                                (onClick)="onCalendarTypeChange()"
                            >
                            </p-radiobutton>
                            <label [for]="type.label" class="ml-2">{{ type.label }}</label>
                        </div>
                    </div>
                </div>

                <div
                    *ngIf="form.get('calendarTypeEnum')?.value === CalendarTypeEnum.DATES"
                    class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                >
                    <div class="field">
                        <label for="rangeDates" class="block mb-2">Datas *</label>
                        <p-datepicker
                            id="rangeDates"
                            formControlName="rangeDates"
                            selectionMode="range"
                            [readonlyInput]="true"
                            dateFormat="dd/mm/yy"
                            [showIcon]="true"
                        ></p-datepicker>
                        <small
                            *ngIf="
                                form.get('rangeDates')?.invalid &&
                                (form.get('rangeDates')?.dirty || form.get('rangeDates')?.touched)
                            "
                            class="p-error block mt-2"
                        >
                            Deve ter ao menos 1 data selecionada.
                        </small>
                    </div>
                </div>

                <div *ngIf="form.get('calendarTypeEnum')?.value === CalendarTypeEnum.WEEKDAYS" class="mb-4">
                    <div class="field mb-4">
                        <label for="weekDays" class="block mb-2">Dias da Semana *</label>
                        <p-select-button
                            id="weekDays"
                            [options]="calendarWeekDays"
                            formControlName="weekDays"
                            [multiple]="true"
                            optionLabel="label"
                            optionValue="value"
                        />
                    </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div class="field">
                        <label for="startTime" class="block mb-2">Hora Início *</label>
                        <p-datepicker
                            id="startTime"
                            formControlName="startTime"
                            [timeOnly]="true"
                            [showTime]="true"
                            [showIcon]="true"
                        ></p-datepicker>
                    </div>
                    <div class="field">
                        <label for="endTime" class="block mb-2">Hora Fim *</label>
                        <p-datepicker
                            id="endTime"
                            formControlName="endTime"
                            [timeOnly]="true"
                            [showTime]="true"
                            [showIcon]="true"
                        ></p-datepicker>
                    </div>
                </div>

                <div class="flex mt-4">
                    <p-button type="submit" label="Salvar" [disabled]="form.invalid || pending">
                        <i *ngIf="pending" class="pi pi-spin pi-spinner"></i>
                        <i *ngIf="!pending" class="pi pi-save"></i>
                    </p-button>
                </div>

                <small *ngIf="showError" class="text-red-500"> Erro ao salvar o calendário </small>
            </form>
        </p-card>
    `
})
export class NewCalendarPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;

    calendarTypes = calendarTypeOptions;

    calendarWeekDays = calendarWeekDays;

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly calendarService: CalendarService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            calendarTypeEnum: [CalendarTypeEnum.WEEKDAYS, [Validators.required]],
            weekDays: [[], [Validators.required, Validators.minLength(1)]],
            startTime: [new Date(new Date().setHours(0, 0, 0, 0)), [Validators.required]],
            endTime: [new Date(new Date().setHours(23, 59, 59, 0)), [Validators.required]]
        });
    }

    private formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    onSubmit() {
        this.pending = true;
        this.showError = false;
        const formValue = this.form.value;
        const calendar: Calendar = {
            companyId: '',
            id: 0,
            name: formValue.name,
            calendarTypeEnum: formValue.calendarTypeEnum,
            rangeDates: this.validateRangeDates(formValue.rangeDates),
            weekDays: formValue.weekDays,
            startTime: this.formatTime(formValue.startTime),
            endTime: this.formatTime(formValue.endTime)
        };
        this.calendarService
            .create(calendar)
            .then(() => this.router.navigate(['/pabx/calendars']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }

    private validateRangeDates(rangeDates: Date[]) {
        if (rangeDates && rangeDates[1] == null) {
            rangeDates[1] = rangeDates[0];
        }
        return rangeDates;
    }

    get rangeDates() {
        return this.form.get('rangeDates')!;
    }
    get weekDays() {
        return this.form.get('weekDays')!;
    }
    get calendarTypeEnum() {
        return this.form.get('calendarTypeEnum')!;
    }

    protected readonly CalendarTypeEnum = CalendarTypeEnum;

    protected onCalendarTypeChange() {
        if (this.calendarTypeEnum.value === CalendarTypeEnum.DATES) {
            this.form.removeControl('weekDays');
            this.form.addControl('rangeDates', this.fb.control([], [Validators.required, Validators.minLength(1)]));
        } else {
            this.form.removeControl('rangeDates');
            this.form.addControl('weekDays', this.fb.control([], [Validators.required, Validators.minLength(1)]));
        }
    }
}
