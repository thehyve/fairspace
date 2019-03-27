package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;

import java.io.FileNotFoundException;
import java.io.IOException;

import static io.fairspace.saturn.vfs.PathUtils.normalizePath;

public class VfsBackedMiltonResourceFactory implements ResourceFactory {
    private final String pathPrefix;
    private final VirtualFileSystem fs;

    VfsBackedMiltonResourceFactory(String pathPrefix, VirtualFileSystem fs) {
        this.pathPrefix = pathPrefix;
        this.fs = fs;
    }

    @Override
    public Resource getResource(String host, String path) throws NotAuthorizedException, BadRequestException {
        if (normalizePath(path).equals(normalizePath(pathPrefix))) {
            return getResource(fs, "");
        }

        if (!path.startsWith(pathPrefix)) {
            throw new BadRequestException("Invalid resource path: " + path);
        }
        return getResource(fs, normalizePath(path.substring(pathPrefix.length())));
    }

    static Resource getResource(VirtualFileSystem fs, String path) {
        try {
            var info = fs.stat(path);
            if (info == null) {
                return null;
            }
            if (info.isDirectory()) {
                return new VfsBackedMiltonDirectoryResource(fs, info);
            } else {
                return new VfsBackedMiltonFileResource(fs, info);
            }
        } catch (FileNotFoundException e) {
            return null;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
