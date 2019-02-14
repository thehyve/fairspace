package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import io.fairspace.saturn.vfs.managed.MemoryBlobStore;
import org.junit.Before;
import org.junit.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.getWorkspaceURI;
import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;

public class CollectionsServiceTest {
    @Before
    public void before() {
        setWorkspaceURI("http://example.com/iri/");
    }

    @Test
    public void basicFunctionality() throws IOException {
        var rdf = connect(createTxnMem());
        Supplier<UserInfo> userInfoSupplier = () -> new UserInfo("userId", null, null, null);
        var collections = new CollectionsService(rdf, userInfoSupplier);

        var files = new ManagedFileSystem(rdf, new MemoryBlobStore(), userInfoSupplier, collections);

        assertTrue(collections.list().isEmpty());

        var c1 = new Collection();
        c1.setName("c1");
        c1.setLocation("dir1");
        c1.setDescription("descr");
        c1.setType("LOCAL");

        var created1 = collections.create(c1);
        assertTrue(created1.getIri().startsWith(getWorkspaceURI()));
        assertEquals(c1.getName(), created1.getName());
        assertEquals(c1.getDescription(), created1.getDescription());
        assertEquals(c1.getLocation(), created1.getLocation());
        assertEquals(c1.getType(), created1.getType());
        assertEquals("userId", created1.getCreator());
        assertNotNull(created1.getDateCreated());

        assertNotNull(collections.getByDirectoryName("dir1"));
        assertNull(collections.getByDirectoryName("dir2"));

        assertEquals(1, collections.list().size());
        assertTrue(collections.list().contains(created1));

        assertEquals(created1, collections.get(created1.getIri()));

        assertNull("Collection with same directory name cannot be created", collections.create(c1));

        files.mkdir("dir1/subdir");
        files.create("dir1/subdir/file.txt", new ByteArrayInputStream(new byte[10]));

        var patch = new Collection();
        patch.setIri(created1.getIri());
        patch.setName("new name");
        patch.setDescription("new descr");
        patch.setLocation("dir2");
        collections.update(patch);

        var updated = collections.get(created1.getIri());
        assertEquals("new name", updated.getName());
        assertEquals("new descr", updated.getDescription());
        assertEquals("dir2", updated.getLocation());

        assertFalse(files.exists("dir1/subdir"));
        assertFalse(files.exists("dir1/subdir/file.txt"));
        assertTrue(files.exists("dir2/subdir"));
        assertTrue(files.exists("dir2/subdir/file.txt"));

        var c2 = new Collection();
        c2.setName("c2");
        c2.setLocation("dir3");
        c2.setDescription("blah");
        c2.setType("LOCAL");
        var created2 = collections.create(c2);
        assertEquals(2, collections.list().size());

        collections.delete(created2.getIri());
        assertEquals(1, collections.list().size());
    }
}