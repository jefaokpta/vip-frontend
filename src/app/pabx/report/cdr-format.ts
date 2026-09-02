export function formatDate(startTime: Date | string): string {
    const d = new Date(startTime);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatDuration(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function dispositionSeverity(disposition: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (disposition) {
        case 'ANSWERED':
            return 'success';
        case 'BUSY':
            return 'warn';
        case 'NO ANSWER':
        case 'FAILED':
            return 'danger';
        default:
            return 'secondary';
    }
}

export function costCenterLabel(accountCode: string | null, labelsByCode: Map<string, string>): string {
    if (!accountCode) return '-';
    return labelsByCode.get(accountCode) ?? '-';
}

export function dispositionTranslate(disposition: string): string {
    switch (disposition) {
        case 'ANSWERED':
            return 'Atendida';
        case 'BUSY':
            return 'Ocupada';
        case 'NO ANSWER':
            return 'Não atendida';
        case 'FAILED':
            return 'Falha';
        default:
            return 'Desconhecido';
    }
}
