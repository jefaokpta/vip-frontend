/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 18/08/2025
 */
import { Component, OnInit } from '@angular/core';
import { User } from '@/types/types';
import { HttpClientService } from '@/services/http-client.service';
import { UserService } from '@/services/user.service';
import { environment } from '../../../environments/environment';
import { ButtonDirective } from 'primeng/button';
import { NgIf } from '@angular/common';
import { Tag } from 'primeng/tag';

@Component({
    selector: 'app-google-calendar-component',
    imports: [ButtonDirective, NgIf, Tag],
    template: `
        <div class="flex flex-col items-center">
            <span class="inline-flex items-center justify-center rounded-full w-20 h-20 bg-primary-100 mb-2">
                <i class="pi pi-google text-4xl text-primary-700" style="font-size: 2.5rem"></i>
            </span>
            <div class="text-2xl mb-4 font-medium">Google Calendário</div>
            <small class="text-surface-500 text-center">Para assistentes criarem eventos na sua agenda</small>
            <ng-container *ngIf="isGoogleConnected; else disconnected">
                <p-tag class="mt-2" severity="success" value="Conectado" />
            </ng-container>
            <ng-template #disconnected>
                <p-tag severity="danger" value="Desconectado" />
            </ng-template>
            <a class="mt-2" [href]="googleAuthUrl" pButton>Conectar</a>
        </div>
    `
})
export class GoogleCalendarComponent implements OnInit {
    googleAuthUrl: string;
    isGoogleConnected = false;
    private readonly user: User;

    constructor(
        private readonly httpClientService: HttpClientService,
        private readonly userService: UserService
    ) {
        this.user = this.userService.getUser();
        this.googleAuthUrl = environment.IASMIN_BACKEND_URL + `/google/authenticate/${this.user.controlNumber}`;
    }

    ngOnInit(): void {
        this.httpClientService
            .getGoogleAuthStatus()
            .then(() => (this.isGoogleConnected = true))
            .catch(() => (this.isGoogleConnected = false));
    }
}
