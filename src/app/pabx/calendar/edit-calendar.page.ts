import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { NgIf } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { SelectButton } from 'primeng/selectbutton';
import { Calendar, CalendarTypeEnum, WeekDayEnum } from '@/pabx/types';
import { CalendarService } from '@/pabx/calendar/calendar.service';
import { calendarTypeOptions } from '@/pabx/calendar/utils';

@Component({
    selector: 'app-edit-calendar-page',
    standalone: true,
    imports: [
        InputTextModule,
        ButtonModule,
        CardModule,
        NgIf,
        ReactiveFormsModule,
        RouterLink,
        Select,
        DatePicker,
        SelectButton
    ],
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

                <div *ngIf="form.get('calendarType')?.value === 'BY_WEEKDAY'" class="mb-4">
                    <div class="field mb-4">
                        <label for="startWeekDay" class="block mb-2">Dia da Semana Início *</label>
                        <p-select-button
                            id="startWeekDay"
                            [options]="weekDays"
                            formControlName="startWeekDay"
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

    calendarTypes = calendarTypeOptions;

    weekDays = [
        { label: 'Dom', value: WeekDayEnum.SUNDAY },
        { label: 'Seg', value: WeekDayEnum.MONDAY },
        { label: 'Ter', value: WeekDayEnum.TUESDAY },
        { label: 'Qua', value: WeekDayEnum.WEDNESDAY },
        { label: 'Qui', value: WeekDayEnum.THURSDAY },
        { label: 'Sex', value: WeekDayEnum.FRIDAY },
        { label: 'Sáb', value: WeekDayEnum.SATURDAY }
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
            calendarType: [CalendarTypeEnum.WEEKDAYS, [Validators.required]],
            rangeDates: [[]],
            weekDays: [[]],
            startTime: [null, [Validators.required]],
            endTime: [null, [Validators.required]]
        });

        this.calendarService
            .findById(this.activatedRoute.snapshot.params['id'])
            .then((calendar) => {
                this.calendar = calendar;
                this.form.patchValue({
                    name: calendar.name,
                    calendarType: calendar.calendarTypeEnum,
                    rangeDates: calendar.rangeDates,
                    weekDays: calendar.weekDays || [],
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
        const calendar: Calendar = {
            ...this.calendar!,
            name: formValue.name,
            calendarTypeEnum: formValue.calendarType,
            rangeDates: formValue.rangeDates,
            weekDays: formValue.weekDays,
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
