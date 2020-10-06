package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.metadata.MetadataService;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.FileItem;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.sparql.util.Context;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.ByteArrayInputStream;
import java.util.Map;

import static io.fairspace.saturn.TestUtils.isomorphic;
import static io.fairspace.saturn.TestUtils.setupRequestContext;
import static io.fairspace.saturn.config.Services.METADATA_SERVICE;
import static io.fairspace.saturn.rdf.ModelUtils.modelOf;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class DirectoryResourceTest {
    private static final String baseUri = "http://example.comapi/v1/webdav";
    private static final int FILE_SIZE = 10;

    private Model model = createTxnMem().getDefaultModel();

    @Mock
    BlobStore store;
    @Mock
    UserService userService;
    @Mock
    MetadataService metadataService;
    @Mock
    FileItem file;
    @Mock
    BlobFileItem blobFileItem;

    Context context = new Context();

    DirectoryResource dir;

    @Before
    public void before() {
        context.set(METADATA_SERVICE, metadataService);
        var factory = new DavFactory(model.createResource(baseUri), store, userService, context);
        dir = new DirectoryResource(factory, model.createResource(baseUri + "/coll/dir"), Access.Manage);
        dir.subject.addProperty(RDF.type, FS.Directory);

        var blob = new BlobInfo("id", FILE_SIZE, "md5");
        when(blobFileItem.getBlob()).thenReturn(blob);
        //when(store.store(any())).thenReturn(blob);

        when(file.getInputStream()).thenAnswer(invocation -> new ByteArrayInputStream(new byte[FILE_SIZE]));


        setupRequestContext();
    }

    @Test
    public void testFileUploadSuccess() throws NotAuthorizedException, ConflictException, BadRequestException {
        dir.processForm(Map.of("action", "upload_files"), Map.of("/subdir/file.ext", blobFileItem));

        assertTrue(dir.child("subdir") instanceof DirectoryResource);

        var subdir = (DirectoryResource) dir.child("subdir");

        assertTrue(subdir.child("file.ext") instanceof FileResource);

        var file = (FileResource) subdir.child("file.ext");

        assertEquals(FILE_SIZE, (long) file.getContentLength());
    }

    @Test
    public void testFileUploadExistingDir() throws NotAuthorizedException, ConflictException, BadRequestException {
        dir.createCollection("subdir");
        dir.processForm(Map.of("action", "upload_files"), Map.of("/subdir/file.ext", blobFileItem));

        assertTrue(dir.child("subdir") instanceof DirectoryResource);

        var subdir = (DirectoryResource) dir.child("subdir");

        assertTrue(subdir.child("file.ext") instanceof FileResource);

        var file = (FileResource) subdir.child("file.ext");

        assertEquals(FILE_SIZE, (long) file.getContentLength());
    }

    @Test
    public void testMetadataUploadSuccess() throws NotAuthorizedException, ConflictException, BadRequestException {
        String csv =
                "Path,Description\n" +
                        ".,\"Blah\"\n" +
                        "./subdir,\"Blah blah\"\n";
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream(csv.getBytes()));

        var subdir = (DirectoryResource) dir.createCollection("subdir");

        dir.processForm(Map.of("action", "upload_metadata"), Map.of("file", file));

        verify(metadataService).patch(isomorphic(modelOf(
               dir.subject, RDFS.comment, model.createTypedLiteral("Blah"),
                subdir.subject, RDFS.comment, model.createTypedLiteral("Blah blah"))));
    }

    @Test(expected = BadRequestException.class)
    public void testMetadataUploadUnknownProperty() throws NotAuthorizedException, ConflictException, BadRequestException {
        String csv =
                "Path,Unknown\n" +
                        "./subdir,\"Blah blah\"\n";
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream(csv.getBytes()));

        dir.createCollection("subdir");

        dir.processForm(Map.of("action", "upload_metadata"), Map.of("file", file));

    }

    @Test(expected = BadRequestException.class)
    public void testMetadataUploadUnknownFile() throws NotAuthorizedException, ConflictException, BadRequestException {
        String csv =
                "Path,Description\n" +
                        "./subdir,\"Blah blah\"\n";
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream(csv.getBytes()));

        dir.processForm(Map.of("action", "upload_metadata"), Map.of("file", file));
    }

    @Test(expected = BadRequestException.class)
    public void testMetadataUploadDeletedFile() throws NotAuthorizedException, ConflictException, BadRequestException {
        String csv =
                "Path,Description\n" +
                        "./subdir,\"Blah blah\"\n";
        when(file.getInputStream()).thenReturn(new ByteArrayInputStream(csv.getBytes()));

        var subdir = (DirectoryResource) dir.createCollection("subdir");
        subdir.delete();

        dir.processForm(Map.of("action", "upload_metadata"), Map.of("file", file));
    }
}
