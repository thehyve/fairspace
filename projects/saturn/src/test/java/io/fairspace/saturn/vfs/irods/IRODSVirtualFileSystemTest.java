package io.fairspace.saturn.vfs.irods;

import io.fairspace.saturn.rdf.transactions.TransactionLog;
import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.services.permissions.Access;
import org.apache.jena.query.DatasetFactory;
import org.apache.jena.rdfconnection.Isolation;
import org.apache.jena.rdfconnection.RDFConnection;
import org.apache.jena.rdfconnection.RDFConnectionLocal;
import org.irods.jargon.core.exception.JargonException;
import org.irods.jargon.core.pub.*;
import org.irods.jargon.core.pub.domain.ObjStat;
import org.irods.jargon.core.pub.io.IRODSFile;
import org.irods.jargon.core.pub.io.IRODSFileFactory;
import org.irods.jargon.core.query.MetaDataAndDomainData;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.File;
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static io.fairspace.saturn.vfs.irods.IRODSVirtualFileSystem.FAIRSPACE_IRI_ATTRIBUTE;
import static org.apache.jena.graph.NodeFactory.createURI;
import static org.junit.Assert.*;
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

    @Mock
    private DataTransferOperations dto;

    @Mock
    private DataObjectAO doao;

    @Mock
    private MetaDataAndDomainData meta;

    @Mock
    private TransactionLog txnLog;

    private final ObjStat stat1 = new ObjStat();

    private final ObjStat stat2 = new ObjStat();

    private IRODSVirtualFileSystem vfs;

    private final RDFConnection rdf = new RDFConnectionLocal(DatasetFactory.createTxnMem(), Isolation.COPY);


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
        when(f.listFiles()).thenReturn(new File[0]);

        when(aof.getCollectionAndDataObjectListAndSearchAO(any())).thenReturn(ao);

        when(ao.retrieveObjectStatForPath(eq("/zone/home/path"))).thenReturn(stat1);

        stat1.setDataId(123);
        stat1.setCreatedAt(new Date());
        stat1.setModifiedAt(new Date());
        stat1.setOwnerName("owner1");

        stat2.setDataId(234);

        when(aof.getDataTransferOperations(any())).thenReturn(dto);

        when(aof.getDataObjectAO(any())).thenReturn(doao);

        vfs = new IRODSVirtualFileSystem(rdf, collections, fs);
    }

    @Test
    public void testStatCollection() throws IOException {
        assertNull(vfs.stat("unknown"));
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
                        account.getHomeDirectory().equals("/zone/home")));
    }

    @Test
    public void testStatFileContainsOwner() throws IOException {
        var file = vfs.stat("rods/path");
        assertEquals(Map.of("ownedBy", "owner1"), file.getCustomProperties());
    }

    @Test
    public void testPathResolution() throws IOException, JargonException {
        var file = vfs.stat("rods/path");

        verify(ff).instanceIRODSFile("/zone/home/path");
        verify(ao).retrieveObjectStatForPath("/zone/home/path");

        assertEquals("rods/path", file.getPath());
    }


    @Test
    public void testIriGeneration() throws IOException, JargonException {
        var iri = vfs.iri("rods/path");
        assertNotNull(iri);
        verify(doao).findMetadataValuesForDataObject("/zone/home/path");
        verify(doao).addAVUMetadata(eq("/zone/home/path"), argThat(avu -> avu.getAttribute().equals(FAIRSPACE_IRI_ATTRIBUTE)));
    }

    @Test
    public void testIriRetrieval() throws IOException, JargonException {
        when(doao.findMetadataValuesForDataObject(eq("/zone/home/path")))
                .thenReturn(List.of(meta));

        when(meta.getAvuAttribute()).thenReturn(FAIRSPACE_IRI_ATTRIBUTE);
        when(meta.getAvuValue()).thenReturn("http://example.com/123");

        assertEquals("http://example.com/123", vfs.iri("rods/path"));
        verify(doao).findMetadataValuesForDataObject("/zone/home/path");
        verifyNoMoreInteractions(doao);
    }

    @Test
    public void testMoving() throws IOException, JargonException {
        vfs.move("rods/path", "rods/newpath");

        verify(dto).move("/zone/home/path", "/zone/home/newpath");
    }

    @Test
    public void testCopying() throws IOException, JargonException {
        vfs.copy("rods/path", "rods/newpath");

        verify(dto).copy("/zone/home/path", "", "/zone/home/newpath", null, null);
    }

    @Test
    public void testMkdir() throws IOException {
        vfs.mkdir("rods/path");

        verify(f).mkdir();
    }

    @Test
    public void testDelete() throws IOException {
        vfs.delete("rods/path");

        verify(f).delete();
    }

    @Test
    public void testList() throws IOException {
        vfs.list("rods/path");

        verify(f).listFiles();
    }
}
