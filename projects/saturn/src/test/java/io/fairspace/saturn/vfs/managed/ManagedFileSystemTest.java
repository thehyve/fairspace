package io.fairspace.saturn.vfs.managed;

import com.google.common.eventbus.EventBus;
import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionDeletedEvent;
import io.fairspace.saturn.services.collections.CollectionMovedEvent;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import org.apache.jena.graph.Node;
import org.apache.jena.query.Dataset;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.function.Supplier;

import static io.fairspace.saturn.TestUtils.ensureRecentInstant;
import static java.util.Collections.singletonList;
import static org.apache.commons.codec.binary.Hex.encodeHexString;
import static org.apache.commons.codec.digest.DigestUtils.md5;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdf.model.ResourceFactory.*;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class ManagedFileSystemTest {
    private final byte[] content1 = new byte[]{1, 2, 3};
    private final byte[] content2 = new byte[]{1, 2, 3, 4};
    @Mock
    private CollectionsService collections;
    @Mock
    private PermissionsService permissions;

    private Dataset ds;
    private ManagedFileSystem fs;

    @Before
    public void before()  {
        var store = new MemoryBlobStore();
        ds = createTxnMem();
        var rdf = connect(ds);
        Supplier<Node> userIriSupplier = () -> createURI("http://example.com/user");
        var eventBus = new EventBus();
        when(permissions.getPermission(any())).thenReturn(Access.Manage);
        fs = new ManagedFileSystem(rdf, store, userIriSupplier, collections, eventBus, permissions);
        var collection = new Collection();
        collection.setLocation("coll");
        collection.setIri(createURI("http://example.com/123"));
        collection.setAccess(Access.Manage);

        when(collections.list()).thenReturn(singletonList(collection));
        when(collections.getByLocation(any())).thenReturn(collection);
    }

    @Test
    public void statRoot() throws IOException {
        assertEquals("", fs.stat("/").getPath());
        assertTrue(fs.stat("").isDirectory());
        assertNull(fs.stat("").getIri());

        verify(permissions, never()).getPermission(any());
    }


    @Test
    public void statCollection() throws IOException {
        assertEquals("coll", fs.stat("coll").getPath());
        assertTrue(fs.stat("coll").isDirectory());
        assertNotNull(fs.stat("coll").getIri());

        verify(permissions, never()).getPermission(createURI(fs.stat("coll").getIri()));
    }

    @Test
    public void statDirectory() throws IOException {
        fs.mkdir("coll/aaa");
        var stat = fs.stat("coll/aaa");
        assertEquals("coll/aaa", stat.getPath());
        assertTrue(stat.isDirectory());
        assertNotNull(stat.getIri());

        verify(permissions).getPermission(createURI(stat.getIri()));
    }

    @Test
    public void list() throws IOException {
        assertEquals(1, fs.list("").size());
        assertEquals("coll", fs.list("").get(0).getPath());
        assertTrue(fs.list("").get(0).isDirectory());

        fs.mkdir("coll/aaa");
        fs.mkdir("coll/aaa/bbb");
        fs.mkdir("coll/aaa/bbb/ccc");
        fs.mkdir("coll/aaa/bbb/ccc/ddd");
        var children = fs.list("coll/aaa/bbb");
        assertEquals(1, children.size());
        assertEquals("coll/aaa/bbb/ccc", children.get(0).getPath());
        assertTrue(children.get(0).isDirectory());
        assertNotNull(children.get(0).getIri());
    }

    @Test
    public void mkdir() throws IOException {
        fs.mkdir("coll/aaa");
        fs.mkdir("coll/aaa/bbb");
        fs.mkdir("coll/aaa/bbb/ccc");
        var stat = fs.stat("coll/aaa/bbb/ccc");
        assertEquals("coll/aaa/bbb/ccc", stat.getPath());
        assertTrue(stat.isDirectory());
        assertNotNull(stat.getIri());
        assertTrue(ds.getDefaultModel().contains(createResource(stat.getIri()), RDFS.label, createStringLiteral("ccc")));
        ensureRecentInstant(stat.getCreated());
        ensureRecentInstant(stat.getModified());
    }

    @Test(expected = IOException.class)
    public void cannotCreateADirectoryTwice() throws IOException {
        fs.mkdir("coll/aaa");
        fs.mkdir("coll/aaa");
    }

    @Test
    public void writeAndRead() throws IOException {
        fs.mkdir("coll/dir");

        fs.create("coll/dir/file", new ByteArrayInputStream(content1));
        var stat = fs.stat("coll/dir/file");
        assertEquals("coll/dir/file", stat.getPath());
        assertEquals(content1.length, stat.getSize());
        var os = new ByteArrayOutputStream();
        fs.read("coll/dir/file", os);
        assertArrayEquals(content1, os.toByteArray());
        ensureRecentInstant(stat.getCreated());
        ensureRecentInstant(stat.getModified());

        fs.modify("coll/dir/file", new ByteArrayInputStream(content2));
        assertEquals(content2.length, fs.stat("coll/dir/file").getSize());
        os = new ByteArrayOutputStream();
        fs.read("coll/dir/file", os);
        if (!Arrays.equals(content2, os.toByteArray())) {
            assertArrayEquals(content2, os.toByteArray());
        }
    }

    @Test(expected = IOException.class)
    public void cannotCreateAFileTwice() throws IOException {
        fs.create("coll/file", new ByteArrayInputStream(content1));
        fs.create("coll/file", new ByteArrayInputStream(content1));
    }

    @Test
    public void checksumCalculation() throws IOException {
        fs.create("coll/file", new ByteArrayInputStream(content1));
        var resource = createResource(fs.stat("coll/file").getIri());
        assertEquals(encodeHexString(md5(content1)), ds.getDefaultModel().getProperty(resource, createProperty("http://fairspace.io/ontology#md5")).getString());

        fs.modify("coll/file", new ByteArrayInputStream(content2));
        assertEquals(encodeHexString(md5(content2)), ds.getDefaultModel().getProperty(resource, createProperty("http://fairspace.io/ontology#md5")).getString());
    }

    @Test
    public void directoryLifecycleMetadata() throws IOException {
        fs.mkdir("coll/dir");
        var dir = createResource(fs.stat("coll/dir").getIri());
        var user = createResource("http://example.com/user");
        assertTrue(ds.getDefaultModel().contains(dir, createProperty("http://fairspace.io/ontology#createdBy"), user));
        assertTrue(ds.getDefaultModel().contains(dir, createProperty("http://fairspace.io/ontology#modifiedBy"), user));

        fs.delete("coll/dir");
        assertTrue(ds.getDefaultModel().contains(dir, createProperty("http://fairspace.io/ontology#deletedBy"), user));
    }

    @Test
    public void fileLifecycleMetadata() throws IOException {
        fs.create("coll/file", new ByteArrayInputStream(content1));
        var file = createResource(fs.stat("coll/file").getIri());
        var user = createResource("http://example.com/user");
        assertTrue(ds.getDefaultModel().contains(file, createProperty("http://fairspace.io/ontology#createdBy"), user));
        assertTrue(ds.getDefaultModel().contains(file, createProperty("http://fairspace.io/ontology#modifiedBy"), user));

        fs.delete("coll/file");
        assertTrue(ds.getDefaultModel().contains(file, createProperty("http://fairspace.io/ontology#deletedBy"), user));
    }

    @Test
    public void copyDir() throws IOException {
        fs.mkdir("coll/dir1");
        fs.mkdir("coll/dir1/subdir");
        fs.create("coll/dir1/subdir/file", new ByteArrayInputStream(content1));
        var oldIri = fs.stat("coll/dir1").getIri();
        fs.copy("coll/dir1", "coll/dir2");
        assertTrue(fs.exists("coll/dir1"));
        assertTrue(fs.exists("coll/dir2"));
        assertTrue(fs.exists("coll/dir2/subdir"));
        assertTrue(fs.exists("coll/dir2/subdir/file"));
        var os = new ByteArrayOutputStream();
        fs.read("coll/dir2/subdir/file", os);
        assertArrayEquals(content1, os.toByteArray());
        assertNotEquals(oldIri, fs.stat("coll/dir2").getIri());
        assertTrue(ds.getDefaultModel().contains(createResource(fs.stat("coll/dir2").getIri()), RDFS.label, createStringLiteral("dir2")));
    }

    @Test(expected = IOException.class)
    public void cannotCopyDirToItself() throws IOException {
        fs.mkdir("coll/dir1");
        fs.copy("coll/dir1", "coll/dir1");
     }

    @Test
    public void copyFile() throws IOException {
        fs.mkdir("coll/dir1");
        fs.mkdir("coll/dir2");
        fs.create("coll/dir1/file", new ByteArrayInputStream(content1));
        var oldIri = fs.stat("coll/dir1/file").getIri();
        fs.copy("coll/dir1/file", "coll/dir2/file");
        assertTrue(fs.exists("coll/dir1"));
        assertTrue(fs.exists("coll/dir2"));
        assertTrue(fs.exists("coll/dir1/file"));
        assertTrue(fs.exists("coll/dir2/file"));
        var os = new ByteArrayOutputStream();
        fs.read("coll/dir2/file", os);
        assertArrayEquals(content1, os.toByteArray());
        assertNotEquals(oldIri, fs.stat("coll/dir2/file").getIri());
    }

    @Test
    public void moveDir() throws IOException {
        fs.mkdir("coll/dir1");
        fs.mkdir("coll/dir1/subdir");
        fs.create("coll/dir1/subdir/file", new ByteArrayInputStream(content1));
        var oldIri = fs.stat("coll/dir1").getIri();
        fs.move("coll/dir1", "coll/dir2");
        assertFalse(fs.exists("coll/dir1"));
        assertTrue(fs.exists("coll/dir2"));
        assertTrue(fs.exists("coll/dir2/subdir"));
        assertTrue(fs.exists("coll/dir2/subdir/file"));
        var os = new ByteArrayOutputStream();
        fs.read("coll/dir2/subdir/file", os);
        assertArrayEquals(content1, os.toByteArray());
        assertEquals(oldIri, fs.stat("coll/dir2").getIri());
        assertTrue(ds.getDefaultModel().contains(createResource(oldIri), RDFS.label, createStringLiteral("dir2")));
    }

    @Test
    public void moveFile() throws IOException {
        fs.mkdir("coll/dir1");
        fs.create("coll/dir1/file1", new ByteArrayInputStream(content1));
        fs.mkdir("coll/dir2");
        var oldIri = fs.stat("coll/dir1/file1").getIri();
        fs.move("coll/dir1/file1", "coll/dir2/file2");
        assertFalse(fs.exists("coll/dir1/file1"));
        assertTrue(fs.exists("coll/dir2/file2"));
        var os = new ByteArrayOutputStream();
        fs.read("coll/dir2/file2", os);
        assertArrayEquals(content1, os.toByteArray());
        assertEquals(oldIri, fs.stat("coll/dir2/file2").getIri());
    }


    @Test
    public void deleteDir() throws IOException {
        fs.mkdir("coll/dir");
        fs.mkdir("coll/dir/subdir");
        fs.create("coll/dir/file", new ByteArrayInputStream(content1));

        fs.delete("coll/dir");

        assertFalse(fs.exists("coll/dir"));
        assertFalse(fs.exists("coll/dir/subdir"));
        assertFalse(fs.exists("coll/dir/file"));
    }

    @Test
    public void deleteFile() throws IOException {
        fs.mkdir("coll/dir");
        fs.create("coll/dir/file", new ByteArrayInputStream(content1));

        fs.delete("coll/dir/file");

        assertFalse(fs.exists("coll/dir/file"));

        fs.create("coll/dir/file", new ByteArrayInputStream(content2));

        assertTrue(fs.exists("coll/dir/file"));
        assertEquals(content2.length, fs.stat("coll/dir/file").getSize());
    }

    @Test(expected = IOException.class)
    public void cannotDeleteANonExistingFile() throws IOException {
        fs.delete("coll/dir/file");
    }

    @Test
    public void filesAreDeletedAfterDeletingACollection() throws IOException {
        fs.mkdir("coll/dir");
        fs.create("coll/file", new ByteArrayInputStream(content1));
        fs.onCollectionDeleted(new CollectionDeletedEvent(collections.getByLocation("coll")));

        assertEquals(0, fs.list("coll").size());
    }

    @Test
    public void filesAreMovedAfterMovingACollection() throws IOException {
        fs.mkdir("coll/dir");
        fs.create("coll/file", new ByteArrayInputStream(content1));
        var c = collections.getByLocation("coll");
        c.setLocation("newLocation");
        fs.onCollectionMoved(new CollectionMovedEvent(c, "coll"));

        assertEquals(0, fs.list("coll").size());
        assertEquals(2, fs.list("newLocation").size());
    }

    @Test
    public void isCollection() {
        assertTrue(ManagedFileSystem.isCollection("coll"));
        assertFalse(ManagedFileSystem.isCollection(""));
        assertFalse(ManagedFileSystem.isCollection("coll/dir"));
        assertFalse(ManagedFileSystem.isCollection("coll/dir/subdir"));
    }
}