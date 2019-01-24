package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

@Getter
@EqualsAndHashCode(callSuper = true)
public class RdfDirectoryResource extends RdfAbstractResource implements VfsDirectoryResource {
    public RdfDirectoryResource(Resource rdfResource, Model model) {
        super(rdfResource, model);
    }
}
