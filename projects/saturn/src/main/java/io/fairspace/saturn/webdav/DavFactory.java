package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.mail.MailService;
import io.fairspace.saturn.services.users.UserService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import org.apache.jena.vocabulary.RDF;

import java.net.URI;

import static io.fairspace.saturn.auth.RequestContext.getUserURI;
import static io.fairspace.saturn.util.EnumUtils.max;
import static io.fairspace.saturn.util.EnumUtils.min;
import static io.fairspace.saturn.webdav.AccessMode.DataPublished;
import static io.fairspace.saturn.webdav.AccessMode.MetadataPublished;
import static io.fairspace.saturn.webdav.PathUtils.encodePath;
import static io.fairspace.saturn.webdav.WebDAVServlet.showDeleted;

public class DavFactory implements ResourceFactory {
    final org.apache.jena.rdf.model.Resource rootSubject;
    final BlobStore store;
    final UserService userService;
    final MailService mailService;
    private final String baseUri;
    public final RootResource root = new RootResource(this);


    public DavFactory(org.apache.jena.rdf.model.Resource rootSubject, BlobStore store, UserService userService, MailService mailService) {
        this.rootSubject = rootSubject;
        this.store = store;
        this.userService = userService;
        this.mailService = mailService;
        var uri = URI.create(rootSubject.getURI());
        this.baseUri = URI.create(uri.getScheme() + "://" + uri.getHost() + (uri.getPort() > 0 ? ":" + uri.getPort() : "")).toString();
    }

    @Override
    public Resource getResource(String host, String path) throws NotAuthorizedException {
        return getResource(rootSubject.getModel().createResource(baseUri + "/" + encodePath(path)));
    }

    Resource getResource(org.apache.jena.rdf.model.Resource subject) {
        if (subject.equals(rootSubject)) {
            return root;
        }

        if (!subject.getModel().containsResource(subject)
                || subject.hasProperty(FS.dateDeleted) && !showDeleted()
                || subject.hasProperty(FS.movedTo)) {
            return null;
        }

        return getResource(subject, getAccess(subject));
    }

    public Access getAccess(org.apache.jena.rdf.model.Resource subject) {
        var uri = subject.getURI();
        var nextSeparatorPos = uri.indexOf('/', rootSubject.getURI().length() + 1);
        var coll = nextSeparatorPos < 0 ? subject : subject.getModel().createResource(uri.substring(0, nextSeparatorPos));
        if (!coll.hasProperty(RDF.type, FS.Collection)) {
            return Access.None;
        }

        if (userService.currentUser().isAdmin()) {
            return Access.Manage;
        }

        var user = currentUserResource();
        var ownerWs = coll.getPropertyResourceValue(FS.ownedBy);
        var deleted = coll.hasProperty(FS.dateDeleted) || (ownerWs != null && ownerWs.hasProperty(FS.dateDeleted));

        var access = getGrantedPermission(coll, user);

        if (coll.hasLiteral(FS.accessMode, DataPublished.name()) && (userService.currentUser().isCanViewPublicData() || access.canRead())) {
            return Access.Read;
        }
        if (!access.canList() && userService.currentUser().isCanViewPublicMetadata()
                && (coll.hasLiteral(FS.accessMode, MetadataPublished.name()) || coll.hasLiteral(FS.accessMode, DataPublished.name()))) {
            access = Access.List;
        }

        var userWorkspacesIterator = subject.getModel()
                .listSubjectsWithProperty(RDF.type, FS.Workspace)
                .filterKeep(ws -> user.hasProperty(FS.isManagerOf, ws) || user.hasProperty(FS.isMemberOf, ws))
                .filterDrop(ws -> ws.hasProperty(FS.dateDeleted));

        while (userWorkspacesIterator.hasNext() && access != Access.Manage) {
            access = max(access, getGrantedPermission(coll, userWorkspacesIterator.next()));
        }

        if (deleted && (!showDeleted() || !access.canWrite())) {
            return Access.None;
        } else if (subject.hasProperty(FS.status, Status.Archived.name())) {
            access = min(access, Access.Read);
        } else if (subject.hasProperty(FS.status, Status.Closed.name())) {
            access = min(access, Access.List);
        }

        return access;
    }

    private static Access getGrantedPermission(org.apache.jena.rdf.model.Resource resource, org.apache.jena.rdf.model.Resource principal) {
        if (principal.hasProperty(FS.canManage, resource)) {
            return Access.Manage;
        }
        if (principal.hasProperty(FS.canWrite, resource)) {
            return Access.Write;
        }
        if (principal.hasProperty(FS.canRead, resource)) {
            return Access.Read;
        }
        if (principal.hasProperty(FS.canList, resource)) {
            return Access.List;
        }
        return Access.None;
    }

    Resource getResource(org.apache.jena.rdf.model.Resource subject, Access access) {
        if (subject.hasProperty(FS.dateDeleted) && !showDeleted()) {
            return null;
        }
        if (subject.hasProperty(FS.movedTo)) {
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
