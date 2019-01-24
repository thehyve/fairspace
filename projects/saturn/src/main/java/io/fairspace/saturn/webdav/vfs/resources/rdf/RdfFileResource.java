package io.fairspace.saturn.webdav.vfs.resources.rdf;

import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import org.apache.commons.lang.StringUtils;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Resource;

import java.time.ZonedDateTime;

import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_LOCATION;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.CONTENT_TYPE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_CREATED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.DATE_MODIFIED;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.FILESIZE;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.IS_READY;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.NAME;
import static io.fairspace.saturn.webdav.vfs.resources.rdf.VirtualFileSystemIris.PARENT;

@Getter
@EqualsAndHashCode(callSuper = true)
public class RdfFileResource extends RdfAbstractResource implements VfsFileResource {
    private String contentLocation;
    private String mimeType;
    private long fileSize;

    public RdfFileResource(Resource rdfResource, Model model) {
        super(rdfResource, model);

        extractFileProperties(rdfResource, model);
    }

    private void extractFileProperties(Resource rdfResource, Model model) {
        RDFNode contentLocationObject = getPropertyValueOrNull(rdfResource, model, CONTENT_LOCATION);
        contentLocation = contentLocationObject != null ? contentLocationObject.toString() : null;

        RDFNode mimeTypeObject = getPropertyValueOrNull(rdfResource, model, CONTENT_TYPE);
        mimeType = mimeTypeObject != null ? mimeTypeObject.toString() : null;

        RDFNode fileSizeObject = getPropertyValueOrNull(rdfResource, model, FILESIZE);
        fileSize = fileSizeObject != null ? FileSize.parse(fileSizeObject.toString()) : 0;
    }

}
