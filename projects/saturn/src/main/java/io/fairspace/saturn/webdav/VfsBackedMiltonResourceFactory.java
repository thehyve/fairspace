package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.ResourceFactory;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.Resource;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.stream.Stream;

import static io.fairspace.saturn.vfs.PathUtils.splitPath;
import static io.fairspace.saturn.webdav.WebDAVServlet.versionHeader;
import static java.util.stream.Collectors.joining;
import static org.eclipse.jetty.server.HttpConnection.getCurrentConnection;

public class VfsBackedMiltonResourceFactory implements ResourceFactory {
    private final VirtualFileSystem fs;

    VfsBackedMiltonResourceFactory(VirtualFileSystem fs) {
        this.fs = fs;
    }

    @Override
    public Resource getResource(String host, String path) throws NotAuthorizedException, BadRequestException {
        // /api/v1/webdav/relPath -> relPath
        var relPath = Stream.of(splitPath(path))
                .skip(3)
                .collect(joining("/"));
        return getResource(fs, relPath);
    }

    static Resource getResource(VirtualFileSystem fs, String path) {
        try {
            var info = fs.stat(path, versionHeader());
            return getResource(fs, info);
        } catch (FileNotFoundException e) {
            return null;
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    static Resource getResource(VirtualFileSystem fs, FileInfo info) {
        if (info == null) {
            return null;
        }
        if (info.isDirectory()) {
            return new VfsBackedMiltonDirectoryResource(fs, info);
        } else {
            return new VfsBackedMiltonFileResource(fs, info);
        }
    }

    static boolean showDeleted() {
        return "on".equals(getCurrentConnection().getHttpChannel().getRequest().getHeader("Show-Deleted"));
    }
}
