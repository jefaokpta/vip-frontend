import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppMenuitem } from './app.menuitem';
import { UserService } from '@/services/user.service';
import { RoleEnum, User } from '@/types/types';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of filteredModel; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    private readonly model: MenuItem[] = [
        {
            label: 'Analises',
            icon: 'pi pi-home',
            items: [
                {
                    label: 'Analise de Conversas',
                    icon: 'pi pi-fw pi-chart-bar',
                    routerLink: ['/pages/analysis']
                },
                {
                    label: 'Assistentes de IA',
                    icon: 'pi pi-fw pi-microchip-ai',
                    routerLink: ['/pages/assistants']
                },
                {
                    label: 'Assistentes de Voz',
                    roles: ['admin', 'super'],
                    icon: 'fa fa-phone-volume',
                    routerLink: ['/pages/voice/assistants']
                }
            ]
        },
        {
            label: 'Configurações',
            roles: ['admin', 'super'],
            icon: 'pi pi-fw pi-phone',
            items: [
                {
                    label: 'Telefonia',
                    icon: 'pi pi-fw pi-phone',
                    routerLink: ['/pages/attendants']
                },
                {
                    label: 'Diretrizes',
                    icon: 'pi pi-fw pi-book',
                    routerLink: ['/pages/guidelines']
                },
                {
                    label: 'Usuários',
                    icon: 'pi pi-fw pi-users',
                    routerLink: ['/pages/users']
                },
                {
                    label: 'Empresas',
                    roles: ['super'],
                    icon: 'pi pi-fw pi-building',
                    routerLink: ['/pages/companies']
                },
                {
                    label: 'Integrações',
                    roles: ['admin'],
                    icon: 'fa fa-puzzle-piece',
                    routerLink: ['/pages/integrations']
                }
            ]
        }
    ];
    filteredModel: MenuItem[] = [];
    private readonly user: User;

    constructor(private readonly userService: UserService) {
        this.user = this.userService.getUser();
    }

    ngOnInit() {
        this.filteredModel = this.filterModel();
    }

    /**
     * Filtra o modelo de menu com base nas permissões do usuário atual.
     * Realiza filtragem recursiva em todos os níveis de itens do menu.
     */
    private filterModel(): MenuItem[] {
        return this.model.filter((item) => {
            // Se o item não tem permissão, exclui imediatamente
            if (item['roles'] && !this.hasRole(item['roles'])) {
                return false;
            }

            // Processa os itens filhos, se existirem
            if (this.hasSubitems(item)) {
                // Filtra itens de primeiro nível
                item.items = this.filterByRole(item.items!);

                // Filtra itens de segundo nível
                this.filterByRoleLevel2(item);
            }

            // Mantém o item se não tiver subitens ou se tiver pelo menos um subitem após filtragem
            return !this.hasSubitems(item) || item.items!.length > 0;
        });
    }

    /**
     * Processa e filtra os subitens de segundo nível
     */
    private filterByRoleLevel2(item: MenuItem): void {
        item.items = item.items?.map((subItem) => {
            if (this.hasSubitems(subItem)) {
                subItem.items = this.filterByRole(subItem.items!);
            }
            return subItem;
        });
    }

    /**
     * Verifica se um item de menu possui subitens
     */
    private hasSubitems(item: MenuItem): boolean {
        return item.items !== undefined && Array.isArray(item.items);
    }

    /**
     * Filtra uma lista de itens de menu com base nas permissões
     */
    private filterByRole(items: MenuItem[]): MenuItem[] {
        return items.filter((item) => !item['roles'] || this.hasRole(item['roles']));
    }

    /**
     * Verifica se o usuário atual possui pelo menos uma das funções necessárias
     */
    private hasRole(roles: RoleEnum[]): boolean {
        return roles.some((role: RoleEnum) => this.user.roles.includes(role));
    }
}

