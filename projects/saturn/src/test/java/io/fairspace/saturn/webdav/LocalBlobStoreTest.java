package io.fairspace.saturn.webdav;

import io.fairspace.saturn.webdav.blobstore.BlobStore;
import io.fairspace.saturn.webdav.blobstore.LocalBlobStore;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;

import static java.util.UUID.randomUUID;
import static org.apache.commons.io.FileUtils.getTempDirectory;
import static org.junit.Assert.*;

public class LocalBlobStoreTest {
    private final File dir = new File(getTempDirectory(), randomUUID().toString());
    private BlobStore blobStore;
    private byte[] contents1 = new byte[]{0, 1, 2, 3};
    private byte[] contents2 = new byte[]{4, 5, 6, 7, 8, 9};

    @Before
    public void before() {
        blobStore = new LocalBlobStore(dir);
    }

    @After
    public void after() {
        dir.delete();
    }

    @Test
    public void shouldReadExactlyWhatWasWritten() throws IOException {
        var id = blobStore.write(new ByteArrayInputStream(contents1));
        assertNotNull(id);
        var out = new ByteArrayOutputStream();
        blobStore.read(id, out, 0, null);
        assertArrayEquals(contents1, out.toByteArray());
    }


    @Test
    public void shouldGenerateUniqueIds() throws IOException {
        var id1 = blobStore.write(new ByteArrayInputStream(contents1));
        var id2 = blobStore.write(new ByteArrayInputStream(contents2));
        assertNotEquals(id1, id2);
    }
}