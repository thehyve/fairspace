package io.fairspace.neptune.service;

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
    private AuthorizationService authorizationService;

    @Mock
    private AuthorizationRepository authorizationRepository;

    @Mock
    private CollectionRepository collectionRepository;

    private Collection collection1 = new Collection(1L, Collection.CollectionType.LOCAL_FILE, "location", null);

    @Before
    public void setUp() {
        authorizationService = new AuthorizationService(authorizationRepository, collectionRepository);

        when(collectionRepository.findById(0L))
                .thenReturn(Optional.empty());

        when(collectionRepository.findById(1L))
                .thenReturn(Optional.of(collection1));

        when(authorizationRepository.findByUserAndCollectionId("user1", collection1))
                .thenReturn(Optional.of(new Authorization(1L, "user1", collection1.getId(), Permission.Manage)));

        when(authorizationRepository.save(any())).thenAnswer(invocation -> invocation.getArguments()[0]);
    };

    @Test(expected = CollectionNotFoundException.class)
    public void testGettingPermissionsForUnknownCollection() {
        authorizationService.getUserAuthorization(0L, "user1");
    }

    @Test(expected = CollectionNotFoundException.class)
    public void testAddingPermissionsForUnknownCollection() {
        authorizationService.add(new Authorization(null, "user2", 0L, Permission.Write), "user1");
    }

    @Test
    public void testGettingPermissionsForExistingCollection() {
        Authorization auth = authorizationService.getUserAuthorization(1L, "user1");

        assertEquals(Permission.Manage, auth.getPermission());

        verify(authorizationRepository).findByUserAndCollectionId(eq("user1"), eq(collection1));
    }

    @Test
    public void testAddingPermissionsForKnownCollection() {
        authorizationService.add(new Authorization(null, "user2", 1L, Permission.Write), "user1");
        verify(authorizationRepository).save(any());
    }

    @Test
    public void testSettingNoneAccess() {
        authorizationService.add(new Authorization(null, "user1", 1L, Permission.None), "user1");
        verify(authorizationRepository).delete(any());
    }

    @Test(expected = AccessDeniedException.class)
    public void testGrantingAccessWithoutPermission() {
        authorizationService.add(new Authorization(null, "user2", 1L, Permission.Manage), "user2");
    }

}
