package io.fairspace.saturn.config;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import io.fairspace.saturn.config.properties.FeatureProperties;
import io.fairspace.saturn.config.properties.KeycloakClientProperties;

import static org.junit.Assert.assertNotNull;

@RunWith(MockitoJUnitRunner.class)
public class SparkFilterFactoryTest {
    @Mock
    private Services svc;

    @Test
    public void itCreatesAFilter() {
        assertNotNull(SparkFilterFactory.createSparkFilter(
                "/some/path", svc, new KeycloakClientProperties(), new FeatureProperties(), ""));
    }
}
