package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.Auth;
import io.milton.http.Range;
import io.milton.http.Request;
import io.milton.http.XmlWriter;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.exceptions.NotFoundException;
import io.milton.resource.CollectionResource;
import io.milton.resource.DeletableCollectionResource;
import io.milton.resource.FolderResource;
import io.milton.resource.Resource;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;
import java.util.Map;

import static io.fairspace.saturn.vfs.PathUtils.normalizePath;
import static io.fairspace.saturn.webdav.VfsBackedMiltonResourceFactory.getResource;
import static java.util.stream.Collectors.toList;
import static org.apache.http.entity.ContentType.TEXT_HTML;

public class VfsBackedMiltonDirectoryResource extends VfsBackedMiltonResource implements FolderResource, DeletableCollectionResource {
    VfsBackedMiltonDirectoryResource(VirtualFileSystem fs, FileInfo info) {
        super(fs, info);
    }

    // Currently we don't support etags for directories
    @Override
    public String getUniqueId() {
        return null;
    }


    @Override
    public CollectionResource createCollection(String newName) throws NotAuthorizedException, ConflictException, BadRequestException {
        ensureIsWriteable();
        var newPath = normalizePath(info.getPath() + "/" + newName);
        try {
            return (CollectionResource) getResource(fs, fs.mkdir(newPath));
        } catch (IOException e) {
            onException(e);
            return null;
        }
    }

    @Override
    public Resource createNew(String newName, InputStream inputStream, Long length, String contentType) throws IOException, ConflictException, NotAuthorizedException, BadRequestException {
        ensureIsWriteable();
        var newPath = normalizePath(info.getPath() + "/" + newName);
        return getResource(fs, fs.create(newPath, inputStream));
    }

    @Override
    public Resource child(String childName) throws NotAuthorizedException, BadRequestException {
        return getResource(fs, info.getPath() + "/" + childName);
    }

    @Override
    public List<? extends Resource> getChildren() throws NotAuthorizedException, BadRequestException {
        try {
            return fs.list(info.getPath()).stream()
                    .sorted()
                    .map(f -> f.isDirectory() ? new VfsBackedMiltonDirectoryResource(fs, f) : new VfsBackedMiltonFileResource(fs, f))
                    .collect(toList());
        } catch (IOException e) {
            try {
                onException(e);
            } catch (ConflictException ce) {
                throw new RuntimeException(ce);
            }
            return null;
        }
    }

    @Override
    public void sendContent(OutputStream out, Range range, Map<String, String> params, String contentType) throws IOException, NotAuthorizedException, BadRequestException, NotFoundException {
        var w = new XmlWriter(out);
        w.open("html");
        w.open("head");
        w.close("head");
        w.open("body");
        w.begin("h1").open().writeText(this.getName()).close();
        w.open("table");
        for (var r : getChildren()) {
            w.open("tr");
            w.open("td");;
            w.begin("a").writeAtt("href", link(r)).open().writeText(r.getName()).close();
            w.close("td");
            w.begin("td").open().writeText(r.getModifiedDate() + "").close();
            w.close("tr");
        }
        w.close("table");
        w.close("body");
        w.close("html");
        w.flush();
    }

    private static String link(Resource r) {
        return r.getName() + (r instanceof FolderResource ? "/" : "");
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

    @Override
    public boolean isLockedOutRecursive(Request request) {
        return false;
    }
}
