package io.fairspace.saturn.webdav.vfs;

import io.fairspace.saturn.webdav.vfs.contents.StoredContent;
import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import io.fairspace.saturn.webdav.vfs.resources.VfsCollectionResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class VirtualFileSystemTest {
    @Mock
    private VfsResourceFactory resourceFactory;

    @Mock
    private VfsContentStore contentStore;

    private VirtualFileSystem vfs;

    @Before
    public void setUp() throws Exception {
        vfs = new VirtualFileSystem(contentStore, resourceFactory);
    }

    @Test
    public void testStoreFile() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        VfsCollectionResource parent = mock(VfsCollectionResource.class);
        when(parent.getPath()).thenReturn("/dir");
        when(parent.getUniqueId()).thenReturn("parent-id");

        when(contentStore.putContent("/dir/test.txt", inputStream)).thenReturn(new StoredContent("test-location", 20));

        vfs.storeFile(parent, "test.txt", "abcdef", inputStream);

        verify(contentStore).putContent("/dir/test.txt", inputStream);
        verify(resourceFactory).storeFile("parent-id", "/dir/test.txt", 20l, "abcdef", "test-location");
    }

    @Test
    public void testStoreFileFailsOnEmptyParams() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        VfsCollectionResource parent = mock(VfsCollectionResource.class);

        try {
            vfs.storeFile(parent, null, "abcdef", inputStream);
            fail("Storing a file without a name should cause an exception");
        } catch(IllegalArgumentException e) {
            // Expected exception
        }

        try {
            vfs.storeFile(null, "test.txt", "abcdef", inputStream);
            fail("Storing a file without parent should cause an exception");
        } catch(IllegalArgumentException e) {
            // Expected exception
        }

        try {
            vfs.storeFile(parent, "", "abcdef", inputStream);
            fail("Storing a file with an empty name should cause an exception");
        } catch(IllegalArgumentException e) {
            // Expected exception
        }

        try {
            vfs.storeFile(parent, "dirname/filename", "abcdef", inputStream);
            fail("Storing a file with an a name including the directory separator must fail");
        } catch(IllegalArgumentException e) {
            // Expected exception
        }

        verify(contentStore, times(0)).putContent(any(), any());
        verify(resourceFactory, times(0)).storeFile(any(), any(), any(), any(), any());
    }

    @Test
    public void testFailedContentStorageDoesNotShowUpInResourcesForNewFile() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        VfsCollectionResource parent = mock(VfsCollectionResource.class);
        when(parent.getPath()).thenReturn("/dir");

        when(contentStore.putContent("/dir/test.txt", inputStream)).thenThrow(new IOException());

        try {
            vfs.storeFile(parent, "test.txt", "abcdef", inputStream);
            fail("IOException on storage should be propagated to the client");
        } catch(IOException e) {
            // Expected exception
        }

        verify(resourceFactory, times(0)).storeFile(any(), any(), any(), any(), any());
    }

    @Test
    public void testUpdateFile() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        VfsFileResource file = mock(VfsFileResource.class);
        when(file.getPath()).thenReturn("/dir/test.txt");

        when(contentStore.putContent("/dir/test.txt", inputStream)).thenReturn(new StoredContent("test-location", 20));

        vfs.updateFile(file, "abcdef", inputStream);

        verify(contentStore).putContent("/dir/test.txt", inputStream);
        verify(resourceFactory).updateFile(file, 20l, "abcdef", "test-location");
    }

    @Test
    public void testFailedContentStorageDoesNotShowUpInResourcesForUpdates() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        VfsFileResource file = mock(VfsFileResource.class);
        when(file.getPath()).thenReturn("/dir/test.txt");

        when(contentStore.putContent("/dir/test.txt", inputStream)).thenThrow(new IOException());

        try {
            vfs.updateFile(file, "abcdef", inputStream);
            fail("IOException on storage should be propagated to the client");
        } catch(IOException e) {
            // Expected exception
        }

        verify(resourceFactory, times(0)).updateFile(any(), any(), any(), any());
    }


    @Test
    public void testUpdateFileWithInvalidParameters() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        try {
            vfs.updateFile(null, "abcdef", inputStream);
            fail("Updating a file without reference to its resource must fail");
        } catch(IllegalArgumentException e) {
            // Expected
        }

        verify(contentStore, times(0)).putContent(any(), any());
        verify(resourceFactory, times(0)).updateFile(any(), any(), any(), any());
    }

}
