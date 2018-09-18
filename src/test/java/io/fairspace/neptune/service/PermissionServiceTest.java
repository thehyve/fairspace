package io.fairspace.neptune.service;

import io.fairspace.neptune.config.upstream.AuthorizationContainer;
import io.fairspace.neptune.model.Access;
import io.fairspace.neptune.model.Collection;
import io.fairspace.neptune.model.Permission;
import io.fairspace.neptune.model.UnauthorizedException;
import io.fairspace.neptune.repository.CollectionRepository;
import io.fairspace.neptune.repository.PermissionRepository;
import io.fairspace.neptune.web.CollectionNotFoundException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.util.Optional;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class PermissionServiceTest {


    @Mock
    private AuthorizationContainer authorizationContainer;

    @Mock
    private PermissionRepository permissionRepository;

    @Mock
    private CollectionRepository collectionRepository;

    private Collection collection1 = new Collection(1L, "location", "name", "description", null, null, null, null );

    private PermissionService permissionService;

    @Before
    public void setUp() {
        permissionService = new PermissionService(permissionRepository, collectionRepository, authorizationContainer);


        when(collectionRepository.findById(0L))
                .thenReturn(Optional.empty());

        when(collectionRepository.findById(1L))
                .thenReturn(Optional.of(collection1));

        when(permissionRepository.findBySubjectAndCollection("creator", collection1))
                .thenReturn(Optional.of(new Permission(1L, "creator", collection1, Access.Manage)));

        when(permissionRepository.save(any())).thenAnswer(invocation -> invocation.getArguments()[0]);
    }

    @Test(expected = CollectionNotFoundException.class)
    public void testGettingPermissionsForUnknownCollection() {
        permissionService.getSubjectsPermission(0L);
    }

    @Test(expected = CollectionNotFoundException.class)
    public void testAddingPermissionsForUnknownCollection() {
        permissionService.authorize(new Permission(null, "user2", Collection.builder().id(0L).build(), Access.Write), false);
    }

    @Test
    public void testGettingPermissionsForExistingCollection() {
        as("creator", () -> {
            Permission auth = permissionService.getSubjectsPermission(1L);

            assertEquals(Access.Manage, auth.getAccess());

            verify(permissionRepository).findBySubjectAndCollection(eq("creator"), eq(collection1));
        });
    }

    @Test
    public void testAddingPermissionsForKnownCollection() {
        as("creator", () -> {
            permissionService.authorize(new Permission(null, "user2", collection1, Access.Write), true);
            verify(permissionRepository).save(any());
        });
    }

    @Test
    public void testSettingNoneAccess() {
        as("creator", () -> {
            permissionService.authorize(new Permission(null, "creator", collection1, Access.None), false);
            verify(permissionRepository).delete(any());
        });
    }

    @Test(expected = UnauthorizedException.class)
    public void testGrantingAccessWithoutPermission() {
        as("trespasser", () ->
                permissionService.authorize(new Permission(null, "trespasser", collection1, Access.Manage), false));
    }

    private void as(String user, Runnable action) {
        when(authorizationContainer.getSubject()).thenReturn(user);
        action.run();
    }
}
