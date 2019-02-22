package nl.fairspace.pluto.app.config;

import org.apache.http.entity.InputStreamEntity;
import org.apache.http.message.BasicHttpEntityEnclosingRequest;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.util.LinkedMultiValueMap;

import java.io.ByteArrayInputStream;

import static org.junit.Assert.*;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class WebDAVHostRoutingFilterTest {

    @Autowired
    private WebDAVHostRoutingFilter filter;


    @Test
    public void buildHttpRequest() {
        var entity = new InputStreamEntity(new ByteArrayInputStream(new byte[1]));

        var map = new LinkedMultiValueMap<String, String> () {{
            set("key", "value");
        }};

        var req = filter.buildHttpRequest("PROPFIND", "http://example.com", entity, map, map, new MockHttpServletRequest());

        assertTrue(req instanceof BasicHttpEntityEnclosingRequest);
        assertSame(entity, ((BasicHttpEntityEnclosingRequest)req).getEntity());
        assertEquals("value", req.getFirstHeader("key").getValue());
        assertEquals("http://example.com?key=value", req.getRequestLine().getUri());
        assertEquals("PROPFIND", req.getRequestLine().getMethod());
    }
}