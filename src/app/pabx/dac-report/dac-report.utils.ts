import { QueueJourneyEvent } from '@/pabx/types/dac-call-journey';

export function formatHms(totalSeconds: number): string {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function percentSeverity(percent: number): 'success' | 'info' | 'warn' {
    if (percent >= 70) return 'success';
    if (percent >= 30) return 'info';
    return 'warn';
}

export function answeredPercent(r: { totalCalls: number; answeredCalls: number }): number {
    return r.totalCalls === 0 ? 0 : Math.round((r.answeredCalls / r.totalCalls) * 100);
}

export function abandonedPercent(r: { totalCalls: number; abandonedCalls: number }): number {
    return r.totalCalls === 0 ? 0 : Math.round((r.abandonedCalls / r.totalCalls) * 100);
}

export function eventLabel(eventType: QueueJourneyEvent): string {
    const labels: Record<QueueJourneyEvent, string> = {
        CALL_ENTRY: 'Entrou na fila',
        CALLING_MEMBER: 'Chamando membro',
        CALLING_MEMBER_FAILED: 'Membro não atendeu',
        CALL_ANSWERED: 'Atendida pelo membro',
        CALL_ABANDON: 'Abandonada pelo cliente',
        MEMBER_HANGUP: 'Encerrada pelo membro',
        CALLER_HANGUP: 'Encerrada pelo cliente'
    };
    return labels[eventType] ?? eventType;
}

export function eventSeverity(eventType: QueueJourneyEvent): 'success' | 'info' | 'warn' | 'secondary' {
    switch (eventType) {
        case 'CALL_ANSWERED':
            return 'success';
        case 'CALLING_MEMBER':
            return 'info';
        case 'CALLING_MEMBER_FAILED':
        case 'CALL_ABANDON':
            return 'warn';
        default:
            return 'secondary';
    }
}
