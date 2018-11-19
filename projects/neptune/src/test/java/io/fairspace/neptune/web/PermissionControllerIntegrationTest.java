package io.fairspace.neptune.web;

import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.service.PermissionService;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.Collections;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles({"test", "noAuth"})
@DirtiesContext
public class PermissionControllerIntegrationTest {
    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @MockBean
    private PermissionService permissionService;

    private Long collectionId = 247L;

    private Collection collection = Collection.builder()
            .id(collectionId)
            .name("Collection")
            .build();

    private Permission permission = Permission.builder()
            .access(Access.Write)
            .collection(collection)
            .subject("my-subject")
            .build();

    @Test
    public void testPermissionRetrieval() {
        // Setup
        List<Permission> permissions = Collections.singletonList(permission);
        doReturn(permissions).when(permissionService).getByCollection(collectionId);

        // Test
        String path = "/" + collectionId + "/permissions";
        ParameterizedTypeReference<List<io.fairspace.neptune.model.dto.Permission>> permissionListReference = new ParameterizedTypeReference<List<io.fairspace.neptune.model.dto.Permission>>() {};
        ResponseEntity<List<io.fairspace.neptune.model.dto.Permission>> response = restTemplate.exchange("http://localhost:" + port + path, HttpMethod.GET, null, permissionListReference);
        List<io.fairspace.neptune.model.dto.Permission> collectionList = response.getBody();

        // Verify response
        assertEquals(1, collectionList.size());
        io.fairspace.neptune.model.dto.Permission expectedCollection =
                new io.fairspace.neptune.model.dto.Permission(permission.getSubject(), collectionId, permission.getAccess());
        assertEquals(expectedCollection, collectionList.get(0));

        assertEquals("max-age=60", response.getHeaders().getFirst("Cache-Control"));
    }

    @Test
    public void testPermissionStorage() {
        // Setup
        doReturn(permission).when(permissionService).authorize("a", 40L, Access.Read, false);

        // Test
        String path = "/permissions";
        String json = "{\"subject\": \"a\", \"collection\": 40, \"access\": \"Read\"}";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> httpEntity = new HttpEntity<>(json, headers);
        ResponseEntity<io.fairspace.neptune.model.dto.Permission> response = restTemplate.exchange("http://localhost:" + port + path, HttpMethod.PUT, httpEntity, io.fairspace.neptune.model.dto.Permission.class);
        io.fairspace.neptune.model.dto.Permission storedCollection = response.getBody();

        // Verification
        verify(permissionService).authorize("a", 40L, Access.Read, false);
        assertEquals(permission.getSubject(), storedCollection.getSubject());
        assertEquals(permission.getAccess(), storedCollection.getAccess());
        assertEquals(collectionId, storedCollection.getCollection());
    }

    @Test
    public void testPermissionStorageWithoutCollection() {
        // Setup
        doReturn(permission).when(permissionService).authorize("a", 40L, Access.Read, false);

        // Test
        String path = "/permissions";
        String json = "{\"subject\": \"a\", \"access\": \"Read\"}";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> httpEntity = new HttpEntity<>(json, headers);
        ResponseEntity<io.fairspace.neptune.model.dto.Permission> response = restTemplate.exchange("http://localhost:" + port + path, HttpMethod.PUT, httpEntity, io.fairspace.neptune.model.dto.Permission.class);

        assertEquals(400, response.getStatusCodeValue());
    }
}
