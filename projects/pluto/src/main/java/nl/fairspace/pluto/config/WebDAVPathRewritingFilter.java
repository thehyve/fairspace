package nl.fairspace.pluto.config;

import lombok.extern.slf4j.Slf4j;
import nl.fairspace.pluto.config.dto.PlutoConfig;
import org.reactivestreams.Publisher;
import org.springframework.cloud.gateway.config.GatewayProperties;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.core.io.buffer.PooledDataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.server.ServerWebExchange;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.xml.XMLConstants;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.TransformerException;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.io.Writer;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.regex.Pattern;

import static nl.fairspace.pluto.config.ExtendedHttpMethod.PROPFIND;

@Slf4j
public class WebDAVPathRewritingFilter implements GlobalFilter, Ordered {
    private final PlutoConfig plutoConfig;
    private final GatewayProperties gatewayProperties;

    public WebDAVPathRewritingFilter(PlutoConfig plutoConfig, GatewayProperties gatewayProperties) {
        this.plutoConfig = plutoConfig;
        this.gatewayProperties = gatewayProperties;
    }

    private boolean shouldFilter(ServerWebExchange exchange) {
        return exchange.getRequest().getMethod() != null && exchange.getRequest().getMethod().matches(PROPFIND.name()) &&
                exchange.getRequest().getURI().getPath().matches("^/api/storages/.*/webdav.*") &&
                exchange.getResponse().getStatusCode() != null && exchange.getResponse().getStatusCode().is2xxSuccessful();
    }

    /**
     * Replace in DAV:multistatus -> DAV:response -> DAV:href
     * values of the form '/api/webdav/*' to '/api/storages/$storage/webdav/*'
     */
    public void transform(InputStream in,
                          String remotePrefix, String routePrefix,
                          String storageRootIri, String storageRoot,
                          Writer writer) throws ParserConfigurationException, IOException, SAXException, XPathExpressionException, TransformerException {
        var documentBuilderFactory = DocumentBuilderFactory.newInstance();
        documentBuilderFactory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        documentBuilderFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        var webDavResponse = documentBuilderFactory.newDocumentBuilder().parse(in);
        var xpath = XPathFactory.newInstance().newXPath();
        {
            var nodes = (NodeList) xpath.evaluate("/multistatus/response/href", webDavResponse, XPathConstants.NODESET);
            for (int i = 0; i < nodes.getLength(); i++) {
                var node = nodes.item(i);
                if (node.getTextContent() != null) {
                    node.setTextContent(node.getTextContent().replaceFirst(Pattern.quote(remotePrefix), routePrefix));
                }
            }
        }
        if (storageRootIri != null) {
            var nodes = (NodeList) xpath.evaluate("/multistatus/response/propstat/prop/getetag", webDavResponse, XPathConstants.NODESET);
            for (int i = 0; i < nodes.getLength(); i++) {
                var node = nodes.item(i);
                if (node.getTextContent() != null) {
                    node.setTextContent(node.getTextContent().replaceFirst(Pattern.quote(storageRootIri), storageRoot));
                }
            }
        }
        var transformerFactory = TransformerFactory.newInstance();
        transformerFactory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        var transformer = transformerFactory.newTransformer();
        transformer.transform(new DOMSource(webDavResponse), new StreamResult(writer));
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        var responseMutated = new ServerHttpResponseDecorator(exchange.getResponse()) {
            @Override
            public Mono<Void> writeWith(Publisher<? extends DataBuffer> body) {
                if (shouldFilter(exchange)) {
                    return join(body).flatMap(db -> {
                        var uri = exchange.getRequest().getURI();
                        // /api/storages/$storage/webdav/
                        var parts = uri.getPath().split("/");
                        if (parts.length < 5 || !"webdav".equals(parts[4])) {
                            return Mono.error(new ResponseStatusException(HttpStatus.METHOD_NOT_ALLOWED, "Not a Webdav endpoint."));
                        }
                        var storageName = parts[3];
                        var storage = plutoConfig.getStorages().get(storageName);
                        if (storage == null) {
                            return Mono.error(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Missing storage configuration"));
                        }

                        String routePrefix = "/api/storages/%s/webdav".formatted(storageName);
                        var storageRoot = "%s://%s:%s%s".formatted(uri.getScheme(), uri.getHost(), uri.getPort(), routePrefix);
                        var route = gatewayProperties.getRoutes().stream()
                                .filter(r -> r.getPredicates().stream().anyMatch(
                                        predicateDefinition -> Objects.equals(predicateDefinition.getName(), "Path")
                                                && predicateDefinition.getArgs().values().stream().anyMatch(v -> v.startsWith(routePrefix))))
                                .findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No such webdav route configured"));
                        String remotePrefix = route.getUri().getPath();
                        var writer = new StringWriter();
                        try {
                            transform(db.asInputStream(), remotePrefix, routePrefix, storage.getRootDirectoryIri(), storageRoot, writer);
                        } catch (Exception e) {
                            log.error("Error translating webdav response", e);
                            return Mono.error(new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Error translating webdav response"));
                        }
                        var newContent = writer.toString();
                        exchange.getResponse().getHeaders().setContentLength(newContent.length());
                        return getDelegate().writeWith(Mono.just(exchange.getResponse().bufferFactory().wrap(newContent.getBytes(StandardCharsets.UTF_8))));
                    });
                } else {
                    return getDelegate().writeWith(body);
                }
            }
        };
        return chain.filter(exchange.mutate().response(responseMutated).build());
    }

    private Mono<? extends DataBuffer> join(Publisher<? extends DataBuffer> dataBuffers) {
        return Flux.from(dataBuffers)
                .collectList()
                .filter((list) -> !list.isEmpty())
                .map((list) -> list.get(0).factory().join(list))
                .doOnDiscard(PooledDataBuffer.class, DataBufferUtils::release);
    }

    @Override
    public int getOrder() {
        return -2;
    }
}
