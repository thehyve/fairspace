package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.Instant;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;

@RunWith(MockitoJUnitRunner.class)
public class VfsBackedMiltonFileResourceTest {
    @Mock
    VirtualFileSystem fs;

    private FileInfo fileInfo = FileInfo.builder()
            .created(Instant.now())
            .createdBy("Test")
            .modified(Instant.now())
            .modifiedBy("Test")
            .path("collection/dir/file.txt")
            .build();

    private FileInfo readOnly = FileInfo.builder()
            .created(Instant.now())
            .createdBy("Test")
            .modified(Instant.now())
            .modifiedBy("Test")
            .path("collection/dir")
            .readOnly(true)
            .build();

    VfsBackedMiltonFileResource resource;

    @Before
    public void setUp() throws Exception {
        resource = new VfsBackedMiltonFileResource(fs, fileInfo);
    }

    @Test(expected = NotAuthorizedException.class)
    public void replaceContentChecksPermissions() throws NotAuthorizedException, ConflictException, BadRequestException {
        resource = new VfsBackedMiltonFileResource(fs, readOnly);
        ByteArrayInputStream inputStream = new ByteArrayInputStream("abcdef".getBytes());
        resource.replaceContent(inputStream, 4l);
    }

    @Test(expected = RuntimeException.class)
    public void replaceContentHandlesExceptions() throws NotAuthorizedException, ConflictException, BadRequestException, IOException {
        ByteArrayInputStream inputStream = new ByteArrayInputStream("abcdef".getBytes());
        resource = new VfsBackedMiltonFileResource(fs, fileInfo);

        doThrow(IOException.class).when(fs).modify(eq("collection/dir/file.txt"), any());
        resource.replaceContent(inputStream, 4l);
    }

}
