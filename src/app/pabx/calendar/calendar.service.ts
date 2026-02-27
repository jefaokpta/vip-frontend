import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { executeRequest, httpHeaders } from '@/util/utils';
import { Calendar } from '@/pabx/types';

@Injectable({ providedIn: 'root' })
export class CalendarService {
    private readonly BACKEND = environment.API_BACKEND_URL;

    constructor(private readonly http: HttpClient) {}

    findAll(): Promise<Calendar[]> {
        return executeRequest(this.http.get<Calendar[]>(`${this.BACKEND}/calendars`, httpHeaders()));
    }

    findById(id: number): Promise<Calendar> {
        return executeRequest(this.http.get<Calendar>(`${this.BACKEND}/calendars/${id}`, httpHeaders()));
    }

    create(calendar: Calendar) {
        return executeRequest(this.http.post(`${this.BACKEND}/calendars`, calendar, httpHeaders()));
    }

    update(calendar: Calendar) {
        return executeRequest(this.http.put(`${this.BACKEND}/calendars/${calendar.id}`, calendar, httpHeaders()));
    }

    delete(id: number) {
        return executeRequest(this.http.delete(`${this.BACKEND}/calendars/${id}`, httpHeaders()));
    }
}
