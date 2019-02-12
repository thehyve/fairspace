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
        c1.setPrettyName("c1");
        c1.setDirectoryName("dir1");
        c1.setDescription("descr");
        c1.setType("LOCAL");

        var created1 = service.create(c1);
        assertTrue(created1.getUri().startsWith(getWorkspaceURI()));
        assertEquals(c1.getPrettyName(), created1.getPrettyName());
        assertEquals(c1.getDescription(), created1.getDescription());
        assertEquals(c1.getDirectoryName(), created1.getDirectoryName());
        assertEquals(c1.getType(), created1.getType());
        assertEquals("userId", created1.getCreator());
        assertNotNull(created1.getDateCreated());

        assertEquals(1, service.list().size());
        assertTrue(service.list().contains(created1));

        assertEquals(created1, service.get(created1.getUri()));

        assertNull("Collection with same directory name cannot be created", service.create(c1));

        var patch = new Collection();
        patch.setUri(created1.getUri());
        patch.setPrettyName("new name");
        patch.setDescription("new descr");
        patch.setDirectoryName("dir2");
        service.update(patch);

        var updated = service.get(created1.getUri());
        assertEquals("new name", updated.getPrettyName());
        assertEquals("new descr", updated.getDescription());
        assertEquals("dir2", updated.getDirectoryName());

        var c2 = new Collection();
        c2.setPrettyName("c2");
        c2.setDirectoryName("dir3");
        c2.setDescription("blah");
        c2.setType("LOCAL");
        var created2 = service.create(c2);
        assertEquals(2, service.list().size());

        service.delete(created2.getUri());
        assertEquals(1, service.list().size());
    }
}