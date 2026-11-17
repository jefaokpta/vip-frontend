import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';

/**
 * Casca da área de empresas: mantém um único p-toast vivo durante a navegação entre
 * as páginas, para que mensagens emitidas antes de navegar (ex.: "Empresa criada") sejam exibidas.
 */
@Component({
    selector: 'app-company-shell',
    standalone: true,
    imports: [Toast, RouterOutlet],
    template: `
        <p-toast />
        <router-outlet />
    `
})
export class CompanyShellComponent {}
