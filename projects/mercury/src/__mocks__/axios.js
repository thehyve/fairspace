export default {
    get: jest.fn(() => Promise.resolve({})),
    patch: jest.fn(() => Promise.resolve({})),
    put: jest.fn(() => Promise.resolve({})),
    interceptors: {
        request: {
            use: () => {}
        }
    }
};
