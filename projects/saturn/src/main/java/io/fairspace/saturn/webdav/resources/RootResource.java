package io.fairspace.saturn.webdav.resources;

import java.util.Date;
import java.util.List;

import io.milton.http.Auth;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.resource.CollectionResource;
import io.milton.resource.MakeCollectionableResource;
import io.milton.resource.PropFindableResource;
import io.milton.resource.Resource;

import io.fairspace.saturn.webdav.DavFactory;

import static io.fairspace.saturn.webdav.DavFactory.childSubject;

public abstract class RootResource implements CollectionResource, MakeCollectionableResource, PropFindableResource {

    final DavFactory factory;

    protected RootResource(DavFactory factory) {
        this.factory = factory;
    }

    @Override
    public Resource child(String childName) throws NotAuthorizedException {
        return factory.getResource(childSubject(this.factory.rootSubject, childName));
    }

    @Override
    public abstract List<? extends Resource> getChildren();

    public abstract void validateTargetCollectionName(String name) throws ConflictException, BadRequestException;

    @Override
    public String getUniqueId() {
        return factory.rootSubject.getURI();
    }

    @Override
    public String getName() {
        return "";
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
    public String checkRedirect(Request request) {
        return null;
    }

    @Override
    public Date getCreateDate() {
        return null;
    }
}
