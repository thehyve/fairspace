package io.fairspace.saturn.webdav.milton;

import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.milton.http.Auth;
import io.milton.http.Request;
import io.milton.resource.CopyableResource;
import io.milton.resource.DeletableResource;
import io.milton.resource.MoveableResource;
import io.milton.resource.PropFindableResource;
import io.milton.resource.Resource;

import java.util.Date;

public abstract class VfsBackedMiltonResource implements Resource, PropFindableResource, DeletableResource, CopyableResource, MoveableResource {
    private static final String AUTHENTICATED = "authenticated";
    private static final String REALM = "WebDAV";

    protected VfsResource vfsResource;

    public VfsBackedMiltonResource(VfsResource resource) {
        this.vfsResource = resource;
    }

    @Override
    public String getUniqueId() {
        return vfsResource.getUniqueId();
    }

    @Override
    public String getName() {
        return vfsResource.getName();
    }

    @Override
    public Object authenticate(String user, String password) {
        // TODO: Handle authentication
        return AUTHENTICATED;
    }

    @Override
    public boolean authorise(Request request, Request.Method method, Auth auth) {
        // TODO: Implement authorization
        return true;
    }

    @Override
    public String getRealm() {
        return REALM;
    }

    @Override
    public Date getModifiedDate() {
        return vfsResource.getModifiedDate() != null ? Date.from(vfsResource.getModifiedDate()) : null;
    }

    @Override
    public String checkRedirect(Request request) {
        return null;
    }

    @Override
    public Date getCreateDate() {
        return vfsResource.getCreatedDate() != null ? Date.from(vfsResource.getCreatedDate()) : null;
    }
}
