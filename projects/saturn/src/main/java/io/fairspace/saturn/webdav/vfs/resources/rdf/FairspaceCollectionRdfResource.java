package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import io.fairspace.saturn.webdav.vfs.resources.VfsFairspaceCollectionResource;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

@Getter
@EqualsAndHashCode(callSuper = true)
public class FairspaceCollectionRdfResource extends AbstractRdfCollectionResource implements VfsFairspaceCollectionResource {
    public FairspaceCollectionRdfResource(Resource rdfResource, Model model, RdfBackedVfsResourceFactory resourceFactory, VfsContentStore contentStore) {
        super(rdfResource, model, resourceFactory, contentStore);
    }

    @Override
    public String getName() {
        // The name of a collection as it should appear to the file system does not
        // equal the label, but it equals the basename of the path
        return getPath().startsWith("/") ? getPath().replaceFirst("/", "") : getPath();
    }
}
