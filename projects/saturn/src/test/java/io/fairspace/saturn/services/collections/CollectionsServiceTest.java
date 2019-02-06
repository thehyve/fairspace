package io.fairspace.saturn.services.collections;

import io.fairspace.saturn.auth.UserInfo;
import org.junit.Test;

import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;

public class CollectionsServiceTest {

    @Test
    public void basicFunctionality() {
        var service = new CollectionsService(connect(createTxnMem()), "http://example.com/iri/",
                () -> new UserInfo("userId", null, null, null));

        assertTrue(service.list().isEmpty());

        var c1 = new Collection();
        c1.setName("c1");
        c1.setDescription("descr");
        c1.setType("LOCAL");

        var created1 = service.create(c1);
        assertTrue(created1.getUri().startsWith("http://example.com/iri/"));
        assertEquals(c1.getName(), created1.getName());
        assertEquals(c1.getDescription(), created1.getDescription());
        assertEquals(c1.getType(), created1.getType());
        assertEquals("userId", created1.getCreator());

        assertEquals(1, service.list().size());
        assertTrue(service.list().contains(created1));

        assertEquals(created1, service.get(created1.getUri()));

        var patch = new Collection();
        patch.setUri(created1.getUri());
        patch.setName("new name");
        patch.setDescription("new descr");
        service.update(patch);

        var updated = service.get(created1.getUri());
        assertEquals("new name", updated.getName());
        assertEquals("new descr", updated.getDescription());

        var c2 = new Collection();
        c2.setName("c2");
        c2.setDescription("blah");
        c2.setType("LOCAL");
        var created2 = service.create(c2);
        assertEquals(2, service.list().size());

        service.delete(created2.getUri());
        assertEquals(1, service.list().size());
    }
}