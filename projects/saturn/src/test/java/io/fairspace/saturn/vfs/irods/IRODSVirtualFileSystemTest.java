package io.fairspace.saturn.vfs.irods;

import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.permissions.Access;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.irods.jargon.core.exception.JargonException;
import org.irods.jargon.core.pub.CollectionAndDataObjectListAndSearchAO;
import org.irods.jargon.core.pub.IRODSAccessObjectFactory;
import org.irods.jargon.core.pub.IRODSFileSystem;
import org.irods.jargon.core.pub.domain.ObjStat;
import org.irods.jargon.core.pub.io.IRODSFile;
import org.irods.jargon.core.pub.io.IRODSFileFactory;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.IOException;
import java.util.Date;

import static org.apache.jena.graph.NodeFactory.createURI;
import static org.apache.jena.query.DatasetFactory.createTxnMem;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotNull;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class IRODSVirtualFileSystemTest {

    @Mock
    private CollectionsService collections;

    @Mock
    private IRODSFileSystem fs;

    @Mock
    private IRODSAccessObjectFactory aof;

    @Mock
    private IRODSFileFactory ff;

    @Mock
    private IRODSFile f;

    @Mock
    private CollectionAndDataObjectListAndSearchAO ao;

    private ObjStat stat = new ObjStat();

    private RDFConnection rdf = new RDFConnectionLocal(createTxnMem(), Isolation.COPY);

    private IRODSVirtualFileSystem vfs;



    @Before
    public void before() throws JargonException {
        var c = new Collection();
        c.setIri(createURI("http://example.com/123"));
        c.setLocation("rods");
        c.setConnectionString("irods://user.zone:password@host.com:1234/zone/home");
        c.setAccess(Access.Manage);

        when(collections.getByLocation(eq("rods"))).thenReturn(c);

        when(fs.getIRODSAccessObjectFactory()).thenReturn(aof);

        when(aof.getIRODSFileFactory(any())).thenReturn(ff);

        when(ff.instanceIRODSFile(anyString())).thenReturn(f);

        when(f.exists()).thenReturn(true);
        when(f.getAbsolutePath()).thenReturn("/zone/home/path");

        when(aof.getCollectionAndDataObjectListAndSearchAO(any())).thenReturn(ao);

        when(ao.retrieveObjectStatForPath(any())).thenReturn(stat);

        stat.setDataId(123);
        stat.setCreatedAt(new Date());
        stat.setModifiedAt(new Date());

        vfs = new IRODSVirtualFileSystem(collections, rdf, fs);
    }

    @Test
    public void testStatCollection() throws IOException, JargonException {
        assertNotNull(vfs.stat("rods"));
        verifyZeroInteractions(fs);
    }

    @Test
    public void testAccountParsing() throws IOException, JargonException {
        vfs.stat("rods/path");

        verify(aof).getIRODSFileFactory(argThat(account ->
                account.getHost().equals("host.com") &&
                        account.getPort() == 1234 &&
                        account.getZone().equals("zone") &&
                        account.getUserName().equals("user") &&
                        account.getPassword().equals("password") &&
                        account.getHomeDirectory().equals("/zone/home")

        ));
    }

    @Test
    public void testPathResolution() throws IOException, JargonException {
        var file = vfs.stat("rods/path");

        verify(ff).instanceIRODSFile("/zone/home/path");
        verify(ao).retrieveObjectStatForPath("/zone/home/path");

        assertEquals("rods/path", file.getPath());

    }


    @Test
    public void testIriGeneration() throws IOException {
        assertEquals("irods://host.com#123", vfs.stat("rods/path").getIri());
    }
}