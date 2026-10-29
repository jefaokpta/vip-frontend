import {isLocalhostIp} from '@/pages/blocked-ip/blocked-ip.page';

describe('isLocalhostIp', () => {
    it('reconhece 127.0.0.1 e variações com zeros à esquerda', () => {
        ['127.0.0.1', ' 127.0.0.1 ', '127.00.0.01'].forEach((ip) => expect(isLocalhostIp(ip)).toBeTrue());
    });

    it('não reconhece outros IPs', () => {
        ['127.0.0.2', '10.0.0.1', '189.40.2.15'].forEach((ip) => expect(isLocalhostIp(ip)).toBeFalse());
    });
});
