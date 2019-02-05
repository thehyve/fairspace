package io.fairspace.saturn.webdav;

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
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;

import static io.fairspace.saturn.vfs.PathUtils.normalizePath;
import static io.fairspace.saturn.webdav.VfsBackedMiltonResourceFactory.getResource;
import static java.util.stream.Collectors.toList;
import static org.apache.http.entity.ContentType.TEXT_HTML;

public class VfsBackedMiltonDirectoryResource extends VfsBackedMiltonResource implements FolderResource {
    public VfsBackedMiltonDirectoryResource(VirtualFileSystem fs, FileInfo info) {
        super(fs, info);
    }


    @Override
    public CollectionResource createCollection(String newName) throws NotAuthorizedException, ConflictException, BadRequestException {
        var newPath = normalizePath(info.getPath() + "/" + newName);
        try {
            fs.mkdir(newPath);
            return (CollectionResource) getResource(fs, newPath);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public Resource createNew(String newName, InputStream inputStream, Long length, String contentType) throws IOException, ConflictException, NotAuthorizedException, BadRequestException {
        var newPath = normalizePath(info.getPath() + "/" + newName);
        fs.create(newPath, inputStream);
        return getResource(fs, newPath);
    }

    @Override
    public Resource child(String childName) throws NotAuthorizedException, BadRequestException {
        return getResource(fs, info.getPath() + "/" + childName);
    }

    @Override
    public List<? extends Resource> getChildren() throws NotAuthorizedException, BadRequestException {
        try {
            return fs.list(info.getPath()).stream()
                    .map(f -> f.isDirectory() ? new VfsBackedMiltonDirectoryResource(fs, f) : new VfsBackedMiltonFileResource(fs, f))
                    .sorted()
                    .collect(toList());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public void sendContent(OutputStream out, Range range, Map<String, String> params, String contentType) throws IOException, NotAuthorizedException, BadRequestException, NotFoundException {
        String relativePath = info.getPath();
        try(var writer = new PrintWriter(out)) {

            writer.println(String.format("<html><head><title>Folder listing for %s</title></head>", relativePath));
            writer.println("<body>");
            writer.println(String.format("<h1>Folder listing for %s</h1>", relativePath));
            writer.println("<ul>");

            for (var child : fs.list(info.getPath())) {
                // TODO: Determine correct URI to link to
                writer.println(String.format("<li><a href=\"/webdav/%s\">%s</a></li>", child.getPath(), PathUtils.name(child.getPath())));
            }
            writer.println("</ul></body></html>");

            writer.flush();
        }
    }

    @Override
    public Long getMaxAgeSeconds(Auth auth) {
        return null;
    }

    @Override
    public String getContentType(String accepts) {
        return TEXT_HTML.getMimeType();
    }

    @Override
    public Long getContentLength() {
        return null;
    }
}
