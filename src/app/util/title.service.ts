import {Injectable} from '@angular/core';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class TitleService {
    private readonly baseTitle = 'Vip';

    constructor(
        private readonly titleService: Title,
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute
    ) {}

    initializeTitleListener(): void {
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            const routeData = this.getRouteData(this.activatedRoute.root);
            if (routeData?.breadcrumb) {
                this.setTitle(`${this.baseTitle} - ${routeData.breadcrumb}`);
            } else {
                this.setTitle(this.baseTitle);
            }
        });
    }

    private getRouteData(route: ActivatedRoute): any {
        if (route.firstChild) {
            return this.getRouteData(route.firstChild);
        }
        return route.snapshot.data;
    }

    setTitle(newTitle: string): void {
        this.titleService.setTitle(newTitle);
    }
}
