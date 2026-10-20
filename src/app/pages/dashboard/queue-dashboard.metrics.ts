import { QueueState } from '@/pabx/types/queue-state';
import { QueueMember } from '@/pabx/types/queue-member';
import { QueueMemberStatusEnum } from '@/pabx/types/queue-member-status-enum';

export type QueueAlert = 'SLA_CRITICAL' | 'TME_HIGH';

export interface MemberAlert {
    memberId: number;
    name: string;
    extension: string;
    type: 'LONG_PAUSE' | 'LONG_CALL';
    elapsedSeconds: number;
}

const sum = (states: QueueState[], pick: (s: QueueState) => number | undefined): number =>
    states.reduce((acc, s) => acc + (pick(s) ?? 0), 0);

export function globalTmeSeconds(states: QueueState[]): number | null {
    const calls = sum(states, (s) => s.answeredCalls) + sum(states, (s) => s.abandonedCalls);
    if (calls === 0) return null;
    return sum(states, (s) => s.totalWaitTimeSeconds) / calls;
}

function serviceLevelOf(inSla: number, answered: number): number | null {
    if (answered === 0) return null;
    return Math.round((inSla / answered) * 1000) / 10;
}

export function globalServiceLevel(states: QueueState[]): number | null {
    return serviceLevelOf(
        sum(states, (s) => s.answeredCallsInServiceLevel),
        sum(states, (s) => s.answeredCalls)
    );
}

export function queueServiceLevel(state: QueueState): number | null {
    return serviceLevelOf(state.answeredCallsInServiceLevel ?? 0, state.answeredCalls ?? 0);
}

export function queueAlerts(state: QueueState): QueueAlert[] {
    const calls = (state.answeredCalls ?? 0) + (state.abandonedCalls ?? 0);
    if (calls === 0) return [];
    const alerts: QueueAlert[] = [];
    const sl = queueServiceLevel(state);
    if (sl !== null && sl < 60) alerts.push('SLA_CRITICAL');
    if ((state.tmeSeconds ?? 0) > state.queue.tmeAlertSeconds) alerts.push('TME_HIGH');
    return alerts;
}

export function serviceLevelSeverity(sl: number | null): 'ok' | 'warn' | 'critical' {
    if (sl === null || sl >= 80) return 'ok';
    return sl >= 60 ? 'warn' : 'critical';
}

function uniqueMembers(states: QueueState[]): QueueMember[] {
    const byId = new Map<number, QueueMember>();
    states.forEach((s) => s.loggedMembers.forEach((m) => byId.has(m.id) || byId.set(m.id, m)));
    return [...byId.values()];
}

export function memberCounts(states: QueueState[]): {
    total: number;
    available: number;
    onCall: number;
    paused: number;
} {
    const members = uniqueMembers(states);
    const S = QueueMemberStatusEnum;
    const count = (...st: QueueMemberStatusEnum[]) =>
        members.filter((m) => st.includes(m.queueMemberStatusEnum)).length;
    return {
        total: members.length,
        available: count(S.AVAILABLE, S.COOLDOWN),
        onCall: count(S.UP, S.RINGING, S.DIALING),
        paused: count(S.PAUSED)
    };
}

export function percentOf(part: number, total: number): number {
    return total === 0 ? 0 : Math.round((part / total) * 100);
}

export function memberAlerts(states: QueueState[], now: number): MemberAlert[] {
    const callLimits = new Map<number, number>();
    states.forEach((s) =>
        s.loggedMembers.forEach((m) =>
            callLimits.set(m.id, Math.min(callLimits.get(m.id) ?? Infinity, s.queue.callDurationAlertMinutes))
        )
    );
    const alerts: MemberAlert[] = [];
    uniqueMembers(states).forEach((m) => {
        const base = { memberId: m.id, name: m.name, extension: m.peerRegistry?.peer?.peer };
        if (
            m.queueMemberStatusEnum === QueueMemberStatusEnum.PAUSED &&
            m.pauseTimestamp &&
            (m.pauseTimeLimitMinutes ?? 0) > 0
        ) {
            const elapsed = now - m.pauseTimestamp;
            if (elapsed > m.pauseTimeLimitMinutes! * 60_000) {
                alerts.push({ ...base, type: 'LONG_PAUSE', elapsedSeconds: Math.floor(elapsed / 1000) });
            }
        }
        if (m.queueMemberStatusEnum === QueueMemberStatusEnum.UP && m.callStartTimestamp) {
            const elapsed = now - m.callStartTimestamp;
            if (elapsed > callLimits.get(m.id)! * 60_000) {
                alerts.push({ ...base, type: 'LONG_CALL', elapsedSeconds: Math.floor(elapsed / 1000) });
            }
        }
    });
    return alerts.sort((a, b) => b.elapsedSeconds - a.elapsedSeconds);
}

export function formatDuration(seconds: number | null): string {
    if (seconds === null) return '—';
    const total = Math.max(0, Math.round(seconds));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
