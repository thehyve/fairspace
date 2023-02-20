package io.fairspace.saturn.webdav.resources;

import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.webdav.Access;
import io.fairspace.saturn.webdav.AccessMode;
import io.fairspace.saturn.webdav.DavFactory;
import io.fairspace.saturn.webdav.Status;
import io.milton.http.Response;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.property.PropertySource;
import io.milton.resource.CollectionResource;
import io.milton.resource.Resource;
import lombok.extern.log4j.Log4j2;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static io.fairspace.saturn.webdav.DavFactory.childSubject;
import static io.fairspace.saturn.webdav.PathUtils.validateCollectionName;
import static io.fairspace.saturn.webdav.WebDAVServlet.owner;
import static io.fairspace.saturn.webdav.WebDAVServlet.timestampLiteral;
import static io.milton.http.ResponseStatus.SC_FORBIDDEN;

@Log4j2
public class CollectionRootResource extends RootResource {

    public CollectionRootResource(DavFactory factory) {
        super(factory);
    }
    
    @Override
    public List<? extends Resource> getChildren() {
        return factory.rootSubject.getModel().listSubjectsWithProperty(RDF.type, FS.Collection)
                .mapWith(factory::getResource)
                .filterDrop(Objects::isNull)
                .filterKeep(r -> ((io.fairspace.saturn.webdav.resources.CollectionResource)r).access.canList())
                .toList();
    }
    
    /**
     * Creates a new collection resource, sets the owner workspaces and assigns
     * manage permission on the collection to the current user.
     * Returns null if a collection with collection already exists with the same name (modulo case),
     * which is interpreted as a failure by {@link io.milton.http.webdav.MkColHandler},
     * resulting in a 405 (Method Not Allowed) response.
     *
     * @param name the collection name, which needs to be unique.
     *
     * @return the collection resource if it was successfully created; null if
     *         a collection with the label already exists (ignoring case);
     * @throws NotAuthorizedException if the user does not have write permission on the owner workspace.
     * @throws ConflictException if the IRI is already is use by a resource that is not deleted.
     * @throws BadRequestException if the name is invalid (@see {@link #validateTargetCollectionName(String)}).
     */
    @Override
    public io.milton.resource.CollectionResource createCollection(String name) throws NotAuthorizedException, ConflictException, BadRequestException {
        if (name != null) {
            name = name.trim();
        }
        validateTargetCollectionName(name);

        var subj = childSubject(factory.rootSubject, name);
        if (subj.hasProperty(RDF.type) && !subj.hasProperty(FS.dateDeleted)) {
            throw new ConflictException();
        }

        subj.getModel().removeAll(subj, null, null).removeAll(null, null, subj);

        var user = factory.currentUserResource();

        subj.addProperty(RDF.type, FS.Collection)
                .addProperty(RDFS.label, name)
                .addProperty(RDFS.comment, "")
                .addProperty(FS.createdBy, user)
                .addProperty(FS.dateCreated, timestampLiteral())
                .addProperty(FS.dateModified, timestampLiteral())
                .addProperty(FS.modifiedBy, user)
                .addProperty(FS.accessMode, AccessMode.Restricted.name())
                .addProperty(FS.status, Status.Active.name());

        user.addProperty(FS.canManage, subj);

        var ownerWorkspace = owner();
        if (ownerWorkspace == null) {
            throw new PropertySource.PropertySetException(Response.Status.SC_BAD_REQUEST, "Workspace IRI is missing");
        }
        var ws = subj.getModel().createResource(ownerWorkspace);
        if (!ws.hasProperty(RDF.type, FS.Workspace) || ws.hasProperty(FS.dateDeleted)) {
            throw new PropertySource.PropertySetException(Response.Status.SC_BAD_REQUEST, "Invalid workspace IRI");
        }

        if (!factory.currentUserResource().hasProperty(FS.isMemberOf, ws)
                && !factory.currentUserResource().hasProperty(FS.isManagerOf, ws)
                && !factory.userService.currentUser().isAdmin()) {
            throw new NotAuthorizedException("Not authorized to create a new collection in this workspace.", this, SC_FORBIDDEN);
        }

        subj.addProperty(FS.ownedBy, ws).addProperty(FS.belongsTo, ws);

        return (CollectionResource) factory.getResource(subj, Access.Manage);
    }

    @Override
    public void validateTargetCollectionName(String name) throws ConflictException, BadRequestException {
        validateCollectionName(name);
        var existing = findCollectionWithName(name);
        if (existing.isPresent()) {
            throw new ConflictException(existing.get(), "Target collection with this name already exists.");
        }
    }

    private Optional<Resource> findCollectionWithName(String name) {
        return factory.rootSubject.getModel().listSubjectsWithProperty(RDF.type, FS.Collection)
                .mapWith(child -> factory.getResourceByType(child, Access.List))
                .filterDrop(Objects::isNull)
                .filterKeep(collection -> collection.getName().equals(name))
                .nextOptional();
    }
}
