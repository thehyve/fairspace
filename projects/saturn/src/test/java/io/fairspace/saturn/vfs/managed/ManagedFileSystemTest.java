package io.fairspace.saturn.vfs.managed;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.services.collections.CollectionsService;
import org.junit.Before;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;

public class ManagedFileSystemTest {
    private final byte[] content1 = new byte[]{1, 2, 3};
    private final byte[] content2 = new byte[]{1, 2, 3, 4};

    private ManagedFileSystem fs;

    @Before
    public void before()  {
        setWorkspaceURI("http://example.com/");
        var store = new MemoryBlobStore();
        var rdf = connect(createTxnMem());
        Supplier<UserInfo> userInfoSupplier = () -> new UserInfo("userId", null, null, null);
        var collections = new CollectionsService(rdf, userInfoSupplier);
        fs = new ManagedFileSystem(rdf, store, userInfoSupplier, collections);
    }

    @Test
    public void list() throws IOException {
        fs.mkdir("aaa");
        fs.mkdir("aaa/bbb");
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
        fs.mkdir("coll");
        fs.mkdir("coll/dir1");
        fs.mkdir("coll/dir1/subdir");
        fs.create("coll/dir1/subdir/file", new ByteArrayInputStream(content1));
        fs.copy("coll/dir1", "coll/dir2");
        assertTrue(fs.exists("coll/dir1"));
        assertTrue(fs.exists("coll/dir2"));
        assertTrue(fs.exists("coll/dir2/subdir"));
        assertTrue(fs.exists("coll/dir2/subdir/file"));
        var os = new ByteArrayOutputStream();
        fs.read("coll/dir2/subdir/file", os);
        assertArrayEquals(content1, os.toByteArray());
    }

    @Test
    public void copyFile() throws IOException {
        fs.mkdir("coll");
        fs.mkdir("coll/dir1");
        fs.mkdir("coll/dir2");
        fs.create("coll/dir1/file", new ByteArrayInputStream(content1));
        fs.copy("coll/dir1/file", "coll/dir2/file");
        assertTrue(fs.exists("coll/dir1"));
        assertTrue(fs.exists("coll/dir2"));
        assertTrue(fs.exists("coll/dir1/file"));
        assertTrue(fs.exists("coll/dir2/file"));
        var os = new ByteArrayOutputStream();
        fs.read("coll/dir2/file", os);
        assertArrayEquals(content1, os.toByteArray());
    }

    @Test
    public void moveDir() throws IOException {
        fs.mkdir("coll");
        fs.mkdir("coll/dir1");
        fs.mkdir("coll/dir1/subdir");
        fs.create("coll/dir1/subdir/file", new ByteArrayInputStream(content1));
        fs.move("coll/dir1", "coll/dir2");
        assertFalse(fs.exists("coll/dir1"));
        assertTrue(fs.exists("coll/dir2"));
        assertTrue(fs.exists("coll/dir2/subdir"));
        assertTrue(fs.exists("coll/dir2/subdir/file"));
        var os = new ByteArrayOutputStream();
        fs.read("coll/dir2/subdir/file", os);
        assertArrayEquals(content1, os.toByteArray());
    }

    @Test
    public void moveDirWithConflicts() throws IOException {
        fs.mkdir("coll");
        fs.mkdir("coll/dir1");
        fs.mkdir("coll/dir1/subdir");
        fs.create("coll/dir1/subdir/file", new ByteArrayInputStream(content1));
        fs.mkdir("coll/dir2");
        fs.mkdir("coll/dir2/subdir2");
        fs.move("coll/dir1", "coll/dir2");
        assertFalse(fs.exists("coll/dir1"));
        assertFalse(fs.exists("coll/dir2/subdir2"));
        assertTrue(fs.exists("coll/dir2"));
        assertTrue(fs.exists("coll/dir2/subdir"));
        assertTrue(fs.exists("coll/dir2/subdir/file"));
        var os = new ByteArrayOutputStream();
        fs.read("coll/dir2/subdir/file", os);
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