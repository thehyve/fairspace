process.env.FILES_FOLDER = __dirname;

const supertest = require('supertest');
const fs = require('fs');
const jwk2pem = require('pem-jwk').jwk2pem;
const jwt = require("jsonwebtoken");
const jwks = JSON.parse(fs.readFileSync(__dirname + '/jwks.json'));
const invalidJWK = JSON.parse(fs.readFileSync(__dirname + '/invalidKey.json'));

mockPublicKeyset();

// Create valid authorization tokens
const key = jwk2pem(jwks.keys[0]);
const invalidKey = jwk2pem(invalidJWK);

const token = jwt.sign({foo: 'bar', exp: Math.floor(Date.now() / 1000) + (60 * 60)}, key, {algorithm: 'RS256'});
const nonExpiringToken = jwt.sign({foo: 'bar'}, key, {algorithm: 'RS256'});
const expiredToken = jwt.sign({foo: 'bar', exp: Math.floor(Date.now() / 1000) - (60 * 60)}, key, {algorithm: 'RS256'});
const invalidSignature = jwt.sign({foo: 'bar'}, invalidKey, {algorithm: 'RS256'});

// Start test
const app = require('../src/app');
const server = supertest(app);

describe('Titan', () => {
    it('responds to / anonymously', () => server.get('/').expect(200, 'Hi, I\'m Titan!'));
    it('responds to /api/storage/webdav/ when the file file is present and authorization is provided', () =>
        server
            .propfind('/api/storage/webdav/')
            .set('Authorization', 'Bearer ' + token)
            .expect(207)
    );
});

describe('Authentication', () => {
    it('responds to /api/storage/webdav/ when no authorization without expiry is provided', () =>
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
});

describe('Webdav', () => {
    beforeEach(() =>
        server
            .mkcol('/api/storage/webdav/tmp')
            .set('Authorization', 'Bearer ' + token)
            .expect(201)
    );

    it('can move directories properly within the /api/storage/webdav/ root', () =>
        server
            .move('/api/storage/webdav/tmp')
            .set('Authorization', 'Bearer ' + token)
            .set('Destination', '/api/storage/webdav/tmp2')
            .expect(201)
            .then(() => server
                .move('/api/storage/webdav/tmp2')
                .set('Authorization', 'Bearer ' + token)
                .set('Destination', '/api/storage/webdav/tmp')
                .expect(201))

        // Move back again to allow cleanup
    );

    afterEach(() =>
        server
            .delete('/api/storage/webdav/tmp')
            .set('Authorization', 'Bearer ' + token)
            .expect(200)
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
