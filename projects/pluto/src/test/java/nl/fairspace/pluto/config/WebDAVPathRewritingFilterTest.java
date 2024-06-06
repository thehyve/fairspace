package nl.fairspace.pluto.config;

import java.io.StringWriter;

import org.junit.Assert;
import org.junit.Test;
import org.mockito.Mock;
import org.springframework.cloud.gateway.config.GatewayProperties;

import static org.hamcrest.Matchers.stringContainsInOrder;

public class WebDAVPathRewritingFilterTest {
    @Mock
    GatewayProperties gatewayProperties;

    private final WebDAVPathRewritingFilter filter = new WebDAVPathRewritingFilter(null, gatewayProperties);

    @Test
    public void transformWebdavResponse() throws Exception {
        var resource = getClass().getClassLoader().getResource("webdav_response.xml");
        var in = resource.openStream();
        var writer = new StringWriter();
        filter.transform(
                in,
                "/api/webdav",
                "/api/storages/test/webdav",
                "http://localhost:8080/api/webdav",
                "http://localhost:9000/api/storages/test/webdav",
                writer);
        writer.flush();
        System.err.println(writer.getBuffer().toString());
        var result = writer.getBuffer().toString();
        Assert.assertThat(result, stringContainsInOrder("<d:href>/api/storages/test/webdav/</d:href>"));
        Assert.assertThat(
                result,
                stringContainsInOrder("<d:getetag>\"http://localhost:9000/api/storages/test/webdav\"</d:getetag>"));
        Assert.assertThat(
                result,
                stringContainsInOrder("<d:href>/api/storages/test/webdav/collection%202021-01-18_02_04-1/</d:href>"));
        Assert.assertThat(
                result,
                stringContainsInOrder(
                        "<d:getetag>\"http://localhost:9000/api/storages/test/webdav/collection%202021-01-18_02_04-1\"</d:getetag>"));
        Assert.assertThat(result, stringContainsInOrder("<d:href>/api/storages/test/webdav/Book/</d:href>"));
        Assert.assertThat(
                result,
                stringContainsInOrder(
                        "<d:getetag>\"http://localhost:9000/api/storages/test/webdav/Book\"</d:getetag>"));
    }
}
