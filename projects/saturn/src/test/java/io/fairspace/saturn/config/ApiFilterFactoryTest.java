package io.fairspace.saturn.config;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.junit.Assert.assertNotNull;

@RunWith(MockitoJUnitRunner.class)
public class ApiFilterFactoryTest {
    @Mock
    private Services svc;

    @Test
    public void itCreatesAFilter() {
        assertNotNull(ApiFilterFactory.createApiFilter("/some/path", svc, new Config()));
    }
}