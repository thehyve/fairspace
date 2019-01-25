package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.NodeIterator;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdf.model.StmtIterator;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Before;
import org.junit.Test;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_LOCATION;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CREATOR;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_CREATED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_MODIFIED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.FILESIZE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.IS_READY;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PARENT;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PATH;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.RDF_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_DIRECTORY;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_FILE;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class RdfBackedVfsResourceFactoryTest {
    VfsResourceFactory resourceFactory;
    Model model;

    @Before
    public void setUp() {
        Dataset dataset = DatasetFactory.createTxnMem();
        model = dataset.getDefaultModel();
        resourceFactory = new RdfBackedVfsResourceFactory(new RDFConnectionLocal(dataset));

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
        // TODO: Test timezones, formats

    }

    @Test
    public void testCreator() {
        // TODO: Test username, missing value, etc
    }

    @Test
    public void testFilesize() {
        // TODO: Test username, missing value, etc
    }

    // TODO: Test edge cases for collection creation
    @Test
    public void testCreateCollection() {
        // Create a parent collection
        Resource parent = model.createResource("http://parent");
        model.add(parent, RDF_TYPE, TYPE_DIRECTORY);
        model.add(parent, NAME, "test");
        model.add(parent, PATH, "/test");

        // Create a collection
        VfsDirectoryResource resource = resourceFactory.createCollection("http://parent", "/test/xyz");

        // Verify how it is stored
        Resource directory = model.createResource(resource.getUniqueId());

        assertTrue(model.contains(directory, RDF_TYPE, TYPE_DIRECTORY));
        assertTrue(model.contains(directory, NAME, "xyz"));
        assertTrue(model.contains(directory, PATH, "/test/xyz"));
        assertTrue(model.contains(directory, IS_READY, "true"));
        assertTrue(model.contains(directory, PARENT, parent));

        // Verify dates
        Statement dateCreated = model.getProperty(directory, DATE_CREATED);
        ZonedDateTime storedCreatedDate = ZonedDateTime.parse(dateCreated.getObject().toString());
        assertDateIsJustNow(storedCreatedDate);

        Statement dateModified = model.getProperty(directory, DATE_MODIFIED);
        ZonedDateTime storedModifiedDate = ZonedDateTime.parse(dateModified.getObject().toString());
        assertDateIsJustNow(storedModifiedDate);

        // Verify returned value
        assertEquals("xyz", resource.getName());
        assertEquals("/test/xyz", resource.getPath());
        assertEquals("http://parent", resource.getParentId());
        assertEquals(storedCreatedDate, resource.getCreatedDate());
        assertEquals(storedModifiedDate, resource.getModifiedDate());
    }

    // TODO: Test edge cases
    @Test
    public void testMarkFileStored() {
        // Create a file stored in the triple store
        String previousDate = ZonedDateTime.now().minusDays(1).toString();
        Resource file= model.createResource("http://justuploaded");
        model.add(file, RDF_TYPE, TYPE_FILE);
        model.add(file, NAME, "test");
        model.add(file, PATH, "/test");
        model.add(file, CONTENT_LOCATION, "somewhere");
        model.add(file, IS_READY, "false");
        model.add(file, DATE_MODIFIED, previousDate);
        model.add(file, DATE_CREATED, previousDate);

        // Mark it as stored
        VfsFileResource fileResource = new RdfFileResource(file, model);
        VfsFileResource finalResource = resourceFactory.markFileStored(fileResource, "otherlocation");

        // Verify date created has not changed
        assertSingleValue(file, DATE_CREATED);
        assertTrue(model.contains(file, DATE_CREATED, previousDate));

        // Verify date modified has been changed
        assertSingleValue(file, DATE_MODIFIED);
        Statement dateModified = model.getProperty(file, DATE_MODIFIED);
        ZonedDateTime storedModifiedDate = ZonedDateTime.parse(dateModified.getObject().toString());
        assertDateIsJustNow(storedModifiedDate);

        // Verify content_location has updated
        assertSingleValue(file, CONTENT_LOCATION);
        assertTrue(model.contains(file, CONTENT_LOCATION, "otherlocation"));

        // Verify that the file is marked as ready
        assertSingleValue(file, IS_READY);
        assertTrue(model.contains(file, IS_READY, "true"));
    }

    // TODO: Test edge cases for retrieving children
    @Test
    public void testGetChildren() {
        for (StmtIterator it = model.listStatements(); it.hasNext(); ) {
            System.out.println(it.next());
        }
        List<? extends VfsResource> children = resourceFactory.getChildren("http://subdirectory");

        assertEquals(2, children.size());
        assertTrue(children.stream().anyMatch(resource ->
            ((VfsResource) resource).getName().equals("data.txt") &&
                    resource instanceof VfsFileResource
        ));
        assertTrue(children.stream().anyMatch(resource ->
                ((VfsResource) resource).getName().equals("temp") &&
                        resource instanceof VfsDirectoryResource
        ));
    }

    // TODO: Test edge cases for file creation
    @Test
    public void testCreateFile() {
        // Create a parent collection
        Resource parent = model.createResource("http://parent");
        model.add(parent, RDF_TYPE, TYPE_DIRECTORY);
        model.add(parent, NAME, "test");
        model.add(parent, PATH, "/test");

        // Create a file
        VfsFileResource file = resourceFactory.createFile("http://parent", "/test/path", 123l, "text/html");

        // Verify how it is stored
        Resource resource = model.createResource(file.getUniqueId());

        assertTrue(model.contains(resource, RDF_TYPE, TYPE_FILE));
        assertTrue(model.contains(resource, NAME, "path"));
        assertTrue(model.contains(resource, PATH, "/test/path"));
        assertTrue(model.contains(resource, PARENT, parent));
        assertTrue(model.contains(resource, IS_READY, "false"));

        // Verify dates
        Statement dateCreated = model.getProperty(resource, DATE_CREATED);
        ZonedDateTime storedCreatedDate = ZonedDateTime.parse(dateCreated.getObject().toString());
        assertDateIsJustNow(storedCreatedDate);

        Statement dateModified = model.getProperty(resource, DATE_MODIFIED);
        ZonedDateTime storedModifiedDate = ZonedDateTime.parse(dateModified.getObject().toString());
        assertDateIsJustNow(storedModifiedDate);

        // Verify returned value
        assertEquals("path", file.getName());
        assertEquals("/test/path", file.getPath());
        assertEquals("http://parent", file.getParentId());
        assertEquals(storedCreatedDate, file.getCreatedDate());
        assertEquals(storedModifiedDate, file.getModifiedDate());
        assertFalse(file.isReady());
    }


    public void testIntegration() {}

    private void setupTestModel() {
        Resource directory = model.createResource("http://directory");
        Resource subdirectory = model.createResource("http://subdirectory");
        Resource file = model.createResource("http://file");
        Resource failed = model.createResource("http://failed");
        Resource additionaldirectory = model.createResource("http://additional-directory");
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
        model.add(file, IS_READY, "true");
        model.add(file, PARENT, subdirectory);

        // Add another subdirectory
        model.add(additionaldirectory, RDF_TYPE, TYPE_DIRECTORY);
        model.add(additionaldirectory, NAME, "temp");
        model.add(additionaldirectory, PATH, "/directory/subdirectory/temp");
        model.add(additionaldirectory, DATE_CREATED, "2019-01-23T12:58:01+00:00");
        model.add(additionaldirectory, CREATOR, user);
        model.add(additionaldirectory, PARENT, subdirectory);
        model.add(additionaldirectory, IS_READY, "true");

        // Add a failed file
        model.add(failed, RDF_TYPE, TYPE_FILE);
        model.add(failed, NAME, "failed.txt");
        model.add(failed, PATH, "/directory/subdirectory/failed.txt");
        model.add(failed, CONTENT_LOCATION, "/somewhere-else.txt");
        model.add(failed, CONTENT_TYPE, "text/plain");
        model.add(failed, FILESIZE, "1MB");
        model.add(failed, DATE_CREATED, "2019-01-23T12:58:01+00:00");
        model.add(failed, CREATOR, user);
        model.add(failed, IS_READY, "false");
        model.add(failed, PARENT, subdirectory);

    }

    /**
     * Verifies that the given date is very recent (in terms of test execution)
     * @param date
     */
    private void assertDateIsJustNow(ZonedDateTime date) {
        // Verify the stored date is at most a second before the current date
        assertTrue(date.isBefore(ZonedDateTime.now()));
        assertTrue(date.plus(1, ChronoUnit.SECONDS).isAfter(ZonedDateTime.now()));
    }

    /**
     * Checks whether the model contains only a single value for the given subject and predicate
     * @param subject
     * @param predicate
     */
    private void assertSingleValue(Resource subject, Property predicate) {
        NodeIterator nodeIterator = model.listObjectsOfProperty(subject, predicate);

        assertTrue("Model contains 0 values for <" + subject + "> <" + predicate + ">; 1 expected", nodeIterator.hasNext());
        nodeIterator.next();
        assertFalse("Model contains more than 1 value for <" + subject + "> <" + predicate + ">; 1 expected", nodeIterator.hasNext());
    }


}
