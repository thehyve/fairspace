package nl.fairspace.pluto.config;

import com.netflix.zuul.*;
import com.netflix.zuul.context.*;
import com.netflix.zuul.exception.*;
import lombok.extern.slf4j.*;
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
import java.util.regex.*;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.POST_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SEND_RESPONSE_FILTER_ORDER;

@Slf4j
public class WebDAVPathRewritingFilter extends ZuulFilter {
    private final ZuulProperties zuulProperties;

    public WebDAVPathRewritingFilter(ZuulProperties zuulProperties) {
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
        return ctx.getRequest().getMethod().equals("PROPFIND") &&
                ctx.getRequest().getRequestURI().startsWith("/api/storages/");
    }

    /**
     * Replace in DAV:multistatus -> DAV:response -> DAV:href
     * values of the form '/api/webdav/*' to '/api/storages/$storage/webdav/*'
     */
    public void transform(InputStream in, String remotePrefix, String routePrefix, Writer writer) throws ParserConfigurationException, IOException, SAXException, XPathExpressionException, TransformerException {
        var documentBuilderFactory = DocumentBuilderFactory.newInstance();
        documentBuilderFactory.setFeature(XMLConstants.FEATURE_SECURE_PROCESSING, true);
        documentBuilderFactory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true);
        var webDavResponse = documentBuilderFactory.newDocumentBuilder().parse(in);
        var xpath = XPathFactory.newInstance().newXPath();
        var nodes = (NodeList) xpath.evaluate("/multistatus/response/href", webDavResponse, XPathConstants.NODESET);
        for (int i=0; i < nodes.getLength(); i++) {
            var node = nodes.item(i);
            if (node.getTextContent() != null) {
                node.setTextContent(node.getTextContent().replaceFirst(Pattern.quote(remotePrefix), routePrefix));
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
        String routePrefix = "/api/storages/%s/webdav".formatted(parts[3]);
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
            transform(ctx.getResponseDataStream(), remotePrefix, routePrefix, writer);
        } catch (Exception e) {
            log.error("Error translating webdav response", e);
            throw new ZuulException(e, HttpStatus.BAD_GATEWAY.value(), "Error translating webdav response");
        }
        ctx.setResponseBody(writer.toString());
        ctx.setResponseDataStream(null);
        return null;
    }
}
