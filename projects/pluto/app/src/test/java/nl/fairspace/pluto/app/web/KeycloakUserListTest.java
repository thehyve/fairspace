package nl.fairspace.pluto.app.web;

import nl.fairspace.pluto.app.config.dto.KeycloakConfig;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import static org.junit.Assert.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class KeycloakUserListTest {
    @Mock
    RestTemplate restTemplate;

    KeycloakConfig config = new KeycloakConfig();

    KeycloakUserList keycloakUserList;

    @Before
    public void setUp() {
        keycloakUserList = new KeycloakUserList(restTemplate, config);
        config.setUsersUriPattern("http://get-users/?%s");
    }

    @Test
    public void testUserResponse() {
        String userUri = getUserUri();
        mockUserResponse(userUri, "users");

        ResponseEntity<String> userListResponse = keycloakUserList.getUsers("");

        // Expect the response from the server to be passed through
        assertEquals(200, userListResponse.getStatusCodeValue());
        assertEquals("users", userListResponse.getBody());
    }

    @Test
    public void testWhetherQueryStringIsForwarded() {
        String query = "first=1&max=4";
        String userUri = getUserUri(query);
        mockUserResponse(userUri, "users");

        keycloakUserList.getUsers(query);
        verify(restTemplate).exchange(eq(userUri), eq(HttpMethod.GET), any(), any(Class.class));
    }

    @Test
    public void testWhetherGroupIdIsRetrievedAndCached() {
        String userUri = getUserUri();
        mockUserResponse(userUri, "users");

        keycloakUserList.getUsers("");

        // Retrieve the users again
        keycloakUserList.getUsers("");

        // Expect two calls for the users
        verify(restTemplate, times(2)).exchange(eq(userUri), eq(HttpMethod.GET), any(), any(Class.class));
    }

    private void mockUserResponse(String userUri, String users) {
        ResponseEntity<String> groupResponse = ResponseEntity.ok(users);
        doReturn(groupResponse).when(restTemplate).exchange(eq(userUri), eq(HttpMethod.GET), any(), any(Class.class));
    }


    private String getUserUri() {
        return getUserUri("");
    }

    private String getUserUri(String query) {
        return String.format(config.getUsersUriPattern(), query);
    }
}
