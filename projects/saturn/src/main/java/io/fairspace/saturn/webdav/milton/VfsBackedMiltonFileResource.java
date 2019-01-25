package io.fairspace.saturn.webdav.milton;

import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.milton.common.ContentTypeUtils;
import io.milton.http.Auth;
import io.milton.http.Range;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.exceptions.NotFoundException;
import io.milton.resource.CollectionResource;
import io.milton.resource.GetableResource;
import io.milton.resource.ReplaceableResource;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

public class VfsBackedMiltonFileResource extends VfsBackedMiltonResource implements GetableResource, ReplaceableResource {
    private VfsFileResource vfsResource;

    public VfsBackedMiltonFileResource(VfsFileResource resource, VfsBackedMiltonResourceFactory factory) {
        super(resource, factory);
        this.vfsResource = resource;
    }

    @Override
    public void sendContent(OutputStream out, Range range, Map<String, String> params, String contentType) throws IOException, NotAuthorizedException, BadRequestException, NotFoundException {
        // TODO: Handle additional parameters
        factory.getContentFactory().getContent(vfsResource.getContentLocation(), out);
    }

    @Override
    public void replaceContent(InputStream inputStream, Long length) throws BadRequestException, ConflictException, NotAuthorizedException {
        try {
            this.vfsResource = factory.storeFile(vfsResource, inputStream);
        } catch (IOException e) {
            // TODO: How to handle error
        }
    }

    @Override
    public Long getMaxAgeSeconds(Auth auth) {
        return null;
    }

    @Override
    public String getContentType(String accepts) {
        return ContentTypeUtils.findAcceptableContentType(vfsResource.getMimeType(), accepts);
    }

    @Override
    public Long getContentLength() {
        return vfsResource.getFileSize();
    }

    @Override
    public void copyTo(CollectionResource toCollection, String name) throws NotAuthorizedException, BadRequestException, ConflictException {
        // TODO: Implement
    }

    @Override
    public void delete() throws NotAuthorizedException, ConflictException, BadRequestException {
        // TODO: Implement
    }

    @Override
    public void moveTo(CollectionResource rDest, String name) throws ConflictException, NotAuthorizedException, BadRequestException {
        // TODO: Implement
    }
}
