package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.workspaces.WorkspaceStatus;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Auth;
import io.milton.http.Request;
import io.milton.http.Response;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.property.PropertySource;
import io.milton.resource.CollectionResource;
import io.milton.resource.MakeCollectionableResource;
import io.milton.resource.PropFindableResource;
import io.milton.resource.Resource;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.util.Date;
import java.util.List;
import java.util.Objects;

import static io.fairspace.saturn.auth.RequestContext.isAdmin;
import static io.fairspace.saturn.webdav.DavFactory.childSubject;
import static io.fairspace.saturn.webdav.DavFactory.currentUserResource;
import static io.fairspace.saturn.webdav.PathUtils.validateCollectionName;
import static io.fairspace.saturn.webdav.WebDAVServlet.owner;
import static io.fairspace.saturn.webdav.WebDAVServlet.timestampLiteral;

class RootResource implements io.milton.resource.CollectionResource, MakeCollectionableResource, PropFindableResource {

    private final DavFactory factory;

    public RootResource(DavFactory factory) {
        this.factory = factory;
    }

    @Override
    public Resource child(String childName) throws NotAuthorizedException {
        return factory.getResource(childSubject(factory.rootSubject, childName));
    }

    @Override
    public List<? extends Resource> getChildren() {
        return factory.rootSubject.getModel().listSubjectsWithProperty(RDF.type, FS.Collection)
                .mapWith(factory::tryGetResource)
                .filterDrop(Objects::isNull)
                .toList();
    }

    private boolean existsCollectionWithNameIgnoreCase(String name) {
        return getChildren().stream()
                .anyMatch(collection -> collection.getName().equalsIgnoreCase(name));
    }

    @Override
    public io.milton.resource.CollectionResource createCollection(String newName) throws NotAuthorizedException, ConflictException, BadRequestException {
        validateCollectionName(newName);

        if (existsCollectionWithNameIgnoreCase(newName)) {
            throw new ConflictException("Collection already exists with that name (modulo case).");
        }

        var subj = childSubject(factory.rootSubject, newName);

        if (subj.hasProperty(RDF.type) && !subj.hasProperty(FS.dateDeleted)) {
            throw new ConflictException();
        }

        subj.getModel().removeAll(subj, null, null).removeAll(null, null, subj);

        subj.addProperty(RDF.type, FS.Collection)
                .addProperty(RDFS.label, newName)
                .addProperty(RDFS.comment, "")
                .addProperty(FS.createdBy, currentUserResource())
                .addProperty(FS.dateCreated, timestampLiteral())
                .addProperty(FS.dateModified, timestampLiteral())
                .addProperty(FS.modifiedBy, currentUserResource());

        var ownerWorkspace = owner();
        if (ownerWorkspace != null) {
            var ws = subj.getModel().createResource(ownerWorkspace);
            if (!ws.hasProperty(RDF.type, FS.Workspace) || ws.hasProperty(FS.dateDeleted)) {
                throw new PropertySource.PropertySetException(Response.Status.SC_BAD_REQUEST, "Invalid workspace IRI");
            }

            if (!ws.hasProperty(FS.status, WorkspaceStatus.Active.name())
                    && !ws.hasProperty(FS.member, currentUserResource())
                    && !ws.hasProperty(FS.manage, currentUserResource())
                    && !isAdmin()) {
                throw new NotAuthorizedException();
            }

            subj.addProperty(FS.ownedBy, ws);
        }

        subj.addProperty(FS.manage, currentUserResource())
                .addProperty(FS.accessMode, AccessMode.Restricted.name());

        return (CollectionResource) factory.getResource(subj, Access.Manage);
    }

    @Override
    public String getUniqueId() {
        return factory.rootSubject.toString();
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
    public String checkRedirect(Request request) {
        return null;
    }

    @Override
    public Date getCreateDate() {
        return null;
    }
}
