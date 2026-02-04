import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '@/layout/service/layout.service';
import { AppBreadcrumb } from './app.breadcrumb';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { Avatar } from 'primeng/avatar';
import { WebphoneTopbarComponent } from '@/webphone/webphone-topbar.component';
import { UserService } from '@/pages/users/user.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: '[app-topbar]',
    standalone: true,
    imports: [
        RouterModule,
        CommonModule,
        StyleClassModule,
        AppBreadcrumb,
        InputTextModule,
        ButtonModule,
        IconFieldModule,
        InputIconModule,
        Avatar,
        WebphoneTopbarComponent,
        FormsModule,
        ReactiveFormsModule
    ],
    template: `<div class="layout-topbar">
        <div class="topbar-start">
            <button #menubutton type="button" class="topbar-menubutton p-link p-trigger" (click)="onMenuButtonClick()">
                <i class="pi pi-bars"></i>
            </button>
            <nav app-breadcrumb class="topbar-breadcrumb"></nav>
        </div>

        <p-button
            *ngIf="user().isExpired"
            (onClick)="openWhatsApp()"
            severity="danger"
            label="Seu periodo de avaliação terminou, fale conosco"
            icon="pi pi-whatsapp"
        />

        <div class="topbar-end">
            <ul class="topbar-menu">
                <li *ngIf="user().managingCompany">
                    <p-button severity="warn" (click)="exitManagingCompany()">
                        <i class="pi pi-sign-out"></i>
                        {{ user().managingCompany!.name }}
                    </p-button>
                </li>
                <li class="ml-3">
                    @if (isWebphoneActivated) {
                        <app-webphone-topbar />
                    } @else {
                        <p-button severity="secondary" outlined (onClick)="isPeerFormDialogVisible = true">
                            <i class="pi pi-phone"></i>
                            <span class="ml-2">Ativar Ramal</span>
                            <i class="pi pi-circle-fill text-red-400"></i>
                        </p-button>
                    }
                </li>
                <li class="ml-3">
                    <p-button
                        [icon]="layoutService.isDarkTheme() ? 'pi pi-sun' : 'pi pi-moon'"
                        rounded
                        outlined
                        (click)="executeDarkModeToggle()"
                    ></p-button>
                </li>
                <li class="topbar-profile">
                    <p-avatar
                        [label]="user().name.at(0)"
                        styleClass="mr-2 cursor-pointer"
                        size="large"
                        shape="circle"
                        (click)="onProfileButtonClick()"
                    />
                </li>
            </ul>
        </div>
    </div> `
})
export class AppTopbar implements OnInit {
    @ViewChild('menubutton')
    menuButton!: ElementRef;
    isWebphoneActivated = false;
    isPeerFormDialogVisible = false;

    constructor(
        public layoutService: LayoutService,
        private readonly userService: UserService,
        private readonly router: Router
    ) {}

    ngOnInit(): void {
        const userSettings = this.userService.getUserSettings();
        if (userSettings.darkMode) {
            this.layoutService.layoutConfig.update((state) => ({
                ...state,
                darkTheme: userSettings.darkMode
            }));
        }
        this.userService
            .getWebphoneRegistration()
            .then((registration) => (this.isWebphoneActivated = registration.peer !== null));
    }

    get user() {
        return this.userService.getUserReactive();
    }

    exitManagingCompany() {
        this.userService.exitManageCompany().then(() => this.router.navigate(['/']));
    }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    onProfileButtonClick() {
        this.layoutService.showProfileSidebar();
    }

    onConfigButtonClick() {
        this.layoutService.showConfigSidebar();
    }

    openWhatsApp() {
        window.open('https://wa.me/551154201020', '_blank');
    }

    executeDarkModeToggle() {
        this.layoutService.layoutConfig.update((state) => ({
            ...state,
            darkTheme: !state.darkTheme
        }));
        this.userService.setUserSettings(this.layoutService.layoutConfig().darkTheme);
    }
}
