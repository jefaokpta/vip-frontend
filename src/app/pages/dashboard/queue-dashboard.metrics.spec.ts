import { QueueState } from '@/pabx/types/queue-state';
import { QueueMember } from '@/pabx/types/queue-member';
import { QueueMemberStatusEnum } from '@/pabx/types/queue-member-status-enum';
import {
    formatDuration,
    globalServiceLevel,
    globalTmeSeconds,
    memberAlerts,
    memberCounts,
    percentOf,
    queueAlerts,
    serviceLevelSeverity
} from './queue-dashboard.metrics';

function member(id: number, status: QueueMemberStatusEnum, extra: Partial<QueueMember> = {}): QueueMember {
    return {
        id,
        name: `Agente ${id}`,
        peerRegistry: { id: `p${id}`, peer: { peer: `100${id}` } },
        queueMemberStatusEnum: status,
        ...extra
    } as unknown as QueueMember;
}

function state(
    opts: {
        answered?: number;
        abandoned?: number;
        inSla?: number;
        wait?: number;
        tme?: number;
        tmeAlert?: number;
        callAlert?: number;
        members?: QueueMember[];
    } = {}
): QueueState {
    return {
        queue: {
            id: 1,
            tmeAlertSeconds: opts.tmeAlert ?? 30,
            callDurationAlertMinutes: opts.callAlert ?? 30
        },
        loggedMembers: opts.members ?? [],
        waitingCalls: [],
        answeredCalls: opts.answered,
        abandonedCalls: opts.abandoned,
        answeredCallsInServiceLevel: opts.inSla,
        totalWaitTimeSeconds: opts.wait,
        tmeSeconds: opts.tme
    } as unknown as QueueState;
}

describe('queue-dashboard.metrics', () => {
    it('globalTmeSeconds', () => {
        expect(
            globalTmeSeconds([
                state({ wait: 120, answered: 2, abandoned: 1 }),
                state({ wait: 60, answered: 1, abandoned: 0 })
            ])
        ).toBe(45);
        expect(globalTmeSeconds([state()])).toBeNull();
    });

    it('globalServiceLevel', () => {
        expect(globalServiceLevel([state({ answered: 10, inSla: 8 }), state({ answered: 10, inSla: 2 })])).toBe(50);
        expect(globalServiceLevel([state()])).toBeNull();
    });

    it('queueAlerts', () => {
        expect(queueAlerts(state({ answered: 10, inSla: 5 }))).toContain('SLA_CRITICAL');
        expect(queueAlerts(state({ answered: 10, inSla: 10, tme: 31, tmeAlert: 30 }))).toEqual(['TME_HIGH']);
        expect(queueAlerts(state({ answered: 10, inSla: 10, tme: 30, tmeAlert: 30 }))).toEqual([]);
        expect(queueAlerts(state())).toEqual([]);
    });

    it('serviceLevelSeverity', () => {
        expect(serviceLevelSeverity(80)).toBe('ok');
        expect(serviceLevelSeverity(79.9)).toBe('warn');
        expect(serviceLevelSeverity(60)).toBe('warn');
        expect(serviceLevelSeverity(59)).toBe('critical');
        expect(serviceLevelSeverity(null)).toBe('ok');
    });

    it('memberCounts deduplicates by id', () => {
        const s = QueueMemberStatusEnum;
        const states = [
            state({ members: [member(1, s.AVAILABLE), member(2, s.UP)] }),
            state({
                members: [member(1, s.AVAILABLE), member(3, s.COOLDOWN), member(4, s.PAUSED), member(5, s.RINGING)]
            })
        ];
        expect(memberCounts(states)).toEqual({ total: 5, available: 2, onCall: 2, paused: 1 });
    });

    it('percentOf', () => {
        expect(percentOf(0, 0)).toBe(0);
        expect(percentOf(1, 3)).toBe(33);
    });

    describe('memberAlerts', () => {
        const now = 10_000_000_000;
        const min = 60_000;

        it('LONG_PAUSE', () => {
            const m = member(1, QueueMemberStatusEnum.PAUSED, {
                pauseTimestamp: now - 16 * min,
                pauseTimeLimitMinutes: 15
            });
            const alerts = memberAlerts([state({ members: [m] })], now);
            expect(alerts.length).toBe(1);
            expect(alerts[0]).toEqual({
                memberId: 1,
                name: 'Agente 1',
                extension: '1001',
                type: 'LONG_PAUSE',
                elapsedSeconds: 960
            });
        });

        it('no pause alert when limit is 0', () => {
            const m = member(1, QueueMemberStatusEnum.PAUSED, {
                pauseTimestamp: now - 16 * min,
                pauseTimeLimitMinutes: 0
            });
            expect(memberAlerts([state({ members: [m] })], now)).toEqual([]);
        });

        it('LONG_CALL uses the minimum target across queues', () => {
            const m = member(1, QueueMemberStatusEnum.UP, { callStartTimestamp: now - 31 * min });
            const alerts = memberAlerts(
                [state({ callAlert: 30, members: [m] }), state({ callAlert: 60, members: [m] })],
                now
            );
            expect(alerts.length).toBe(1);
            expect(alerts[0].type).toBe('LONG_CALL');
        });

        it('no call alert under target', () => {
            const m = member(1, QueueMemberStatusEnum.UP, { callStartTimestamp: now - 29 * min });
            expect(memberAlerts([state({ callAlert: 30, members: [m] })], now)).toEqual([]);
        });

        it('sorts by elapsed desc', () => {
            const a = member(1, QueueMemberStatusEnum.UP, { callStartTimestamp: now - 31 * min });
            const b = member(2, QueueMemberStatusEnum.UP, { callStartTimestamp: now - 50 * min });
            expect(memberAlerts([state({ members: [a, b] })], now).map((x) => x.memberId)).toEqual([2, 1]);
        });
    });

    it('formatDuration', () => {
        expect(formatDuration(84)).toBe('01:24');
        expect(formatDuration(3725)).toBe('1:02:05');
        expect(formatDuration(null)).toBe('—');
    });
});
