package io.fairspace.saturn.webdav.vfs;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.PathUtils;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.Auth;
import io.milton.http.Range;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.exceptions.NotFoundException;
import io.milton.resource.CollectionResource;
import io.milton.resource.FolderResource;
import io.milton.resource.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;

import static io.fairspace.saturn.vfs.PathUtils.normalizePath;
import static java.util.stream.Collectors.toList;

public class VfsBackedMiltonDirectoryResource extends VfsBackedMiltonResource implements FolderResource {
    public VfsBackedMiltonDirectoryResource(VirtualFileSystem fs, FileInfo info) {
        super(fs, info);
    }


    @Override
    public CollectionResource createCollection(String newName) throws NotAuthorizedException, ConflictException, BadRequestException {
        var newPath = normalizePath(info.getPath() + "/" + newName);
        try {
            fs.mkdir(newPath);
            return new VfsBackedMiltonDirectoryResource(fs, fs.stat(newPath));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Resource createNew(String newName, InputStream inputStream, Long length, String contentType) throws IOException, ConflictException, NotAuthorizedException, BadRequestException {
        var newPath = normalizePath(info.getPath() + "/" + newName);
        fs.write(newPath, inputStream);
        return new VfsBackedMiltonDirectoryResource(fs, fs.stat(newPath));
    }

    @Override
    public Resource child(String childName) throws NotAuthorizedException, BadRequestException {
        return null;
    }

    @Override
    public List<? extends Resource> getChildren() throws NotAuthorizedException, BadRequestException {
        try {
            return fs.list(info.getPath()).stream()
                    .map(f -> f.isDirectory() ? new VfsBackedMiltonDirectoryResource(fs, f) : new VfsBackedMiltonFileResource(fs, f))
                    .collect(toList());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void sendContent(OutputStream out, Range range, Map<String, String> params, String contentType) throws IOException, NotAuthorizedException, BadRequestException, NotFoundException {

    }

    @Override
    public Long getMaxAgeSeconds(Auth auth) {
        return null;
    }

    @Override
    public String getContentType(String accepts) {
        return null;
    }

    @Override
    public Long getContentLength() {
        return null;
    }
}
