import {RxStomp} from '@stomp/rx-stomp';
import {myRxStompConfig} from './rx-stomp-config';

describe('myRxStompConfig', () => {
    afterEach(() => localStorage.removeItem('token'));

    it('envia o token atual no CONNECT a cada tentativa de conexão', () => {
        const client = jasmine.createSpyObj<RxStomp>('RxStomp', ['configure']);

        localStorage.setItem('token', 'jwt-1');
        myRxStompConfig.beforeConnect!(client);
        localStorage.setItem('token', 'jwt-2');
        myRxStompConfig.beforeConnect!(client);

        expect(client.configure.calls.first().args[0].connectHeaders).toEqual({ Authorization: 'Bearer jwt-1' });
        expect(client.configure.calls.mostRecent().args[0].connectHeaders).toEqual({ Authorization: 'Bearer jwt-2' });
    });
});
