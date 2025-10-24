import {Component, ElementRef, ViewChild} from '@angular/core';
import {AppMenu} from './app.menu';
import {LayoutService} from '@/layout/service/layout.service';
import {RouterModule} from '@angular/router';
import {Image} from 'primeng/image';
import {NgIf} from '@angular/common';

@Component({
    selector: '[app-sidebar]',
    standalone: true,
    imports: [AppMenu, RouterModule, Image, NgIf],
    template: ` <div class="layout-sidebar" (mouseenter)="onMouseEnter()" (mouseleave)="onMouseLeave()">
        <div class="sidebar-header">
            <ng-container *ngIf="layoutService.isDarkTheme(); else lightTheme">
                <a [routerLink]="['/']" class="app-logo">
                    <p-image src="layout/images/vip-white.png" alt="logo Vip" width="190rem"></p-image>
                </a>
            </ng-container>
            <ng-template #lightTheme>
                <a [routerLink]="['/']" class="app-logo">
                    <p-image src="layout/images/vip-black.png" alt="logo Vip" width="190rem"></p-image>
                </a>
            </ng-template>
        </div>

        <div #menuContainer class="layout-menu-container">
            <app-menu></app-menu>
        </div>
    </div>`
})
export class AppSidebar {
    timeout: any = null;

    @ViewChild('menuContainer') menuContainer!: ElementRef;
    constructor(
        public layoutService: LayoutService,
        public el: ElementRef
    ) {}

    onMouseEnter() {
        if (!this.layoutService.layoutState().anchored) {
            if (this.timeout) {
                clearTimeout(this.timeout);
                this.timeout = null;
            }

            this.layoutService.layoutState.update((state) => {
                if (!state.sidebarActive) {
                    return {
                        ...state,
                        sidebarActive: true
                    };
                }
                return state;
            });
        }
    }

    onMouseLeave() {
        if (!this.layoutService.layoutState().anchored) {
            if (!this.timeout) {
                this.timeout = setTimeout(() => {
                    this.layoutService.layoutState.update((state) => {
                        if (state.sidebarActive) {
                            return {
                                ...state,
                                sidebarActive: false
                            };
                        }
                        return state;
                    });
                }, 300);
            }
        }
    }

    anchor() {
        this.layoutService.layoutState.update((state) => ({
            ...state,
            anchored: !state.anchored
        }));
    }
}
