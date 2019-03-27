package io.fairspace.saturn.webdav;

import com.google.common.eventbus.EventBus;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;
import io.fairspace.saturn.rdf.dao.DAO;
import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.mail.MailComposer;
import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.services.permissions.PermissionsServiceImpl;
import io.fairspace.saturn.vfs.SafeFileSystem;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import io.fairspace.saturn.vfs.managed.MemoryBlobStore;
import org.apache.jena.graph.Node;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.servlet.ServletException;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.function.Supplier;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@RunWith(MockitoJUnitRunner.class)
public class WebDAVIT {

    private MiltonWebDAVServlet milton;

    private VirtualFileSystem fs;

    private MockHttpServletRequest req;

    private MockHttpServletResponse res;

    private PermissionsService permissions;

    private CollectionsService collections;

    private Node collectionIRI;

    private Node defaultUser = createURI("http://example.com/user");
    private Node anotherUser = createURI("http://example.com/new-user");
    private Node currentUser = defaultUser;

    @Mock
    private MailComposer.MessageBuilder messageBuilder;

    @Mock
    private MailComposer mailComposer;

    @Before
    public void before() {
        var rdf = connect(createTxnMem());
        Supplier<Node> userIriSupplier = () -> currentUser;
        var eventBus = new EventBus();
        permissions = new PermissionsServiceImpl(rdf, userIriSupplier, mailComposer);
        collections = new CollectionsService(new DAO(rdf, userIriSupplier), eventBus::post, permissions);
        when(mailComposer.newMessage(any())).thenReturn(messageBuilder);
        when(messageBuilder.append(any())).thenReturn(messageBuilder);
        when(messageBuilder.appendLink(any())).thenReturn(messageBuilder);
        var permissions = new PermissionsServiceImpl(rdf, userIriSupplier, mailComposer);
        var collections = new CollectionsService(new DAO(rdf, userIriSupplier), eventBus::post, permissions);
        fs = new SafeFileSystem(new ManagedFileSystem(rdf, new MemoryBlobStore(), userIriSupplier, collections, eventBus, permissions));
        milton = new MiltonWebDAVServlet("/webdav/", fs);
        var coll = new Collection();
        coll.setName("My Collection");
        coll.setLocation("coll1");
        coll.setType("LOCAL");
        collections.create(coll);
        collectionIRI = coll.getIri();

        req = new MockHttpServletRequestEx();
        res = new MockHttpServletResponse();
    }


    @Test
    public void testPropFindRoot() throws ServletException, IOException {
        req.setMethod("PROPFIND");
        req.setRequestURL("http://localhost/webdav/");
        milton.service(req, res);
        assertTrue(res.getOutputStreamContent().contains("<d:displayname></d:displayname>"));
        assertTrue(res.getOutputStreamContent().contains("<d:displayname>coll1</d:displayname>"));
    }

    @Test
    public void testPropFindForCollection() throws ServletException, IOException {
        req.setMethod("PROPFIND");
        req.setRequestURL("http://localhost/webdav/coll1");
        milton.service(req, res);
        assertEquals(207, res.getStatus());
        assertFalse(res.getOutputStreamContent().contains("<d:displayname></d:displayname>"));
        assertTrue(res.getOutputStreamContent().contains("<d:displayname>coll1</d:displayname>"));
    }

    @Test
    public void testPropFindWithIRI() throws ServletException, IOException {
        req.setMethod("PROPFIND");
        req.setRequestURL("http://localhost/webdav/coll1");
        req.setContentType("text/xml");
        req.setBodyContent("<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n" +
                "<propfind xmlns:D=\"DAV:\">\n" +
                "  <allprop/>\n" +
                "</propfind>");
        milton.service(req, res);
        assertEquals(207, res.getStatus());
        assertTrue(res.getOutputStreamContent().contains("xmlns:ns1=\"http://fairspace.io/ontology#\""));
        assertTrue(res.getOutputStreamContent().contains("<d:prop><ns1:iri>" + fs.stat("coll1").getIri() + "</ns1:iri>"));
    }

    @Test
    public void testPropFindMissingDirectoryReturns404() throws ServletException, IOException {
        req.setMethod("PROPFIND");
        req.setRequestURL("http://localhost/webdav/missing");
        milton.service(req, res);
        assertEquals(404, res.getStatus());
    }

    @Test
    public void testMkColl() throws ServletException, IOException {
        req.setMethod("MKCOL");
        req.setRequestURL("http://localhost/webdav/coll1/dir");
        milton.service(req, res);
        assertEquals(201, res.getStatus());
        assertTrue(fs.exists("coll1/dir"));
    }

    @Test
    public void testDirectoryCreationInNonExistingCollection() throws ServletException, IOException {
        req.setMethod("MKCOL");
        req.setRequestURL("http://localhost/webdav/missing/dir");
        milton.service(req, res);
        assertEquals(409, res.getStatus());
    }

    @Test
    public void testDirectoryCreationInNonExistingParent() throws ServletException, IOException {
        req.setMethod("MKCOL");
        req.setRequestURL("http://localhost/webdav/coll1/missing/dir");
        milton.service(req, res);
        assertEquals(409, res.getStatus());
    }

    @Test
    public void testDeleteDirectory() throws ServletException, IOException {
        fs.mkdir("coll1/dir");

        req.setMethod("DELETE");
        req.setRequestURL("http://localhost/webdav/coll1/dir");
        milton.service(req, res);

        assertEquals(204, res.getStatus());

        assertFalse(fs.exists("coll1/dir"));
    }

    @Test
    public void testDeleteNonExistingDirectory() throws ServletException, IOException {
        req.setMethod("DELETE");
        req.setRequestURL("http://localhost/webdav/coll1/missing");
        milton.service(req, res);

        assertEquals(404, res.getStatus());
    }

    @Test
    public void testDeleteRoot() throws ServletException, IOException {
        req.setMethod("DELETE");
        req.setRequestURL("http://localhost/webdav");
        milton.service(req, res);

        assertEquals(403, res.getStatus());
    }

    @Test
    public void testDeleteCollection() throws ServletException, IOException {
        req.setMethod("DELETE");
        req.setRequestURL("http://localhost/webdav/coll1");
        milton.service(req, res);

        assertEquals(403, res.getStatus());
    }

    @Test
    public void testMoveDirectory() throws ServletException, IOException {
        fs.mkdir("coll1/dir");
        fs.mkdir("coll1/dir/subdir");

        req.setMethod("MOVE");
        req.setRequestURL("http://localhost/webdav/coll1/dir");
        req.addHeader("Destination", "http://localhost/webdav/coll1/newdir");
        milton.service(req, res);

        assertEquals(201, res.getStatus());

        assertFalse(fs.exists("coll1/dir"));
        assertFalse(fs.exists("coll1/dir/subdir"));
        assertTrue(fs.exists("coll1/newdir"));
        assertTrue(fs.exists("coll1/newdir/subdir"));
    }

    @Test
    public void testMoveDirectoryConflict() throws ServletException, IOException {
        fs.mkdir("coll1/dir1");
        fs.mkdir("coll1/dir2");

        req.setMethod("MOVE");
        req.setRequestURL("http://localhost/webdav/coll1/dir1");
        req.addHeader("Destination", "http://localhost/webdav/coll1/dir2");
        milton.service(req, res);

        assertEquals(412, res.getStatus());

        assertTrue(fs.exists("coll1/dir1"));
        assertTrue(fs.exists("coll1/dir2"));
    }


    @Test
    public void testCopyDirectory() throws ServletException, IOException {
        fs.mkdir("coll1/dir");
        fs.mkdir("coll1/dir/subdir");

        req.setMethod("COPY");
        req.setRequestURL("http://localhost/webdav/coll1/dir");
        req.addHeader("Destination", "http://localhost/webdav/coll1/newdir");
        milton.service(req, res);

        assertEquals(201, res.getStatus());

        assertTrue(fs.exists("coll1/dir"));
        assertTrue(fs.exists("coll1/dir/subdir"));
        assertTrue(fs.exists("coll1/newdir"));
        assertTrue(fs.exists("coll1/newdir/subdir"));
    }

    @Test
    public void testCopyDirectoryConflict() throws ServletException, IOException {
        fs.mkdir("coll1/dir1");
        fs.mkdir("coll1/dir1/subdir");
        fs.mkdir("coll1/dir2");

        req.setMethod("COPY");
        req.setRequestURL("http://localhost/webdav/coll1/dir1");
        req.addHeader("Destination", "http://localhost/webdav/coll1/dir2");
        milton.service(req, res);

        assertEquals(412, res.getStatus());

        assertTrue(fs.exists("coll1/dir1"));
        assertTrue(fs.exists("coll1/dir2"));
    }

    @Test
    public void testCopyDirectoryToAnInvalidDestination() throws ServletException, IOException {
        fs.mkdir("coll1/dir1");

        req.setMethod("COPY");
        req.setRequestURL("http://localhost/webdav/coll1/dir1");
        req.addHeader("Destination", "http://localhost/vebdaw/coll1/dir2");
        milton.service(req, res);

        assertEquals(400, res.getStatus());
    }

    @Test
    public void testPropFindReturnsNoEmptyProps() throws ServletException, IOException {
        req.setMethod("PROPFIND");
        req.setRequestURL("http://localhost/webdav/coll1");
        milton.service(req, res);
        assertEquals(207, res.getStatus());
        assertFalse(res.getOutputStreamContent().contains("getetag"));
        assertFalse(res.getOutputStreamContent().contains("getcontentlength"));
    }

    @Test
    public void shouldNotSendAcceptRangesHeader() throws ServletException, IOException {
        req.setMethod("OPTIONS");
        req.setRequestURL("http://localhost/webdav/");
        milton.service(req, res);
        assertEquals(200, res.getStatus());
        assertNull(res.getHeader("Accept-Ranges"));
    }

    @Test
    public void shouldIgnoreRangeHeaders() throws ServletException, IOException {
        fs.create("coll1/dir1/file.txt", new ByteArrayInputStream("123".getBytes()));

        req.setMethod("GET");
        req.setRequestURL("http://localhost/webdav/coll1/dir1/file.txt");
        req.setHeader("Range", "bytes=0-1");
        milton.service(req, res);
        assertEquals(200, res.getStatus());
        assertEquals("3", res.getHeader("Content-Length"));
        assertNull(res.getHeader("Content-Range"));
        assertEquals("123", res.getOutputStreamContent());
    }

    @Test
    public void testReadingWithoutPermissions() throws ServletException, IOException {
        currentUser = anotherUser;
        req.setMethod("PROPFIND");
        req.setRequestURL("http://localhost/webdav/coll1");
        milton.service(req, res);
        assertEquals(404, res.getStatus());
    }

    @Test
    public void testWritingWithWritePermission() throws ServletException, IOException {
        permissions.setPermission(collectionIRI, anotherUser, Access.Write);
        req.setMethod("PUT");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");

        currentUser = anotherUser;

        milton.service(req, res);

        assertEquals(201, res.getStatus());
    }

    @Test
    public void testWritingWithReadPermission() throws ServletException, IOException {
        permissions.setPermission(collectionIRI, anotherUser, Access.Read);
        req.setMethod("PUT");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");

        currentUser = anotherUser;

        milton.service(req, res);

        assertEquals(403, res.getStatus());
    }

    @Test
    public void testWritingWithoutPermissions() throws ServletException, IOException {
        req.setMethod("PUT");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");

        currentUser = anotherUser;

        milton.service(req, res);

        assertEquals(403, res.getStatus());
    }

    @Test
    public void testMkDirWithWritePermission() throws ServletException, IOException {
        permissions.setPermission(collectionIRI, anotherUser, Access.Write);
        req.setMethod("MKCOL");
        req.setRequestURL("http://localhost/webdav/coll1/dir");

        currentUser = anotherUser;

        milton.service(req, res);

        assertEquals(201, res.getStatus());
    }

    @Test
    public void testMkDirWithReadPermission() throws ServletException, IOException {
        permissions.setPermission(collectionIRI, anotherUser, Access.Read);
        req.setMethod("MKCOL");
        req.setRequestURL("http://localhost/webdav/coll1/dir");

        currentUser = anotherUser;

        milton.service(req, res);

        assertEquals(403, res.getStatus());
    }

    @Test
    public void testMkDirWithNoPermission() throws ServletException, IOException {
        req.setMethod("MKCOL");
        req.setRequestURL("http://localhost/webdav/coll1/dir");

        currentUser = anotherUser;

        milton.service(req, res);

        assertEquals(409, res.getStatus());
    }


    @Test
    public void testWritingToAReadOnlyCollection() {
        permissions.setPermission(collectionIRI, anotherUser, Access.Read);
    }

    @Test
    public void testCopyingWithWritePermission() throws ServletException, IOException {
        var newCollection = new Collection();
        newCollection.setName("Collection 2");
        newCollection.setLocation("coll2");
        newCollection.setType("LOCAL");
        collections.create(newCollection);
        var newCollectionIRI = newCollection.getIri();

        permissions.setPermission(collectionIRI, anotherUser, Access.Read);
        permissions.setPermission(newCollectionIRI, anotherUser, Access.Write);

        req.setMethod("PUT");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");
        milton.service(req, res);

        currentUser = anotherUser;

        req.setMethod("COPY");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");
        req.addHeader("Destination", "http://localhost/webdav/coll2/file.ext");
        milton.service(req, res);

        assertEquals(201, res.getStatus());
    }

    @Test
    public void testCopyingToAReadOnlyCollection() throws ServletException, IOException {
        var newCollection = new Collection();
        newCollection.setName("Collection 2");
        newCollection.setLocation("coll2");
        newCollection.setType("LOCAL");
        collections.create(newCollection);
        var newCollectionIRI = newCollection.getIri();

        permissions.setPermission(collectionIRI, anotherUser, Access.Read);
        permissions.setPermission(newCollectionIRI, anotherUser, Access.Read);

        req.setMethod("PUT");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");
        milton.service(req, res);

        currentUser = anotherUser;

        req.setMethod("COPY");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");
        req.addHeader("Destination", "http://localhost/webdav/coll2/file.ext");
        milton.service(req, res);

        assertEquals(403, res.getStatus());
    }

    @Test
    public void testMovingWithWritePermission() throws ServletException, IOException {
        var newCollection = new Collection();
        newCollection.setName("Collection 2");
        newCollection.setLocation("coll2");
        newCollection.setType("LOCAL");
        collections.create(newCollection);
        var newCollectionIRI = newCollection.getIri();

        permissions.setPermission(collectionIRI, anotherUser, Access.Read);
        permissions.setPermission(newCollectionIRI, anotherUser, Access.Write);

        req.setMethod("PUT");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");
        milton.service(req, res);

        currentUser = anotherUser;

        req.setMethod("MOVE");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");
        req.addHeader("Destination", "http://localhost/webdav/coll2/file.ext");
        milton.service(req, res);

        assertEquals(201, res.getStatus());
    }

    @Test
    public void testMovingToAReadOnlyCollection() throws ServletException, IOException {
        var newCollection = new Collection();
        newCollection.setName("Collection 2");
        newCollection.setLocation("coll2");
        newCollection.setType("LOCAL");
        collections.create(newCollection);
        var newCollectionIRI = newCollection.getIri();

        permissions.setPermission(collectionIRI, anotherUser, Access.Read);
        permissions.setPermission(newCollectionIRI, anotherUser, Access.Read);

        req.setMethod("PUT");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");
        milton.service(req, res);

        currentUser = anotherUser;

        req.setMethod("MOVE");
        req.setRequestURL("http://localhost/webdav/coll1/file.ext");
        req.addHeader("Destination", "http://localhost/webdav/coll2/file.ext");
        milton.service(req, res);

        assertEquals(403, res.getStatus());
    }
}
