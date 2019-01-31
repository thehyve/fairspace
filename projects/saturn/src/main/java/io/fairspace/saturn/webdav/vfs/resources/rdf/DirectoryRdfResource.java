package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

@Getter
@EqualsAndHashCode(callSuper = true)
public class DirectoryRdfResource extends AbstractRdfCollectionResource implements VfsDirectoryResource {
    public DirectoryRdfResource(Resource rdfResource, Model model, RdfBackedVfsResourceFactory resourceFactory, VfsContentStore contentStore) {
        super(rdfResource, model, resourceFactory, contentStore);
    }
}
