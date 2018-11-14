process.env.CONFIG_FILE = __dirname + '/test-config.js';
const testConfig = require(process.env.CONFIG_FILE);

const supertest = require('supertest');
const fs = require('fs-extra');
nock = require('nock');

// Start test
const app = require('../src/app');
const server = supertest(app);

describe('Titan', () => {
    before(() => fs.mkdirSync(testConfig.rootPath));

    after(() => fs.removeSync(testConfig.rootPath));

    it('responds to probe requests', () =>
        server
            .get('/')
            .set('probe', 'Liveness')
            .expect(200, 'Hi, I\'m Titan!'));

    it('responds to /api/storage/webdav when the directory is present and authorization is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Bearer Alice')
            .expect(207)
    );
});

describe('Authentication', () => {
    before(() => fs.mkdirSync(testConfig.rootPath));

    after(() => fs.removeSync(testConfig.rootPath));

    it('responds to /api/storage/webdav/ when authorization with a valid JWT is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Bearer Alice')
            .expect(207)
    );

    it('responds to /api/storage/webdav/ when authorization with any Bearer is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Bearer JWT')
            .expect(207)
    );

    it('responds a 401 to /api/storage/webdav/ when an unknown authorization is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Unknown token')
            .
            expect(401)
    );
    it('responds a 401 to /api/storage/webdav/ when no authorization is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .expect(401)
    );
});
