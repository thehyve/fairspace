package io.fairspace.saturn.webdav.milton;

import io.fairspace.saturn.webdav.vfs.contents.VfsContentFactory;
import io.fairspace.saturn.webdav.vfs.resources.VfsCollectionResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import io.fairspace.saturn.webdav.vfs.resources.VfsRootResource;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Getter
public class VfsBackedMiltonResourceFactory implements ResourceFactory {
    private final String contextPath;
    private final VfsResourceFactory resourceFactory;
    private final VfsContentFactory contentFactory;

    public VfsBackedMiltonResourceFactory(String contextPath, VfsResourceFactory resourceFactory, VfsContentFactory contentFactory) {
        this.resourceFactory = resourceFactory;
        this.contentFactory = contentFactory;

        // Ensure the context path starts with a /
        if(contextPath == null) {
            this.contextPath = null;
        } else if (!contextPath.startsWith("/")) {
            this.contextPath = "/" + contextPath;
        } else {
            this.contextPath = contextPath;
        }
    }

    @Override
    public Resource getResource(String host, String path) throws NotAuthorizedException, BadRequestException {
        if(path == null) {
            return null;
        }

        // Strip the context from the path.
        // If the path is outside the context (e.g. when milton searches for the parent of the root)
        // then we indicate that the resource is not available by returning null
        String webdavPath = stripContext(path);
        if(webdavPath == null) {
            return null;
        }

        return toMiltonResource(resourceFactory.getResource(webdavPath), this);
    }

    public VfsFileResource storeFile(VfsFileResource vfsResource, InputStream inputStream) throws IOException {
        // TODO: Handle error cases, exceptions etc.
        // TODO: Update file length
        String contentLocation = contentFactory.putContent(vfsResource.getPath(), inputStream);

        // On succesful upload, mark it as stored
        // Store a reference to the updated resource
        return resourceFactory.markFileStored(vfsResource, contentLocation);
    }

    /**
     * Generates a new Milton {@Resource} object for the given Vfs resource
     * @param vfsResource
     * @param factory
     * @return
     */
    public static Resource toMiltonResource(VfsResource vfsResource, VfsBackedMiltonResourceFactory factory) {
        if(vfsResource == null) {
            return null;
        }

        if(vfsResource instanceof VfsDirectoryResource || vfsResource instanceof VfsRootResource) {
            return new VfsBackedMiltonDirectoryResource((VfsCollectionResource) vfsResource, factory);
        } else if(vfsResource instanceof VfsFileResource) {
            return new VfsBackedMiltonFileResource((VfsFileResource) vfsResource, factory);
        }

        log.info("Unknown type of vfs resource provided {}", vfsResource.getClass().getSimpleName());
        return null;
    }

    /**
     * Removes context path from the given path
     * @param path Path for which to strip the context
     * @return
     */
    private String stripContext(String path) {
        if (this.contextPath != null && contextPath.length() > 0 && !contextPath.equals("/")) {
            if(path.equals(contextPath)) {
                return "/";
            } else if(path.startsWith(contextPath)) {
                return path.replaceFirst(contextPath, "");
            } else {
                return null;
            }
        }

        return path;
    }

}
