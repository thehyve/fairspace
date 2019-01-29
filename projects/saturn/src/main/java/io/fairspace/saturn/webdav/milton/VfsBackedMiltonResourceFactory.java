package io.fairspace.saturn.webdav.milton;

import io.fairspace.saturn.webdav.vfs.resources.VfsCollectionResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResourceFactory;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Getter
public class VfsBackedMiltonResourceFactory implements ResourceFactory {
    public static final String PATH_SEPARATOR = "/";
    private final String contextPath;
    private final VfsResourceFactory resourceFactory;

    public VfsBackedMiltonResourceFactory(String contextPath, VfsResourceFactory resourceFactory) {
        this.resourceFactory = resourceFactory;

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

        // The implementation should be insensitive to trailing slashes
        // (see JavaDoc for {@see ResourceFactory} interface)
        // As there may be multiple trailing slashes, the check is being repeated
        while(webdavPath.endsWith(PATH_SEPARATOR)) {
            webdavPath = webdavPath.substring(0, webdavPath.length() - 1);
        }

        return toMiltonResource(resourceFactory.getResource(webdavPath));
    }

    /**
     * Generates a new Milton {@Resource} object for the given Vfs resource
     * @param vfsResource
     * @return
     */
    public static Resource toMiltonResource(VfsResource vfsResource) {
        if(vfsResource == null) {
            return null;
        }

        if(vfsResource instanceof VfsCollectionResource) {
            return new VfsBackedMiltonDirectoryResource((VfsCollectionResource) vfsResource);
        } else if(vfsResource instanceof VfsFileResource) {
            return new VfsBackedMiltonFileResource((VfsFileResource) vfsResource);
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
                return PATH_SEPARATOR;
            } else if(path.startsWith(contextPath)) {
                return path.replaceFirst(contextPath, "");
            } else {
                return null;
            }
        }

        return path;
    }

}
