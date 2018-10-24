Cypress.Commands.add("clickButtonOnHover", (row, buttonSelector = 'button') =>
    cy.wrap(row).within($row =>
        cy
            .get(buttonSelector)

            // Make button visible
            .then(button => {
                button.attr('visibility', 'visible');
                button.parent().css('visibility', 'visible');

                return cy.wait(10);
            })

            // Click the button
            .then(() => cy.get(buttonSelector).click({force:true}))
    )
);
