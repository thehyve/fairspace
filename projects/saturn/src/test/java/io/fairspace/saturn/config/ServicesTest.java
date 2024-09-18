package io.fairspace.saturn.config;

import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.contrib.java.lang.system.EnvironmentVariables;

import io.fairspace.saturn.config.properties.FeatureProperties;
import io.fairspace.saturn.webdav.resources.ExtraStorageRootResource;

import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

public class ServicesTest {
    private final Dataset dataset = DatasetFactory.create();
    private final ViewsConfig viewsConfig = new ViewsConfig();
    private Services svc;

    @Rule
    public final EnvironmentVariables environmentVariables = new EnvironmentVariables();

    @Before
    public void before() {
        environmentVariables.set("KEYCLOAK_CLIENT_SECRET", "secret");
        svc = new Services(
                viewsConfig, dataset, new FeatureProperties(), null, null, null, null, null, null, null, "localhost");
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
    public void getPermissionsService() {
        assertNotNull(svc.getMetadataPermissions());
    }

    @Test
    public void getMetadataService() {
        assertNotNull(svc.getMetadataService());
    }

    @Test
    public void getExtraDavServlet() {
        assertNotNull(svc.getExtraBlobStore());
        assertNotNull(svc.getExtraDavFactory());
        assertNotNull(svc.getExtraDavServlet());
        assertTrue(svc.getExtraDavFactory().root instanceof ExtraStorageRootResource);
    }
}
