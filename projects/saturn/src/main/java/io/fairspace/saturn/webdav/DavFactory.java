package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.PermissionsService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.vocabulary.RDF;

import java.util.stream.Stream;

import static io.fairspace.saturn.webdav.WebDAVServlet.showDeleted;
import static io.fairspace.saturn.webdav.PathUtils.encodePath;
import static io.fairspace.saturn.webdav.PathUtils.splitPath;
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

        var collection = resource(splitPath(path)[0]);
        if (!collection.hasProperty(RDF.type, collection)) {
            return null;
        }

        var subject = resource(path);
        var access = permissions.getPermission(collection.asNode());

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

    org.apache.jena.rdf.model.Resource resource(String path) {
        return model.createResource(baseUri + encodePath(path));
    }
}
