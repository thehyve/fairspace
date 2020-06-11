package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.InvalidFilenameException;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Auth;
import io.milton.http.ConditionalCompatibleResource;
import io.milton.http.Request;
import io.milton.http.Response;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.webdav.WebDavProtocol;
import io.milton.property.PropertySource;
import io.milton.property.PropertySource.PropertyMetaData;
import io.milton.resource.*;
import lombok.extern.slf4j.Slf4j;

import javax.xml.namespace.QName;
import java.io.IOException;
import java.nio.file.AccessDeniedException;
import java.nio.file.FileSystemException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import static io.fairspace.saturn.vfs.PathUtils.name;
import static io.fairspace.saturn.vfs.PathUtils.normalizePath;
import static io.milton.property.PropertySource.PropertyAccessibility.READ_ONLY;
import static io.milton.property.PropertySource.PropertyAccessibility.WRITABLE;

@Slf4j
public abstract class VfsBackedMiltonResource implements
        Resource, PropFindableResource, DeletableResource, CopyableResource, MoveableResource, MultiNamespaceCustomPropertyResource, ConditionalCompatibleResource {
    private static final QName IRI_PROPERTY = new QName(FS.NS, "iri");
    private static final PropertyMetaData IRI_PROPERTY_META = new PropertyMetaData(READ_ONLY, String.class);
    private static final QName ISREADONLY_PROPERTY = new QName(WebDavProtocol.DAV_URI, "isreadonly");
    private static final PropertyMetaData ISREADONLY_PROPERTY_META = new PropertyMetaData(READ_ONLY, Boolean.class);
    private static final QName DATE_DELETED_PROPERTY = new QName(FS.NS, "dateDeleted");
    private static final PropertyMetaData DATE_DELETED_PROPERTY_META = new PropertyMetaData(WRITABLE, Date.class);
    private static final QName VERSION_PROPERTY = new QName(FS.NS, "version");
    private static final PropertyMetaData VERSION_PROPERTY_META = new PropertyMetaData(WRITABLE, Integer.class);

    private static final List<QName> DEFAULT_PROPERTIES = List.of(IRI_PROPERTY, ISREADONLY_PROPERTY, DATE_DELETED_PROPERTY, VERSION_PROPERTY);

    protected final VirtualFileSystem fs;
    protected final FileInfo info;
    protected final MiltonMapPropertySource propertySource;

    VfsBackedMiltonResource(VirtualFileSystem fs, FileInfo info) {
        this(fs, info, new MiltonMapPropertySource<>(info.getCustomProperties()));
    }

    VfsBackedMiltonResource(VirtualFileSystem fs, FileInfo info, MiltonMapPropertySource propertySource) {
        this.fs = fs;
        this.info = info;
        this.propertySource = propertySource;
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
        ensureIsWriteable();
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
            try {
                return fs.iri(info.getPath());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        if (name.equals(ISREADONLY_PROPERTY)) return info.isReadOnly();
        if (name.equals(DATE_DELETED_PROPERTY)) return info.getDeleted();
        if (name.equals(VERSION_PROPERTY)) return info.getVersion();

        return propertySource.getProperty(name);
    }

    @Override
    public void setProperty(QName name, Object value) throws PropertySource.PropertySetException, NotAuthorizedException {
        if (name.equals(DATE_DELETED_PROPERTY)) {
            if (value == null) {
                try {
                    fs.undelete(info.getPath());
                } catch (IOException e) {
                    throw new PropertySource.PropertySetException(Response.Status.SC_PRECONDITION_FAILED, "Error undeleting");
                }
            } else {
                throw new PropertySource.PropertySetException(Response.Status.SC_BAD_REQUEST, "Cannot modify \"dateDeleted\" property");
            }
        } else if (name.equals(VERSION_PROPERTY)) {
            try {
                fs.revert(info.getPath(), (Integer) value);
            } catch (IOException e) {
                throw new PropertySource.PropertySetException(Response.Status.SC_PRECONDITION_FAILED, "Error reverting");
            }
        }
    }

    @Override
    public PropertySource.PropertyMetaData getPropertyMetaData(QName name) {
        if (name.equals(IRI_PROPERTY)) return IRI_PROPERTY_META;
        if (name.equals(ISREADONLY_PROPERTY)) return ISREADONLY_PROPERTY_META;
        if (name.equals(DATE_DELETED_PROPERTY)) return DATE_DELETED_PROPERTY_META;
        if (name.equals(VERSION_PROPERTY)) return VERSION_PROPERTY_META;

        return propertySource.getPropertyMeta(name);
    }

    @Override
    public List<QName> getAllPropertyNames() {
        ArrayList<QName> qNames = new ArrayList<>(DEFAULT_PROPERTIES);
        qNames.addAll(propertySource.getPropertyNames());
        return qNames;
    }

    void onException(Exception e) throws NotAuthorizedException, BadRequestException, ConflictException {
        String errorMessage = "A WebDAV operation resulted in an error: {}";

        if (e instanceof AccessDeniedException) {
            log.info(errorMessage, e.getMessage());
            throw new NotAuthorizedException(this, e);
        }
        if (e instanceof InvalidFilenameException) {
            log.info(errorMessage, e.getMessage());
            throw new BadRequestException(this, e.getMessage());
        }
        if (e instanceof FileSystemException) {
            log.info(errorMessage, e.getMessage());
            throw new ConflictException(this, e.getMessage());
        }
        if (e instanceof RuntimeException) {
            log.error(errorMessage, e);
            throw (RuntimeException) e;
        }

        log.error(errorMessage, e);
        throw new RuntimeException(e);
    }

    void ensureIsWriteable() throws NotAuthorizedException {
        if (info.isReadOnly()) {
            throw new NotAuthorizedException(this);
        }
    }

    @Override
    public boolean isCompatible(Request.Method method) {
        if (method.isWrite && info.isReadOnly()) {
            return false;
        }

        if (info.getDeleted() != null) {
            return !method.isWrite || (method == Request.Method.DELETE || method == Request.Method.PROPPATCH);
        }

        return true;
    }
}
