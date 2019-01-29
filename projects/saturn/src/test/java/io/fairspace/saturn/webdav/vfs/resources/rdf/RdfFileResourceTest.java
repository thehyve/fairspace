package io.fairspace.saturn.webdav.vfs.resources.rdf;

import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.junit.Test;

import java.time.ZonedDateTime;
import java.util.GregorianCalendar;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_LOCATION;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.FILESIZE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

public class RdfFileResourceTest {
    @Test
    public void testtest() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        model.add(resource1, NAME, model.createTypedLiteral(GregorianCalendar.from(ZonedDateTime.now())));

        Statement property = model.getProperty(resource1, NAME);


    }

        @Test
    public void testBasicProperties() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        model.add(resource1, NAME, "resource-name");

        RdfAbstractResource vfsResource1 = new RdfFileResource(resource1, model);
        assertEquals("resource-name", vfsResource1.getName());
        assertEquals("http://resource1", vfsResource1.getUniqueId());
    }

    @Test
    public void testMimeType() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        model.add(resource2, CONTENT_TYPE, "application/json");

        RdfFileResource vfsResource1 = new RdfFileResource(resource1, model);
        assertNull(vfsResource1.getMimeType());

        RdfFileResource vfsResource2 = new RdfFileResource(resource2, model);
        assertEquals("application/json", vfsResource2.getMimeType());
    }

    @Test
    public void testContentLocation() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        model.add(resource2, CONTENT_LOCATION, "location-on-disk");

        RdfFileResource vfsResource1 = new RdfFileResource(resource1, model);
        assertNull(vfsResource1.getContentLocation());

        RdfFileResource vfsResource2 = new RdfFileResource(resource2, model);
        assertEquals("location-on-disk", vfsResource2.getContentLocation());
    }

    @Test
    public void testFileSize() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        Resource resource3 = model.createResource("http://resource3");
        model.add(resource2, FILESIZE, "1MB");
        model.add(resource3, FILESIZE, "10");

        RdfFileResource vfsResource1 = new RdfFileResource(resource1, model);
        assertEquals(0l, vfsResource1.getFileSize());

        RdfFileResource vfsResource2 = new RdfFileResource(resource2, model);
        assertEquals(1048576l, vfsResource2.getFileSize());

        RdfFileResource vfsResource3 = new RdfFileResource(resource3, model);
        assertEquals(10240, vfsResource3.getFileSize());
    }
}
