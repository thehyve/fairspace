package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Auth;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import org.apache.jena.vocabulary.RDF;

import java.util.Date;
import java.util.List;
import java.util.Objects;

class RootResource implements io.milton.resource.CollectionResource {

    private final DavFactory factory;

    public RootResource(DavFactory factory) {
        this.factory = factory;
    }

    @Override
    public Resource child(String childName) throws NotAuthorizedException, BadRequestException {
        return factory.getResource(null, childName);
    }

    @Override
    public List<? extends Resource> getChildren() throws NotAuthorizedException, BadRequestException {
        return factory.model.listSubjectsWithProperty(RDF.type, FS.Collection)
                .mapWith(s -> {
                    try {
                        return factory.getResource(null, s.getRequiredProperty(FS.filePath).getString());
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filterDrop(Objects::isNull)
                .toList();
    }

    @Override
    public String getUniqueId() {
        return factory.baseUri;
    }

    @Override
    public String getName() {
        return "";
    }

    @Override
    public Object authenticate(String user, String password) {
        return null;
    }

    @Override
    public boolean authorise(Request request, Request.Method method, Auth auth) {
        return true;
    }

    @Override
    public String getRealm() {
        return null;
    }

    @Override
    public Date getModifiedDate() {
        return null;
    }

    @Override
    public String checkRedirect(Request request) throws NotAuthorizedException, BadRequestException {
        return null;
    }
}
