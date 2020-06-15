package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.permissions.Access;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Auth;
import io.milton.http.FileItem;
import io.milton.http.Range;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.exceptions.NotFoundException;
import io.milton.property.PropertySource;
import io.milton.resource.ReplaceableResource;
import lombok.SneakyThrows;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;

import javax.xml.namespace.QName;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Date;
import java.util.List;
import java.util.Map;

import static io.fairspace.saturn.webdav.WebDAVServlet.fileVersion;
import static io.fairspace.saturn.rdf.ModelUtils.getListProperty;
import static java.lang.Integer.parseInt;

class FileResource extends BaseResource implements io.milton.resource.FileResource, ReplaceableResource {
    private final int version;
    private final String blobId;
    private final long contentLength;
    private final String contentType;
    private final Date modifiedDate;

    @SneakyThrows
    FileResource(DavFactory factory, Resource subject, Access access) {
        super(factory, subject, access);

        var versions = getListProperty(subject, FS.versions);

        var ver = fileVersion();

        if (ver == null) {
            version = versions.size();
        } else {
            version = ver;
        }

        if (version < 1 || version > versions.size()) {
            throw new BadRequestException("Invalid file version");
        }

        var current = versions.get(subject.getProperty(FS.currentVersion).getInt() - version).asResource();

        blobId = current.getRequiredProperty(FS.blobId).getString();
        contentLength = current.getRequiredProperty(FS.fileSize).getLong();
        contentType = current.listProperties(FS.contentType).nextOptional().map(Statement::getString).orElse(null);
        modifiedDate = parseDate(current, FS.dateModified);
    }

    @Override
    public String processForm(Map<String, String> parameters, Map<String, FileItem> files) throws BadRequestException, NotAuthorizedException, ConflictException {
        throw new BadRequestException(this, "Unsupported");
    }

    @Override
    public void sendContent(OutputStream out, Range range, Map<String, String> params, String contentType) throws IOException, NotAuthorizedException, BadRequestException, NotFoundException {
        factory.store.read(blobId, out, range != null ? range.getStart() : 0, range != null ? range.getFinish() : null);
    }

    @Override
    public Long getMaxAgeSeconds(Auth auth) {
        return null;
    }

    @Override
    public String getContentType(String accepts) {
        return contentType;
    }

    @Override
    public Long getContentLength() {
        return contentLength;
    }

    @Override
    public void replaceContent(InputStream in, Long length) throws BadRequestException, ConflictException, NotAuthorizedException {
        var versions = getListProperty(subject, FS.versions).cons(newVersion());
        var current = subject.getRequiredProperty(FS.currentVersion).getInt() + 1;

        subject.removeAll(FS.versions)
                .removeAll(FS.currentVersion)
                .addProperty(FS.versions, versions)
                .addLiteral(FS.currentVersion, current);
    }

    @Override
    public Date getModifiedDate() {
        return modifiedDate;
    }

    @Override
    public List<QName> getAllPropertyNames() {
        return List.of(IRI_PROPERTY, IS_READONLY_PROPERTY, DATE_DELETED_PROPERTY, VERSION_PROPERTY);
    }

    @Override
    public PropertySource.PropertyMetaData getPropertyMetaData(QName name) {
        if (name.equals(VERSION_PROPERTY)) {
            return VERSION_PROPERTY_META;
        }
        return super.getPropertyMetaData(name);
    }

    @Override
    public Object getProperty(QName name) {
        if (name.equals(VERSION_PROPERTY)) {
            return version;
        }
        return super.getProperty(name);
    }

    @Override
    public void setProperty(QName name, Object value) throws PropertySource.PropertySetException, NotAuthorizedException {
        if (name.equals(VERSION_PROPERTY)) {
            var version = parseInt(value.toString());

            var versions = getListProperty(subject, FS.versions);
            var ver = versions.get(subject.getProperty(FS.currentVersion).getInt() - version).asResource();
            var newVer = subject.getModel()
                    .createResource();

            copyProperties(ver, newVer, RDF.type, FS.blobId, FS.fileSize, FS.md5);
            newVer.addProperty(FS.modifiedBy, getUser())
                    .addLiteral(FS.dateModified, now());

            versions = versions.cons(newVer);
            var current = subject.getRequiredProperty(FS.currentVersion).getInt() + 1;
            subject.removeAll(FS.versions)
                    .removeAll(FS.currentVersion)
                    .addProperty(FS.versions, versions)
                    .addLiteral(FS.currentVersion, current);
        } else {
            super.setProperty(name, value);
        }
    }
}
