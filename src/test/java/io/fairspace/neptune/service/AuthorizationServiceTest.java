package io.fairspace.neptune.service;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.repository.AuthorizationRepository;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.access.AccessDeniedException;

import java.util.Optional;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class AuthorizationServiceTest {


    @Mock
    private AuthorizationContainer authorizationContainer;

    @Mock
    private AuthorizationRepository authorizationRepository;

    @Mock
    private CollectionRepository collectionRepository;

    private Collection collection1 = new Collection(1L, "location", "name", "description", null);

    private AuthorizationService authorizationService;

    @Before
    public void setUp() {
        authorizationService = new AuthorizationService(authorizationRepository, collectionRepository, authorizationContainer);


        when(collectionRepository.findById(0L))
                .thenReturn(Optional.empty());

        when(collectionRepository.findById(1L))
                .thenReturn(Optional.of(collection1));

        when(authorizationRepository.findByUserAndCollectionId("creator", collection1))
                .thenReturn(Optional.of(new Authorization(1L, "creator", collection1.getId(), Permission.Manage)));

        when(authorizationRepository.save(any())).thenAnswer(invocation -> invocation.getArguments()[0]);
    }

    ;

    @Test(expected = CollectionNotFoundException.class)
    public void testGettingPermissionsForUnknownCollection() {
        authorizationService.getUserAuthorization(0L);
    }

    @Test(expected = CollectionNotFoundException.class)
    public void testAddingPermissionsForUnknownCollection() {
        authorizationService.authorize(new Authorization(null, "user2", 0L, Permission.Write));
    }

    @Test
    public void testGettingPermissionsForExistingCollection() {
        as("creator", () -> {
            Authorization auth = authorizationService.getUserAuthorization(1L);

            assertEquals(Permission.Manage, auth.getPermission());

            verify(authorizationRepository).findByUserAndCollectionId(eq("creator"), eq(collection1));
        });
    }

    @Test
    public void testAddingPermissionsForKnownCollection() {
        as("creator", () -> {
            authorizationService.authorize(new Authorization(null, "user2", 1L, Permission.Write));
            verify(authorizationRepository).save(any());
        });
    }

    @Test
    public void testSettingNoneAccess() {
        as("creator", () -> {
            authorizationService.authorize(new Authorization(null, "creator", 1L, Permission.None));
            verify(authorizationRepository).delete(any());
        });
    }

    @Test(expected = AccessDeniedException.class)
    public void testGrantingAccessWithoutPermission() {
        as("trespasser", () ->
                authorizationService.authorize(new Authorization(null, "trespasser", 1L, Permission.Manage)));
    }

    private void as(String user, Runnable action) {
        when(authorizationContainer.getSubject()).thenReturn(user);
        action.run();
    }
}
