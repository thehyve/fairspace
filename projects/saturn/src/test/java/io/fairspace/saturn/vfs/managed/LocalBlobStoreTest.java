package io.fairspace.saturn.vfs.managed;

import org.apache.commons.io.input.BrokenInputStream;
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
    private byte[] contents = new byte[] {0, 1, 2, 3, 4, 5, 6, 7, 8, 9};

    @Before
    public void before() throws IOException {
        blobStore = new LocalBlobStore(dir);
    }

    @After
    public void after() {
        dir.delete();
    }

    @Test
    public void writeAndRead() throws IOException {
        var id = blobStore.write(new ByteArrayInputStream(contents));

        var out = new ByteArrayOutputStream();

        blobStore.read(id, 0, Long.MAX_VALUE, out);
        assertArrayEquals(contents, out.toByteArray());

        out.reset();
        blobStore.read(id, 0, contents.length, out);
        assertArrayEquals(contents, out.toByteArray());

        out.reset();
        blobStore.read(id, 2, 3, out);
        assertArrayEquals(new byte[] {2, 3, 4}, out.toByteArray());

        out.reset();
        blobStore.read(id, 7, Long.MAX_VALUE, out);
        assertArrayEquals(new byte[] {7, 8, 9}, out.toByteArray());

        out.reset();
        blobStore.read(id, 3, 0, out);
        assertArrayEquals(new byte[0], out.toByteArray());

        out.reset();
        blobStore.read(id, contents.length, Long.MAX_VALUE, out);
        assertArrayEquals(new byte[0], out.toByteArray());

        out.reset();
        blobStore.read(id, contents.length + 10, Long.MAX_VALUE, out);
        assertArrayEquals(new byte[0], out.toByteArray());
    }

    @Test
    public void filesShouldBeDeletedInCaseOfErrors() {
        try {
            blobStore.write(new BrokenInputStream());
        } catch (IOException ignore) {
        }

        assertEquals(0, dir.list().length);
    }
}