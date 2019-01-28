package io.fairspace.saturn.webdav.milton;

import io.fairspace.saturn.webdav.vfs.VirtualFileSystem;
import io.fairspace.saturn.webdav.vfs.contents.VfsContentFactory;
import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import io.fairspace.saturn.webdav.vfs.resources.VfsUser;
import io.fairspace.saturn.webdav.vfs.resources.rdf.RdfDirectoryResource;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.time.ZonedDateTime;

import static java.nio.charset.StandardCharsets.UTF_8;
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
    private VirtualFileSystem virtualFileSystem;

    @Test
    public void testGetResource() throws NotAuthorizedException, BadRequestException {
        VfsBackedMiltonResourceFactory factory = new VfsBackedMiltonResourceFactory(null, virtualFileSystem);

        RdfDirectoryResource root = mock(RdfDirectoryResource.class);
        RdfDirectoryResource dir1 = mock(RdfDirectoryResource.class);
        when(root.getName()).thenReturn("root");
        when(dir1.getName()).thenReturn("dir1");

        when(virtualFileSystem.getResource("/testing")).thenReturn(root);
        when(virtualFileSystem.getResource("/testing/dir1")).thenReturn(dir1);

        assertEquals("root", factory.getResource(null, "/testing").getName());
        assertEquals("dir1", factory.getResource(null, "/testing/dir1").getName());
        assertNull(factory.getResource(null, "/dir1"));
        assertNull(factory.getResource(null, "/testing/testing/dir1"));
    }

    @Test
    public void testGetResourceWithContextPath() throws NotAuthorizedException, BadRequestException {
        VfsBackedMiltonResourceFactory factory = new VfsBackedMiltonResourceFactory(contextPath, virtualFileSystem);

        RdfDirectoryResource root = mock(RdfDirectoryResource.class);
        RdfDirectoryResource dir1 = mock(RdfDirectoryResource.class);
        when(root.getName()).thenReturn("root");
        when(dir1.getName()).thenReturn("dir1");

        when(virtualFileSystem.getResource("")).thenReturn(root);
        when(virtualFileSystem.getResource("/dir1")).thenReturn(dir1);

        assertEquals("root", factory.getResource(null, "/testing").getName());
        assertEquals("dir1", factory.getResource(null, "/testing/dir1").getName());
        assertNull(factory.getResource(null, "/testingdir1"));
        assertNull(factory.getResource(null, "/testing/testing/dir1"));
    }

    @Test
    public void testGetResourceWithTrailingSlashes() throws NotAuthorizedException, BadRequestException {
        VfsBackedMiltonResourceFactory factory = new VfsBackedMiltonResourceFactory(contextPath, virtualFileSystem);

        RdfDirectoryResource root = mock(RdfDirectoryResource.class);
        RdfDirectoryResource dir1 = mock(RdfDirectoryResource.class);
        when(root.getName()).thenReturn("root");
        when(dir1.getName()).thenReturn("dir1");

        when(virtualFileSystem.getResource("")).thenReturn(root);
        when(virtualFileSystem.getResource("/dir1")).thenReturn(dir1);

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
        VfsBackedMiltonResourceFactory factory = new VfsBackedMiltonResourceFactory(contextPath, virtualFileSystem);
        Resource resource = factory.getResource(null, "/outside/testing/dir1");

        assertNull(resource);
    }


    @Test
    public void testGetNullResource() throws NotAuthorizedException, BadRequestException {
        VfsBackedMiltonResourceFactory factory = new VfsBackedMiltonResourceFactory(contextPath, virtualFileSystem);
        Resource resource = factory.getResource(null, null);

        assertNull(resource);
    }
}
