package io.fairspace.saturn.webdav.resources;

import io.fairspace.saturn.vocabulary.FS;
import io.fairspace.saturn.webdav.Access;
import io.fairspace.saturn.webdav.DavFactory;
import io.milton.http.Auth;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.resource.CollectionResource;
import io.milton.resource.Resource;
import lombok.extern.log4j.Log4j2;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static io.fairspace.saturn.webdav.DavFactory.childSubject;

@Log4j2
public class ExtraStorageRootResource extends RootResource {

    public ExtraStorageRootResource(DavFactory factory) {
        super(factory);
    }

    @Override
    public boolean authorise(Request request, Request.Method method, Auth auth) {
        return true;
    }
    @Override
    public List<? extends Resource> getChildren() {
        return factory.rootSubject.getModel().listSubjectsWithProperty(RDF.type, FS.ExtraStorageDirectory)
                .mapWith(factory::getResource)
                .filterDrop(Objects::isNull)
                .toList();
    }

    @Override
    public CollectionResource createCollection(String name) throws ConflictException, BadRequestException {
        if (name != null) {
            name = name.trim();
        }
        validateTargetCollectionName(name);
        var existing = findStorageWithName(name);
        if (existing.isPresent()) {
            return (CollectionResource) existing.get();
        }
        var subj = childSubject(factory.rootSubject, name);
        if (subj.hasProperty(RDF.type) && !subj.hasProperty(FS.dateDeleted)) {
            throw new ConflictException();
        }

        subj.getModel().removeAll(subj, null, null).removeAll(null, null, subj);
        subj.addProperty(RDF.type, FS.ExtraStorageDirectory)
                .addProperty(RDFS.label, name);

        return (CollectionResource) factory.getResource(subj, Access.Manage);
    }

    @Override
    public void validateTargetCollectionName(String name) throws BadRequestException {
        if (name == null || name.isEmpty()) {
            throw new BadRequestException("The storage name is empty.");
        }
    }

    private Optional<Resource> findStorageWithName(String name) {
        return factory.rootSubject.getModel().listSubjects()
                .filterDrop(Objects::isNull)
                .filterKeep(r -> r.getProperty(RDFS.label) != null && r.getProperty(RDFS.label).getString().equals(name))
                .mapWith(factory::getResource)
                .nextOptional();
    }

}
