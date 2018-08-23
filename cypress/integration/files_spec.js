Cypress.Commands.add('upload_file', (selector, fileUrl, type = '') => {
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


describe('e2e tests checking files for Fairspace', function () {
    beforeEach(() => {
        cy.visit('');
        cy.url().should('include', '/auth/realms');
        cy.get('input[name=username]').type(Cypress.config("user_name"));
        cy.get('input[name=password').type(Cypress.config("password") + '{enter}');
    });

    it('successfully see list of files and upload one', function () {
        cy.contains("Collections").click();
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                cy.get('button').contains("add").click();
                cy.wait(500);
                cy.get('tr').find('th').contains("Test workspace-ci's collection").click().click();
            }).then(() => {
                cy.get("button[aria-label=Upload]").click();
                cy.upload_file("input[type=file]", 'myfile.csv');
                cy.get("span").contains("Close").click();
                cy.wait(1000);
                cy.get("tbody>tr>th").contains("myfile.csv");
                cy.get("tbody>tr>td>span").contains("note_open");
        })
    });

    afterEach(() => {
        cy.contains("Collections").click();
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                cy.get("tbody>tr").each(($rows) => {
                    const txt = $rows.text();
                    if (txt.includes("Test workspace-ci's collection")) {
                        $rows.find("button").click();
                    }
                });
            })
    });
});
