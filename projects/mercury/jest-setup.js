import { TextEncoder, TextDecoder } from 'util';

// TextEncoder and TextDecoder are not available anymore in the jest jsdom environment. They
// are available in all common browsers, therefor we can use them in tests without risk.
// https://github.com/inrupt/solid-client-authn-js/issues/1676
Object.assign(global, { TextDecoder, TextEncoder });