package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.contents.StoredContent;
import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import io.fairspace.saturn.webdav.vfs.resources.VfsCollectionResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.RdfBackedVfsResourceFactory.DIRECTORY_SEPARATOR;

@Getter
@EqualsAndHashCode(callSuper = true)
@Slf4j
public abstract class AbstractRdfCollectionResource extends AbstractRdfResource implements VfsCollectionResource {
    protected final RdfBackedVfsResourceFactory resourceFactory;
    protected final VfsContentStore contentStore;

    /**
     * Instantiates a resource object by reading values from the RDF model
     *
     * Please note that if multiple triples exist for the same property, the behaviour is undefined!
     *
     * @param rdfResource
     * @param model
     */
    public AbstractRdfCollectionResource(Resource rdfResource, Model model, RdfBackedVfsResourceFactory resourceFactory, VfsContentStore contentStore) {
        super(rdfResource, model);
        this.resourceFactory = resourceFactory;
        this.contentStore = contentStore;
    }

    @Override
    public VfsDirectoryResource createCollection(String name) {
        return resourceFactory.createDirectory(getUniqueId(), getPath() + DIRECTORY_SEPARATOR + name);
    }

    @Override
    public List<? extends VfsResource> getChildren() {
        return resourceFactory.getChildren(getUniqueId());
    }

    @Override
    public VfsResource getChild(String name) {
        return resourceFactory.getResource(getPath() + DIRECTORY_SEPARATOR + name);
    }

    @Override
    public VfsFileResource createFile(String name, String contentType, InputStream inputStream) throws IOException {
        if(StringUtils.isEmpty(name)) {
            throw new IllegalArgumentException("Resource name must be given when creating a file");
        }

        // Our implementation expects the name not to contain any path separators
        if(name.contains(DIRECTORY_SEPARATOR)) {
            throw new IllegalArgumentException("Resource name must not contain a path separator");
        }

        String path = getPath() + DIRECTORY_SEPARATOR + name;

        // The file must not exist yet
        if(resourceFactory.getResource(path) != null) {
            throw new IllegalArgumentException("Resource should not exist yet");
        }

        // In case of an exception while storing the contents, it will not be added
        // to the directory structure.
        StoredContent storedContent = contentStore.putContent(path, inputStream);

        // On succesful upload, store a reference to the file in the resources
        return resourceFactory.storeFile(getUniqueId(), path, storedContent.getSize(), contentType, storedContent.getLocation());
    }
}
