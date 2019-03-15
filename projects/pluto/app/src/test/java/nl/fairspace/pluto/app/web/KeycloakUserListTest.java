package nl.fairspace.pluto.app.web;

import nl.fairspace.pluto.app.config.dto.KeycloakConfig;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@RunWith(MockitoJUnitRunner.class)
public class KeycloakUserListTest {
    @Mock
    RestTemplate restTemplate;

    KeycloakConfig config = new KeycloakConfig(
            "http://get-users/%s?%s",
            "group-name",
            "http://get-groups"
    );

    KeycloakUserList keycloakUserList;

    @Before
    public void setUp() throws Exception {
        keycloakUserList = new KeycloakUserList(restTemplate, config);
    }

    @Test
    public void testUserResponse() {
        String groupId = "group-id";
        String userUri = getUserUri(groupId);
        mockGroupResponse(groupId, "name");
        mockUserResponse(userUri, "users");

        ResponseEntity<String> userListResponse = keycloakUserList.getUsers("");

        // Expect the response from the server to be passed through
        assertEquals(200, userListResponse.getStatusCodeValue());
        assertEquals("users", userListResponse.getBody());
    }


    @Test
    public void testWhetherGroupIdIsRetrievedAndCached() {
        String groupId = "group-id";
        String userUri = getUserUri(groupId);
        mockGroupResponse(groupId, "name");
        mockUserResponse(userUri, "users");

        keycloakUserList.getUsers("");

        // Expect a single call for the group id
        verify(restTemplate, times(1)).exchange(eq(config.getGroupUri()), eq(HttpMethod.GET), any(), any(ParameterizedTypeReference.class));

        // Retrieve the users again
        keycloakUserList.getUsers("");

        // Expect a single call for the group id, but two for the users
        verify(restTemplate, times(1)).exchange(eq(config.getGroupUri()), eq(HttpMethod.GET), any(), any(ParameterizedTypeReference.class));
        verify(restTemplate, times(2)).exchange(eq(userUri), eq(HttpMethod.GET), any(), any(Class.class));
    }

    @Test
    public void testWhetherGroupIdErrorIsReturnedProperly() {
        doThrow(new RuntimeException("Test-error"))
                .when(restTemplate).exchange(eq(config.getGroupUri()), eq(HttpMethod.GET), any(), any(ParameterizedTypeReference.class));

        ResponseEntity<String> userListResponse = keycloakUserList.getUsers("");

        assertEquals(500, userListResponse.getStatusCodeValue());
    }

    @Test
    public void testWhetherQueryStringIsForwarded() {
        String groupId = "group-id";
        String query = "first=1&max=4";
        String userUri = getUserUri(groupId, query);
        mockGroupResponse(groupId, "name");
        mockUserResponse(userUri, "users");

        keycloakUserList.getUsers(query);
        verify(restTemplate).exchange(eq(userUri), eq(HttpMethod.GET), any(), any(Class.class));
    }

    private void mockUserResponse(String userUri, String users) {
        ResponseEntity<String> groupResponse = ResponseEntity.ok(users);
        doReturn(groupResponse).when(restTemplate).exchange(eq(userUri), eq(HttpMethod.GET), any(), any(Class.class));
    }

    private void mockGroupResponse(String id, String name) {
        ResponseEntity<List<KeycloakUserList.GroupInfo>> groupResponse = ResponseEntity.ok(
                Collections.singletonList(new KeycloakUserList.GroupInfo(id, name))
        );
        doReturn(groupResponse).when(restTemplate).exchange(eq(config.getGroupUri()), eq(HttpMethod.GET), any(), any(ParameterizedTypeReference.class));
    }

    private String getUserUri(String groupName) {
        return getUserUri(groupName, "");
    }

    private String getUserUri(String groupName, String query) {
        return String.format(config.getUsersUriPattern(), groupName, query);
    }
}
