import {transportDots} from '@/pages/dashboard/peer-transport-dots';
import {PeerRegistry} from '@/pabx/types/peer-registry';
import {PeerTransportEnum} from '@/pabx/types/peer-transport-enum';
import {ContactStatusEventEnum} from '@/pabx/types/contact-status-event-enum';

describe('transportDots', () => {
    function registry(
        techs: PeerTransportEnum[],
        transports?: Partial<Record<PeerTransportEnum, ContactStatusEventEnum>>
    ): PeerRegistry {
        return {
            id: '1001_100',
            peer: { peer: '1001', peerTransportEnums: techs },
            contactStatusEventEnum: ContactStatusEventEnum.UNKNOWN,
            transports
        } as unknown as PeerRegistry;
    }

    it('pinta de verde as techs registradas', () => {
        const dots = transportDots(
            registry([PeerTransportEnum.UDP, PeerTransportEnum.WSS], {
                UDP: ContactStatusEventEnum.REACHABLE,
                WSS: ContactStatusEventEnum.NONQUALIFIED
            })
        );
        expect(dots.map((d) => d.cssClass)).toEqual(['bg-green-500', 'bg-green-500']);
    });

    it('pinta de laranja a tech UNREACHABLE', () => {
        const [dot] = transportDots(registry([PeerTransportEnum.TCP], { TCP: ContactStatusEventEnum.UNREACHABLE }));
        expect(dot.cssClass).toBe('bg-orange-400');
        expect(dot.tooltip).toBe('TCP: INALCANÇÁVEL');
    });

    it('pinta de cinza a tech configurada mas ausente', () => {
        const [dot] = transportDots(registry([PeerTransportEnum.TLS], {}));
        expect(dot.cssClass).toBe('bg-surface-400');
        expect(dot.tooltip).toBe('TLS: AUSENTE');
    });

    it('nao desenha ponto para tech fora da configuracao', () => {
        const dots = transportDots(
            registry([PeerTransportEnum.UDP], {
                UDP: ContactStatusEventEnum.REACHABLE,
                TCP: ContactStatusEventEnum.REACHABLE
            })
        );
        expect(dots.map((d) => d.tech)).toEqual([PeerTransportEnum.UDP]);
    });

    it('sem transports (backend antigo) desenha todos os pontos cinza', () => {
        const dots = transportDots(registry([PeerTransportEnum.UDP, PeerTransportEnum.WSS]));
        expect(dots.map((d) => d.cssClass)).toEqual(['bg-surface-400', 'bg-surface-400']);
    });
});
