package io.fairspace.saturn.services.metadata;

import org.apache.jena.graph.Node;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDF;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import io.fairspace.saturn.services.users.User;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.services.workspaces.Workspace;
import io.fairspace.saturn.services.workspaces.WorkspaceService;
import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.webdav.Access;
import io.fairspace.saturn.webdav.DavFactory;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class MetadataPermissionsTest {

    @Mock
    private WorkspaceService workspaceService;

    @Mock
    private DavFactory davFactory;

    @Mock
    private UserService userService;

    @InjectMocks
    private MetadataPermissions sut;

    @Test
    public void testAdminCanReadFacets() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(true);
        when(userService.currentUser()).thenReturn(currentUser);

        // when
        var actual = sut.canReadFacets();

        // then
        assertTrue(actual);
    }

    @Test
    public void testUserWithRoleCanViewPublicMetadataCanReadFacets() {
        // given
        var currentUser = new User();
        currentUser.setCanViewPublicMetadata(true);
        when(userService.currentUser()).thenReturn(currentUser);

        // when
        var actual = sut.canReadFacets();

        // then
        assertTrue(actual);
    }

    @Test
    public void testUserWithoutRoleCanViewPublicMetadataCannotReadFacets() {
        // given
        var currentUser = new User();
        currentUser.setCanViewPublicMetadata(false);
        when(userService.currentUser()).thenReturn(currentUser);

        // when
        var actual = sut.canReadFacets();

        // then
        assertFalse(actual);
    }

    @Test
    public void testAdminCanReadMetadata() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(true);
        when(userService.currentUser()).thenReturn(currentUser);
        var mockResource = mock(Resource.class);

        // when
        var actual = sut.canReadMetadata(mockResource);

        // then
        assertTrue(actual);
    }

    @Test
    public void testCanReadMetadataOfFileSystemResourceWhichCanBeListed() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(true);
        when(davFactory.getAccess(mockResource)).thenReturn(Access.List);

        // when
        var actual = sut.canReadMetadata(mockResource);

        // then
        assertTrue(actual);
    }

    @Test
    public void testCannotReadMetadataOfFileSystemResourceWhichCanNotBeListed() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(true);
        when(davFactory.getAccess(mockResource)).thenReturn(Access.None);

        // when
        var actual = sut.canReadMetadata(mockResource);

        // then
        assertFalse(actual);
    }

    @Test
    public void testCanReadMetadataOfWorkspaceWhenCanCollaborate() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(false);

        when(mockResource.hasProperty(RDF.type, FS.Workspace)).thenReturn(true);
        var mockNode = mock(Node.class);
        when(mockResource.asNode()).thenReturn(mockNode);
        Workspace ws = new Workspace();
        ws.setCanCollaborate(true);
        when(workspaceService.getWorkspace(mockNode)).thenReturn(ws);

        var actual = sut.canReadMetadata(mockResource);

        // then
        assertTrue(actual);
    }

    @Test
    public void testCanNotReadMetadataOfWorkspaceWhenCanNotCollaborate() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(false);

        when(mockResource.hasProperty(RDF.type, FS.Workspace)).thenReturn(true);
        var mockNode = mock(Node.class);
        when(mockResource.asNode()).thenReturn(mockNode);
        Workspace ws = new Workspace();
        ws.setCanCollaborate(false);
        when(workspaceService.getWorkspace(mockNode)).thenReturn(ws);

        var actual = sut.canReadMetadata(mockResource);

        // then
        assertFalse(actual);
    }

    @Test
    public void testCanReadMetadataWhenUserHasRoleCanViewPublicMetadata() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        currentUser.setCanViewPublicMetadata(true);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(false);

        when(mockResource.hasProperty(RDF.type, FS.Workspace)).thenReturn(false);

        var actual = sut.canReadMetadata(mockResource);

        // then
        assertTrue(actual);
    }

    @Test
    public void testCanNotReadMetadataWhenUserDoesNotHaveRoleCanViewPublicMetadata() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        currentUser.setCanViewPublicMetadata(false);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(false);

        when(mockResource.hasProperty(RDF.type, FS.Workspace)).thenReturn(false);

        var actual = sut.canReadMetadata(mockResource);

        // then
        assertFalse(actual);
    }

    @Test
    public void testAdminCanWriteMetadata() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(true);
        when(userService.currentUser()).thenReturn(currentUser);
        var mockResource = mock(Resource.class);

        // when
        var actual = sut.canWriteMetadata(mockResource);

        // then
        assertTrue(actual);
    }

    @Test
    public void testCanWriteMetadataOfFileSystemResourceWhichCanBeWritten() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(true);
        when(davFactory.getAccess(mockResource)).thenReturn(Access.Write);

        // when
        var actual = sut.canWriteMetadata(mockResource);

        // then
        assertTrue(actual);
    }

    @Test
    public void testCannotWriteMetadataOfFileSystemResourceWhichCanNotBeWritten() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(true);
        when(davFactory.getAccess(mockResource)).thenReturn(Access.None);

        // when
        var actual = sut.canReadMetadata(mockResource);

        // then
        assertFalse(actual);
    }

    @Test
    public void testCanWriteMetadataOfWorkspaceWhenCanManage() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(false);

        when(mockResource.hasProperty(RDF.type, FS.Workspace)).thenReturn(true);
        var mockNode = mock(Node.class);
        when(mockResource.asNode()).thenReturn(mockNode);
        Workspace ws = new Workspace();
        ws.setCanManage(true);
        when(workspaceService.getWorkspace(mockNode)).thenReturn(ws);

        var actual = sut.canWriteMetadata(mockResource);

        // then
        assertTrue(actual);
    }

    @Test
    public void testCanNotWriteMetadataOfWorkspaceWhenCanNotManageCollaborate() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(false);

        when(mockResource.hasProperty(RDF.type, FS.Workspace)).thenReturn(true);
        var mockNode = mock(Node.class);
        when(mockResource.asNode()).thenReturn(mockNode);
        Workspace ws = new Workspace();
        ws.setCanManage(false);
        when(workspaceService.getWorkspace(mockNode)).thenReturn(ws);

        var actual = sut.canWriteMetadata(mockResource);

        // then
        assertFalse(actual);
    }

    @Test
    public void testCanWriteMetadataWhenUserHasRoleCanAddSharedMetadata() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        currentUser.setCanAddSharedMetadata(true);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(false);

        when(mockResource.hasProperty(RDF.type, FS.Workspace)).thenReturn(false);

        var actual = sut.canWriteMetadata(mockResource);

        // then
        assertTrue(actual);
    }

    @Test
    public void testCanNotWriteMetadataWhenUserDoesNotHaveRoleCanAddSharedMetadata() {
        // given
        var currentUser = new User();
        currentUser.setAdmin(false);
        currentUser.setCanAddSharedMetadata(false);
        when(userService.currentUser()).thenReturn(currentUser);

        var mockResource = mock(Resource.class);
        when(davFactory.isFileSystemResource(mockResource)).thenReturn(false);

        when(mockResource.hasProperty(RDF.type, FS.Workspace)).thenReturn(false);

        var actual = sut.canReadMetadata(mockResource);

        // then
        assertFalse(actual);
    }
}
