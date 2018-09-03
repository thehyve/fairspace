package io.fairspace.neptune.service;

import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Authorization;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.repository.AuthorizationRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.security.core.Authentication;


import java.util.Optional;

import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class AuthorizationServiceTest {
    private AuthorizationService authorizationService;

    @Mock
    private AuthorizationRepository authorizationRepository;

    @Mock
    private CollectionRepository collectionRepository;

    @Mock
    private Authentication user1;

    @Mock
    private Authentication user2;

    @Mock
    private Authentication superuser;

    @Before
    public void setUp() {
        authorizationService = new AuthorizationService(authorizationRepository, collectionRepository);

        when(authorizationRepository.findByUserAndCollectionId(eq("user1"), any()))
                .thenReturn(Optional.of(new Authorization(1L, "user1", 1L, Permission.Read)));
        when(authorizationRepository.save(any()))
                .thenReturn(new Authorization());

        when(collectionRepository.findById(0L))
                .thenReturn(Optional.empty());
        when(collectionRepository.findById(1L))
                .thenReturn(Optional.of(new Collection(1L, Collection.CollectionType.LOCAL_FILE, "location",  null)));
    }

    @Test(expected = CollectionNotFoundException.class)
    public void testGettingPermissionsForUnknownCollection() {
        authorizationService.findByCollectionId(0L);
    }

    @Test(expected = CollectionNotFoundException.class)
    public void testAddingPermissionsForUnknownCollection() {
        authorizationService.add(new Authorization(null, "user1", 0L, Permission.Write), superuser);
    }

    @Test
    public void testGettingPermissionsForExistingCollection() {
        authorizationService.findByCollectionId(1L);
        verify(authorizationRepository).findByCollectionId(any());

        authorizationService.findByUserAndCollectionId("user1", 1L);
        verify(authorizationRepository).findByUserAndCollectionId(eq("user1"), any());

        authorizationService.findByUser("user1");
        verify(authorizationRepository).findByUser(eq("user1"));
    }

    @Test
    public void testAddingPermissionsForKnownCollection() {
        authorizationService.add(new Authorization(null, "user1", 1L, Permission.Write), superuser);
        verify(authorizationRepository).save(any());
    }

    @Test
    public void testSettingNoneAccess() {
        authorizationService.add(new Authorization(null, "user1", 1L, Permission.None), superuser);
        verify(authorizationRepository).delete(any());
    }

}
