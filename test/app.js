process.env.FILES_FOLDER = __dirname;

const app = require('../src/app');
const supertest = require('supertest');
const server = supertest(app);

describe('Titan', () => {
    it('responds to /', () => server.get('/').expect(200, 'Hi, I\'m Titan!'));

    it('responds to /api/storage/webdav/ when the file file is present', () => server.propfind('/api/storage/webdav/').expect(207));
});
