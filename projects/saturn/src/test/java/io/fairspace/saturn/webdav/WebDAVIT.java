package io.fairspace.saturn.webdav;

import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;
import io.fairspace.saturn.auth.UserInfo;
import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.vfs.SafeFileSystem;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.fairspace.saturn.vfs.managed.ManagedFileSystem;
import io.fairspace.saturn.vfs.managed.MemoryBlobStore;
import org.junit.Before;
import org.junit.Test;

import javax.servlet.ServletException;
import java.io.IOException;
import java.util.function.Supplier;

import static io.fairspace.saturn.rdf.SparqlUtils.setWorkspaceURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.apache.jena.rdfconnection.RDFConnectionFactory.connect;
import static org.junit.Assert.*;

public class WebDAVIT {

    private MiltonWebDAVServlet milton;

    private VirtualFileSystem fs;

    private MockHttpServletRequest req;

    private MockHttpServletResponse res;

    @Before
    public void before() throws IOException {
        setWorkspaceURI("http://example.com/");
        var rdf = connect(createTxnMem());
        Supplier<UserInfo> userInfoSupplier = () -> new UserInfo("userId", null, null, null);
        var collections = new CollectionsService(rdf, userInfoSupplier);
        fs = new SafeFileSystem(new ManagedFileSystem(rdf, new MemoryBlobStore(), userInfoSupplier, collections));
        milton = new MiltonWebDAVServlet("/webdav/", fs);
        var coll = new Collection();
        coll.setName("My Collection");
        coll.setLocation("coll1");
        coll.setType("LOCAL");
        collections.create(coll);

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
    public void testPropFindForColection() throws ServletException, IOException {
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

        assertEquals(400, res.getStatus());
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
}
