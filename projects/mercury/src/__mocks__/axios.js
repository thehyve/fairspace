export default {
    get: jest.fn(() => Promise.resolve({data: [], headers: {'content-type': 'application/json'}})),
    patch: jest.fn(() => Promise.resolve({data: [], headers: {'content-type': 'application/json'}})),
    put: jest.fn(() => Promise.resolve({data: [], headers: {'content-type': 'application/json'}})),
    delete: jest.fn(() => Promise.resolve({data: [], headers: {'content-type': 'application/json'}})),
    isCancel: jest.fn(() => false),
    interceptors: {
        request: {
            use: () => {}
        }
    }
};
