package io.fairspace.saturn.config;

import io.fairspace.oidc_auth.model.OAuthAuthenticationToken;
import org.apache.jena.rdfconnection.RDFConnection;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.function.Supplier;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;

@RunWith(MockitoJUnitRunner.class)
public class ServicesTest {
    @Mock
    private RDFConnection rdf;

    @Mock
    private Supplier<OAuthAuthenticationToken> userInfoSupplier;

    private Config config = new Config();

    private Services svc;


    @Before
    public void before() throws Exception {
        svc = new Services(config, rdf, userInfoSupplier);
    }

    @Test
    public void getConfig() {
        assertEquals(config, svc.getConfig());
    }

    @Test
    public void getRdf() {
        assertEquals(rdf, svc.getRdf());
    }

    @Test
    public void getUserInfoSupplier() {
        assertEquals(userInfoSupplier, svc.getUserInfoSupplier());
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
    public void getEventService() {
        assertNotNull(svc.getEventService());
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