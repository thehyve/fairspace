package io.fairspace.saturn.webdav;

import com.pivovarit.function.ThrowingConsumer;
import io.fairspace.saturn.rdf.transactions.Transactions;
import io.milton.http.ResourceFactory;
import io.milton.resource.GetableResource;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import javax.servlet.ServletInputStream;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Vector;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class WebDAVServletTest {
    @Mock
    ResourceFactory factory;
    @Mock
    Transactions txn;
    @Mock
    BlobStore store;
    @Mock
    HttpServletRequest req;
    @Mock
    HttpServletResponse res;
    @Mock
    ServletInputStream in;
    @Mock
    ServletOutputStream out;
    @Mock
    GetableResource resource;

    WebDAVServlet servlet;


    @Before
    public void before() throws IOException {
        servlet = new WebDAVServlet(factory, txn, store);

        when(req.getRequestURL()).thenReturn(new StringBuffer("resource"));
        when(req.getInputStream()).thenReturn(in);
        when(res.getOutputStream()).thenReturn(out);
        when(req.getParameterNames()).thenReturn(new Vector<String>().elements());
        when(resource.authorise(any(), any(), any())).thenReturn(true);
    }

    @Test
    public void testReadTxn() throws IOException {
        when(req.getMethod()).thenReturn("GET");
        servlet.service(req, res);
        verify(txn).executeRead(any());
    }

    @Test
    public void testWriteTxn() throws IOException {
        when(req.getMethod()).thenReturn("DELETE");
        servlet.service(req, res);
        verify(txn).executeWrite(any());
    }

    @Test
    public void testPutConsumesPayloadOutsideTransaction() throws IOException {
        var blob = new BlobInfo("id", 1, "md5");

        when(req.getMethod()).thenReturn("PUT");
        when(store.store(in)).thenReturn(blob);

        servlet.service(req, res);

        var order = inOrder(store, txn);

        order.verify(store).store(in);
        // Transaction is executed afterwards
        order.verify(txn).executeWrite(any());
    }

    @Test
    public void testGetPayloadIsReadOutsideTransaction() throws Exception {
        when(req.getMethod()).thenReturn("GET");
        when(factory.getResource(any(), any())).thenReturn(resource);

        doAnswer(invocation -> {
            ThrowingConsumer job = invocation.getArgument(0);
            job.accept(null);
            return null;
        }).when(txn).executeRead(any());

        servlet.service(req, res);

        var order = inOrder(txn, resource);

        order.verify(txn).executeRead(any());
        // Called after the transaction is finished
        order.verify(resource).sendContent(eq(out), any(), any(), any());
    }
}