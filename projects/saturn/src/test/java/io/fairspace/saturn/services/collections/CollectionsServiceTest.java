package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.auth.UserInfo;
import org.junit.Before;
import org.junit.Test;

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
    public void basicFunctionality() {
        var service = new CollectionsService(connect(createTxnMem()),
                () -> new UserInfo("userId", null, null, null));

        assertTrue(service.list().isEmpty());

        var c1 = new Collection();
        c1.setName("c1");
        c1.setLocation("dir1");
        c1.setDescription("descr");
        c1.setType("LOCAL");

        var created1 = service.create(c1);
        assertTrue(created1.getUri().startsWith(getWorkspaceURI()));
        assertEquals(c1.getName(), created1.getName());
        assertEquals(c1.getDescription(), created1.getDescription());
        assertEquals(c1.getLocation(), created1.getLocation());
        assertEquals(c1.getType(), created1.getType());
        assertEquals("userId", created1.getCreator());
        assertNotNull(created1.getDateCreated());

        assertNotNull(service.getByDirectoryName("dir1"));
        assertNull(service.getByDirectoryName("dir2"));

        assertEquals(1, service.list().size());
        assertTrue(service.list().contains(created1));

        assertEquals(created1, service.get(created1.getUri()));

        assertNull("Collection with same directory name cannot be created", service.create(c1));

        var patch = new Collection();
        patch.setUri(created1.getUri());
        patch.setName("new name");
        patch.setDescription("new descr");
        patch.setLocation("dir2");
        service.update(patch);

        var updated = service.get(created1.getUri());
        assertEquals("new name", updated.getName());
        assertEquals("new descr", updated.getDescription());
        assertEquals("dir2", updated.getLocation());

        var c2 = new Collection();
        c2.setName("c2");
        c2.setLocation("dir3");
        c2.setDescription("blah");
        c2.setType("LOCAL");
        var created2 = service.create(c2);
        assertEquals(2, service.list().size());

        service.delete(created2.getUri());
        assertEquals(1, service.list().size());
    }
}