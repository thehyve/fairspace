package io.fairspace.saturn.config;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.contrib.java.lang.system.EnvironmentVariables;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

public class ServicesTest {
    private Dataset dataset = DatasetFactory.create();
    private Config config = new Config();
    private Services svc;

    @Rule
    public final EnvironmentVariables environmentVariables
            = new EnvironmentVariables();
    @Before
    public void before() throws Exception {
        environmentVariables.set("KEYCLOAK_CLIENT_SECRET", "secret");
        svc = new Services(config, dataset);
    }

    @Test
    public void getConfig() {
        assertEquals(config, svc.getConfig());
    }

    @Test
    public void getTransactions() {
        assertNotNull(svc.getTransactions());
    }

    @Test
    public void getUserService() {
        assertNotNull(svc.getUserService());
    }

    @Test
    public void getMailService() {
        assertNotNull(svc.getMailService());
    }

    @Test
    public void getPermissionsService() {
        assertNotNull(svc.getMetadataPermissions());
    }

    @Test
    public void getMetadataService() {
        assertNotNull(svc.getMetadataService());
    }

    @Test
    public void getUserVocabularyService() {
        assertNotNull(svc.getUserVocabularyService());
    }
}
