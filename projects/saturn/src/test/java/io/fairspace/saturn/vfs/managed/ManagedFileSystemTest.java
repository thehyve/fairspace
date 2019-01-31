package io.fairspace.saturn.vfs.managed;

import org.junit.Before;
import org.junit.Test;

import java.io.FileNotFoundException;
import java.io.IOException;

import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;

public class ManagedFileSystemTest {
    private ManagedFileSystem fs;

    @Before
    public void before() {
        fs = new ManagedFileSystem(connect(createTxnMem()), null, "http://example.com/");
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
    public void write() throws IOException {

    }

    @Test
    public void read() {
    }

    @Test
    public void copy() {
    }

    @Test
    public void move() {
    }

    @Test(expected = FileNotFoundException.class)
    public void delete() throws IOException {
        fs.mkdir("dir");
        fs.delete("dir");
        fs.stat("dir");
    }
}