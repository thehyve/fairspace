package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.junit.Before;
import org.junit.Test;

import java.time.ZonedDateTime;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.*;
import static org.junit.Assert.*;

public class RdfBackedVfsResourceFactoryTest {
    VfsResourceFactory resourceFactory;
    Dataset dataset;
    Model model;

    @Before
    public void setUp() {
        dataset = DatasetFactory.createTxnMem();
        model = dataset.getDefaultModel();
        resourceFactory = new RdfBackedVfsResourceFactory(dataset);

        setupTestModel();
    }

    @Test
    public void testGetNonExistingResourceReturnsNull() {
        assertNull(resourceFactory.getResource("/not-existing"));
    }

    @Test
    public void testGetWithTrailingSlash() {
        assertNotNull(resourceFactory.getResource("/directory"));
        assertNull(resourceFactory.getResource("/directory/"));
    }

    @Test
    public void testGetResourceForDirectory() {
        // Verify top level directory
        VfsResource directoryResource = resourceFactory.getResource("/directory");

        assertNotNull(directoryResource);
        assertTrue(directoryResource instanceof VfsDirectoryResource);
        assertTrue(directoryResource.isReady());
        assertNull(directoryResource.getParentId());

        assertEquals("directory", directoryResource.getName());
        assertEquals("http://directory", directoryResource.getUniqueId());
        assertEquals(ZonedDateTime.parse("2019-01-23T12:55:01+00:00"), directoryResource.getCreatedDate());

        // Verify subdirectory
        VfsResource subdirectoryResource = resourceFactory.getResource("/directory/subdirectory");
        assertEquals("subdirectory", subdirectoryResource.getName());
        assertEquals("http://subdirectory", subdirectoryResource.getUniqueId());
    }

    @Test
    public void testGetResourceForFile() {
        // Verify top level directory
        VfsResource resource = resourceFactory.getResource("/directory/subdirectory/data.txt");

        assertNotNull(resource);
        assertTrue(resource instanceof VfsFileResource);

        VfsFileResource fileResource = (VfsFileResource) resource;

        assertTrue(fileResource.isReady());
        assertEquals("http://file", fileResource.getUniqueId());
        assertEquals("http://subdirectory", fileResource.getParentId());

        assertEquals("/location-on-disk/abc.txt", fileResource.getContentLocation());
        assertEquals("text/plain", fileResource.getMimeType());
        assertEquals(2097152l, fileResource.getFileSize());
    }

    @Test
    public void testDateCreated() {
        // Test timezones, formats
    }

    @Test
    public void testCreator() {
        // Test username, missing value, etc
    }

    @Test
    public void testFilesize() {
        // Test username, missing value, etc
    }

    private void setupTestModel() {
        Resource directory = model.createResource("http://directory");
        Resource subdirectory = model.createResource("http://subdirectory");
        Resource file = model.createResource("http://file");
        Resource user = model.createResource("http://user");

        // Add a user
        model.add(user, NAME, "Donald Trump");

        // Setup a directory structure
        model.add(directory, RDF_TYPE, TYPE_DIRECTORY);
        model.add(directory, NAME, "directory");
        model.add(directory, PATH, "/directory");
        model.add(directory, DATE_CREATED, "2019-01-23T12:55:01+00:00");
        model.add(directory, CREATOR, user);

        model.add(subdirectory, RDF_TYPE, TYPE_DIRECTORY);
        model.add(subdirectory, NAME, "subdirectory");
        model.add(subdirectory, PATH, "/directory/subdirectory");
        model.add(subdirectory, PARENT, directory);
        model.add(subdirectory, IS_READY, "false");

        // Add a file
        model.add(file, RDF_TYPE, TYPE_FILE);
        model.add(file, NAME, "data.txt");
        model.add(file, PATH, "/directory/subdirectory/data.txt");
        model.add(file, CONTENT_LOCATION, "/location-on-disk/abc.txt");
        model.add(file, CONTENT_TYPE, "text/plain");
        model.add(file, FILESIZE, "2MB");
        model.add(file, DATE_CREATED, "2019-01-23T12:58:01+00:00");
        model.add(file, CREATOR, user);
        model.add(file, PARENT, subdirectory);
    }
}
