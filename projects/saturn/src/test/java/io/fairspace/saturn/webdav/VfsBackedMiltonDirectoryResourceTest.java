package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.InvalidFilenameException;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.nio.file.FileSystemException;
import java.time.Instant;
import java.util.List;

import static org.junit.Assert.*;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.doThrow;

@RunWith(MockitoJUnitRunner.class)
public class VfsBackedMiltonDirectoryResourceTest {
    @Mock
    VirtualFileSystem fs;

    private FileInfo fileInfo = FileInfo.builder()
            .created(Instant.now())
            .createdBy("Test")
            .modified(Instant.now())
            .modifiedBy("Test")
            .path("collection/dir")
            .isDirectory(true)
            .build();

    private VfsBackedMiltonDirectoryResource resource;

    @Before
    public void setUp() throws Exception {
        resource = new VfsBackedMiltonDirectoryResource(fs, fileInfo);
    }

    @Test
    public void createCollectionExceptionHandling() throws IOException, NotAuthorizedException, ConflictException, BadRequestException {
        doThrow(new InvalidFilenameException("test")).when(fs).mkdir("collection/dir/subdir");

        try {
            resource.createCollection("subdir");
            fail();
        } catch(BadRequestException e) {
            // Expected
            assertEquals("test", e.getReason());
        }

        doThrow(new FileSystemException("test")).when(fs).mkdir("collection/dir/subdir");

        try {
            resource.createCollection("subdir");
            fail();
        } catch(ConflictException e) {
            // Expected
            assertEquals("test", e.getMessage());
        }

        doThrow(new IOException("test-message")).when(fs).mkdir("collection/dir/subdir");

        try {
            resource.createCollection("subdir");
            fail();
        } catch(RuntimeException e) {
            // Expected
            assertTrue(e.getMessage().contains("test-message"));
        }
    }

    @Test
    public void getChildrenExceptionHandling() throws IOException, NotAuthorizedException, BadRequestException {
        doThrow(new InvalidFilenameException("test")).when(fs).list("collection/dir");

        try {
            resource.getChildren();
            fail();
        } catch(BadRequestException e) {
            // Expected
            assertEquals("test", e.getReason());
        }

        doThrow(new FileSystemException("test-message")).when(fs).list("collection/dir");

        try {
            resource.getChildren();
            fail();
        } catch(RuntimeException e) {
            // Expected
            assertTrue(e.getMessage().contains("test-message"));
        }

        doThrow(new IOException("test-message")).when(fs).list("collection/dir");

        try {
            resource.getChildren();
            fail();
        } catch(RuntimeException e) {
            // Expected
            assertTrue(e.getMessage().contains("test-message"));
        }
    }

    @Test
    public void getChildrenSortsList() throws IOException, NotAuthorizedException, BadRequestException {
        doReturn(List.of(
                FileInfo.builder().isDirectory(false).path("collection/dir/file.txt").build(),
                FileInfo.builder().isDirectory(true).path("collection/dir/ttt").build(),
                FileInfo.builder().isDirectory(false).path("collection/dir/aaa.txt").build(),
                FileInfo.builder().isDirectory(true).path("collection/dir/subdir").build()
        )).when(fs).list("collection/dir");

        List<? extends Resource> children = resource.getChildren();

        // Expected sort behaviour
        // - all directories before all files
        // - directories and files both sorted alphabetically
        assertTrue(children.get(0) instanceof VfsBackedMiltonDirectoryResource);
        assertEquals("subdir", children.get(0).getName());
        assertTrue(children.get(1) instanceof VfsBackedMiltonDirectoryResource);
        assertEquals("ttt", children.get(1).getName());
        assertTrue(children.get(2) instanceof VfsBackedMiltonFileResource);
        assertEquals("aaa.txt", children.get(2).getName());
        assertTrue(children.get(3) instanceof VfsBackedMiltonFileResource);
        assertEquals("file.txt", children.get(3).getName());
    }
}
