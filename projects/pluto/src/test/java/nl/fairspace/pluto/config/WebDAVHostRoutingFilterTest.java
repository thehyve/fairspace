package nl.fairspace.pluto.config;

import org.apache.http.entity.InputStreamEntity;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.web.server.ServerWebExchange;

import java.io.ByteArrayInputStream;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;

@RunWith(SpringRunner.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class WebDAVHostRoutingFilterTest {

    @Autowired
    private WebDAVHostRoutingFilter filter;

    @Test
    public void buildHttpRequest() {
        var entity = new InputStreamEntity(new ByteArrayInputStream(new byte[1]));

        MockServerHttpRequest request = MockServerHttpRequest.method("PROPFIND", "http://example.com")
                .header("key", "value")
                .body(entity.toString());
        ServerWebExchange exchange = MockServerWebExchange.from(request);
        exchange.getAttributes().put("key", "value");
        GatewayFilterChain filterChain = mock(GatewayFilterChain.class);

        filter.filter(exchange, filterChain);
        assertEquals("value",  exchange.getRequest().getHeaders().get("key").get(0));
        assertEquals("PROPFIND", exchange.getRequest().getMethod().toString());
    }
}
