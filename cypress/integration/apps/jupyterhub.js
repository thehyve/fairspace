describe('JupyterHub', function () {
    const maxJupyterStartupTime = 90000;

    it('should have SSO with Fairspace', () => {
        openJupyter();

        // Wait for the launcher to be visible
        cy.get(".p-TabBar-tabLabel").contains("Launcher").should('exist');
    });

    it('should show the collections present in fairspace', () => {
        openJupyter();

        // Go to the root of the user directory
        cy.get('.jp-FileBrowser-crumbs [title="Home"]').click();

        // Expect the directory 'collections' to be present and click on it
        cy.contains('.jp-DirListing-item', 'collections').dblclick();

        // Expect the collections present in fairspace to be available as directories
        cy.request('/api/collections')
            .then(data => {
                expect(data.status).to.equal(200);

                // TODO: Verify that other collections are not visible. However, this depends
                // on a fix for VRE-305
                // cy.contains('.jp-DirListing-item').its('length').should('equal', data.body.length);

                return Promise.all(data.body.map(
                    collection => cy.contains('.jp-DirListing-item', collection.location).should('exist')
                ));
            });

    });

    it('should share files with fairspace', () => {
        const filename = 'myfile.txt';
        cy.request('/api/collections')
            .then(data => {
                expect(data.status).to.equal(200);

                // Choose the first collection
                const collection = data.body.filter(c => c.access === 'Manage')[0];

                // Add a file via fairspace
                cy.uploadFileFast(collection.id, '', filename);

                openJupyter();

                // Go to the root of the user directory
                cy.get('.jp-FileBrowser-crumbs [title="Home"]').click();

                // Go into the collection directory
                cy.contains('.jp-DirListing-item', 'collections').dblclick();
                cy.contains('.jp-DirListing-item', collection.location).dblclick()

                // Verify the text file is present
                cy.contains('.jp-DirListing-item', filename);

                // Create a new directory
                cy.get('.jp-ToolbarButton [title="New Folder"]').click();

                // Verify the new directory is visible in fairspace
                cy.visit("/collections/" + collection.id);
                cy.contains("tr", "Untitled Folder").should("exist");
            });
    });

    it('should logout from jupyter when logging out from fairspace', () => {
        let jupyterUrl = '';

        // Go to Jupyter first
        openJupyter();

        // Store the URL
        cy.url().then(url => jupyterUrl = url);

        // Log out from Fairspace
        cy.visit("");
        cy.get("header").within(() => {
            cy.contains("span", "First User").click();
            cy.contains("li", "Logout").click();
        })

        // Wait for fairspace.com to load
        cy.url().should("not.contain", "workspace");

        // Go back to jupyter url
        cy.visit(jupyterUrl);

        // Expect the keycloak page to show up
        cy.url().should("contain", "keycloak.hyperspace");

    })

    const openJupyter = () => {
        // For some reason, when running multiple tests against Jupyter
        // the user is logged out between tests. This is most probably caused
        // by the JSESSIONID cookie being removed.
        // The easiest fix is to login again
        cy.login();

        // Go to a metadata page about a patient
        cy.visit("/notebooks");

        // Wait for the page to show 'Metadata' (which indicates that metadata has been loaded)
        cy.get("main").contains("a", "Open").click();

        // Ensure we are on the JupyterHub page
        cy.url().should('include', 'jupyterhub');

        // Wait for the server to start
        cy.contains("Your server is starting up", { timeout: maxJupyterStartupTime }).should("not.exist");
        cy.get('#jupyterlab-splash').should('exist');
        cy.get('#jupyterlab-splash').should('not.exist');
    }

});
