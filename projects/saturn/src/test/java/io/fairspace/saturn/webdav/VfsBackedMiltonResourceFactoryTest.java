package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.resource.Resource;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.FileNotFoundException;
import java.io.IOException;

import static org.junit.Assert.*;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class VfsBackedMiltonResourceFactoryTest {
    @Mock
    VirtualFileSystem fs;

    @Test
    public void getResourceReturnsNullForFileNotFound() throws IOException {
        when(fs.stat("/test")).thenThrow(new FileNotFoundException("test"));

        assertNull(VfsBackedMiltonResourceFactory.getResource(fs, "/test"));
    }
}
