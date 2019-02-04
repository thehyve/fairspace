package io.fairspace.saturn.webdav.vfs;

import io.fairspace.saturn.vfs.PathUtils;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;

import java.io.FileNotFoundException;
import java.io.IOException;

public class VfsBackedMiltonResourceFactory implements ResourceFactory {
    private final VirtualFileSystem fs;

    public VfsBackedMiltonResourceFactory(VirtualFileSystem fs) {
        this.fs = fs;
    }

    @Override
    public Resource getResource(String host, String path) throws NotAuthorizedException, BadRequestException {
        try {
            var info = fs.stat(PathUtils.normalizePath(path.substring("/webdav".length())));
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
