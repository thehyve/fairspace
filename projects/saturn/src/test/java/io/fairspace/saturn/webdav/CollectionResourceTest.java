package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.metadata.MetadataService;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.FileItem;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.PostableResource;
import lombok.SneakyThrows;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;
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
import static org.apache.jena.rdf.model.ResourceFactory.createPlainLiteral;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class CollectionResourceTest {
    public static final String BASE_PATH = "/api/v1/webdav";
    private static final String baseUri = "http://example.com" + BASE_PATH;

    private Model model = createTxnMem().getDefaultModel();
    private CollectionResource resource;

    private Resource WORKSPACE_1 = model.createResource("http://localhost/iri/W1");
    private Resource WORKSPACE_2 = model.createResource("http://localhost/iri/W2");
    private Resource COLLECTION_1 = model.createResource("http://localhost/iri/C1");
    private Resource USER_1 = model.createResource("http://localhost/iri/userid1");
    private Resource USER_2 = model.createResource("http://localhost/iri/userid2");
    private Resource USER_3 = model.createResource("http://localhost/iri/userid3");
    private Resource USER_4 = model.createResource("http://localhost/iri/userid4");

    @Mock
    BlobStore store;
    @Mock
    UserService userService;
    @Mock
    MailService mailService;
    @Mock
    MetadataService metadataService;
    @Mock
    FileItem file;

    Context context = new Context();


    @SneakyThrows
    @Before
    public void before() {
        model.add(WORKSPACE_1, RDF.type, FS.Workspace)
                .add(WORKSPACE_2, RDF.type, FS.Workspace)
                .add(COLLECTION_1, RDF.type, FS.Collection)
                .add(COLLECTION_1, FS.ownedBy, WORKSPACE_1);

        context.set(METADATA_SERVICE, metadataService);
        DavFactory factory = new DavFactory(model.createResource(baseUri), store, userService, mailService, context);
        resource = new CollectionResource(factory, COLLECTION_1, Access.Manage);

        setupRequestContext();
    }

    @Test
    public void testTransferringOwnership() throws NotAuthorizedException, BadRequestException {
        model.add(USER_1, FS.isManagerOf, WORKSPACE_1)
                .add(USER_2, FS.isMemberOf, WORKSPACE_1)
                .add(USER_3, FS.isMemberOf, WORKSPACE_1)
                .add(USER_4, FS.isMemberOf, WORKSPACE_1)
                .add(USER_4, FS.isMemberOf, WORKSPACE_2);
        model.add(USER_1, FS.canManage, COLLECTION_1)
                .add(USER_2, FS.canList, COLLECTION_1)
                .add(USER_3, FS.canWrite, COLLECTION_1)
                .add(USER_4, FS.canManage, COLLECTION_1)
                .add(WORKSPACE_1, FS.canWrite, COLLECTION_1);

        resource.setOwnedBy(WORKSPACE_2);

        assertFalse(model.contains(COLLECTION_1, FS.ownedBy, WORKSPACE_1));
        assertTrue(model.contains(COLLECTION_1, FS.ownedBy, WORKSPACE_2));

        // User 1 - manager of workspace 1
        assertFalse(model.contains(USER_1, FS.canManage, COLLECTION_1));
        assertFalse(model.contains(USER_1, FS.canWrite, COLLECTION_1));
        assertTrue(model.contains(USER_1, FS.canRead, COLLECTION_1));
        assertFalse(model.contains(USER_1, FS.canList, COLLECTION_1));

        // User 2 - member of workspace 1
        assertFalse(model.contains(USER_2, FS.canManage, COLLECTION_1));
        assertFalse(model.contains(USER_2, FS.canWrite, COLLECTION_1));
        assertFalse(model.contains(USER_2, FS.canRead, COLLECTION_1));
        assertTrue(model.contains(USER_2, FS.canList, COLLECTION_1));

        // User 3 - member of workspace 1
        assertFalse(model.contains(USER_3, FS.canManage, COLLECTION_1));
        assertFalse(model.contains(USER_3, FS.canWrite, COLLECTION_1));
        assertTrue(model.contains(USER_3, FS.canRead, COLLECTION_1));
        assertFalse(model.contains(USER_3, FS.canList, COLLECTION_1));

        // User 4 - member of workspaces 1 and 2
        assertTrue(model.contains(USER_4, FS.canManage, COLLECTION_1));
        assertFalse(model.contains(USER_4, FS.canWrite, COLLECTION_1));
        assertFalse(model.contains(USER_4, FS.canRead, COLLECTION_1));
        assertFalse(model.contains(USER_4, FS.canList, COLLECTION_1));

        // Workspace 1 - previous owner
        assertFalse(model.contains(WORKSPACE_1, FS.canManage, COLLECTION_1));
        assertFalse(model.contains(WORKSPACE_1, FS.canWrite, COLLECTION_1));
        assertFalse(model.contains(WORKSPACE_1, FS.canRead, COLLECTION_1));
        assertFalse(model.contains(WORKSPACE_1, FS.canList, COLLECTION_1));
    }

    @Test
    public void testUploadMetadata() throws NotAuthorizedException, ConflictException, BadRequestException {
        String csv =
                "Path,Description\n" +
              ".,\"A collection\"\n" +
                "dir1,\"A directory\"\n";

        var is = new ByteArrayInputStream(csv.getBytes());
        when(file.getInputStream()).thenReturn(is);

        var dir  = (io.fairspace.saturn.webdav.DirectoryResource) resource.createCollection("dir1");


        ((PostableResource)resource).processForm(Map.of("action", "metadata"), Map.of("file1.csv", file));


        verify(metadataService).put(isomorphic(modelOf(
                resource.subject, RDFS.comment, createPlainLiteral("A collection"),
                dir.subject, RDFS.comment, createPlainLiteral("A directory")

        )));
    }
}
