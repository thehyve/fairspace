package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_LOCATION;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.FILESIZE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;

@RunWith(MockitoJUnitRunner.class)
public class RdfFileResourceTest {
    @Mock
    RdfBackedVfsResourceFactory resourceFactory;

    @Mock
    VfsContentStore contentStore;


    @Test
    public void testBasicProperties() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        model.add(resource1, NAME, "resource-name");

        AbstractRdfResource vfsResource1 = new FileRdfResource(resource1, model, resourceFactory, contentStore);
        assertEquals("resource-name", vfsResource1.getName());
        assertEquals("http://resource1", vfsResource1.getUniqueId());
    }

    @Test
    public void testMimeType() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        model.add(resource2, CONTENT_TYPE, "application/json");

        FileRdfResource vfsResource1 = new FileRdfResource(resource1, model, resourceFactory, contentStore);
        assertNull(vfsResource1.getContentType());

        FileRdfResource vfsResource2 = new FileRdfResource(resource2, model, resourceFactory, contentStore);
        assertEquals("application/json", vfsResource2.getContentType());
    }

    @Test
    public void testContentLocation() {
        Model model = ModelFactory.createDefaultModel();

        Resource resource1 = model.createResource("http://resource1");
        Resource resource2 = model.createResource("http://resource2");
        model.add(resource2, CONTENT_LOCATION, "location-on-disk");

        FileRdfResource vfsResource1 = new FileRdfResource(resource1, model, resourceFactory, contentStore);
        assertNull(vfsResource1.getContentLocation());

        FileRdfResource vfsResource2 = new FileRdfResource(resource2, model, resourceFactory, contentStore);
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

        FileRdfResource vfsResource1 = new FileRdfResource(resource1, model, resourceFactory, contentStore);
        assertEquals(0l, vfsResource1.getFileSize());

        FileRdfResource vfsResource2 = new FileRdfResource(resource2, model, resourceFactory, contentStore);
        assertEquals(1048576l, vfsResource2.getFileSize());

        FileRdfResource vfsResource3 = new FileRdfResource(resource3, model, resourceFactory, contentStore);
        assertEquals(10240, vfsResource3.getFileSize());
    }
}
