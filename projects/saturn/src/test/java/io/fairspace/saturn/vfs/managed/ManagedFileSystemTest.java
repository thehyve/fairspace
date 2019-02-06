package io.fairspace.saturn.vfs.managed;

import org.junit.Before;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;

import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;

public class ManagedFileSystemTest {
    private final byte[] content1 = new byte[]{1, 2, 3};
    private final byte[] content2 = new byte[]{1, 2, 3, 4};

    private ManagedFileSystem fs;

    @Before
    public void before()  {
        var store = new MemoryBlobStore();
        fs = new ManagedFileSystem(connect(createTxnMem()), store,"http://example.com/", null);
    }

    @Test
    public void list() throws IOException {
        fs.mkdir("aaa/bbb/ccc");
        fs.mkdir("aaa/bbb/ccc/ddd");
        var children = fs.list("aaa/bbb");
        assertEquals(1, children.size());
    }

    @Test
    public void mkdir() throws IOException {
        fs.mkdir("aaa/bbb/ccc");
        var stat = fs.stat("aaa/bbb/ccc");
        assertEquals("aaa/bbb/ccc", stat.getPath());
        assertTrue(stat.isDirectory());
    }

    @Test
    public void writeAndRead() throws IOException {
        fs.mkdir("dir");

        fs.create("dir/file", new ByteArrayInputStream(content1));
        assertEquals(content1.length, fs.stat("dir/file").getSize());
        var os = new ByteArrayOutputStream();
        fs.read("dir/file", os);
        assertArrayEquals(content1, os.toByteArray());

        fs.modify("dir/file", new ByteArrayInputStream(content2));
        assertEquals(content2.length, fs.stat("dir/file").getSize());
        os = new ByteArrayOutputStream();
        fs.read("dir/file", os);
        if (!Arrays.equals(content2, os.toByteArray())) {
            assertArrayEquals(content2, os.toByteArray());
        }
    }


    @Test
    public void copyDir() throws IOException {
        fs.mkdir("dir1");
        fs.mkdir("dir1/subdir");
        fs.create("dir1/subdir/file", new ByteArrayInputStream(content1));
        fs.copy("dir1", "dir2");
        assertTrue(fs.exists("dir1"));
        assertTrue(fs.exists("dir2"));
        assertTrue(fs.exists("dir2/subdir"));
        assertTrue(fs.exists("dir2/subdir/file"));
        var os = new ByteArrayOutputStream();
        fs.read("dir2/subdir/file", os);
        assertArrayEquals(content1, os.toByteArray());
    }

    @Test
    public void copyFile() throws IOException {
        fs.mkdir("dir1");
        fs.mkdir("dir2");
        fs.create("dir1/file", new ByteArrayInputStream(content1));
        fs.copy("dir1/file", "dir2/file");
        assertTrue(fs.exists("dir1"));
        assertTrue(fs.exists("dir2"));
        assertTrue(fs.exists("dir1/file"));
        assertTrue(fs.exists("dir2/file"));
        var os = new ByteArrayOutputStream();
        fs.read("dir2/file", os);
        assertArrayEquals(content1, os.toByteArray());
    }

    @Test
    public void moveDir() throws IOException {
        fs.mkdir("dir1");
        fs.mkdir("dir1/subdir");
        fs.create("dir1/subdir/file", new ByteArrayInputStream(content1));
        fs.move("dir1", "dir2");
        assertFalse(fs.exists("dir1"));
        assertTrue(fs.exists("dir2"));
        assertTrue(fs.exists("dir2/subdir"));
        assertTrue(fs.exists("dir2/subdir/file"));
        var os = new ByteArrayOutputStream();
        fs.read("dir2/subdir/file", os);
        assertArrayEquals(content1, os.toByteArray());
    }

    @Test
    public void moveDirWithConflicts() throws IOException {
        fs.mkdir("dir1");
        fs.mkdir("dir1/subdir");
        fs.create("dir1/subdir/file", new ByteArrayInputStream(content1));
        fs.mkdir("dir2");
        fs.mkdir("dir2/subdir2");
        fs.move("dir1", "dir2");
        assertFalse(fs.exists("dir1"));
        assertFalse(fs.exists("dir2/subdir2"));
        assertTrue(fs.exists("dir2"));
        assertTrue(fs.exists("dir2/subdir"));
        assertTrue(fs.exists("dir2/subdir/file"));
        var os = new ByteArrayOutputStream();
        fs.read("dir2/subdir/file", os);
        assertArrayEquals(content1, os.toByteArray());
    }


    @Test
    public void moveFile() throws IOException {
        fs.mkdir("dir1");
        fs.create("dir1/file1", new ByteArrayInputStream(content1));
        fs.mkdir("dir2");
        fs.move("dir1/file1", "dir2/file2");
        assertFalse(fs.exists("dir1/file1"));
        assertTrue(fs.exists("dir2/file2"));
        var os = new ByteArrayOutputStream();
        fs.read("dir2/file2", os);
        assertArrayEquals(content1, os.toByteArray());
    }


    @Test
    public void deleteDir() throws IOException {
        fs.mkdir("dir");
        fs.mkdir("dir/subdir");
        fs.create("dir/file", new ByteArrayInputStream(content1));

        fs.delete("dir");

        assertFalse(fs.exists("dir"));
        assertFalse(fs.exists("dir/subdir"));
        assertFalse(fs.exists("dir/file"));
    }

    @Test
    public void deleteFile() throws IOException {
        fs.mkdir("dir");
        fs.create("dir/file", new ByteArrayInputStream(content1));

        fs.delete("dir/file");

        assertFalse(fs.exists("dir/file"));
    }
}