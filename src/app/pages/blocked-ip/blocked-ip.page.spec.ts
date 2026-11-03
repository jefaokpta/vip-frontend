import {countByStatus, isLocalhostIp} from '@/pages/blocked-ip/blocked-ip.page';
import {BlockedIp, BlockedIpStatus} from '@/types/blocked-ip';

describe('countByStatus', () => {
    const ipWith = (status: BlockedIpStatus) => ({ status }) as BlockedIp;

    it('conta somente os IPs com a situação informada', () => {
        const ips = [ipWith('BLOCKED'), ipWith('ALLOWED'), ipWith('BLOCKED')];

        expect(countByStatus(ips, 'BLOCKED')).toBe(2);
        expect(countByStatus(ips, 'ALLOWED')).toBe(1);
    });

    it('retorna zero para lista vazia', () => {
        expect(countByStatus([], 'BLOCKED')).toBe(0);
    });
});

describe('isLocalhostIp', () => {
    it('reconhece 127.0.0.1 e variações com zeros à esquerda', () => {
        ['127.0.0.1', ' 127.0.0.1 ', '127.00.0.01'].forEach((ip) => expect(isLocalhostIp(ip)).toBeTrue());
    });

    it('não reconhece outros IPs', () => {
        ['127.0.0.2', '10.0.0.1', '189.40.2.15'].forEach((ip) => expect(isLocalhostIp(ip)).toBeFalse());
    });
});
