package io.fairspace.saturn.config;

import io.fairspace.saturn.rdf.transactions.DatasetJobSupport;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.contrib.java.lang.system.EnvironmentVariables;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

@RunWith(MockitoJUnitRunner.class)
public class ServicesTest {
    @Mock
    private DatasetJobSupport dataset;
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
    public void getRdf() {
        assertEquals(dataset, svc.getDataset());
    }

    @Test
    public void getEventBus() {
        assertNotNull(svc.getEventBus());
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
        assertNotNull(svc.getPermissionsService());
    }

    @Test
    public void getCollectionsService() {
        assertNotNull(svc.getCollectionsService());
    }

    @Test
    public void getMetadataService() {
        assertNotNull(svc.getMetadataService());
    }

    @Test
    public void getUserVocabularyService() {
        assertNotNull(svc.getUserVocabularyService());
    }

    @Test
    public void getMetaVocabularyService() {
        assertNotNull(svc.getUserVocabularyService());
    }
}