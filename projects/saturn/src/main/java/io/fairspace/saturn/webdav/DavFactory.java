package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.workspaces.WorkspaceStatus;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;

import java.net.URI;

import static io.fairspace.saturn.auth.RequestContext.*;
import static io.fairspace.saturn.webdav.PathUtils.encodePath;
import static io.fairspace.saturn.webdav.WebDAVServlet.showDeleted;

public class DavFactory implements ResourceFactory {
    final org.apache.jena.rdf.model.Resource rootSubject;
    final BlobStore store;
    private final String baseUri;
    public final io.milton.resource.CollectionResource root = new RootResource(this);


    public DavFactory(org.apache.jena.rdf.model.Resource rootSubject, BlobStore store) {
        this.rootSubject = rootSubject;
        this.store = store;
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

        if (!subject.getModel().containsResource(subject) || subject.hasProperty(FS.dateDeleted) && !showDeleted()) {
            return null;
        }

        var access = getAccess(subject);

        if (!access.canList()) {
            throw new NotAuthorizedException();
        }

        return getResource(subject, access);
    }

    Resource tryGetResource(org.apache.jena.rdf.model.Resource subject) {
        if (subject.equals(rootSubject)) {
            return root;
        }

        var access = getAccess(subject);

        if (!access.canList()) {
            return null;
        }

        return getResource(subject, access);
    }

    public Access getAccess(org.apache.jena.rdf.model.Resource subject) {
        var uri = subject.getURI();
        var nextSeparatorPos = uri.indexOf('/', rootSubject.getURI().length() + 1);
        var coll = nextSeparatorPos < 0 ? subject : subject.getModel().createResource(uri.substring(0, nextSeparatorPos));
        if (coll.hasProperty(RDF.type, FS.Collection)) {
            var user = currentUserResource();
            var ownerWs = coll.getPropertyResourceValue(FS.ownedBy);
            var active = (ownerWs != null) && ownerWs.hasLiteral(FS.status, WorkspaceStatus.Active);
            var deleted = coll.hasProperty(FS.dateDeleted) || (ownerWs != null && ownerWs.hasProperty(FS.dateDeleted));
            if (coll.hasProperty(FS.manage, user)
                    || (ownerWs != null) && ownerWs.hasProperty(FS.manage, user)
                    || isAdmin()) {
                return Access.Manage;
            } else if (deleted) {
                return Access.None;
            } else if (ownerWs != null && coll.hasProperty(FS.sharedWith, ownerWs) && ownerWs.hasProperty(FS.member, user)) {
                return active ? Access.Write : Access.Read;
            } else if (coll.listProperties(FS.sharedWith)
                    .mapWith(Statement::getResource)
                    .filterDrop(r -> r.hasProperty(FS.dateDeleted))
                    .filterKeep(r -> r.hasProperty(FS.member, user) || r.hasProperty(FS.manage, user))
                    .hasNext()) {
                return Access.Read;
            } else if (coll.hasLiteral(FS.accessMode, AccessMode.DataPublished.name()) && canViewPublicData()) {
                return Access.Read;
            } else if (coll.hasLiteral(FS.accessMode, AccessMode.MetadataPublished.name()) || coll.hasLiteral(FS.accessMode, AccessMode.DataPublished.name())
                    && canViewPublicMetadata()) {
                return Access.List;
            }
        }
        return Access.None;
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

    public boolean isFileSystemResource(org.apache.jena.rdf.model.Resource resource) {
        return resource.getURI().startsWith(baseUri);
    }
}
