const request = require('superagent');
const expect = require('expect.js');
const config = require('./config');

getPropertyValue = (jsonld, predicate) => {
    if(!jsonld || !jsonld['@context'])
        return undefined;

    const predicateContext = Object.entries(jsonld['@context'])
        .find(([key, value]) =>
            value && value['@id'] && value['@id'] === predicate
        )

    if(!predicateContext)
        return undefined;

    // Return data as an array
    const data = jsonld[predicateContext[0]]

    return Array.isArray(data) ? data : [data];
};

getMetadataForSubject = async (subject, sessionCookie) => {
    const response = await request
        .get(config.workspaceUri + '/api/metadata/statements')
        .query({subject: subject})
        .accept('application/ld+json')
        .set('Cookie', sessionCookie);

    expect(response.status).to.equal(200);

    return response.body
};

module.exports = {
    getPropertyValue,
    getMetadataForSubject
}
