import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const matchPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const repeatedPassword = control.get('repeatPassword');
    if (password && repeatedPassword) {
        return repeatedPassword.value === password.value ? null : { passwordMustMatch: true };
    }
    return null;
};

export function passwordStrengthValidator(): (control: AbstractControl) => ValidationErrors | null {
    return (control: AbstractControl): ValidationErrors | null => {
        const value: string = control.value ?? '';

        if (!value) {
            return null;
        }

        const errors: any = {};
        let hasErrors = false;

        // Verificar letra maiúscula
        if (!/[A-Z]/.test(value)) {
            errors.missingUppercase = true;
            hasErrors = true;
        }

        // Verificar letra minúscula
        if (!/[a-z]/.test(value)) {
            errors.missingLowercase = true;
            hasErrors = true;
        }

        // Verificar número
        if (!/\d/.test(value)) {
            errors.missingNumber = true;
            hasErrors = true;
        }

        // Verificar caractere especial
        if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
            errors.missingSpecialChar = true;
            hasErrors = true;
        }

        return hasErrors ? { passwordStrength: errors } : null;
    };
}
