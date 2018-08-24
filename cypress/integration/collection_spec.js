describe('e2e tests checking collections for Fairspace', function () {
    beforeEach(() => {
        cy.visit('');
        cy.url().should('include', '/auth/realms');
        cy.get('input[name=username]').type(Cypress.config("user_name"));
        cy.get('input[name=password').type(Cypress.config("password") + '{enter}');
    });

    it('successfully log in', function () {
        cy.url().should('include', 'https://workspace.ci.test.fairdev.app/');
        cy.getCookie('JSESSIONID').should('exist');
    });

    it('successfully see list of collections', function () {
        cy.contains("Collections").click();
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                cy.get('table');
                cy.get('tbody').find('tr').should('length.above', 0);
        });
    });

    it('successfully add collection', function () {
        cy.contains("Collections").click();
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                let number = 0;
                cy.get('tbody>tr').each(() => {
                    number += 1;
                   return number;
                }).then(() => {
                    cy.get('button').contains("add").click();
                    cy.get('tbody>tr').should('length.above', number);
                })
            });
    });

    it('successfully change name of collection', function () {
        cy.contains("Collections").click();
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                cy.get('tbody');
                cy.get('tr').find('th').contains("Test workspace-ci's collection").click();
                cy.wait(1000);
                cy.get('h2').contains("Test workspace-ci's collection").click();
                cy.get('input[name=name]').clear().type('test change name');
                cy.get('button').contains('Save').click();
                cy.get('ul>li').should('contain', 'test change name');
            });
    });

    it('successfully change description of collection', function () {
        cy.contains("Collections").click();
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                cy.get('tbody');
                cy.get('tr').find('th').contains("test change name").click();
                cy.wait(1000);
                cy.get('h2').contains("test change name").click();
                cy.get('textarea[name=description]').clear().type('this is just a test');
                cy.get('button').contains('Save').click();
                cy.wait(500);
                cy.get('ul>li').should('contain', 'this is just a test');
            });
    });

    it('successfully deletes a collection', function () {
        cy.get("a").contains("home").click({force: true});
        cy.contains("Collections").click({force: true});
        cy.request("/metadata/collections", "GET").as("getCollections")
            .then(() => {
                let number = 0;
                cy.get('tbody>tr').each(() => {
                    number += 1;
                    return number;
                }).then(() => {
                    cy.get("tbody>tr").each(($rows) => {
                        const txt = $rows.text();
                        if (txt.includes("test change name")) {
                            $rows.find("button").click();
                        }
                    });
                }).then(() => {
                    cy.get('tbody>tr').should('length.below', number);
                });
            });
    });

});
