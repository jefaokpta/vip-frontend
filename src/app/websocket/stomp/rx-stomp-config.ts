import {environment} from '../../../environments/environment';
import {RxStompConfig} from '@stomp/rx-stomp';

export const myRxStompConfig: RxStompConfig = {
    // Which server?
    brokerURL: environment.WEBSOCKET_BACKEND_URL,

    // Headers
    // Typical keys: login, passcode, host
    // connectHeaders: {
    //   login: 'guest',
    //   passcode: 'guest',
    // },

    // How often to heartbeat?
    // Interval in milliseconds, set to 0 to disable
    heartbeatIncoming: 50000, // Typical value 0 - disabled
    heartbeatOutgoing: 50000, // 50s: abaixo do timeout de 2 min da DO App Platform

    // Wait in milliseconds before attempting auto reconnect
    // Set to 0 to disable
    // Typical value 500 (500 milli seconds)
    reconnectDelay: 5000,

    // Will log diagnostics on console
    // It can be quite verbose, not recommended in production
    // Skip this key to stop logging to console
    debug: (msg: string): void => {
        console.log(new Date(), msg);
    }
};
