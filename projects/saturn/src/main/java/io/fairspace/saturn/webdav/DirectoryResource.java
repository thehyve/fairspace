package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Auth;
import io.milton.http.Range;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.exceptions.NotFoundException;
import io.milton.resource.DeletableCollectionResource;
import io.milton.resource.FolderResource;
import io.milton.resource.Resource;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import javax.xml.namespace.QName;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;

import static io.fairspace.saturn.webdav.DavFactory.childSubject;

class DirectoryResource extends BaseResource implements FolderResource, DeletableCollectionResource {
    private static final List<QName> DIRECTORY_PROPERTIES = List.of(IRI_PROPERTY, IS_READONLY_PROPERTY, DATE_DELETED_PROPERTY);

    public DirectoryResource(DavFactory factory, org.apache.jena.rdf.model.Resource subject, Access access) {
        super(factory, subject, access);
    }

    @Override
    public Date getModifiedDate() {
        return null;
    }

    @Override
    public io.milton.resource.CollectionResource createCollection(String newName) throws NotAuthorizedException, ConflictException, BadRequestException {
        var subj = createResource(newName).addProperty(RDF.type, FS.Directory);

        return (io.milton.resource.CollectionResource) factory.getResource(subj, access);
    }

    @Override
    public Resource createNew(String newName, InputStream inputStream, Long length, String contentType) throws IOException, ConflictException, NotAuthorizedException, BadRequestException {
        var subj = createResource(newName)
                .addProperty(RDF.type, FS.File)
                .addLiteral(FS.currentVersion, 1)
                .addProperty(FS.versions, subject.getModel().createList(newVersion()));

        if (contentType != null) {
            subj.addProperty(FS.contentType, contentType);
        }

        return factory.getResource(subj, access);
    }

    private org.apache.jena.rdf.model.Resource createResource(String newName) throws ConflictException, NotAuthorizedException, BadRequestException {
        var existing = child(newName);
        if (existing != null) {
            throw new ConflictException(existing);
        }

        var subj = childSubject(subject, newName);
        subj.getModel().removeAll(subj, null, null).removeAll(null, null, subj);
        var t = WebDAVServlet.timestampLiteral();

        subj.addProperty(RDFS.label, newName)
                .addProperty(FS.createdBy, factory.currentUserResource())
                .addProperty(FS.dateCreated, t);

        subject.addProperty(FS.contains, subj);
        return subj;
    }

    @Override
    public Resource child(String childName) throws NotAuthorizedException, BadRequestException {
        return factory.getResource(childSubject(subject, childName), access);
    }

    @Override
    public List<? extends Resource> getChildren() throws NotAuthorizedException, BadRequestException {
        return subject.listProperties(FS.contains)
                .mapWith(Statement::getResource)
                .mapWith(r -> factory.getResource(r, access))
                .filterDrop(Objects::isNull)
                .toList();
    }

    @Override
    public void delete(boolean purge) throws NotAuthorizedException, ConflictException, BadRequestException {
        for (var child : getChildren()) {
            ((BaseResource) child).delete(purge);
        }
        super.delete(purge);
    }

    @Override
    public void sendContent(OutputStream out, Range range, Map<String, String> params, String contentType) throws IOException, NotAuthorizedException, BadRequestException, NotFoundException {
//        var w = new XmlWriter(out);
//        w.open("html");
//        w.open("head");
//        w.close("head");
//        w.open("body");
//        w.begin("h1").open().writeText(this.getName()).close();
//        w.open("table");
//        for (var r : getChildren()) {
//            w.open("tr");
//            w.open("td");
//            w.begin("a").writeAtt("href", r.getName() + (r instanceof FolderResource ? "/" : "")).open().writeText(r.getName()).close();
//            w.close("td");
//            w.begin("td").open().writeText(r.getModifiedDate() + "").close();
//            w.begin("td").open().writeText((r instanceof FileResource) ? ((FileResource) r).getContentLength() + " bytes" : "DIR").close();
//            w.close("tr");
//        }
//        w.close("table");
//        w.close("body");
//        w.close("html");
//        w.flush();
    }

    @Override
    public Long getMaxAgeSeconds(Auth auth) {
        return null;
    }

    @Override
    public String getContentType(String accepts) {
        return "text/html";
    }

    @Override
    public Long getContentLength() {
        return null;
    }

    @Override
    public List<QName> getAllPropertyNames() {
        return DIRECTORY_PROPERTIES;
    }

    @Override
    public boolean isLockedOutRecursive(Request request) {
        return false;
    }
}
