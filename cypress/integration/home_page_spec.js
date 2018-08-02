describe('The Home Page', function() {
    beforeEach(() => {
        cy.visit('https://workspace.ci.test.fairdev.app/')
        cy.url().should('include', '/auth/realms')
        cy.get('input[name=username]').type('test-workspace-ci')
        cy.get('input[name=password').type('fairspace123{enter}')
    })

    it('successfully log in', function() {
        cy.url().should('include', 'https://workspace.ci.test.fairdev.app/')
        cy.getCookie('JSESSIONID').should('exist')
    })

    it('successfully see list of collections', function() {
        cy.contains("Collections").click()
        cy.get('h3')
        cy.get('ul').find('li').should('length.above', 0)
    })

    it('successfully add collection', function() {
        cy.contains("Collections").click()
        cy.get('h3')
        let number = 0
        cy.get('ul>li').each(() => {
            number += 1
            return number
        }).then(() =>{
            cy.get('button').contains("add").click()
            cy.get('ul>li').should('length.above', number)
        })
    })


    it('successfully change name of collection', function() {
        cy.contains("Collections").click()
        cy.get('h3')
        cy.get('ul').find('li').contains("Test workspace-ci's collection").click()
        cy.get('h2').contains("Test workspace-ci's collection").click()
        cy.get('input[name=name]').clear().type('test change name')
        cy.get('button').contains('Save').click()
        cy.get('ul>li').should('contain', 'test change name')
    })
});
