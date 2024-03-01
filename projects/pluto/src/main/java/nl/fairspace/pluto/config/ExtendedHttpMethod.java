package nl.fairspace.pluto.config;

import lombok.Getter;

public enum ExtendedHttpMethod {
    GET(false),
    HEAD(false),
    POST(false),
    PUT(false),
    PATCH(false),
    DELETE(false),
    OPTIONS(false),
    TRACE(false),
    COPY(true),
    LOCK(true),
    MKCOL(true),
    MOVE(true),
    PROPFIND(true),
    PROPPATCH(true),
    UNLOCK(true);

    @Getter
    private final boolean webDAVSpecific;

    ExtendedHttpMethod(boolean webDAVSpecific) {
        this.webDAVSpecific = webDAVSpecific;
    }
}
