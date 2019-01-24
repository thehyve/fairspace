package io.fairspace.saturn.webdav.vfs.resources.rdf;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.junit.Test;

import java.time.ZonedDateTime;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_CREATED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_MODIFIED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.IS_READY;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PARENT;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class RdfAbstractResourceTest {
    @Test
    public void testName() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        model.add(resource2, NAME, "resource-name");

        RdfAbstractResource vfsResource1 = createResource(resource1, model);
        assertNull(vfsResource1.getName());

        RdfAbstractResource vfsResource2 = createResource(resource2, model);
        assertEquals("resource-name", vfsResource2.getName());
    }

    @Test
    public void testIdentifier() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");

        RdfAbstractResource vfsResource1 = createResource(resource1, model);
        assertEquals("http://resource1", vfsResource1.getUniqueId());

        RdfAbstractResource vfsResource2 = createResource(resource2, model);
        assertEquals("http://resource2", vfsResource2.getUniqueId());
    }

    @Test
    public void testIsReady() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        Resource resource3 = model.createResource("http://resource3");
        model.add(resource2, IS_READY, "false");
        model.add(resource3, IS_READY, "true");

        RdfAbstractResource vfsResource1 = createResource(resource1, model);
        assertTrue(vfsResource1.isReady());

        RdfAbstractResource vfsResource2 = createResource(resource2, model);
        assertFalse(vfsResource2.isReady());

        RdfAbstractResource vfsResource3 = createResource(resource3, model);
        assertTrue(vfsResource3.isReady());
    }

    @Test
    public void testCreatedDate() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        Resource resource3 = model.createResource("http://resource3");
        Resource resource4 = model.createResource("http://resource4");
        model.add(resource2, DATE_CREATED, "2019-01-23T12:58:01+03:00");
        model.add(resource3, DATE_CREATED, "2019-01-23T12:58:01");
        model.add(resource4, DATE_CREATED, "unparsable-date");

        RdfAbstractResource vfsResource1 = createResource(resource1, model);
        assertEquals(null, vfsResource1.getCreatedDate());

        RdfAbstractResource vfsResource2 = createResource(resource2, model);
        assertEquals(ZonedDateTime.parse("2019-01-23T12:58:01+03:00"), vfsResource2.getCreatedDate());

        // Require a timezone to be specified
        RdfAbstractResource vfsResource3 = createResource(resource3, model);
        assertEquals(null, vfsResource3.getCreatedDate());

        // Set to null for unparsable dates
        RdfAbstractResource vfsResource4 = createResource(resource4, model);
        assertEquals(null, vfsResource4.getCreatedDate());
    }

    @Test
    public void testModifiedDate() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        Resource resource3 = model.createResource("http://resource3");
        Resource resource4 = model.createResource("http://resource4");
        model.add(resource2, DATE_MODIFIED, "2019-01-23T12:58:01+03:00");
        model.add(resource3, DATE_MODIFIED, "2019-01-23T12:58:01");
        model.add(resource4, DATE_MODIFIED, "unparsable-date");

        RdfAbstractResource vfsResource1 = createResource(resource1, model);
        assertEquals(null, vfsResource1.getModifiedDate());

        RdfAbstractResource vfsResource2 = createResource(resource2, model);
        assertEquals(ZonedDateTime.parse("2019-01-23T12:58:01+03:00"), vfsResource2.getModifiedDate());

        // Require a timezone to be specified
        RdfAbstractResource vfsResource3 = createResource(resource3, model);
        assertEquals(null, vfsResource3.getModifiedDate());

        // Set to null for unparsable dates
        RdfAbstractResource vfsResource4 = createResource(resource4, model);
        assertEquals(null, vfsResource4.getModifiedDate());
    }

    @Test
    public void testParentId() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        model.add(resource1, PARENT, resource2);

        RdfAbstractResource vfsResource1 = createResource(resource1, model);
        assertEquals("http://resource2", vfsResource1.getParentId());

        RdfAbstractResource vfsResource2 = createResource(resource2, model);
        assertNull(vfsResource2.getParentId());
    }

    private RdfAbstractResource createResource(Resource resource, Model model) {
        return new RdfAbstractResource(resource, model) {};
    }
}
