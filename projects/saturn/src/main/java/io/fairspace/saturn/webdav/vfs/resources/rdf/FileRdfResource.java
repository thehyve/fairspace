package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.contents.StoredContent;
import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_LOCATION;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.FILESIZE;

@Getter
@EqualsAndHashCode(callSuper = true)
public class FileRdfResource extends AbstractRdfResource implements VfsFileResource {
    protected final RdfBackedVfsResourceFactory resourceFactory;
    protected final VfsContentStore contentStore;

    private String contentLocation;
    private String contentType;
    private long fileSize;

    public FileRdfResource(Resource rdfResource, Model model, RdfBackedVfsResourceFactory resourceFactory, VfsContentStore contentStore) {
        super(rdfResource, model);

        extractFileProperties(rdfResource, model);
        this.resourceFactory = resourceFactory;
        this.contentStore = contentStore;
    }

    private void extractFileProperties(Resource rdfResource, Model model) {
        RDFNode contentLocationObject = getPropertyValueOrNull(rdfResource, model, CONTENT_LOCATION);
        contentLocation = contentLocationObject != null ? contentLocationObject.toString() : null;

        RDFNode contentTypeObject = getPropertyValueOrNull(rdfResource, model, CONTENT_TYPE);
        contentType = contentTypeObject != null ? contentTypeObject.toString() : null;

        RDFNode fileSizeObject = getPropertyValueOrNull(rdfResource, model, FILESIZE);
        fileSize = fileSizeObject != null ? FileSize.parse(fileSizeObject.toString()) : 0;
    }

    @Override
    public void sendContent(OutputStream outputStream) throws IOException {
        contentStore.getContent(contentLocation, outputStream);
    }

    @Override
    public VfsFileResource updateContents(String contentType, InputStream inputStream) throws IOException {
        // In case of an exception while storing the contents, it will not be added
        // to the directory structure.
        StoredContent storedContent = contentStore.putContent(getPath(), inputStream);

        // On succesful upload, store a reference to the file in the resources
        return resourceFactory.updateFile(this, storedContent.getSize(), contentType, storedContent.getLocation());
    }
}
