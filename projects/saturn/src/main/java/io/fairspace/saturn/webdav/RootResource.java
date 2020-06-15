package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Auth;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.MakeCollectionableResource;
import io.milton.resource.Resource;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.util.Date;
import java.util.List;
import java.util.Objects;

import static io.fairspace.saturn.webdav.DavFactory.getUser;
import static io.fairspace.saturn.webdav.DavFactory.now;

class RootResource implements io.milton.resource.CollectionResource, MakeCollectionableResource {

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
    public io.milton.resource.CollectionResource createCollection(String newName) throws NotAuthorizedException, ConflictException, BadRequestException {
        var subj = factory.pathToSubject(newName);

        if (subj.hasProperty(RDF.type) && !subj.hasProperty(FS.dateDeleted)) {
            throw new ConflictException();
        }

        subj.getModel().removeAll(subj, null, null).removeAll(null, null, subj);

        subj.addProperty(RDF.type, FS.Collection)
                .addProperty(FS.filePath, newName)
                .addProperty(RDFS.label, newName)
                .addProperty(FS.createdBy, getUser())
                .addProperty(FS.dateCreated, now());

        factory.permissions.createResource(subj.asNode());

        return new CollectionResource(factory, subj, Access.Manage);
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
