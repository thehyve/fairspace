package io.fairspace.saturn.webdav.milton;

import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import io.fairspace.saturn.webdav.vfs.resources.rdf.DirectoryRdfResource;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class VfsBackedMiltonResourceFactoryTest {
    private String contextPath = "/testing";

    @Mock
    private VfsResourceFactory resourceFactory;

    @Test
    public void testGetResource() throws NotAuthorizedException, BadRequestException {
        VfsBackedMiltonResourceFactory factory = new VfsBackedMiltonResourceFactory(null, resourceFactory);

        DirectoryRdfResource root = mock(DirectoryRdfResource.class);
        DirectoryRdfResource dir1 = mock(DirectoryRdfResource.class);
        when(root.getName()).thenReturn("root");
        when(dir1.getName()).thenReturn("dir1");

        when(resourceFactory.getResource("/testing")).thenReturn(root);
        when(resourceFactory.getResource("/testing/dir1")).thenReturn(dir1);

        assertEquals("root", factory.getResource(null, "/testing").getName());
        assertEquals("dir1", factory.getResource(null, "/testing/dir1").getName());
        assertNull(factory.getResource(null, "/dir1"));
        assertNull(factory.getResource(null, "/testing/testing/dir1"));
    }

    @Test
    public void testGetResourceWithContextPath() throws NotAuthorizedException, BadRequestException {
        VfsBackedMiltonResourceFactory factory = new VfsBackedMiltonResourceFactory(contextPath, resourceFactory);

        DirectoryRdfResource root = mock(DirectoryRdfResource.class);
        DirectoryRdfResource dir1 = mock(DirectoryRdfResource.class);
        when(root.getName()).thenReturn("root");
        when(dir1.getName()).thenReturn("dir1");

        when(resourceFactory.getResource("")).thenReturn(root);
        when(resourceFactory.getResource("/dir1")).thenReturn(dir1);

        assertEquals("root", factory.getResource(null, "/testing").getName());
        assertEquals("dir1", factory.getResource(null, "/testing/dir1").getName());
        assertNull(factory.getResource(null, "/testingdir1"));
        assertNull(factory.getResource(null, "/testing/testing/dir1"));
    }

    @Test
    public void testGetResourceWithTrailingSlashes() throws NotAuthorizedException, BadRequestException {
        VfsBackedMiltonResourceFactory factory = new VfsBackedMiltonResourceFactory(contextPath, resourceFactory);

        DirectoryRdfResource root = mock(DirectoryRdfResource.class);
        DirectoryRdfResource dir1 = mock(DirectoryRdfResource.class);
        when(root.getName()).thenReturn("root");
        when(dir1.getName()).thenReturn("dir1");

        when(resourceFactory.getResource("")).thenReturn(root);
        when(resourceFactory.getResource("/dir1")).thenReturn(dir1);

        // Trailing slashes should not matter for the resource retrieval
        assertEquals("root", factory.getResource(null, "/testing").getName());
        assertEquals("root", factory.getResource(null, "/testing/").getName());
        assertEquals("root", factory.getResource(null, "/testing/////").getName());
        assertEquals("dir1", factory.getResource(null, "/testing/dir1").getName());
        assertEquals("dir1", factory.getResource(null, "/testing/dir1//").getName());
        assertEquals("dir1", factory.getResource(null, "/testing/dir1//").getName());

        // Multiples slashes within the uri do matter
        assertNull(factory.getResource(null, "/testing//dir1"));
    }

    @Test
    public void testGetResourceOutsideContextPath() throws NotAuthorizedException, BadRequestException {
        VfsBackedMiltonResourceFactory factory = new VfsBackedMiltonResourceFactory(contextPath, resourceFactory);
        Resource resource = factory.getResource(null, "/outside/testing/dir1");

        assertNull(resource);
    }


    @Test
    public void testGetNullResource() throws NotAuthorizedException, BadRequestException {
        VfsBackedMiltonResourceFactory factory = new VfsBackedMiltonResourceFactory(contextPath, resourceFactory);
        Resource resource = factory.getResource(null, null);

        assertNull(resource);
    }
}
