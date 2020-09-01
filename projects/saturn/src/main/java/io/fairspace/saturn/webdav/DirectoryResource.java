package io.fairspace.saturn.webdav;

import io.fairspace.saturn.services.metadata.MetadataService;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.http.Auth;
import io.milton.http.FileItem;
import io.milton.http.Range;
import io.milton.http.Request;
import io.milton.http.exceptions.BadRequestException;
import io.milton.http.exceptions.ConflictException;
import io.milton.http.exceptions.NotAuthorizedException;
import io.milton.http.exceptions.NotFoundException;
import io.milton.resource.DeletableCollectionResource;
import io.milton.resource.FolderResource;
import io.milton.resource.Resource;
import org.apache.commons.csv.CSVFormat;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.rdf.model.RDFNode;
import org.apache.jena.rdf.model.Statement;
import org.apache.jena.shacl.vocabulary.SHACLM;
import org.apache.jena.vocabulary.RDF;
import org.apache.jena.vocabulary.RDFS;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.*;

import static io.fairspace.saturn.config.Services.METADATA_SERVICE;
import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.vocabulary.Vocabularies.VOCABULARY;
import static io.fairspace.saturn.webdav.DavFactory.childSubject;
import static io.fairspace.saturn.webdav.PathUtils.encodePath;
import static io.fairspace.saturn.webdav.PathUtils.normalizePath;
import static org.apache.commons.lang3.StringUtils.isNotBlank;
import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;

class DirectoryResource extends BaseResource implements FolderResource, DeletableCollectionResource {
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
    public List<? extends Resource> getChildren() {
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
    public boolean isLockedOutRecursive(Request request) {
        return false;
    }

    @Override
    protected void performAction(String action, Map<String, String> parameters, Map<String, FileItem> files) throws BadRequestException, NotAuthorizedException, ConflictException {
        switch (action) {
            case "metadata" -> uploadMetadata(files.values());
            default -> super.performAction(action, parameters, files);
        }

    }

    private void uploadMetadata(Collection<FileItem> files) throws BadRequestException {
        var model = createDefaultModel();

        for (var file : files) {
            prepareMetadata(file, model);
        }

        MetadataService metadataService = factory.context.get(METADATA_SERVICE);
        try {
            metadataService.put(model);
        } catch (Exception e) {
            throw new BadRequestException("Error applying metadata");
        }
    }

    private void prepareMetadata(FileItem file, Model model) throws BadRequestException {
        try (var csvParser = CSVFormat.DEFAULT.withFirstRecordAsHeader().parse(new InputStreamReader(file.getInputStream()))) {
            var headers = new HashSet<>(csvParser.getHeaderNames());
            for (var record : csvParser) {
                var path = record.get("Path");
                org.apache.jena.rdf.model.Resource s;
                if (path.equals(".")) {
                    s = subject;
                } else {
                    if (path.startsWith(".")) {
                        path = path.substring(1);
                    }
                    path = normalizePath(path);
                    s = this.subject.getModel().createResource(subject + "/" + encodePath(path));
                }
                if (!s.getModel().containsResource(s)) {
                    throw new BadRequestException("File \"" + path + "\" not found");
                }

                if (s.hasProperty(FS.dateDeleted)) {
                    throw new BadRequestException("File \"" + path + "\" was deleted");
                }

                var classShape = s.getPropertyResourceValue(RDF.type).inModel(VOCABULARY);
                classShape.listProperties(SHACLM.property)
                        .mapWith(Statement::getObject)
                        .mapWith(RDFNode::asResource)
                        .filterKeep(propertyShape -> propertyShape.hasProperty(SHACLM.name)
                                && propertyShape.hasProperty(SHACLM.path)
                                && propertyShape.getProperty(SHACLM.path).getObject().isURIResource())
                        .forEachRemaining(propertyShape -> {
                            var property = model.createProperty(propertyShape.getPropertyResourceValue(SHACLM.path).getURI());
                            var name = propertyShape.getProperty(SHACLM.name).getString();
                            if (headers.contains(name)) {
                                var datatype = propertyShape.getPropertyResourceValue(SHACLM.datatype);
                                var class_ = propertyShape.getPropertyResourceValue(SHACLM.class_);
                                assert (datatype != null) ^ (class_ != null);

                                var text = record.get(name);
                                if (isNotBlank(text)) {
                                    var values = text.split("\\|");

                                    for (var value : values) {
                                        var o = (class_ != null)
                                                ? model.wrapAsResource(generateMetadataIri(value))
                                                : model.createTypedLiteral(value, datatype.getURI());
                                        model.add(s, property, o);
                                    }
                                }
                            }
                        });
            }
        } catch (IOException e) {
            throw new BadRequestException("Error parsing file " + file.getName(), e);
        }
    }
}
