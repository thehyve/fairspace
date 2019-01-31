package io.fairspace.saturn.webdav2.vfs.managed;

import lombok.Builder;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionFactory;
import org.junit.Before;
import org.junit.Test;

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
    public void list() {
    }

    @Test
    public void mkdir() throws IOException {
        fs.mkdir("/aaa/bbb/ccc");
        var stat = fs.stat("/aaa/bbb/ccc");
        assertEquals("/aaa/bbb/ccc", stat.getPath());
        assertEquals(true, stat.isDirectory());
    }

    @Test
    public void write() {
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

    @Test
    public void delete() {
    }
}