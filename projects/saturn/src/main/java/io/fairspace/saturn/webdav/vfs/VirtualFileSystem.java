package io.fairspace.saturn.webdav.vfs;

import io.fairspace.saturn.webdav.vfs.contents.StoredContent;
import io.fairspace.saturn.webdav.vfs.contents.VfsContentStore;
import io.fairspace.saturn.webdav.vfs.resources.VfsCollectionResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import org.apache.commons.lang.StringUtils;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

/**
 * Represents a virtual file system, consisting of
 *      Resources representing the directory structure, handled by a {@see ResourceFactory}
 *      Contents representing the file contents, handled by a {@see ContentStore}
 */
public class VirtualFileSystem {
    private static final String PATH_SEPARATOR = "/";
    private VfsContentStore contentStore;
    private VfsResourceFactory resourceFactory;

    public VirtualFileSystem(VfsContentStore contentStore, VfsResourceFactory resourceFactory) {
        this.contentStore = contentStore;
        this.resourceFactory = resourceFactory;
    }

    public VfsResource getResource(String path) {
        return resourceFactory.getResource(path);
    }

    /**
     * Retrieves the content for a given contentLocation.
     * @param contentLocation location of the contents within the contentStore.
     *                        Is produced when using putContent
     * @param out             OutputStream to write the content to
     * @throws IOException
     */
    public void getContent(String contentLocation, OutputStream out) throws IOException {
        contentStore.getContent(contentLocation, out);
    }

    public VfsDirectoryResource createDirectory(String parentId, String path) {
        return resourceFactory.createDirectory(parentId, path);
    }

    public List<? extends VfsResource> getChildren(String parentId) {
        return resourceFactory.getChildren(parentId);
    }

    public VfsFileResource storeFile(VfsCollectionResource parentResource, String name, String contentType, InputStream inputStream) throws IOException {
        if(parentResource == null || StringUtils.isEmpty(name)) {
            throw new IllegalArgumentException("Parent resource and resource name must be given");
        }

        // Our implementation expects the name not to contain any path separators
        if(name.contains(PATH_SEPARATOR)) {
            throw new IllegalArgumentException("Resource name must not contain a path separator");
        }

        String path = parentResource.getPath() + PATH_SEPARATOR + name;

        // In case of an exception while storing the contents, it will not be added
        // to the directory structure.
        StoredContent storedContent = contentStore.putContent(path, inputStream);

        // On succesful upload, store a reference to the file in the resources
        return resourceFactory.storeFile(parentResource.getUniqueId(), path, storedContent.getSize(), contentType, storedContent.getLocation());
    }

    public VfsFileResource updateFile(VfsFileResource resource, String contentType, InputStream inputStream) throws IOException {
        if(resource == null) {
            throw new IllegalArgumentException("Resource must be given when updating it");
        }

        // In case of an exception while storing the contents, it will not be added
        // to the directory structure.
        StoredContent storedContent = contentStore.putContent(resource.getPath(), inputStream);

        // On succesful upload, store a reference to the file in the resources
        return resourceFactory.updateFile(resource, storedContent.getSize(), contentType, storedContent.getLocation());
    }

}
