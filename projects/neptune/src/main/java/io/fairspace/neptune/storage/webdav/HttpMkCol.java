package io.fairspace.neptune.storage.webdav;

import org.apache.http.client.methods.HttpRequestBase;

import java.net.URI;

public class HttpMkCol extends HttpRequestBase {

    public final static String METHOD_NAME = "MKCOL";

    public HttpMkCol(final URI uri) {
        setURI(uri);
    }

    /**
     * @throws IllegalArgumentException if the uri is invalid.
     */
    public HttpMkCol(final String uri) {
        setURI(URI.create(uri));
    }

    @Override
    public String getMethod() {
        return METHOD_NAME;
    }

}
