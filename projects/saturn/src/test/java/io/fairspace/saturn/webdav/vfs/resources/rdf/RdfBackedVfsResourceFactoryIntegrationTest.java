package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.contents.LocalImmutableVfsContentStore;
import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import io.fairspace.saturn.webdav.vfs.resources.VfsCollectionResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import org.apache.commons.io.IOUtils;
import org.apache.jena.query.Dataset;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.apache.jena.vocabulary.RDF;
import org.junit.Before;
import org.junit.Rule;
import org.junit.Test;
import org.junit.rules.TemporaryFolder;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.Charset;
import java.util.List;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PATH;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.TYPE_COLLECTION;
import static java.nio.charset.StandardCharsets.UTF_8;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class RdfBackedVfsResourceFactoryIntegrationTest {
    @Rule
    public TemporaryFolder folder = new TemporaryFolder(new File(System.getProperty("java.io.tmpdir")));

    private static final String COLLECTION_ID = "http://collection";
    public static final String COLLECTION_DIR = "/directory1";

    VfsResourceFactory resourceFactory;
    VfsContentStore contentStore;
    Model model;

    @Before
    public void setUp() {
        Dataset dataset = DatasetFactory.createTxnMem();
        model = dataset.getDefaultModel();

        contentStore = new LocalImmutableVfsContentStore(folder.getRoot());
        resourceFactory = new RdfBackedVfsResourceFactory(new RDFConnectionLocal(dataset), contentStore);

        // Setup basic collection
        Resource collection = model.createResource(COLLECTION_ID);

        model.add(collection, RDF.type, TYPE_COLLECTION);
        model.add(collection, NAME, "My collection");
        model.add(collection, PATH, COLLECTION_DIR);
    }

    @Test
    public void testIntegration() throws IOException {
        Charset charset = UTF_8;

        VfsCollectionResource collectionResource = (VfsCollectionResource) resourceFactory.getResource(COLLECTION_DIR);

        // Create directory within collection
        assertNull(resourceFactory.getResource(COLLECTION_DIR + "/subdir"));
        assertNotNull(collectionResource.createCollection("subdir"));

        // Verify empty directory creation
        VfsCollectionResource directory = (VfsCollectionResource) resourceFactory.getResource(COLLECTION_DIR + "/subdir");
        assertEquals(0, directory.getChildren().size());

        // Create a file within the directory
        String inputText = "Test text";
        InputStream inputStream = IOUtils.toInputStream(inputText, charset);
        VfsFileResource file = (VfsFileResource) directory.createFile("data.txt", "text/plain", inputStream);

        // Verify the file data
        assertEquals(9l, file.getFileSize());
        assertEquals(COLLECTION_DIR + "/subdir/data.txt", file.getPath());

        // Verify the file contents
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        file.sendContent(outputStream);
        String fileContents = outputStream.toString(charset.name());
        assertEquals(inputText, fileContents);

        // The resource should now show up within the directory
        List<? extends VfsResource> children = directory.getChildren();
        assertEquals(1, children.size());
        assertTrue(children.contains(file));

        // Overwrite the file contents
        String newInputText = "Some Chinese text 人物";
        InputStream newInputStream = IOUtils.toInputStream(newInputText, charset);
        VfsFileResource updatedFile = file.updateContents("text/plain;charset=UTF-8", newInputStream);

        // Verify the file data
        assertEquals(24l, updatedFile.getFileSize());

        // Verify the updated file contents
        outputStream = new ByteArrayOutputStream();
        updatedFile.sendContent(outputStream);
        String updatedFileContents = outputStream.toString(charset.name());
        assertEquals(newInputText, updatedFileContents);

    }

}
