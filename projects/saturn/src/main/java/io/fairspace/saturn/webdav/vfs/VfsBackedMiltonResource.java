package io.fairspace.saturn.webdav.vfs;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.PathUtils;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.Auth;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.*;

import java.io.IOException;
import java.util.Date;

public abstract class VfsBackedMiltonResource  implements Resource, PropFindableResource, DeletableResource, CopyableResource, MoveableResource {
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
        try {
            fs.delete(info.getPath());
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
        return PathUtils.name(info.getPath());
    }

    @Override
    public Object authenticate(String user, String password) {
        return null;
    }

    @Override
    public boolean authorise(Request request, Request.Method method, Auth auth) {
        return true;
    }

    @Override
    public String getRealm() {
        return null;
    }

    @Override
    public Date getModifiedDate() {
        return null;
    }

    @Override
    public String checkRedirect(Request request) throws NotAuthorizedException, BadRequestException {
        return null;
    }
}
