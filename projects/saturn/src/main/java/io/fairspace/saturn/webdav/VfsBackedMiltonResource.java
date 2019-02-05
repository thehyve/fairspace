package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.Auth;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.*;

import java.io.IOException;
import java.util.Date;

import static io.fairspace.saturn.vfs.PathUtils.*;

public abstract class VfsBackedMiltonResource  implements Resource, PropFindableResource, DeletableResource, CopyableResource, MoveableResource, Comparable<Resource> {
    protected final VirtualFileSystem fs;
    protected final FileInfo info;

    protected VfsBackedMiltonResource(VirtualFileSystem fs, FileInfo info) {
        this.fs = fs;
        this.info = info;
    }

    @Override
    public String toString() {
        return info.getPath();
    }

    @Override
    public void copyTo(CollectionResource toCollection, String name) throws NotAuthorizedException, BadRequestException, ConflictException {
        checkTarget(toCollection);
        try {
            fs.copy(info.getPath(), normalizePath(toCollection + "/" + name));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void delete() throws NotAuthorizedException, ConflictException, BadRequestException {
        try {
            fs.delete(info.getPath());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void moveTo(CollectionResource rDest, String name) throws ConflictException, NotAuthorizedException, BadRequestException {
        checkTarget(rDest);
        try {
            fs.move(info.getPath(), normalizePath(rDest + "/" + name));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Date getCreateDate() {
        return new Date(info.getCreated());
    }

    @Override
    public String getUniqueId() {
        return info.getPath();
    }

    @Override
    public String getName() {
        return name(info.getPath());
    }

    @Override
    public Object authenticate(String user, String password) {
        return null;
    }

    @Override
    public boolean authorise(Request request, Request.Method method, Auth auth) {
        return method.isWrite ? info.isWriteable() : info.isReadable();
    }

    @Override
    public String getRealm() {
        return null;
    }

    @Override
    public Date getModifiedDate() {
        return new Date(info.getModified());
    }

    @Override
    public String checkRedirect(Request request) throws NotAuthorizedException, BadRequestException {
        return null;
    }

    @Override
    public int compareTo(Resource resource) {
        return getName().compareTo(resource.getName());
    }

    private static void checkTarget(CollectionResource c) throws BadRequestException {
        if (!(c instanceof VfsBackedMiltonDirectoryResource)) {
            throw new BadRequestException("Unsupported target resource type");
        }
    }
}
