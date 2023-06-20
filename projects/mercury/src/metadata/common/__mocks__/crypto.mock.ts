// @ts-nocheck
const mockCrypto = {
    getRandomValues: () => '3b28e049-540a-4951-9ebb-da9b44194e36'
};
global.window.crypto = mockCrypto;