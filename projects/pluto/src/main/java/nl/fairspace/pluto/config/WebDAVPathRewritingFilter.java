package nl.fairspace.pluto.config;

import com.netflix.zuul.*;
import com.netflix.zuul.context.*;
import com.netflix.zuul.exception.*;
import lombok.extern.slf4j.*;
import nl.fairspace.pluto.config.dto.*;
import org.springframework.cloud.netflix.zuul.filters.*;
import org.springframework.http.*;
import org.w3c.dom.*;
import org.xml.sax.*;

import javax.xml.*;
import javax.xml.parsers.*;
import javax.xml.transform.*;
import javax.xml.transform.dom.*;
import javax.xml.transform.stream.*;
import javax.xml.xpath.*;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.regex.*;

import static nl.fairspace.pluto.config.ExtendedHttpMethod.PROPFIND;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.POST_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SEND_RESPONSE_FILTER_ORDER;
import static org.springframework.http.HttpStatus.*;

@Slf4j
public class WebDAVPathRewritingFilter extends ZuulFilter {
    private final PlutoConfig plutoConfig;
    private final ZuulProperties zuulProperties;

    public WebDAVPathRewritingFilter(PlutoConfig plutoConfig, ZuulProperties zuulProperties) {
        this.plutoConfig = plutoConfig;
        this.zuulProperties = zuulProperties;
    }

    @Override
    public String filterType() {
        return POST_TYPE;
    }

    @Override
    public int filterOrder() {
        return SEND_RESPONSE_FILTER_ORDER - 10;
    }

    @Override
    public boolean shouldFilter() {
        RequestContext ctx = RequestContext.getCurrentContext();
        return ctx.getRequest().getMethod().equalsIgnoreCase(PROPFIND.name()) &&
                ctx.getRequest().getRequestURI().startsWith("/api/storages/") &&
                valueOf(ctx.getResponseStatusCode()).is2xxSuccessful();
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
    public Object run() throws ZuulException {
        RequestContext ctx = RequestContext.getCurrentContext();
        // /api/storages/$storage/webdav/
        var parts = ctx.getRequest().getRequestURI().split("/");
        if (parts.length < 5 || ! "webdav".equals(parts[4])) {
            throw new ZuulException("Not a Webdav endpoint", HttpStatus.METHOD_NOT_ALLOWED.value(), "Method not allowed.");
        }
        var storageName = parts[3];
        var storage = plutoConfig.getStorages().get(storageName);
        if (storage == null) {
            throw new ZuulException("Missing storage configuration", HttpStatus.BAD_GATEWAY.value(), "Missing storage configuration");
        }
        String routePrefix = "/api/storages/%s/webdav".formatted(storageName);
        var storageRoot = "%s://%s:%s%s".formatted(
                ctx.getRequest().getScheme(),
                ctx.getRequest().getServerName(),
                ctx.getRequest().getServerPort(),
                routePrefix
        );
        var route = zuulProperties.getRoutes().values().stream()
                .filter(r -> r.getPath().startsWith(routePrefix))
                .findFirst().orElseThrow(() -> new ZuulException("Invalid Webdav route", HttpStatus.NOT_FOUND.value(), "No such route configured"));
        ctx.setDebugRouting(true);
        String remotePrefix;
        try {
            remotePrefix = new URL(route.getUrl()).getPath();
        } catch (MalformedURLException e) {
            log.error("Invalid route url: {}", route.getUrl(), e);
            throw new ZuulException(e, HttpStatus.BAD_GATEWAY.value(), "Invalid route url");
        }
        var writer = new StringWriter();
        try {
            transform(ctx.getResponseDataStream(), remotePrefix, routePrefix, storage.getRootDirectoryIri(), storageRoot, writer);
        } catch (Exception e) {
            log.error("Error translating webdav response", e);
            throw new ZuulException(e, HttpStatus.BAD_GATEWAY.value(), "Error translating webdav response");
        }
        var content = writer.toString();
        ctx.setResponseBody(content);
        ctx.setOriginContentLength(Long.valueOf(content.getBytes(StandardCharsets.UTF_8).length));
        ctx.setResponseDataStream(null);
        return null;
    }
}
