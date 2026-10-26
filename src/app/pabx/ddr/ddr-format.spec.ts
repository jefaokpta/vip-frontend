import { FormControl } from '@angular/forms';
import { ddrValidator, formatDdr, isValidDdr, onlyDigits } from './ddr-format';

describe('ddr-format', () => {
    const cases: [string, string][] = [
        ['1123456789', '(11) 2345-6789'],
        ['11923456789', '(11) 92345-6789'],
        ['211123456789', '21 (11) 2345-6789'],
        ['2111923456789', '21 (11) 92345-6789'],
        ['0211123456789', '0 21 (11) 2345-6789'],
        ['02111923456789', '0 21 (11) 92345-6789'],
        ['08001234567', '0800 123 4567']
    ];

    cases.forEach(([digits, formatted]) => {
        it(`formats ${digits}`, () => {
            expect(formatDdr(digits)).toBe(formatted);
            expect(isValidDdr(digits)).toBeTrue();
            expect(onlyDigits(formatted)).toBe(digits);
        });
    });

    it('returns input unchanged when outside the formats', () => {
        expect(formatDdr('12345')).toBe('12345');
    });

    it('strips non digits', () => {
        expect(onlyDigits('0 21 (11) 92345-6789')).toBe('02111923456789');
    });

    it('rejects invalid values', () => {
        ['12345', '123456789012345', '0800123', '12111923456789'].forEach((v) => expect(isValidDdr(v)).toBeFalse());
    });

    it('validator works on masked value', () => {
        expect(ddrValidator(new FormControl('(11) 2345-6789'))).toBeNull();
        expect(ddrValidator(new FormControl('12345'))).toEqual({ ddrFormat: true });
        expect(ddrValidator(new FormControl(''))).toBeNull();
    });
});
