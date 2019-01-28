package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Before;
import org.junit.Test;

import java.util.List;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_CREATED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PATH;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.RDF_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_COLLECTION;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class RdfBackedVfsResourceFactoryIntegrationTest {
    private static final String COLLECTION_ID = "http://collection";
    public static final String COLLECTION_DIR = "/directory1";

    VfsResourceFactory resourceFactory;
    Model model;

    @Before
    public void setUp() {
        Dataset dataset = DatasetFactory.createTxnMem();
        model = dataset.getDefaultModel();
        resourceFactory = new RdfBackedVfsResourceFactory(new RDFConnectionLocal(dataset));

        // Setup basic collection
        Resource collection = model.createResource(COLLECTION_ID);

        model.add(collection, RDF_TYPE, TYPE_COLLECTION);
        model.add(collection, NAME, "My collection");
        model.add(collection, PATH, COLLECTION_DIR);
        model.add(collection, DATE_CREATED, "2019-01-23T12:55:01+00:00");
    }

    @Test
    public void testIntegration() {
        // Create directory within collection
        assertNull(resourceFactory.getResource(COLLECTION_DIR + "/subdir"));
        assertNotNull(resourceFactory.createDirectory(COLLECTION_ID, COLLECTION_DIR + "/subdir"));

        // Verify empty directory creation
        VfsResource directory = resourceFactory.getResource(COLLECTION_DIR + "/subdir");
        assertEquals(0, resourceFactory.getChildren(directory.getUniqueId()).size());

        // Create a file within the directory
        VfsFileResource file = resourceFactory.storeFile(directory.getUniqueId(), COLLECTION_DIR + "/subdir/data.txt", 10l, "text/plain", "some-location");

        // The resource should now show up within the directory
        List<? extends VfsResource> children = resourceFactory.getChildren(directory.getUniqueId());
        assertEquals(1, children.size());
        assertTrue(children.contains(file));
    }

}
