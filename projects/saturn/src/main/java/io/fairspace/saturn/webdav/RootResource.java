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
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.util.Date;
import java.util.List;
import java.util.Objects;

import static io.fairspace.saturn.auth.RequestContext.isAdmin;
import static io.fairspace.saturn.webdav.DavFactory.childSubject;
import static io.fairspace.saturn.webdav.PathUtils.validateCollectionName;
import static io.fairspace.saturn.webdav.WebDAVServlet.owner;
import static io.fairspace.saturn.webdav.WebDAVServlet.timestampLiteral;

@Slf4j
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

    public Resource findExistingCollectionWithNameIgnoreCase(String name) {
        return getChildren().stream()
                .filter(collection -> collection.getName().equalsIgnoreCase(name))
                .findAny()
                .orElse(null);
    }

    /**
     * Creates a new collection resource, sets the owner workspaces and assigns
     * manage permission on the collection to the current user.
     * Returns null if a collection with collection already exists with the same name (modulo case),
     * which is interpreted as a failure by {@link io.milton.http.webdav.MkColHandler},
     * resulting in a 405 (Method Not Allowed) response.
     *
     * @param newName the name (identifier) of the new collection, which needs to be a valid collection name.
     *
     * @return the collection resource if it was successfully created; null if
     *         a collection with the name already exists (ignoring case);
     * @throws NotAuthorizedException if the user does not have write permission on the owner workspace.
     * @throws ConflictException if the IRI is already is use by a resource that is not deleted.
     * @throws BadRequestException if the name is invalid (@see {@link PathUtils#validateCollectionName}).
     */
    @Override
    public io.milton.resource.CollectionResource createCollection(String newName) throws NotAuthorizedException, ConflictException, BadRequestException {
        validateCollectionName(newName);

        var existing = findExistingCollectionWithNameIgnoreCase(newName);
        if (existing != null) {
            log.warn("Collection already exists with that name (modulo case): {}", existing.getName());
            return null;
        }

        var subj = childSubject(factory.rootSubject, newName);

        if (subj.hasProperty(RDF.type) && !subj.hasProperty(FS.dateDeleted)) {
            throw new ConflictException();
        }

        subj.getModel().removeAll(subj, null, null).removeAll(null, null, subj);

        subj.addProperty(RDF.type, FS.Collection)
                .addProperty(RDFS.label, newName)
                .addProperty(RDFS.comment, "")
                .addProperty(FS.createdBy, factory.currentUserResource())
                .addProperty(FS.dateCreated, timestampLiteral())
                .addProperty(FS.dateModified, timestampLiteral())
                .addProperty(FS.modifiedBy, factory.currentUserResource());

        var ownerWorkspace = owner();
        if (ownerWorkspace != null) {
            var ws = subj.getModel().createResource(ownerWorkspace);
            if (!ws.hasProperty(RDF.type, FS.Workspace) || ws.hasProperty(FS.dateDeleted)) {
                throw new PropertySource.PropertySetException(Response.Status.SC_BAD_REQUEST, "Invalid workspace IRI");
            }

            if (!ws.hasProperty(FS.status, WorkspaceStatus.Active.name())
                    && !ws.hasProperty(FS.member, factory.currentUserResource())
                    && !ws.hasProperty(FS.manager, factory.currentUserResource())
                    && !isAdmin()) {
                throw new NotAuthorizedException();
            }

            subj.addProperty(FS.ownedBy, ws);
        }

        subj.addProperty(FS.manage, factory.currentUserResource())
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
