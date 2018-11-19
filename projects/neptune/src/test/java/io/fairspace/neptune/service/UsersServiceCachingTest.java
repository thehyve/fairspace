package io.fairspace.neptune.service;

import io.fairspace.neptune.model.KeycloakUser;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(SpringRunner.class)
@SpringBootTest
@ActiveProfiles({"test", "noAuth"})
@DirtiesContext
public class UsersServiceCachingTest {
    @MockBean
    RestTemplate authorizedRestTemplate;

    @Autowired
    UsersService usersService;

    @Value("${app.oauth2.base-url}/auth/admin/realms/${app.oauth2.realm}/users")
    String usersUrl;

    @Before
    public void setUp() throws Exception {
        KeycloakUser user = new KeycloakUser();

        ResponseEntity<KeycloakUser> response = ResponseEntity.ok(user);
        when(authorizedRestTemplate.exchange(usersUrl + "/123", HttpMethod.GET, null, KeycloakUser.class)).thenReturn(response);
        when(authorizedRestTemplate.exchange(usersUrl + "/456", HttpMethod.GET, null, KeycloakUser.class)).thenReturn(response);
    }

    @Test
    public void testCachingIsDonePerUser() throws IOException {
        usersService.getUserById("123");
        usersService.getUserById("456");
        usersService.getUserById("123");
        usersService.getUserById("456");

        verify(authorizedRestTemplate, times(1)).exchange(usersUrl + "/123", HttpMethod.GET, null, KeycloakUser.class);
        verify(authorizedRestTemplate, times(1)).exchange(usersUrl + "/456", HttpMethod.GET, null, KeycloakUser.class);
    }

}
