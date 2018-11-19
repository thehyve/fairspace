process.env.CONFIG_FILE = __dirname + '/test-config.js';
const testConfig = require(process.env.CONFIG_FILE);
const supertest = require('supertest');
const fs = require('fs-extra');
nock = require('nock');

// Start test
const app = require('../src/app');
const server = supertest(app);

describe('Webdav integration test', () => {
    before(() => {
        setupMocks()
    })

    after(() => {
        nock.restore()
    });

    beforeEach(() => {
        fs.mkdirSync(testConfig.rootPath)
    })

    afterEach(() => {
        fs.removeSync(testConfig.rootPath);
    });

    it('a user can create and delete a top-level directory', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer Alice')
            .set('Anticipated-Operation', 'true')
            .expect(201)
            .then(() => server
                .delete('/api/storage/webdav/1')
                .set('Anticipated-Operation', 'true')
                .set('Authorization', 'Bearer Alice')
                .expect(200))
    );

    it('a user without manage permission cannot delete other\'s top-level directories', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer Alice')
            .set('Anticipated-Operation', 'true')
            .expect(201)
            .then(() => server
                .propfind('/api/storage/webdav/1')
                .set('Authorization', 'Bearer Bob')
                .expect(401))
    );

    it('a user without read permission cannot read other\'s top-level directories', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer Alice')
            .set('Anticipated-Operation', 'true')
            .expect(201)
            .then(() => server
                .delete('/api/storage/webdav/1')
                .set('Authorization', 'Bearer Bob')
                .expect(401))
    );

    it('a user with read permission can read other\'s top-level directories', () =>
        server
            .mkcol('/api/storage/webdav/2')
            .set('Authorization', 'Bearer Bob')
            .set('Anticipated-Operation', 'true')
            .expect(201)
            .then(() => server
                .propfind('/api/storage/webdav/2')
                .set('Authorization', 'Bearer Alice')
                .expect(207))
    );

    it('a user can create and delete subdirectories', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer Alice')
            .set('Anticipated-Operation', 'true')
            .expect(201)
            .then(() => server
                .mkcol('/api/storage/webdav/1/subdir')
                .set('Authorization', 'Bearer Alice')
                .expect(201))
            .then(() => server
                .delete('/api/storage/webdav/1/subdir')
                .set('Authorization', 'Bearer Alice')
                .expect(200))
    );

    it('a user can create and delete files', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer Alice')
            .set('Anticipated-Operation', 'true')
            .expect(201)
            .then(() => server
                .put('/api/storage/webdav/1/file.txt')
                .set('Authorization', 'Bearer Alice')
                .expect(201))
            .then(() => server
                .delete('/api/storage/webdav/1/file.txt')
                .set('Authorization', 'Bearer Alice')
                .expect(200))
    );


    it('a user can rename a top-level directory with Anticipated-Operation: true', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer Alice')
            .set('Anticipated-Operation', 'true')
            .expect(201)
            .then(() => server
                .move('/api/storage/webdav/1')
                .set('Authorization', 'Bearer Alice')
                .set('Destination', 'http://fairspace.io/newname-1')
                .set('Anticipated-Operation', 'true')
                .expect(201))
    );

    it('a user cannot rename a top-level directory without Anticipated-Operation: true', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer Alice')
            .set('Anticipated-Operation', 'true')
            .expect(201)
            .then(() => server
                .move('/api/storage/webdav/1')
                .set('Authorization', 'Bearer Alice')
                .set('Destination', 'http://fairspace.io/newname-1')
                .expect(401))
    );

    it('returns 401 for non-existing collections', () =>
        server
            .delete('/api/storage/webdav/1001/')
            .set('Authorization', 'Bearer Alice')
            .set('Anticipated-Operation', 'true')
            .expect(401)
    );

    it('hides unavailable collections', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer Alice')
            .set('Anticipated-Operation', 'true')
            .expect(201)
            .then(() => server
                .propfind('/api/storage/webdav/')
                .set('Authorization', 'Bearer Alice')
                .expect(207)
                .expect(res => {
                    if (!res.res.text.includes('/api/storage/webdav/1')) {
                        throw new Error('Should be visible to Alice')
                    }

                }))
            .then(() => server
                .propfind('/api/storage/webdav/')
                .set('Authorization', 'Bearer Bob')
                .expect(207)
                .expect(res => {
                    if (res.res.text.includes('/api/storage/webdav/1')) {
                        throw new Error('Shouldn\'t be visible to Bob')
                    }
                }))
    );
});

const setupMocks = () => {
    nock('http://fairspace.io', {
        reqheaders: {
            'authorization': 'Bearer Alice'
        }
    })
        .get('/api/collections')
        .query({location: '1'})
        .reply(200, [{collection: 1, subject: 'alice', access: 'Manage'}], {'Cache-Control': 'max-age=60'});

    nock('http://fairspace.io', {
        reqheaders: {
            'authorization': 'Bearer Alice'
        }
    })
        .get('/api/collections')
        .query({location: 'newname-1'})
        .reply(200, [{collection: 1, subject: 'alice', access: 'Manage'}], {'Cache-Control': 'max-age=60'});

    nock('http://fairspace.io', {
        reqheaders: {
            'authorization': 'Bearer Bob'
        }
    })
        .get('/api/collections')
        .query({location: '1'})
        .reply(200, [{collection: 1, subject: 'bob', access: 'None'}], {'Cache-Control': 'max-age=60'});

    nock('http://fairspace.io', {
        reqheaders: {
            'authorization': 'Bearer Alice'
        }
    })
        .get('/api/collections')
        .query({location: '2'})
        .times(100)
        .reply(200, [{collection: 2, subject: 'alice', access: 'Write'}], {'Cache-Control': 'max-age=60'});

    nock('http://fairspace.io', {
        reqheaders: {
            'authorization': 'Bearer Bob'
        }
    })
        .get('/api/collections')
        .query({location: '2'})
        .times(100)
        .reply(200, [{collection: 2, subject: 'bob', access: 'Manage'}], {'Cache-Control': 'max-age=60'});


    nock('http://fairspace.io', {
        reqheaders: {
            'authorization': 'Bearer Alice'
        }
    })
        .get('/api/collections')
        .query({location: '1001'})
        .times(100)
        .reply(404);
}
