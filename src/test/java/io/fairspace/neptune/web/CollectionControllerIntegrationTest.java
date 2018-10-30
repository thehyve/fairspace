package io.fairspace.neptune.web;

import io.fairspace.neptune.service.CollectionMetadataService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Collections;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "noAuth"})
@DirtiesContext
public class CollectionControllerIntegrationTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @MockBean
    private CollectionMetadataService collectionMetadataService;

    @Test
    public void testUriRetrieval() {
        // Setup
        ParameterizedTypeReference<Map<String, String>> uriMapReference = new ParameterizedTypeReference<Map<String, String>>() {};

        doReturn("http://test").when(collectionMetadataService).getCollectionUriByLocation("loc");
        doThrow(new CollectionNotFoundException()).when(collectionMetadataService).getCollectionUriByLocation("unknown");
        String path = "/uri";
        ResponseEntity<Map<String, String>> response;

        // Test
        response = restTemplate.exchange("http://localhost:" + port + path + "?location=loc", HttpMethod.GET, null, uriMapReference);
        assertEquals(Collections.singletonMap("uri", "http://test"), response.getBody());

        response = restTemplate.exchange("http://localhost:" + port + path + "?location=unknown", HttpMethod.GET, null, uriMapReference);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());

        response = restTemplate.exchange("http://localhost:" + port + path, HttpMethod.GET, null, uriMapReference);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

}
