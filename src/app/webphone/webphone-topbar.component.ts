/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 * @create 5/5/25
 */
import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { WebphoneService } from '@/webphone/webphone.service';
import { LayoutService } from '@/layout/service/layout.service';
import { NgClass, NgIf } from '@angular/common';
import { ButtonGroup } from 'primeng/buttongroup';
import { PhoneStateEnum } from '@/types/types';
import { handleCalleId } from '@/webphone/utils';
import { telephoneFormat } from '@/util/utils';

@Component({
    selector: 'app-webphone-topbar',
    standalone: true,
    imports: [Button, NgIf, ButtonGroup, NgClass],
    template: `
        <div class="flex gap-2">
            <p-button-group *ngIf="phoneStatus().state === PhoneStateEnum.INCOMING_CALL">
                <p-button label="Atender" (click)="answer()" severity="success" icon="pi pi-check" />
                <p-button label="Cancelar" (click)="hangup()" severity="danger" icon="pi pi-times" />
            </p-button-group>
            <p-button outlined severity="secondary" (click)="onWebphoneButtonClick()">
                <i class="pi pi-phone"></i>
                <ng-container *ngIf="phoneStatus().session; else noSession">
                    <span class="ml-2">{{ telephoneFormat(handleCalleId(phoneStatus().session?.remote_identity?.uri?.user)) }}</span>
                    <span>{{ timer }}</span>
                    <i class="pi pi-circle-fill text-yellow-400"></i>
                </ng-container>
                <ng-template #noSession>
                    <span class="ml-2">{{ phoneStatus().state }}</span>
                    <i
                        class="pi pi-circle-fill"
                        [ngClass]="{
                            'text-green-400': phoneStatus().state !== PhoneStateEnum.REGISTRATION_FAILED,
                            'text-red-400': phoneStatus().state === PhoneStateEnum.REGISTRATION_FAILED
                        }"
                    ></i>
                </ng-template>
            </p-button>
        </div>
    `
})
export class WebphoneTopbarComponent {
    constructor(
        readonly webphoneService: WebphoneService,
        private readonly layoutService: LayoutService
    ) {}

    get phoneStatus() {
        return this.webphoneService.phoneState$;
    }

    get timer() {
        return this.webphoneService.callTimeFormated();
    }

    hangup() {
        this.webphoneService.hangup();
    }

    answer() {
        this.webphoneService.answerCall();
    }

    onWebphoneButtonClick() {
        this.layoutService.showWebphoneSidebar();
    }

    protected readonly PhoneStateEnum = PhoneStateEnum;
    protected readonly handleCalleId = handleCalleId;
    protected readonly telephoneFormat = telephoneFormat;
}
