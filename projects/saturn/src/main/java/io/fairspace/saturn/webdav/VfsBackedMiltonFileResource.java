package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.Auth;
import io.milton.http.Range;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.exceptions.NotFoundException;
import io.milton.resource.GetableResource;
import io.milton.resource.ReplaceableResource;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

import static io.milton.common.ContentTypeUtils.findAcceptableContentType;
import static io.milton.common.ContentTypeUtils.findContentTypes;

public class VfsBackedMiltonFileResource extends VfsBackedMiltonResource implements GetableResource, ReplaceableResource {
        VfsBackedMiltonFileResource(VirtualFileSystem fs, FileInfo info) {
        super(fs, info);
    }

    @Override
    public String getUniqueId() {
        return info.getPath();
    }

    @Override
    public void sendContent(OutputStream out, Range range, Map<String, String> params, String contentType) throws IOException, NotAuthorizedException, BadRequestException, NotFoundException {
        if (range != null) {
            fs.read(info.getPath(), out, range.getStart(), range.getFinish());
        } else {
            fs.read(info.getPath(), out, 0, null);
        }

    }

    @Override
    public Long getMaxAgeSeconds(Auth auth) {
        return null;
    }

    @Override
    public String getContentType(String accepts) {
        return findAcceptableContentType(findContentTypes(getName()), accepts);
    }

    @Override
    public Long getContentLength() {
        return info.getSize();
    }

    @Override
    public void replaceContent(InputStream in, Long length) throws BadRequestException, ConflictException, NotAuthorizedException {
        ensureIsWriteable();
        try {
            fs.modify(info.getPath(), in);
        } catch (IOException e) {
            onException(e);
        }
    }
}
