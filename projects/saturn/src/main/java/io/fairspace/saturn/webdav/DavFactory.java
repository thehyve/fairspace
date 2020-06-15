package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import org.apache.jena.rdf.model.Literal;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.vocabulary.RDF;

import java.time.Instant;
import java.util.stream.Stream;

import static io.fairspace.saturn.auth.RequestContext.getCurrentUser;
import static io.fairspace.saturn.rdf.SparqlUtils.toXSDDateTimeLiteral;
import static io.fairspace.saturn.webdav.PathUtils.encodePath;
import static io.fairspace.saturn.webdav.PathUtils.splitPath;
import static io.fairspace.saturn.webdav.WebDAVServlet.showDeleted;
import static java.util.stream.Collectors.joining;

public class DavFactory implements ResourceFactory {
    final String baseUri;
    final Model model;
    final BlobStore store;
    final PermissionsService permissions;
    private final Resource root = new RootResource(this);


    public DavFactory(String baseUri, Model model, BlobStore store, PermissionsService permissions) {
        this.baseUri = baseUri;
        this.model = model;
        this.store = store;
        this.permissions = permissions;
    }

    @Override
    public Resource getResource(String host, String path) throws NotAuthorizedException, BadRequestException {
        // /api/v1/webdav/relPath -> relPath
        path = Stream.of(splitPath(path))
                .skip(3)
                .collect(joining("/"));
        if (path.isEmpty()) {
            return root;
        }

        var collection = pathToSubject(splitPath(path)[0]);
        if (!collection.hasProperty(RDF.type, collection)) {
            return null;
        }

        var subject = pathToSubject(path);
        var access = permissions.getPermission(collection.asNode());

        if (!access.canRead()) {
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

    org.apache.jena.rdf.model.Resource pathToSubject(String path) {
        return model.createResource(baseUri + encodePath(path));
    }

    static Literal timestampLiteral() {
        return toXSDDateTimeLiteral(Instant.now());
    }

    static org.apache.jena.rdf.model.Resource currentUserResource() {
        return org.apache.jena.rdf.model.ResourceFactory.createResource(getCurrentUser().getIri().getURI());
    }
}
