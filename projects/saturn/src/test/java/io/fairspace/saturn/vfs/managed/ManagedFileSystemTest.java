package io.fairspace.saturn.vfs.managed;

import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;

import java.io.*;
import java.util.HashMap;
import java.util.Map;

import static java.util.UUID.randomUUID;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;

public class ManagedFileSystemTest {
    private ManagedFileSystem fs;

    @Before
    public void before() {
        var store = new BlobStore() {
            private Map<String, byte[]> memo = new HashMap<>();

            @Override
            public String write(InputStream in) throws IOException {
                var id = randomUUID().toString();
                var os = new ByteArrayOutputStream();
                IOUtils.copy(in, os);
                memo.put(id, os.toByteArray());
                return id;
            }

            @Override
            public void read(String id, OutputStream out) throws IOException {
                IOUtils.copy(new ByteArrayInputStream(memo.get(id)), out);
            }
        };
        fs = new ManagedFileSystem(connect(createTxnMem()), store, "http://example.com/");
    }

    @Test
    public void stat() {
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
        var content1 = new byte[] {1, 2, 3};
        fs.mkdir("dir");

        fs.create("dir/file", new ByteArrayInputStream(content1));
        assertEquals(content1.length, fs.stat("dir/file").getSize());
        var os = new ByteArrayOutputStream();
        fs.read("dir/file", os);
        assertArrayEquals(content1, os.toByteArray());

        var content2 = new byte[] {1, 2, 3, 4};

        fs.modify("dir/file", new ByteArrayInputStream(content2));
        assertEquals(content2.length, fs.stat("dir/file").getSize());
        os = new ByteArrayOutputStream();
        fs.read("dir/file", os);
        assertArrayEquals(content2, os.toByteArray());
    }


    @Test
    public void copy() {
    }

    @Test
    public void move() {
    }

    @Test
    public void delete() throws IOException {
        fs.mkdir("dir");
        fs.delete("dir");
        assertNull(fs.stat("dir"));
    }
}