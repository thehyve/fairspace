package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.HttpManager;
import io.milton.http.Request;
import io.milton.http.Response;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.junit.MockitoJUnitRunner;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.Charset;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.mockito.Mockito.*;

@RunWith(MockitoJUnitRunner.class)
public class MiltonWebDAVServletTest {
    @Mock
    VirtualFileSystem fs;

    @Mock
    Request request;

    @Mock
    Response response;

    private List<Request> requests;
    private HttpManager httpManager;
    private ByteArrayOutputStream outputStream;

    private FileInfo fileInfo = FileInfo.builder()
            .created(Instant.now())
            .modified(Instant.now())
            .path("collection/dir/file.txt")
            .build();

    @Before
    public void setUp() throws IOException {
        requests = new ArrayList<>();
        httpManager = MiltonWebDAVServlet.setupHttpManager("/webdav", fs, requests::add);

        when(request.getAbsolutePath()).thenReturn("/webdav/collection/dir/file.txt");
        when(request.getAbsoluteUrl()).thenReturn("http://test/webdav/collection/dir/file.txt");
        when(fs.stat("collection/dir/file.txt")).thenReturn(fileInfo);

        outputStream = new ByteArrayOutputStream();
        when(response.getOutputStream()).thenReturn(outputStream);
    }

    @Test
    public void testCallsAreAuthorized() throws IOException {
        when(request.getMethod()).thenReturn(Request.Method.PROPFIND);
        httpManager.process(request, response);
        verify(response, atLeastOnce()).setStatus(Response.Status.SC_MULTI_STATUS);
    }

    @Test
    public void testNullPropertiesAreIgnored() throws IOException {
        when(request.getMethod()).thenReturn(Request.Method.PROPFIND);
        httpManager.process(request, response);

        String xmlOutput = outputStream.toString(Charset.defaultCharset());

        assertFalse("Output should not contain a value for d:resourcetype", xmlOutput.contains("d:resourcetype"));
    }

    @Test
    public void testEventHandlerIsBeingCalled() throws IOException {
        when(request.getMethod()).thenReturn(Request.Method.PROPFIND);
        httpManager.process(request, response);

        assertEquals(List.of(request), requests);
    }
}
