package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.contents.StoredContent;
import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import org.apache.commons.io.IOUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.ModelFactory;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.time.ZonedDateTime;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_CREATED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_MODIFIED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PARENT;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PATH;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.RDF_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_COLLECTION;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_DIRECTORY;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class AbstractRdfCollectionResourceTest {

    @Mock
    private RdfBackedVfsResourceFactory resourceFactory;

    @Mock
    private VfsContentStore contentStore;

    @Test
    public void testStoreFile() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        when(contentStore.putContent("/dir/test.txt", inputStream)).thenReturn(new StoredContent("test-location", 20l));
        AbstractRdfCollectionResource parent = instantiateTestResource("http://test-resource", "/dir");
        parent.createFile("test.txt", "abcdef", inputStream);

        verify(contentStore).putContent("/dir/test.txt", inputStream);
        verify(resourceFactory).storeFile("http://test-resource", "/dir/test.txt", 20l, "abcdef", "test-location");
    }

    @Test
    public void testStoreFileFailsOnEmptyParams() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        AbstractRdfCollectionResource parent = instantiateTestResource("http://test-resource", "/dir");


        try {
            parent.createFile(null, "abcdef", inputStream);
            fail("Storing a file without a name should cause an exception");
        } catch(IllegalArgumentException e) {
            // Expected exception
        }

        try {
            parent.createFile("", "abcdef", inputStream);
            fail("Storing a file with an empty name should cause an exception");
        } catch(IllegalArgumentException e) {
            // Expected exception
        }

        try {
            parent.createFile("dirname/filename", "abcdef", inputStream);
            fail("Storing a file with an a name including the directory separator must fail");
        } catch(IllegalArgumentException e) {
            // Expected exception
        }

        verify(contentStore, times(0)).putContent(any(), any());
        verify(resourceFactory, times(0)).storeFile(any(), any(), any(), any(), any());
    }

    @Test
    public void testFailedContentStorageDoesNotShowUpInResourcesForNewFile() throws IOException {
        String inputText = "Test text";
        Charset charset = UTF_8;
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);

        when(contentStore.putContent("/dir/test.txt", inputStream)).thenThrow(new IOException());

        try {
            AbstractRdfCollectionResource parent = instantiateTestResource("http://test-resource", "/dir");
            parent.createFile("test.txt", "abcdef", inputStream);
            fail("IOException on storage should be propagated to the client");
        } catch(IOException e) {
            // Expected exception
        }

        verify(resourceFactory, times(0)).storeFile(any(), any(), any(), any(), any());
    }


    @Test
    public void testCreateDirectory() {
        // Create a parent collection
        TestResource parent = instantiateTestResource("http://parent", "/test");

        // Create a collection
        VfsDirectoryResource resource = parent.createCollection("xyz");

        verify(resourceFactory).createDirectory("http://parent", "/test/xyz");
    }

    private TestResource instantiateTestResource(String uri, String path) {
        Model model = ModelFactory.createDefaultModel();
        Resource resource = model.createResource(uri);
        model.add(resource, RDF_TYPE, TYPE_DIRECTORY);
        model.add(resource, PATH, path);

        return new TestResource(resource, model, resourceFactory, contentStore);
    }

    class TestResource extends AbstractRdfCollectionResource {
        final Model model;

        /**
         * Instantiates a resource object by reading values from the RDF model
         * <p>
         * Please note that if multiple triples exist for the same property, the behaviour is undefined!
         *
         * @param rdfResource
         * @param model
         * @param resourceFactory
         * @param contentStore
         */
        public TestResource(Resource rdfResource, Model model, RdfBackedVfsResourceFactory resourceFactory, VfsContentStore contentStore) {
            super(rdfResource, model, resourceFactory, contentStore);
            this.model = model;
        }
    }
}
