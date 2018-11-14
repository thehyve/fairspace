package io.fairspace.neptune.service;

import com.github.tomakehurst.wiremock.junit.WireMockClassRule;
import io.fairspace.neptune.model.KeycloakUser;
import org.junit.Before;
import org.junit.ClassRule;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.cloud.contract.wiremock.WireMockSpring;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import static com.github.tomakehurst.wiremock.client.WireMock.aResponse;
import static com.github.tomakehurst.wiremock.client.WireMock.get;
import static com.github.tomakehurst.wiremock.client.WireMock.urlPathMatching;
import static junit.framework.TestCase.assertEquals;
import static junit.framework.TestCase.assertFalse;

@RunWith(MockitoJUnitRunner.class)
public class UsersServiceTest {
    @ClassRule
    public static WireMockClassRule wiremock = new WireMockClassRule(
            WireMockSpring.options().dynamicPort());

    UsersService usersService;

    @Before
    public void setUp() throws Exception {
        serveUsers();

        usersService = new UsersService(
                new RestTemplate(),
                "http://localhost:" + wiremock.port() + "/users");
    }

    @Test
    public void testUserParsing() throws IOException {
        List<KeycloakUser> users = usersService.getUsers();

        KeycloakUser firstUser = new KeycloakUser(
                "fa7774bd-d1d9-4638-84db-a13610d58ee9",
                "coordinator2-workspace",
                "Gregor",
                "Clegane",
                "gregor@gameofthrones.com"
        );

        assertEquals(8, users.size());
        assertEquals(firstUser, users.get(0));
    }

    @Test
    public void testSingleUserRetrieval() throws IOException {
        Optional<KeycloakUser> user = usersService.getUserById("ce5b827a-9e61-4c32-9b8b-2351561c1b9c");

        KeycloakUser expectedUser = new KeycloakUser(
                "ce5b827a-9e61-4c32-9b8b-2351561c1b9c",
                "potus",
                "Donald",
                "Trump",
                "potus@whitehouse.gov"
        );

        assertEquals(expectedUser, user.get());
    }

    @Test
    public void testSingleUserNotFound() throws IOException {
        Optional<KeycloakUser> user = usersService.getUserById("non-existing-id");
        assertFalse(user.isPresent());
    }

    private void serveUsers() {
        wiremock.stubFor(get(urlPathMatching("^/users"))
                .willReturn(
                        aResponse()
                                .withHeader("Content-Type", "application/json")
                                .withBodyFile("users.json")
                )
        );
    }


}
