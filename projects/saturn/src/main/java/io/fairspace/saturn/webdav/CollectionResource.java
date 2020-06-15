package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.resource.DisplayNameResource;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.vocabulary.RDFS;

class CollectionResource extends DirectoryResource implements DisplayNameResource {

    public CollectionResource(DavFactory factory, Resource subject, Access access) {
        super(factory, subject, access);
    }

    @Override
    public String getName() {
        return subject.getRequiredProperty(FS.filePath).getString();
    }

    @Override
    public String getDisplayName() {
        return subject.getRequiredProperty(RDFS.label).getString();
    }

    @Override
    public void setDisplayName(String s) {
        subject.removeAll(RDFS.label).addProperty(RDFS.label, s);
    }
}
