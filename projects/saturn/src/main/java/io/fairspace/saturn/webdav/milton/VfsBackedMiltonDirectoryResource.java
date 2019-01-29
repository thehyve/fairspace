package io.fairspace.saturn.webdav.milton;

import io.fairspace.saturn.webdav.vfs.resources.VfsCollectionResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsDirectoryResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsFileResource;
import io.fairspace.saturn.webdav.vfs.resources.VfsResource;
import io.milton.common.ContentTypeUtils;
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
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class VfsBackedMiltonDirectoryResource extends VfsBackedMiltonResource implements FolderResource {
    public static final String HTML_CONTENT_TYPE = "text/html";
    public static final String DIRECTORY_SEPARATOR = "/";
    private VfsCollectionResource vfsResource;

    public VfsBackedMiltonDirectoryResource(VfsCollectionResource resource) {
        super(resource);
        this.vfsResource = resource;
    }

    @Override
    public CollectionResource createCollection(String newName) {
        return new VfsBackedMiltonDirectoryResource(vfsResource.createCollection(newName));
    }

    @Override
    public Resource child(String childName) throws NotAuthorizedException, BadRequestException {
        return VfsBackedMiltonResourceFactory.toMiltonResource(vfsResource.getChild(childName));
    }

    @Override
    public List<? extends Resource> getChildren() {
        return vfsResource.getChildren().stream()
                .map(resource -> VfsBackedMiltonResourceFactory.toMiltonResource(resource))
                .collect(Collectors.toList());
    }

    @Override
    public void sendContent(OutputStream out, Range range, Map<String, String> params, String contentType) throws IOException, NotAuthorizedException, BadRequestException, NotFoundException {
        String relativePath = vfsResource.getPath();
        PrintWriter writer = new PrintWriter(out);

        writer.println(String.format("<html><head><title>Folder listing for %s</title></head>", relativePath));
        writer.println("<body>");
        writer.println(String.format("<h1>Folder listing for %s</h1>", relativePath));
        writer.println("<ul>");

        for (VfsResource child: vfsResource.getChildren()) {
            // TODO: Determine correct URI to link to
            writer.println(String.format("<li><a href=\"%s\">%s</a></li>", vfsResource.getPath() + "/" + child.getName(), child.getName()));
        }
        writer.println("</ul></body></html>");

        writer.flush();
        writer.close();
    }

    @Override
    public Long getMaxAgeSeconds(Auth auth) {
        return null;
    }

    @Override
    public String getContentType(String accepts) {
        return ContentTypeUtils.findAcceptableContentType(HTML_CONTENT_TYPE, accepts);
    }

    @Override
    public Long getContentLength() {
        return null;
    }

    @Override
    public Resource createNew(String newName, InputStream inputStream, Long length, String contentType) throws IOException {
        // Store the file contents itself and add the resource to the directory tree
        VfsFileResource fileResource = vfsResource.createFile(newName, contentType, inputStream);

        // Return a reference to this resource
        return VfsBackedMiltonResourceFactory.toMiltonResource(fileResource);
    }

    @Override
    public void copyTo(CollectionResource toCollection, String name) throws NotAuthorizedException, BadRequestException, ConflictException {
        // TODO: implement
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
