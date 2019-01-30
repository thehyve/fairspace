package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFairspaceCollectionResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsRootResource;
import org.apache.jena.datatypes.xsd.XSDDateTime;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.NodeIterator;
import org.apache.jena.rdf.model.Property;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.GregorianCalendar;
import java.util.List;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_LOCATION;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CREATOR;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_CREATED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_MODIFIED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.FILESIZE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PARENT;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PATH;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.RDF_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.SCHEMA_IDENTIFIER;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_COLLECTION;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_DIRECTORY;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_FILE;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.verify;

@RunWith(MockitoJUnitRunner.class)
public class RdfBackedVfsResourceFactoryTest {
    @Mock
    VfsContentStore contentStore;

    RdfBackedVfsResourceFactory resourceFactory;
    Model model;

    @Before
    public void setUp() {
        Dataset dataset = DatasetFactory.createTxnMem();
        model = dataset.getDefaultModel();
        resourceFactory = new RdfBackedVfsResourceFactory(new RDFConnectionLocal(dataset), contentStore);
    }

    @Test
    public void testGetNonExistingResourceReturnsNull() {
        assertNull(resourceFactory.getResource("/not-existing"));
    }

    @Test
    public void testGetWithTrailingSlash() {
        setupTestModel();

        assertNotNull(resourceFactory.getResource("/directory"));
        assertNull(resourceFactory.getResource("/directory/"));
    }

    @Test
    public void testGetResourceForDirectory() {
        setupTestModel();

        // Verify top level directory
        VfsResource directoryResource = resourceFactory.getResource("/directory");

        assertNotNull(directoryResource);
        assertTrue(directoryResource instanceof VfsDirectoryResource);

        assertEquals("directory", directoryResource.getName());
        assertEquals("http://directory", directoryResource.getUniqueId());
        assertEquals(ZonedDateTime.parse("2019-01-23T12:55:01+00:00").toInstant(), directoryResource.getCreatedDate());

        // Verify subdirectory
        VfsResource subdirectoryResource = resourceFactory.getResource("/directory/subdirectory");
        assertNotNull(subdirectoryResource);
        assertEquals("subdirectory", subdirectoryResource.getName());
        assertEquals("http://subdirectory", subdirectoryResource.getUniqueId());
    }

    @Test
    public void testGetResourceForFile() throws IOException {
        setupTestModel();

        // Verify top level directory
        VfsResource resource = resourceFactory.getResource("/directory/subdirectory/data.txt");

        assertNotNull(resource);
        assertTrue(resource instanceof VfsFileResource);

        VfsFileResource fileResource = (VfsFileResource) resource;

        assertEquals("http://file", fileResource.getUniqueId());

        assertEquals("text/plain", fileResource.getContentType());
        assertEquals(2097152l, fileResource.getFileSize());

        // Verify content location
        OutputStream outputStream = new ByteArrayOutputStream();
        fileResource.sendContent(outputStream);
        verify(contentStore).getContent("/location-on-disk/abc.txt", outputStream);
    }

    @Test
    public void testGetRootResource() {
        // Verify top level directory
        VfsResource resource = resourceFactory.getResource("/");

        assertNotNull(resource);
        assertTrue(resource instanceof VfsRootResource);
    }

    @Test
    public void testGetCreatorForResource() {
        setupTestModel();

        // Verify top level directory
        VfsResource directoryResource = resourceFactory.getResource("/directory");

        assertNotNull(directoryResource);
        assertTrue(directoryResource instanceof VfsDirectoryResource);
        assertNotNull(directoryResource.getCreator());
        assertEquals("Donald Trump", directoryResource.getCreator().getName());
        assertEquals("user-uuid", directoryResource.getCreator().getId());
    }

    @Test
    public void testGetResourceWithoutCreator() {
        Resource directory = model.createResource("http://not-ready");
        model.add(directory, RDF_TYPE, TYPE_DIRECTORY);
        model.add(directory, NAME, "no-creator");
        model.add(directory, PATH, "/no-creator");
        model.add(directory, DATE_CREATED, "2019-01-23T12:55:01+00:00");

        // Verify top level directory
        VfsResource directoryResource = resourceFactory.getResource("/no-creator");

        assertNotNull(directoryResource);
        assertNull(directoryResource.getCreator());
    }

    @Test
    public void testCreateDirectory() {
        // Create a parent collection
        Resource parent = model.createResource("http://parent");
        model.add(parent, RDF_TYPE, TYPE_DIRECTORY);
        model.add(parent, NAME, "test");
        model.add(parent, PATH, "/test");

        // Create a collection
        VfsDirectoryResource resource = resourceFactory.createDirectory("http://parent", "/test/xyz");

        // Verify how it is stored
        Resource directory = model.createResource(resource.getUniqueId());

        assertTrue(model.contains(directory, RDF_TYPE, TYPE_DIRECTORY));
        assertTrue(model.contains(directory, NAME, "xyz"));
        assertTrue(model.contains(directory, PATH, "/test/xyz"));
        assertTrue(model.contains(directory, PARENT, parent));

        // Verify dates
        Statement dateCreated = model.getProperty(directory, DATE_CREATED);
        ZonedDateTime storedCreatedDate = getStoredDateTimeValue(dateCreated);
        assertDateIsJustNow(storedCreatedDate);

        Statement dateModified = model.getProperty(directory, DATE_MODIFIED);
        ZonedDateTime storedModifiedDate = getStoredDateTimeValue(dateModified);
        assertDateIsJustNow(storedModifiedDate);

        // Verify returned value
        assertEquals("xyz", resource.getName());
        assertEquals("/test/xyz", resource.getPath());
        assertEquals(storedCreatedDate.toInstant(), resource.getCreatedDate());
        assertEquals(storedModifiedDate.toInstant(), resource.getModifiedDate());
    }

    @Test
    public void testCreateDirectoryForRoot() {
        // Creating a collection for the root should be prohibited,
        // as the top level directories are collections, which should be
        // created through the Collections API
        resourceFactory.createDirectory(null, "/test/xyz");

        // Verify no triples have been added
        assertTrue(model.isEmpty());
    }

    @Test
    public void testCreateDirectoryWithinCollection() {
        // Create a parent collection
        Resource collection = model.createResource("http://collection");
        model.add(collection, RDF_TYPE, TYPE_COLLECTION);
        model.add(collection, NAME, "my-collection");
        model.add(collection, PATH, "/test");

        // Creating a collection for the root should be prohibited,
        // as the top level directories are collections, which should be
        // created through the Collections API
        VfsDirectoryResource directory = resourceFactory.createDirectory("http://collection", "/test/xyz");

        // Verify directory creation
        Resource resource = model.createResource(directory.getUniqueId());
        assertTrue(model.contains(resource, PATH, "/test/xyz"));
    }

    @Test(expected = NullPointerException.class)
    public void testCreateDirectoryWithoutPath() {
        // Create a parent collection
        Resource collection = model.createResource("http://collection");
        model.add(collection, RDF_TYPE, TYPE_COLLECTION);
        model.add(collection, NAME, "my-collection");
        model.add(collection, PATH, "/test");

        resourceFactory.createDirectory("http://collection", null);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCreateDirectoryWithEmptyPath() {
        // Create a parent collection
        Resource collection = model.createResource("http://collection");
        model.add(collection, RDF_TYPE, TYPE_COLLECTION);
        model.add(collection, NAME, "my-collection");
        model.add(collection, PATH, "/test");

        resourceFactory.createDirectory("http://collection", "");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCreateDirectoryWithPathNotMatchingParent() {
        // Create a parent collection
        Resource collection = model.createResource("http://collection");
        model.add(collection, RDF_TYPE, TYPE_COLLECTION);
        model.add(collection, NAME, "my-collection");
        model.add(collection, PATH, "/test");

        resourceFactory.createDirectory("http://collection", "/other-dir/my-new-dir");
    }

    @Test
    public void testGetChildren() {
        setupTestModel();

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

    @Test
    public void testGetFairspaceCollections() {
        setupTestCollections();

        List<? extends VfsResource> children = resourceFactory.getFairspaceCollections();

        // Please note that for collections, the name equals the path
        // as the name of the collection itself is not relevant to the filesystem
        // as presented to the user
        assertEquals(2, children.size());
        assertTrue(children.stream().anyMatch(resource ->
                ((VfsResource) resource).getName().equals("directory1") &&
                        resource instanceof VfsFairspaceCollectionResource
        ));
        assertTrue(children.stream().anyMatch(resource ->
                ((VfsResource) resource).getName().equals("directory2") &&
                        resource instanceof VfsFairspaceCollectionResource
        ));
    }

    @Test
    public void testGetChildrenForCollection() {
        setupTestCollections();

        List<? extends VfsResource> children = resourceFactory.getChildren("http://collection1");

        assertEquals(1, children.size());
        assertTrue(children.stream().anyMatch(resource ->
                ((VfsResource) resource).getName().equals("data.txt") &&
                        resource instanceof VfsFileResource
        ));
    }

    @Test
    public void testGetChildrenForNonExistingDirectory() {
        List<? extends VfsResource> children = resourceFactory.getChildren("http://not-existing-uri");

        assertEquals(0, children.size());
    }

    @Test
    public void testCreateFile() throws IOException {
        // Create a parent collection
        Resource parent = model.createResource("http://parent");
        model.add(parent, RDF_TYPE, TYPE_DIRECTORY);
        model.add(parent, NAME, "test");
        model.add(parent, PATH, "/test");

        // Create a file
        VfsFileResource file = resourceFactory.storeFile("http://parent", "/test/path", 123l, "text/html", "content-location");

        // Verify how it is stored
        Resource resource = model.createResource(file.getUniqueId());

        assertTrue(model.contains(resource, RDF_TYPE, TYPE_FILE));
        assertTrue(model.contains(resource, NAME, "path"));
        assertTrue(model.contains(resource, PATH, "/test/path"));
        assertTrue(model.contains(resource, PARENT, parent));
        assertTrue(model.contains(resource, FILESIZE, "123B"));
        assertTrue(model.contains(resource, CONTENT_LOCATION, "content-location"));

        // Verify dates
        Statement dateCreated = model.getProperty(resource, DATE_CREATED);
        ZonedDateTime storedCreatedDate = getStoredDateTimeValue(dateCreated);
        assertDateIsJustNow(storedCreatedDate);

        Statement dateModified = model.getProperty(resource, DATE_MODIFIED);
        ZonedDateTime storedModifiedDate = getStoredDateTimeValue(dateModified);
        assertDateIsJustNow(storedModifiedDate);

        // Verify returned value
        assertEquals("path", file.getName());
        assertEquals("/test/path", file.getPath());
        assertEquals(storedCreatedDate.toInstant(), file.getCreatedDate());
        assertEquals(storedModifiedDate.toInstant(), file.getModifiedDate());

        // Verify content location
        OutputStream outputStream = new ByteArrayOutputStream();
        file.sendContent(outputStream);
        verify(contentStore).getContent("content-location", outputStream);
    }

    @Test
    public void testCreateFileInRootDirectoryFails() {
        VfsFileResource file = resourceFactory.storeFile(null, "/test/path", 123l, "text/html", "location");

        assertNull(file);
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCreateFileWithNonExistingParent() {
        // Create a parent collection
        Resource parent = model.createResource("http://parent");
        model.add(parent, RDF_TYPE, TYPE_DIRECTORY);
        model.add(parent, NAME, "test");
        model.add(parent, PATH, "/test");

        resourceFactory.storeFile("http://not-existing", "/test/path", 123l, "text/html", "location");
    }

    @Test(expected = IllegalArgumentException.class)
    public void testCreateFileInvalidPath() {
        // Create a parent collection
        Resource parent = model.createResource("http://parent");
        model.add(parent, RDF_TYPE, TYPE_DIRECTORY);
        model.add(parent, NAME, "test");
        model.add(parent, PATH, "/test");

        resourceFactory.storeFile("http://parent", "/other-path/test.txt", 123l, "text/html", "location");
    }

    @Test
    public void testCreateFileWithoutContentType() {
        // Create a parent collection
        Resource parent = model.createResource("http://parent");
        model.add(parent, RDF_TYPE, TYPE_DIRECTORY);
        model.add(parent, NAME, "test");
        model.add(parent, PATH, "/test");

        VfsFileResource file = resourceFactory.storeFile("http://parent", "/test/test.txt", 123l, null, "location");

        Resource fileResource = model.createResource(file.getUniqueId());
        assertTrue(model.contains(fileResource, PATH, "/test/test.txt"));
        assertNull(model.getProperty(fileResource, CONTENT_TYPE));
    }

    @Test
    public void testUpdateFile() throws IOException {
        // Create a file resource
        ZonedDateTime yesterday = ZonedDateTime.now().minusDays(1);
        Literal yesterdayLiteral = model.createTypedLiteral(GregorianCalendar.from(yesterday));

                Resource file = model.createResource("http://parent");
        model.add(file, RDF_TYPE, TYPE_FILE);
        model.add(file, NAME, "test.txt");
        model.add(file, PATH, "/test.txt");
        model.add(file, DATE_CREATED, yesterdayLiteral);
        model.add(file, DATE_MODIFIED, yesterdayLiteral);
        model.add(file, FILESIZE, "0B");
        model.add(file, CONTENT_LOCATION, "location-on-disk");

        Model modelClone = ModelFactory.createModelForGraph(model.getGraph());
        VfsFileResource fileResource = new FileRdfResource(file, modelClone, resourceFactory, contentStore);

        VfsFileResource updatedFile = resourceFactory.updateFile(fileResource, 10l, "application/json", "other-place");

        // Verify how it is stored
        assertTrue(model.contains(file, RDF_TYPE, TYPE_FILE));
        assertTrue(model.contains(file, NAME, "test.txt"));
        assertTrue(model.contains(file, PATH, "/test.txt"));
        assertTrue(model.contains(file, FILESIZE, "10B"));
        assertTrue(model.contains(file, CONTENT_LOCATION, "other-place"));
        assertTrue(model.contains(file, CONTENT_TYPE, "application/json"));

        // Verify old values are removed
        assertFalse(model.contains(file, FILESIZE, "0B"));
        assertFalse(model.contains(file, CONTENT_LOCATION, "location-on-disk"));
        assertFalse(model.contains(file, DATE_MODIFIED, yesterdayLiteral));

        // Verify dates
        assertTrue(model.contains(file, DATE_CREATED, yesterdayLiteral));

        Statement dateModified = model.getProperty(file, DATE_MODIFIED);
        ZonedDateTime storedModifiedDate = getStoredDateTimeValue(dateModified);
        assertDateIsJustNow(storedModifiedDate);

        // Verify returned value
        assertEquals("test.txt", updatedFile.getName());
        assertEquals("/test.txt", updatedFile.getPath());
        assertEquals(10, updatedFile.getFileSize());
        assertEquals(yesterday.toInstant(), updatedFile.getCreatedDate());
        assertEquals(storedModifiedDate.toInstant(), updatedFile.getModifiedDate());
        assertEquals("application/json", updatedFile.getContentType());

        // Verify content location
        OutputStream outputStream = new ByteArrayOutputStream();
        updatedFile.sendContent(outputStream);
        verify(contentStore).getContent("other-place", outputStream);
    }

    private void setupTestCollections() {
        Literal dateTime1 = createTypedLiteral(ZonedDateTime.parse("2019-01-23T12:55:01+00:00"));
        Literal dateTime2 = createTypedLiteral(ZonedDateTime.parse("2019-01-23T12:58:01+00:00"));

        Resource collection1 = model.createResource("http://collection1");
        Resource collection2 = model.createResource("http://collection2");
        Resource file = model.createResource("http://collection-file");

        model.add(collection1, RDF_TYPE, TYPE_COLLECTION);
        model.add(collection1, NAME, "My collection");
        model.add(collection1, PATH, "/directory1");
        model.add(collection1, DATE_CREATED, dateTime1);

        model.add(collection2, RDF_TYPE, TYPE_COLLECTION);
        model.add(collection2, NAME, "All my data");
        model.add(collection2, PATH, "/directory2");
        model.add(collection2, DATE_CREATED, dateTime2);

        model.add(file, RDF_TYPE, TYPE_FILE);
        model.add(file, NAME, "data.txt");
        model.add(file, PATH, "/directory1/data.txt");
        model.add(file, CONTENT_LOCATION, "/location-on-disk/abc.txt");
        model.add(file, CONTENT_TYPE, "text/plain");
        model.add(file, FILESIZE, "2MB");
        model.add(file, DATE_CREATED, dateTime2);
        model.add(file, PARENT, collection1);
    }

    private void setupTestModel() {
        Literal dateTime1 = createTypedLiteral(ZonedDateTime.parse("2019-01-23T12:55:01+00:00"));
        Literal dateTime2 = createTypedLiteral(ZonedDateTime.parse("2019-01-23T12:58:01+00:00"));

        Resource directory = model.createResource("http://directory");
        Resource subdirectory = model.createResource("http://subdirectory");
        Resource file = model.createResource("http://file");
        Resource failed = model.createResource("http://failed");
        Resource additionaldirectory = model.createResource("http://additional-directory");
        Resource user = model.createResource("http://user");

        // Add a user
        model.add(user, SCHEMA_IDENTIFIER, "user-uuid");
        model.add(user, NAME, "Donald Trump");

        // Setup a directory structure
        model.add(directory, RDF_TYPE, TYPE_DIRECTORY);
        model.add(directory, NAME, "directory");
        model.add(directory, PATH, "/directory");
        model.add(directory, DATE_CREATED, dateTime1);
        model.add(directory, CREATOR, user);

        model.add(subdirectory, RDF_TYPE, TYPE_DIRECTORY);
        model.add(subdirectory, NAME, "subdirectory");
        model.add(subdirectory, PATH, "/directory/subdirectory");
        model.add(subdirectory, PARENT, directory);
        model.add(subdirectory, CREATOR, user);

        // Add a file
        model.add(file, RDF_TYPE, TYPE_FILE);
        model.add(file, NAME, "data.txt");
        model.add(file, PATH, "/directory/subdirectory/data.txt");
        model.add(file, CONTENT_LOCATION, "/location-on-disk/abc.txt");
        model.add(file, CONTENT_TYPE, "text/plain");
        model.add(file, FILESIZE, "2MB");
        model.add(file, DATE_CREATED, dateTime2);
        model.add(file, CREATOR, user);
        model.add(file, PARENT, subdirectory);

        // Add another subdirectory
        model.add(additionaldirectory, RDF_TYPE, TYPE_DIRECTORY);
        model.add(additionaldirectory, NAME, "temp");
        model.add(additionaldirectory, PATH, "/directory/subdirectory/temp");
        model.add(additionaldirectory, DATE_CREATED, dateTime2);
        model.add(additionaldirectory, CREATOR, user);
        model.add(additionaldirectory, PARENT, subdirectory);

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

    private ZonedDateTime getStoredDateTimeValue(Statement dateModified) {
        return ((GregorianCalendar) ((XSDDateTime) dateModified.getObject().asLiteral().getValue()).asCalendar()).toZonedDateTime();
    }

    private Literal createTypedLiteral(ZonedDateTime dateTime) {
        return ModelFactory.createDefaultModel().createTypedLiteral(GregorianCalendar.from(dateTime));
    }


}
