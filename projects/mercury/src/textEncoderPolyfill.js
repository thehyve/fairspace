/* eslint-disable */
// Polyfills for Web APIs that are not available in Node.js by default
// These are needed for the tests to run properly

// TextEncoder and TextDecoder polyfills
global.TextEncoder = function () {};
global.TextEncoder.prototype.encode = function (str) {
    return new Uint8Array([...str].map(c => c.charCodeAt(0)));
};

global.TextDecoder = function () {};
global.TextDecoder.prototype.decode = function (bytes) {
    return String.fromCharCode.apply(null, bytes);
};

// ReadableStream polyfill (minimal implementation)
class ReadableStreamDefaultReader {
    constructor() {
        this.closed = Promise.resolve();
    }

    read() {
        return Promise.resolve({done: true, value: undefined});
    }

    cancel() {
        return Promise.resolve();
    }

    releaseLock() {}
}

class ReadableStreamDefaultController {
    constructor() {
        this.desiredSize = 0;
    }

    close() {}

    enqueue() {}

    error() {}
}

global.ReadableStream = class ReadableStream {
    constructor() {
        this.locked = false;
    }

    getReader() {
        return new ReadableStreamDefaultReader();
    }

    cancel() {
        return Promise.resolve();
    }
};

global.ReadableStreamDefaultReader = ReadableStreamDefaultReader;
global.ReadableStreamDefaultController = ReadableStreamDefaultController;
/* eslint-enable */
