package io.fairspace.saturn.vfs.managed;

import org.junit.Before;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URISyntaxException;
import java.util.Arrays;

import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;

public class ManagedFileSystemTest {
    private ManagedFileSystem fs;

    @Before
    public void before() throws URISyntaxException {
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
        assertEquals(true, stat.isDirectory());
    }

    @Test
    public void writeAndRead() throws IOException {
        var content1 = new byte[]{1, 2, 3};
        fs.mkdir("dir");

        fs.create("dir/file", new ByteArrayInputStream(content1));
        assertEquals(content1.length, fs.stat("dir/file").getSize());
        var os = new ByteArrayOutputStream();
        fs.read("dir/file", os);
        assertArrayEquals(content1, os.toByteArray());

        var content2 = new byte[]{1, 2, 3, 4};

        fs.modify("dir/file", new ByteArrayInputStream(content2));
        assertEquals(content2.length, fs.stat("dir/file").getSize());
        os = new ByteArrayOutputStream();
        fs.read("dir/file", os);
        if (!Arrays.equals(content2, os.toByteArray())) {
            assertArrayEquals(content2, os.toByteArray());
        }
    }


    @Test
    public void copy() throws IOException {
        var content1 = new byte[]{1, 2, 3};
        fs.mkdir("dir1");
        fs.mkdir("dir1/subdir");
        fs.create("dir1/subdir/file", new ByteArrayInputStream(content1));
        fs.copy("dir1", "dir2");
        assertNotNull(fs.stat("dir1"));
        assertNotNull(fs.stat("dir2"));
        assertNotNull(fs.stat("dir2/subdir"));
        assertNotNull(fs.stat("dir2/subdir/file"));
        var os = new ByteArrayOutputStream();
        fs.read("dir2/subdir/file", os);
        assertArrayEquals(content1, os.toByteArray());
    }

    @Test
    public void move() throws IOException {
        var content1 = new byte[]{1, 2, 3};
        fs.mkdir("dir1");
        fs.mkdir("dir1/subdir");
        fs.create("dir1/subdir/file", new ByteArrayInputStream(content1));
        fs.move("dir1", "dir2");
        assertNull(fs.stat("dir1"));
        assertNotNull(fs.stat("dir2"));
        assertNotNull(fs.stat("dir2/subdir"));
        assertNotNull(fs.stat("dir2/subdir/file"));
        var os = new ByteArrayOutputStream();
        fs.read("dir2/subdir/file", os);
        assertArrayEquals(content1, os.toByteArray());
    }

    @Test
    public void delete() throws IOException {
        fs.mkdir("dir");
        fs.delete("dir");
        assertNull(fs.stat("dir"));
    }

}