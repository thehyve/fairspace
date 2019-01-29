package io.fairspace.saturn.webdav.vfs.resources.rdf;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.junit.Test;

import java.time.ZonedDateTime;
import java.util.GregorianCalendar;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CREATOR;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_CREATED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_MODIFIED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PARENT;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.SCHEMA_IDENTIFIER;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;

public class AbstractRdfResourceTest {
    @Test
    public void testName() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        model.add(resource2, NAME, "resource-name");

        AbstractRdfResource vfsResource1 = createResource(resource1, model);
        assertNull(vfsResource1.getName());

        AbstractRdfResource vfsResource2 = createResource(resource2, model);
        assertEquals("resource-name", vfsResource2.getName());
    }

    @Test
    public void testIdentifier() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");

        AbstractRdfResource vfsResource1 = createResource(resource1, model);
        assertEquals("http://resource1", vfsResource1.getUniqueId());

        AbstractRdfResource vfsResource2 = createResource(resource2, model);
        assertEquals("http://resource2", vfsResource2.getUniqueId());
    }

    @Test
    public void testCreatedDate() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        Resource resource3 = model.createResource("http://resource3");
        Resource resource4 = model.createResource("http://resource4");
        model.add(resource2, DATE_CREATED, model.createTypedLiteral(GregorianCalendar.from(ZonedDateTime.parse("2019-01-23T12:58:01+03:00"))));
        model.add(resource3, DATE_CREATED, model.createTypedLiteral(GregorianCalendar.from(ZonedDateTime.parse("2019-01-23T12:58:01Z"))));
        model.add(resource4, DATE_CREATED, "unparsable-date");

        AbstractRdfResource vfsResource1 = createResource(resource1, model);
        assertEquals(null, vfsResource1.getCreatedDate());

        AbstractRdfResource vfsResource2 = createResource(resource2, model);
        assertEquals(ZonedDateTime.parse("2019-01-23T12:58:01+03:00").toInstant(), vfsResource2.getCreatedDate());

        // Timezones are not needed. If not specified, UTC is assumed
        AbstractRdfResource vfsResource3 = createResource(resource3, model);
        assertEquals(ZonedDateTime.parse("2019-01-23T12:58:01Z").toInstant(), vfsResource3.getCreatedDate());

        // Set to null for unparsable dates
        AbstractRdfResource vfsResource4 = createResource(resource4, model);
        assertEquals(null, vfsResource4.getCreatedDate());
    }

    @Test
    public void testModifiedDate() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        Resource resource3 = model.createResource("http://resource3");
        Resource resource4 = model.createResource("http://resource4");
        model.add(resource2, DATE_MODIFIED, model.createTypedLiteral(GregorianCalendar.from(ZonedDateTime.parse("2019-01-23T12:58:01+03:00"))));
        model.add(resource3, DATE_MODIFIED, model.createTypedLiteral(GregorianCalendar.from(ZonedDateTime.parse("2019-01-23T12:58:01Z"))));
        model.add(resource4, DATE_MODIFIED, "unparsable-date");

        AbstractRdfResource vfsResource1 = createResource(resource1, model);
        assertEquals(null, vfsResource1.getModifiedDate());

        AbstractRdfResource vfsResource2 = createResource(resource2, model);
        assertEquals(ZonedDateTime.parse("2019-01-23T12:58:01+03:00").toInstant(), vfsResource2.getModifiedDate());

        // Timezones are not needed. If not specified, UTC is assumed
        AbstractRdfResource vfsResource3 = createResource(resource3, model);
        assertEquals(ZonedDateTime.parse("2019-01-23T12:58:01Z").toInstant(), vfsResource3.getModifiedDate());

        // Set to null for unparsable dates
        AbstractRdfResource vfsResource4 = createResource(resource4, model);
        assertEquals(null, vfsResource4.getModifiedDate());
    }

    @Test
    public void testCreator() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        Resource user = model.createResource("http://user");

        model.add(resource2, CREATOR, user);
        model.add(user, SCHEMA_IDENTIFIER, "user-id");
        model.add(user, NAME, "Donald Tusk");

        AbstractRdfResource vfsResource1 = createResource(resource1, model);
        assertNull(vfsResource1.getCreator());

        AbstractRdfResource vfsResource2 = createResource(resource2, model);
        assertNotNull(vfsResource2.getCreator());
        assertEquals("user-id", vfsResource2.getCreator().getId());
        assertEquals("Donald Tusk", vfsResource2.getCreator().getName());
    }

    @Test
    public void testCreatorPartialData() {
        // Both the id and name of the creator (or both) could be missing
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        Resource resource3 = model.createResource("http://resource3");
        Resource user1 = model.createResource("http://user1");
        Resource user2 = model.createResource("http://user2");
        Resource user3 = model.createResource("http://user3");

        model.add(resource1, CREATOR, user1);
        model.add(resource2, CREATOR, user2);
        model.add(resource3, CREATOR, user3);
        model.add(user1, SCHEMA_IDENTIFIER, "user-id");
        model.add(user2, NAME, "Donald Tusk");

        AbstractRdfResource vfsResource1 = createResource(resource1, model);
        assertNotNull(vfsResource1.getCreator());
        assertEquals("user-id", vfsResource1.getCreator().getId());
        assertNull(vfsResource1.getCreator().getName());

        AbstractRdfResource vfsResource2 = createResource(resource2, model);
        assertNotNull(vfsResource2.getCreator());
        assertNull(vfsResource2.getCreator().getId());
        assertEquals("Donald Tusk", vfsResource2.getCreator().getName());

        AbstractRdfResource vfsResource3 = createResource(resource3, model);
        assertNotNull(vfsResource3.getCreator());
        assertNull(vfsResource3.getCreator().getId());
        assertNull(vfsResource3.getCreator().getName());
    }

    private AbstractRdfResource createResource(Resource resource, Model model) {
        return new AbstractRdfResource(resource, model) {};
    }
}
