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

getMetadataForSubject = async (subject, authenticatedRequest) => {
    const response = await authenticatedRequest('GET', config.workspaceUri + '/api/metadata/statements')
        .query({subject: subject})
        .accept('application/ld+json');

    expect(response.status).to.equal(200);

    return response.body
};

module.exports = {
    getPropertyValue,
    getMetadataForSubject
}
