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
    public void testReadFully() throws IOException {
        testReadRange(0, Long.MAX_VALUE, contents);
    }

    @Test
    public void testReadExactSize() throws IOException {
        testReadRange(0, contents.length, contents);
    }

    @Test
    public void testReadSubRange() throws IOException {
        testReadRange(2, 3, new byte[] {2, 3, 4});
    }

    @Test
    public void testReadEmptyRange() throws IOException {
        testReadRange(2, 0, new byte[0]);
    }

    @Test
    public void testReadTail() throws IOException {
        testReadRange(7, Long.MAX_VALUE, new byte[] {7, 8, 9});
    }

    @Test
    public void testAfterEnd() throws IOException {
        testReadRange(contents.length, 0, new byte[0]);
    }

    @Test
    public void filesShouldBeDeletedInCaseOfErrors() {
        try {
            blobStore.write(new BrokenInputStream());
        } catch (IOException ignore) {
        }

        assertEquals(0, dir.list().length);
    }

    private void testReadRange(long offset, long length, byte[] expected) throws IOException {
        var id = blobStore.write(new ByteArrayInputStream(contents));
        var out = new ByteArrayOutputStream();
        blobStore.read(id, offset, length, out);
        assertArrayEquals(expected, out.toByteArray());
    }
}