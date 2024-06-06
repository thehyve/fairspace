const mockClipboard = {
    writeText: jest.fn()
};

global.navigator.clipboard = mockClipboard;
