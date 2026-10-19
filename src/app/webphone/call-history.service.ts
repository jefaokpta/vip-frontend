import {Injectable, signal} from '@angular/core';
import {CallHistory, CallHistoryType} from '@/types/call-history';

export const CALL_HISTORY_STORAGE_KEY = 'webphoneCallHistory';
const MAX_ENTRIES = 50;

/**
 * Histórico de chamadas do webphone salvo apenas no navegador (localStorage),
 * uma entrada por número, com a chamada mais recente no topo.
 */
@Injectable({
    providedIn: 'root'
})
export class CallHistoryService {
    private readonly entries = signal<CallHistory[]>(this.load());
    readonly history = this.entries.asReadonly();

    add(telephone: string | undefined, type: CallHistoryType) {
        const digits = telephone?.replaceAll(/[^\d*#]/g, '');
        if (!digits) return;
        const entry: CallHistory = { telephone: digits, type, time: new Date().toISOString() };
        this.entries.update((list) => [entry, ...list.filter((c) => c.telephone !== digits)].slice(0, MAX_ENTRIES));
        this.save();
    }

    private load(): CallHistory[] {
        try {
            const parsed = JSON.parse(localStorage.getItem(CALL_HISTORY_STORAGE_KEY) ?? '[]');
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }

    private save() {
        try {
            localStorage.setItem(CALL_HISTORY_STORAGE_KEY, JSON.stringify(this.entries()));
        } catch {
            // localStorage indisponível: histórico fica só em memória
        }
    }
}
