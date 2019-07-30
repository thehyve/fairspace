const validReponse = {
    status: 200,
    statusText: 'OK',
    headers: {'Content-type': 'application/json'},
    data: {}
};

export default {
    get: jest.fn(() => Promise.resolve(validReponse)),
    patch: jest.fn(() => Promise.resolve(validReponse)),
    put: jest.fn(() => Promise.resolve(validReponse)),
    interceptors: {
        request: {
            use: () => {}
        }
    }
};
