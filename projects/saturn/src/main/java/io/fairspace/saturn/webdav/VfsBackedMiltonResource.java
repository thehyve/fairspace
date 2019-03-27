package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.milton.http.Auth;
import io.milton.http.HttpManager;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.property.PropertySource;
import io.milton.property.PropertySource.PropertyAccessibility;
import io.milton.property.PropertySource.PropertyMetaData;
import io.milton.resource.*;
import lombok.extern.slf4j.Slf4j;

import javax.xml.namespace.QName;
import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.nio.file.FileSystemException;
import java.util.Date;
import java.util.List;

import static io.fairspace.saturn.vfs.PathUtils.*;
import static io.milton.common.Utils.getDecodedDestination;
import static java.util.Collections.singletonList;

@Slf4j
public abstract class VfsBackedMiltonResource implements
        Resource, PropFindableResource, DeletableResource, CopyableResource, MoveableResource, MultiNamespaceCustomPropertyResource, Comparable<Resource> {
    private static final QName IRI_PROPERTY = new QName("http://fairspace.io/ontology#", "iri");
    private static final PropertyMetaData IRI_PROPERTY_META = new PropertyMetaData(PropertyAccessibility.READ_ONLY, String.class);

    protected final VirtualFileSystem fs;
    protected final FileInfo info;

    VfsBackedMiltonResource(VirtualFileSystem fs, FileInfo info) {
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
            onException(e);
        }
    }

    @Override
    public void delete() throws NotAuthorizedException, ConflictException, BadRequestException {
        ensureIsWriteable();
        try {
            fs.delete(info.getPath());
        } catch (IOException e) {
            onException(e);
        }
    }

    @Override
    public void moveTo(CollectionResource rDest, String name) throws ConflictException, NotAuthorizedException, BadRequestException {
        checkTarget(rDest);
        try {
            fs.move(info.getPath(), normalizePath(rDest + "/" + name));
        } catch (IOException e) {
            onException(e);
        }
    }

    @Override
    public Date getCreateDate() {
        return Date.from(info.getCreated());
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
        // This method is called twice for COPY and MOVE operations, for each side of an operation.
        // Unfortunately, there's no simple and reliable way to understand on which side you currently are.
        // That would require comparison of the request's URL with the resource's path, taking the path prefix into account, etc.
        // Luckily, methods like copyTo can throw NotAuthorizedException, making it possible to implement the necessary checks in those methods.
        // See ensureIsWriteable and its usages.
        return true;
    }

    @Override
    public String getRealm() {
        return null;
    }

    @Override
    public Date getModifiedDate() {
        return Date.from(info.getModified());
    }

    @Override
    public String checkRedirect(Request request) throws NotAuthorizedException, BadRequestException {
        return null;
    }

    @Override
    public int compareTo(Resource resource) {
        return getName().compareTo(resource.getName());
    }

    private static void checkTarget(CollectionResource c) throws BadRequestException, NotAuthorizedException {
        if (c instanceof VfsBackedMiltonDirectoryResource) {
            ((VfsBackedMiltonDirectoryResource) c).ensureIsWriteable();
        } else {
            throw new BadRequestException("Unsupported target resource type");
        }
    }

    @Override
    public Object getProperty(QName name) {
        if (name.equals(IRI_PROPERTY)) {
            return info.getIri();
        }
        return null;
    }

    @Override
    public void setProperty(QName name, Object value) throws PropertySource.PropertySetException, NotAuthorizedException {

    }

    @Override
    public PropertySource.PropertyMetaData getPropertyMetaData(QName name) {
        if (name.equals(IRI_PROPERTY)) {
            return IRI_PROPERTY_META;
        }
        return null;
    }

    @Override
    public List<QName> getAllPropertyNames() {
        return singletonList(IRI_PROPERTY);
    }

    void onException(Exception e) throws NotAuthorizedException, BadRequestException, ConflictException {
        log.error("A WebDAV operation resulted in an error", e);
        if (e instanceof AccessDeniedException) {
            throw new NotAuthorizedException(this, e);
        }
        if (e instanceof FileSystemException) {
            throw new ConflictException(this, e.getMessage());
        }
        if (e instanceof RuntimeException) {
            throw (RuntimeException) e;
        }
        throw new RuntimeException(e);
    }

    void ensureIsWriteable() throws NotAuthorizedException {
        if (info.isReadOnly()) {
            throw new NotAuthorizedException(this);
        }
    }
}
