// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add('uploadFile', (selector, fileUrl, type = '') => {
    return cy.fixture(fileUrl, 'base64')
        .then(Cypress.Blob.base64StringToBlob)
        .then(blob => {
            const nameSegments = fileUrl.split('/');
            const name = nameSegments[nameSegments.length - 1];
            const testFile = new window.File([blob], name, { type });
            const event = { dataTransfer: { files: [testFile] }, force: true };
            return cy.get(selector).trigger('drop', event)
        })
});

Cypress.Commands.add("uploadFileFast", (collectionId, path = '', filename = 'myfile.txt') => {
    cy.fixture(filename, 'binary')
        .then(data =>
            // Find collection details
            cy.request('/api/collections/' + collectionId)
                .then(response => {
                    expect(response.status).to.equal(200);

                    const fileUrl = '/api/storage/webdav/' + response.body.location + path + '/' + filename;

                    // Perform file upload
                    return cy.request({
                        method: 'PUT',
                        url: fileUrl,
                        body: data,
                        headers: {'Content-length': data.length}
                    }).then(response => {
                        expect(response.status).to.equal(201);
                        return fileUrl;
                    })
                })

        );
});

