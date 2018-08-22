package io.fairspace.neptune.service;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.junit.Assert.*;

@RunWith(MockitoJUnitRunner.class)
public class CollectionMetadataServiceTest {

    @Mock
    TripleService tripleService;

    CollectionMetadataService service;

    @Before
    public void setUp() throws Exception {
        service = new CollectionMetadataService(tripleService, "http://example-base-url");
    }

    @Test
    public void testGetUri() {
        assertEquals("http://example-base-url/iri/collections/12", service.getUri(12L));
    }
}