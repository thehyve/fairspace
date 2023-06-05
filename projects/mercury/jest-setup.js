import { TextEncoder, TextDecoder } from 'util';

// TextEncoder and TextDecoder are not available anymore in the jest jsdom environment
// https://github.com/inrupt/solid-client-authn-js/issues/1676
Object.assign(global, { TextDecoder, TextEncoder });