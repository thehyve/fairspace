package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import org.apache.jena.vocabulary.RDF;

import java.net.URI;

import static io.fairspace.saturn.auth.RequestContext.getUserURI;
import static io.fairspace.saturn.webdav.PathUtils.encodePath;
import static io.fairspace.saturn.webdav.WebDAVServlet.showDeleted;

public class DavFactory implements ResourceFactory {
    final org.apache.jena.rdf.model.Resource rootSubject;
    final BlobStore store;
    final PermissionsService permissions;
    private final String baseUri;
    private final Resource root = new RootResource(this);


    public DavFactory(org.apache.jena.rdf.model.Resource rootSubject, BlobStore store, PermissionsService permissions) {
        this.rootSubject = rootSubject;
        this.store = store;
        this.permissions = permissions;
        var uri = URI.create(rootSubject.getURI());
        this.baseUri = URI.create(uri.getScheme() + "://" + uri.getHost() + (uri.getPort() > 0 ? ":" + uri.getPort() : "")).toString();
    }

    @Override
    public Resource getResource(String host, String path) throws NotAuthorizedException {
        return getResource(rootSubject.getModel().createResource(baseUri + "/" + encodePath(path)));
    }

    Resource getResource(org.apache.jena.rdf.model.Resource subject) throws NotAuthorizedException {
        if (subject.equals(rootSubject)) {
            return root;
        }

        var access = permissions.getPermission(subject.asNode());

        if (access == Access.None) {
            throw new NotAuthorizedException();
        }

        return getResource(subject, access);
    }

    Resource getResource(org.apache.jena.rdf.model.Resource subject, Access access) {
        if (subject.hasProperty(FS.dateDeleted) && !showDeleted()) {
            return null;
        }
        if (subject.hasProperty(RDF.type, FS.File)) {
            return new FileResource(this, subject, access);
        }
        if (subject.hasProperty(RDF.type, FS.Directory)) {
            return new DirectoryResource(this, subject, access);
        }
        if (subject.hasProperty(RDF.type, FS.Collection)) {
            return new CollectionResource(this, subject, access);
        }

        return null;
    }

    static org.apache.jena.rdf.model.Resource childSubject(org.apache.jena.rdf.model.Resource subject, String name) {
        return subject.getModel().createResource(subject.getURI() + "/" + encodePath(name));
    }

    static org.apache.jena.rdf.model.Resource currentUserResource() {
        return org.apache.jena.rdf.model.ResourceFactory.createResource(getUserURI().getURI());
    }
}
