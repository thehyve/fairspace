package io.fairspace.saturn.auth;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import spark.Request;

import java.util.List;
import java.util.Set;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.mockito.Mockito.doReturn;

@RunWith(MockitoJUnitRunner.class)
public class VocabularyAuthorizationVerifierTest {
    private static final String dataStewardRole = "data-steward";
    private static final UserInfo DATASTEWARD = new UserInfo(
            "data-steward",
            "data-steward",
            "Data Steward",
            "datasteward@fairspace.com",
            Set.of("other-role", dataStewardRole, "additional-role")
    );

    private static final UserInfo REGULAR_USER = new UserInfo(
            "regular-user",
            "regular-user",
            "Regular User",
            "user@fairspace.com",
            Set.of("other-role", "additional-role")
    );

    @Mock
    Request request;

    private UserInfo currentUser;
    private VocabularyAuthorizationVerifier authorizationVerifier;

    @Before
    public void setUp() throws Exception {
        authorizationVerifier = new VocabularyAuthorizationVerifier(() -> currentUser, dataStewardRole);
    }

    @Test
    public void testGetRequestsAreAllowedForAnyone() {
        doReturn("GET").when(request).requestMethod();

        currentUser = DATASTEWARD;
        assertEquals(AuthorizationResult.AUTHORIZED, authorizationVerifier.verify(request));

        currentUser = REGULAR_USER;
        assertEquals(AuthorizationResult.AUTHORIZED, authorizationVerifier.verify(request));
    }

    @Test
    public void testOtherRequestsAreAllowedForDataStewards() {
        List<String> restictedMethods = List.of("PUT", "PATCH", "DELETE");

        restictedMethods.forEach(method -> {
            doReturn(method).when(request).requestMethod();

            currentUser = DATASTEWARD;
            assertEquals(AuthorizationResult.AUTHORIZED, authorizationVerifier.verify(request));

            currentUser = REGULAR_USER;
            assertFalse(authorizationVerifier.verify(request).isAuthorized());
        });
    }

    @Test
    public void testNoUserInfoMeansInvalid() {
        doReturn("PUT").when(request).requestMethod();
        currentUser = null;
        assertFalse(authorizationVerifier.verify(request).isAuthorized());
    }

}
