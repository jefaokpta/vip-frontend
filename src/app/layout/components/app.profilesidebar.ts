import { Component, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { BadgeModule } from 'primeng/badge';
import { LayoutService } from '@/layout/service/layout.service';
import { RouterLink } from '@angular/router';
import { UserService } from '@/pages/users/user.service';

@Component({
    selector: '[app-profilesidebar]',
    imports: [ButtonModule, DrawerModule, BadgeModule, RouterLink],
    template: `
        <p-drawer
            [visible]="visible()"
            (onHide)="onDrawerHide()"
            position="right"
            [transitionOptions]="'.3s cubic-bezier(0, 0, 0.2, 1)'"
            styleClass="layout-profile-sidebar w-full sm:w-25rem"
        >
            <div class="flex flex-col mx-auto md:mx-0">
                <span class="mb-2 text-2xl text-center font-semibold">{{ user().name }}</span>

                <ul class="list-none m-0 p-0">
                    <li>
                        <a
                            class="cursor-pointer flex mb-4 p-4 items-center border border-surface-200 dark:border-surface-700 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150"
                            routerLink="/pages/profile"
                        >
                            <span>
                                <i class="pi pi-user text-xl text-primary"></i>
                            </span>
                            <div class="ml-4">
                                <span class="mb-2 font-semibold">Perfil</span>
                                <p class="text-surface-500 dark:text-surface-400 m-0">Configurações Pessoais</p>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a
                            (click)="openWhatsApp()"
                            class="cursor-pointer flex mb-4 p-4 items-center border border-surface-200 dark:border-surface-700 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150"
                        >
                            <span>
                                <i class="pi pi-whatsapp text-xl text-primary"></i>
                            </span>
                            <div class="ml-4">
                                <span class="mb-2 font-semibold">Suporte</span>
                                <p class="text-surface-500 dark:text-surface-400 m-0">Ajuda, Sugestões</p>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a
                            (click)="logout()"
                            class="cursor-pointer flex mb-4 p-4 items-center border border-surface-200 dark:border-surface-700 rounded hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150"
                        >
                            <span>
                                <i class="pi pi-power-off text-xl text-primary"></i>
                            </span>
                            <div class="ml-4">
                                <span class="mb-2 font-semibold">Sair</span>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </p-drawer>
    `
})
export class AppProfileSidebar {
    constructor(
        public layoutService: LayoutService,
        private readonly userService: UserService
    ) {}

    visible = computed(() => this.layoutService.layoutState().profileSidebarVisible);
    get user() {
        return this.userService.getUserSignal();
    }

    onDrawerHide() {
        this.layoutService.layoutState.update((state) => ({
            ...state,
            profileSidebarVisible: false
        }));
    }

    logout() {
        this.userService.logout();
    }

    openWhatsApp() {
        window.open('https://wa.me/551154201020', '_blank');
    }
}
