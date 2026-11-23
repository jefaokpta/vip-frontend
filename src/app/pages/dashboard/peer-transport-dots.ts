import {PeerRegistry} from '@/pabx/types/peer-registry';
import {PeerTransportEnum} from '@/pabx/types/peer-transport-enum';
import {ContactStatusEventEnum} from '@/pabx/types/contact-status-event-enum';

export interface TransportDot {
    readonly tech: PeerTransportEnum;
    readonly cssClass: string;
    readonly tooltip: string;
}

const REGISTERED = new Set<ContactStatusEventEnum>([
    ContactStatusEventEnum.REACHABLE,
    ContactStatusEventEnum.CREATED,
    ContactStatusEventEnum.UPDATED,
    ContactStatusEventEnum.NONQUALIFIED
]);

/** Um ponto por tech configurada no ramal, com a cor do status daquela tech. */
export function transportDots(pr: PeerRegistry): TransportDot[] {
    return pr.peer.peerTransportEnums.map((tech) => {
        const status = pr.transports?.[tech];
        if (status && REGISTERED.has(status)) return { tech, cssClass: 'bg-green-500', tooltip: `${tech}: REGISTRADO` };
        if (status === ContactStatusEventEnum.UNREACHABLE)
            return { tech, cssClass: 'bg-orange-400', tooltip: `${tech}: INALCANÇÁVEL` };
        return { tech, cssClass: 'bg-surface-400', tooltip: `${tech}: AUSENTE` };
    });
}
