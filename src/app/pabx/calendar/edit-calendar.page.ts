import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Calendar, CalendarTypeEnum, WeekDayEnum } from '@/pabx/types';
import { CalendarService } from '@/pabx/calendar/calendar.service';

@Component({
    selector: 'app-edit-calendar-page',
    standalone: true,
    imports: [InputTextModule, ButtonModule, CardModule, NgIf, ReactiveFormsModule, RouterLink, Select, DatePicker],
    template: `
        <p-card>
            <ng-template #title>
                <div class="flex justify-between">
                    <span class="font-semibold text-2xl">Editar Calendário</span>
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
                    <label for="calendarType" class="block mb-2">Tipo *</label>
                    <p-select
                        id="calendarType"
                        formControlName="calendarType"
                        [options]="calendarTypes"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Selecione o tipo"
                    ></p-select>
                </div>

                <div
                    *ngIf="form.get('calendarType')?.value === 'BY_DATE'"
                    class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                >
                    <div class="field">
                        <label for="startDate" class="block mb-2">Data Início *</label>
                        <p-datepicker
                            id="startDate"
                            formControlName="startDate"
                            dateFormat="dd/mm/yy"
                            [showIcon]="true"
                            appendTo="body"
                        ></p-datepicker>
                    </div>
                    <div class="field">
                        <label for="endDate" class="block mb-2">Data Fim</label>
                        <p-datepicker
                            id="endDate"
                            formControlName="endDate"
                            dateFormat="dd/mm/yy"
                            [showIcon]="true"
                            appendTo="body"
                        ></p-datepicker>
                    </div>
                </div>

                <div
                    *ngIf="form.get('calendarType')?.value === 'BY_WEEKDAY'"
                    class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"
                >
                    <div class="field">
                        <label for="startWeekDay" class="block mb-2">Dia da Semana Início *</label>
                        <p-select
                            id="startWeekDay"
                            formControlName="startWeekDay"
                            [options]="weekDays"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecione o dia"
                        ></p-select>
                    </div>
                    <div class="field">
                        <label for="endWeekDay" class="block mb-2">Dia da Semana Fim</label>
                        <p-select
                            id="endWeekDay"
                            formControlName="endWeekDay"
                            [options]="weekDays"
                            optionLabel="label"
                            optionValue="value"
                            placeholder="Selecione o dia"
                        ></p-select>
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
                            appendTo="body"
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
                            appendTo="body"
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
export class EditCalendarPage implements OnInit {
    form!: FormGroup;
    pending = false;
    showError = false;
    private calendar: Calendar | undefined;

    calendarTypes = [
        { label: 'Por Data', value: CalendarTypeEnum.BY_DATE },
        { label: 'Por Dia da Semana', value: CalendarTypeEnum.BY_WEEKDAY }
    ];

    weekDays = [
        { label: 'Domingo', value: WeekDayEnum.SUNDAY },
        { label: 'Segunda-feira', value: WeekDayEnum.MONDAY },
        { label: 'Terça-feira', value: WeekDayEnum.TUESDAY },
        { label: 'Quarta-feira', value: WeekDayEnum.WEDNESDAY },
        { label: 'Quinta-feira', value: WeekDayEnum.THURSDAY },
        { label: 'Sexta-feira', value: WeekDayEnum.FRIDAY },
        { label: 'Sábado', value: WeekDayEnum.SATURDAY }
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly router: Router,
        private readonly calendarService: CalendarService,
        private readonly activatedRoute: ActivatedRoute
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            name: ['', [Validators.required]],
            calendarType: [CalendarTypeEnum.BY_DATE, [Validators.required]],
            startDate: [null],
            endDate: [null],
            startWeekDay: [null],
            endWeekDay: [null],
            startTime: [null, [Validators.required]],
            endTime: [null, [Validators.required]]
        });

        this.calendarService
            .findById(this.activatedRoute.snapshot.params['id'])
            .then((calendar) => {
                this.calendar = calendar;
                this.form.patchValue({
                    name: calendar.name,
                    calendarType: calendar.calendarType,
                    startDate: calendar.startDate ? new Date(calendar.startDate + 'T00:00:00') : null,
                    endDate: calendar.endDate ? new Date(calendar.endDate + 'T00:00:00') : null,
                    startWeekDay: calendar.startWeekDay || null,
                    endWeekDay: calendar.endWeekDay || null,
                    startTime: this.parseTime(calendar.startTime),
                    endTime: this.parseTime(calendar.endTime)
                });
            })
            .catch(() => {
                this.router.navigate(['/pabx/calendars']);
            });
    }

    private parseTime(time: string): Date {
        const [hours, minutes] = time.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
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
        const calendar = {
            ...this.calendar!,
            name: formValue.name,
            calendarType: formValue.calendarType,
            startDate: formValue.startDate ? this.formatDate(formValue.startDate) : undefined,
            endDate: formValue.endDate ? this.formatDate(formValue.endDate) : undefined,
            startWeekDay: formValue.calendarType === CalendarTypeEnum.BY_WEEKDAY ? formValue.startWeekDay : undefined,
            endWeekDay: formValue.calendarType === CalendarTypeEnum.BY_WEEKDAY ? formValue.endWeekDay : undefined,
            startTime: this.formatTime(formValue.startTime),
            endTime: this.formatTime(formValue.endTime)
        };
        this.calendarService
            .update(calendar as any)
            .then(() => this.router.navigate(['/pabx/calendars']))
            .catch(() => {
                this.showError = true;
            })
            .finally(() => (this.pending = false));
    }
}
