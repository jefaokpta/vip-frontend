import {Routes} from '@angular/router';
import {Access} from './access';
import {Login} from './login';
import {Error} from './error';
import {ForgotPassword} from './forgotpassword';
import {NewPassword} from './newpassword';
import {ConfirmEmailPage} from './confirm-email.page';

export default [
    { path: 'access', component: Access },
    { path: 'error', component: Error },
    { path: 'login', component: Login },
    { path: 'forgotpassword', component: ForgotPassword },
    { path: 'newpassword', component: NewPassword },
    { path: 'confirm-email', component: ConfirmEmailPage },
    { path: '**', redirectTo: '/notfound' }
] as Routes;
