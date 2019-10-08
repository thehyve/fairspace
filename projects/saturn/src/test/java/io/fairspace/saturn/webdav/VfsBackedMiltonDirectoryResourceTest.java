package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.InvalidFilenameException;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.CollectionResource;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.nio.file.FileSystemException;
import java.time.Instant;

import static org.junit.Assert.*;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

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
}
