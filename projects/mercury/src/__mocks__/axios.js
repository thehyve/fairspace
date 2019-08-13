export default {
    get: jest.fn(() => Promise.resolve({headers: {'content-type': 'application/json'}})),
    patch: jest.fn(() => Promise.resolve({headers: {'content-type': 'application/json'}})),
    put: jest.fn(() => Promise.resolve({headers: {'content-type': 'application/json'}})),
    interceptors: {
        request: {
            use: () => {}
        }
    }
};
