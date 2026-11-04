/**
 * @author Jefferson Alves Reis (jefaokpta)
 * @email jefaokpta@hotmail.com
 */

import {Injectable, signal} from '@angular/core';
import {Cdr} from '@/pabx/types/cdr';

@Injectable({ providedIn: 'root' })
export class MyCallsStateService {
    private readonly _cdrs = signal<Cdr[]>([]);
    private readonly _loaded = signal<boolean>(false);
    readonly cdrs = this._cdrs.asReadonly();
    readonly loaded = this._loaded.asReadonly();

    setCdrs(cdrs: Cdr[]): void {
        this._cdrs.set(cdrs);
        this._loaded.set(true);
    }

    reset(): void {
        this._cdrs.set([]);
        this._loaded.set(false);
    }
}
