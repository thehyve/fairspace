process.env.FILES_FOLDER = __dirname + '/fs';
process.env.PERMISSIONS_URL = 'http://fairspace.io/api/collections/%s/permissions';

const supertest = require('supertest');
const fs = require('fs-extra');
const jwk2pem = require('pem-jwk').jwk2pem;
const jwt = require("jsonwebtoken");
const jwks = JSON.parse(fs.readFileSync(__dirname + '/jwks.json'));
const invalidJWK = JSON.parse(fs.readFileSync(__dirname + '/invalidKey.json'));
nock = require('nock');

mockPublicKeyset();

// Create valid authorization tokens
const key = jwk2pem(jwks.keys[0]);
const invalidKey = jwk2pem(invalidJWK);

const token = jwt.sign({foo: 'bar', sub: 'alice', exp: Math.floor(Date.now() / 1000) + (60 * 60)}, key, {algorithm: 'RS256'});
const anotherToken = jwt.sign({foo: 'bar', sub: 'bob', exp: Math.floor(Date.now() / 1000) + (60 * 60)}, key, {algorithm: 'RS256'});
const nonExpiringToken = jwt.sign({foo: 'bar', sub: 'alice'}, key, {algorithm: 'RS256'});
const expiredToken = jwt.sign({foo: 'bar', exp: Math.floor(Date.now() / 1000) - (60 * 60)}, key, {algorithm: 'RS256'});
const invalidSignature = jwt.sign({foo: 'bar'}, invalidKey, {algorithm: 'RS256'});
const noSubject = jwt.sign({foo: 'bar', exp: Math.floor(Date.now() / 1000) + (60 * 60)}, key, {algorithm: 'RS256'});

// Start test
const app = require('../src/app');
const server = supertest(app);


nock('http://fairspace.io')
    .get('/api/collections/1/permissions')
    .times(100)
    .reply(200, [{collection: 1, subject: 'alice', access: 'Manage'}]);

nock('http://fairspace.io')
    .get('/api/collections/2/permissions')
    .times(100)
    .reply(200, [{collection: 2, subject: 'alice', access: 'Write'}, {collection: 2, subject: 'bob', access: 'Manage'}]);

describe('Titan', () => {
    before(() => fs.mkdirSync(process.env.FILES_FOLDER));

    after(() => fs.removeSync(process.env.FILES_FOLDER));

    it('responds to / anonymously', () => server.get('/').expect(200, 'Hi, I\'m Titan!'));
    it('responds to /api/storage/webdav/ when the directory is present and authorization is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Bearer ' + token)
            .expect(207)
    );
});

describe('Authentication', () => {
    before(() => fs.mkdirSync(process.env.FILES_FOLDER));

    after(() => fs.removeSync(process.env.FILES_FOLDER));

    it('responds to /api/storage/webdav/ when authorization without expiry is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Bearer ' + nonExpiringToken)
            .expect(207)
    );
    it('responds a 401 to /api/storage/webdav/ when no authorization is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .expect(401)
    );
    it('responds a 401 to /api/storage/webdav/ when invalid authorization is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Bearer invalidtoken')
            .expect(401)
    );
    it('responds a 401 to /api/storage/webdav/ when invalid authorization is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Bearer ' + expiredToken)
            .expect(401)
    );
    it('responds a 401 to /api/storage/webdav/ when authorization with invalid signature is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Bearer ' + invalidSignature)
            .expect(401)
    );
    it('responds a 401 to /api/storage/webdav/ when authorization with no subject claim is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Bearer ' + noSubject)
            .expect(401)
    );
});

describe('Webdav', () => {
    beforeEach(() => fs.mkdirSync(process.env.FILES_FOLDER));

    afterEach(() => fs.removeSync(process.env.FILES_FOLDER));


    it('a user can create and delete a top-level directory', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer ' + token)
            .expect(201)
            .then(() => server
                .delete('/api/storage/webdav/1')
                .set('Authorization', 'Bearer ' + token)
                .expect(200))
    );

    it('a user without manage permission cannot delete other\'s top-level directories', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer ' + token)
            .expect(201)
            .then(() => server
                .propfind('/api/storage/webdav/1')
                .set('Authorization', 'Bearer ' + anotherToken)
                .expect(401))
    );

    it('a user without read permission cannot read other\'s top-level directories', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer ' + token)
            .expect(201)
            .then(() => server
                .delete('/api/storage/webdav/1')
                .set('Authorization', 'Bearer ' + anotherToken)
                .expect(401))
    );

    it('a user with read permission can read other\'s top-level directories', () =>
        server
            .mkcol('/api/storage/webdav/2')
            .set('Authorization', 'Bearer ' + anotherToken)
            .expect(201)
            .then(() => server
                .propfind('/api/storage/webdav/2')
                .set('Authorization', 'Bearer ' + token)
                .expect(207))
    );

    it('a user can create and delete subdirectories', () =>
        server
            .mkcol('/api/storage/webdav/1')
            .set('Authorization', 'Bearer ' + token)
            .expect(201)
            .then(() =>  server
                .mkcol('/api/storage/webdav/1/subdir')
                .set('Authorization', 'Bearer ' + token)
                .expect(201))
            .then(() => server
                .delete('/api/storage/webdav/1/subdir')
                .set('Authorization', 'Bearer ' + token)
                .expect(200))
    );
});


function mockPublicKeyset() {
    const publicKeyset = {
        keys: jwks.keys.map(key => ({
            "kty": key.kty,
            "e": key.e,
            "use": key.use,
            "kid": key.kid,
            "alg": key.alg,
            "n": key.n
        }))
    };

    // Mock keyset provider
    require('../src/auth/verify-jwt-with-jwks').keySetProvider = () => Promise.resolve(publicKeyset);
}
