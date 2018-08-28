process.env.FILES_FOLDER = __dirname;

const supertest = require('supertest');
const fs = require('fs');
const jwks = JSON.parse(fs.readFileSync(__dirname + '/jwks.json'));

// Mock keyset provider
require('../src/auth/verify-jwt-with-jwks').keySetProvider = () => Promise.resolve(jwks);

// Start test
const app = require('../src/app');
const server = supertest(app);

// Create valid authorization tokens (valid one expires in 2028)
// For some reason, when generating the tokens on the fly,
// the test failed once every 5 or 6 runs.
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJleHAiOjE4NTA4MjQ3MTgsImlhdCI6MTUzNTQ2NDcxOH0.eCT_gijss7ijgGRL7YUSLlvmMvyazGZXoaFduwiwkD0'
const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmb28iOiJiYXIiLCJleHAiOjE1MzU0NjExMTgsImlhdCI6MTUzNTQ2NDcxOH0.GxFWrs6RBmi-Ocz2qfCbNrZ5EGMQBeKKApuwbSICqjs';

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


})
