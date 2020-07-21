package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.util.iterator.ExtendedIterator;
import org.apache.jena.vocabulary.RDF;

import java.net.URI;

import static io.fairspace.saturn.auth.RequestContext.*;
import static io.fairspace.saturn.webdav.Access.max;
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

        if (!subject.getModel().containsResource(subject)
                || subject.hasProperty(FS.dateDeleted) && !showDeleted()
                || subject.hasProperty(FS.movedTo)) {
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

            if (isAdmin()) {
                return Access.Manage;
            }

            var access = getPermission(coll, user);

            var deleted = coll.hasProperty(FS.dateDeleted) || (ownerWs != null && ownerWs.hasProperty(FS.dateDeleted));
            if (deleted && access != Access.Manage) {
                return Access.None;
            }

            if (coll.hasLiteral(FS.accessMode, AccessMode.DataPublished.name()) && canViewPublicData()) {
                access = max(access, Access.Read);
            } else if (coll.hasProperty(FS.list, user)
                    || ((coll.hasLiteral(FS.accessMode, AccessMode.MetadataPublished.name()) || coll.hasLiteral(FS.accessMode, AccessMode.DataPublished.name())) && canViewPublicMetadata())) {
                access = max(access, Access.List);
            }

            Iterable<org.apache.jena.rdf.model.Resource> userWorkspaces = () -> subject.getModel()
                    .listSubjectsWithProperty(RDF.type, FS.Workspace)
                    .filterKeep(ws -> ws.hasProperty(FS.manage, user) || ws.hasProperty(FS.member, user))
                    .filterDrop(ws -> ws.hasProperty(FS.dateDeleted));


            for (var ws : userWorkspaces) {
                access = max(access, getPermission(coll, ws));
                if (access == Access.Manage) {
                    break;
                }
            }

            return access;
        }
        return Access.None;
    }

    private Access getPermission(org.apache.jena.rdf.model.Resource resource, org.apache.jena.rdf.model.Resource principal) {
        if (principal.hasProperty(FS.manage, principal)) {
            return Access.Manage;
        }
        if (principal.hasProperty(FS.write, principal)) {
            return Access.Write;
        }
        if (principal.hasProperty(FS.read, principal)) {
            return Access.Read;
        }
        if (principal.hasProperty(FS.list, principal)) {
            return Access.List;
        }
        return Access.None;
    }

    private static ExtendedIterator<org.apache.jena.rdf.model.Resource> getWorkspaceShares(org.apache.jena.rdf.model.Resource coll) {
        return coll.listProperties()
                .filterKeep(s -> s.getPredicate().equals(FS.manage)
                        || s.getPredicate().equals(FS.write)
                        || s.getPredicate().equals(FS.read)
                        || s.getPredicate().equals(FS.list))
                .mapWith(Statement::getResource)
                .filterKeep(r -> r.hasProperty(RDF.type, FS.Workspace))
                .filterDrop(r -> r.hasProperty(FS.dateDeleted));
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

    org.apache.jena.rdf.model.Resource currentUserResource() {
        return rootSubject.getModel().createResource(getUserURI().getURI());
    }

    public boolean isFileSystemResource(org.apache.jena.rdf.model.Resource resource) {
        return resource.getURI().startsWith(baseUri);
    }
}
