package io.fairspace.saturn.vfs.irods;

import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.vfs.BaseFileSystem;
import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vocabulary.FS;
import org.apache.commons.lang.StringUtils;
import org.apache.jena.rdf.model.Resource;
import org.apache.jena.rdfconnection.RDFConnection;
import org.irods.jargon.core.connection.ClientServerNegotiationPolicy;
import org.irods.jargon.core.connection.IRODSAccount;
import org.irods.jargon.core.exception.JargonException;
import org.irods.jargon.core.pub.CollectionAndDataObjectListAndSearchAO;
import org.irods.jargon.core.pub.DataTransferOperations;
import org.irods.jargon.core.pub.IRODSFileSystem;
import org.irods.jargon.core.pub.domain.AvuData;
import org.irods.jargon.core.pub.domain.ObjStat;
import org.irods.jargon.core.pub.io.IRODSFile;
import org.irods.jargon.core.pub.io.IRODSFileFactory;
import org.irods.jargon.core.pub.io.IRODSFileInputStream;
import org.irods.jargon.core.pub.io.IRODSFileOutputStream;
import org.irods.jargon.core.query.JargonQueryException;
import org.irods.jargon.core.query.MetaDataAndDomainData;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.nio.file.FileSystemException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

import static io.fairspace.saturn.rdf.SparqlUtils.generateMetadataIri;
import static io.fairspace.saturn.rdf.SparqlUtils.storedQuery;
import static io.fairspace.saturn.rdf.TransactionUtils.commit;
import static io.fairspace.saturn.vfs.PathUtils.*;
import static java.time.Instant.ofEpochMilli;
import static org.apache.commons.io.IOUtils.copyLarge;
import static org.apache.jena.riot.system.IRIResolver.checkIRI;

public class IRODSVirtualFileSystem extends BaseFileSystem {
    public static final String TYPE = "irods";
    public static final String FAIRSPACE_IRI_ATTRIBUTE = "FairspaceIRI";
    private final IRODSFileSystem fs;
    private final RDFConnection rdf;

    public IRODSVirtualFileSystem(RDFConnection rdf, CollectionsService collections) throws JargonException {
        this(rdf, collections, IRODSFileSystem.instance());
    }

    IRODSVirtualFileSystem(RDFConnection rdf, CollectionsService collections, IRODSFileSystem fs) {
        super(collections);

        this.fs = fs;
        this.rdf = rdf;
    }

    @Override
    protected FileInfo statRegularFile(String path) throws IOException {
        try {
            var f = getFile(path);
            if (!f.exists()) {
                return null;
            }

            var collection = collectionByPath(path);
            var account = accountForCollection(collection);
            var stat = getAccessObject(account).retrieveObjectStatForPath(f.getAbsolutePath());

            return FileInfo.builder()
                    .path(path)
                    .isDirectory(stat.isSomeTypeOfCollection())
                    .readOnly(!collection.canWrite() || !f.canWrite())
                    .created(ofEpochMilli(stat.getCreatedAt().getTime()))
                    .modified(ofEpochMilli(stat.getModifiedAt().getTime()))
                    .size(stat.getObjSize())
                    .customProperties(getCustomProperties(stat))
                    .build();
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    @Override
    protected String fileOrDirectoryIri(String path) throws IOException {
        try {
            var f = getFile(path);
            if (!f.exists()) {
                return null;
            }

            if (f.isDirectory()) {
                return directoryIri(path);
            } else {
                return fileIri(path);
            }
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            throw new IOException(e);
        }
    }

    private String directoryIri(String path) throws IOException, JargonException, JargonQueryException {
        var irodsPath = getIrodsPath(path);
        var collectionAO = fs.getIRODSAccessObjectFactory().getCollectionAO(getAccount(path));
        var meta = collectionAO.findMetadataValuesForCollection(irodsPath);
        var existing = getFairspaceIRI(meta);
        if (existing.isPresent()) {
            return existing.get();
        } else {
            var avu = createIri(FS.ExternalDirectory);
            collectionAO.addAVUMetadata(irodsPath, avu);
            return avu.getValue();
        }
    }

    private String fileIri(String path) throws IOException, JargonException {
        var account = getAccount(path);
        var irodsPath = getIrodsPath(path);
        var dataObjectAO = fs.getIRODSAccessObjectFactory().getDataObjectAO(account);
        var meta = dataObjectAO.findMetadataValuesForDataObject(irodsPath);
        var existing = getFairspaceIRI(meta);
        if (existing.isPresent()) {
            return existing.get();
        } else {
            var avu = createIri(FS.ExternalFile);
            dataObjectAO.addAVUMetadata(irodsPath, avu);
            return avu.getValue();
        }
    }

    private Optional<String> getFairspaceIRI(List<MetaDataAndDomainData> meta) {
        return meta.stream()
                .filter(m -> FAIRSPACE_IRI_ATTRIBUTE.equals(m.getAvuAttribute()))
                .map(MetaDataAndDomainData::getAvuValue)
                .filter(iri -> !checkIRI(iri))
                .findFirst();
    }

    private AvuData createIri(Resource type) {
        var iri = generateMetadataIri();
        commit("Generate an IRI for an external resource", rdf, () ->
                rdf.update(storedQuery("register_external_resource", iri, type)));
        return new AvuData(FAIRSPACE_IRI_ATTRIBUTE, iri.getURI(), "");
    }

    @Override
    protected List<FileInfo> listCollectionOrDirectory(String parentPath) throws IOException {
        try {
            var collection = collectionByPath(parentPath);
            var account = accountForCollection(collection);
            var f = getFile(parentPath);

            var cao = getAccessObject(account);

            var result = new ArrayList<FileInfo>();

            for (var child : f.listFiles()) {
                var stat = cao.retrieveObjectStatForPath(child.getAbsolutePath());
                result.add(FileInfo.builder()
                        .path(parentPath + "/" + child.getName())
                        .isDirectory(stat.isSomeTypeOfCollection())
                        .readOnly(!collection.canWrite() || !child.canWrite())
                        .created(ofEpochMilli(stat.getCreatedAt().getTime()))
                        .modified(ofEpochMilli(stat.getModifiedAt().getTime()))
                        .size(stat.getObjSize())
                        .customProperties(getCustomProperties(stat))
                        .build());
            }
            return result;
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    @Override
    protected void doMkdir(String path) throws IOException {
        getFile(path).mkdir();
    }

    @Override
    protected void doCreate(String path, InputStream in) throws IOException {
        getFile(path).createNewFile();
        modify(path, in);
    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        try (var out = getOutputStream(path)) {
            copyLarge(in, out);
        }
    }

    @Override
    public void read(String path, OutputStream out) throws IOException {
        try (var in = getInputStream(path)) {
            copyLarge(in, out);
        }
    }

    @Override
    protected void doCopy(String from, String to) throws IOException {
        try {
            var fromAccount = getAccount(from);
            var toAccount = getAccount(to);
            if (fromAccount.equals(toAccount)) {
                var src = getIrodsPath(from);
                var dst = getIrodsPath(to);
                getDataTransferOperations(fromAccount).copy(src, fromAccount.getDefaultStorageResource(), dst, null, null);
            } else {
                throw new FileSystemException("Copying files between different iRODS accounts is not implemented yet");
            }
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    @Override
    protected void doMove(String from, String to) throws IOException {
        try {
            var fromAccount = getAccount(from);
            var toAccount = getAccount(to);
            if (fromAccount.equals(toAccount)) {
                getDataTransferOperations(fromAccount).move(getIrodsPath(from), getIrodsPath(to));
            } else {
                throw new FileSystemException("Moving files between different iRODS accounts is not implemented yet");
            }
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    @Override
    protected void doDelete(String path) throws IOException {
        getFile(path).delete();
    }

    @Override
    public void close() throws IOException {
        try {
            fs.close();
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    private IRODSFile getFile(String path) throws IOException {
        var account = getAccount(path);
        try {
            return getIrodsFileFactory(account).instanceIRODSFile(getIrodsPath(path));
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    private IRODSAccount getAccount(String path) throws IOException {
        return accountForCollection(collectionByPath(path));
    }

    private Collection collectionByPath(String path) {
        return collections.getByLocation(splitPath(path)[0]);
    }

    private String getIrodsPath(String path) throws IOException {
        return "/" + joinPaths(getAccount(path).getHomeDirectory(), subPath(path));
    }

    private IRODSFileInputStream getInputStream(String path) throws IOException {
        var account = getAccount(path);
        try {
            return getIrodsFileFactory(account).instanceIRODSFileInputStream(getIrodsPath(path));
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    private IRODSFileOutputStream getOutputStream(String path) throws IOException {
        var account = getAccount(path);
        try {
            return getIrodsFileFactory(account).instanceIRODSFileOutputStream(getIrodsPath(path));
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    private CollectionAndDataObjectListAndSearchAO getAccessObject(IRODSAccount account) throws JargonException {
        return fs.getIRODSAccessObjectFactory().getCollectionAndDataObjectListAndSearchAO(account);
    }

    private DataTransferOperations getDataTransferOperations(IRODSAccount fromAccount) throws JargonException {
        return fs.getIRODSAccessObjectFactory().getDataTransferOperations(fromAccount);
    }

    private IRODSFileFactory getIrodsFileFactory(IRODSAccount account) throws JargonException {
        return fs.getIRODSAccessObjectFactory().getIRODSFileFactory(account);
    }

    private static IRODSAccount accountForCollection(Collection collection) throws IOException {
        try {
            var uri = new URI(collection.getConnectionString());
            var userInfo = uri.getUserInfo().split("[.:]");
            return IRODSAccount.instance(
                    uri.getHost(),
                    uri.getPort(),
                    userInfo[0],
                    userInfo[2],
                    uri.getPath(),
                    userInfo[1],
                    "",
                    new ClientServerNegotiationPolicy()
            );
        } catch (Exception e) {
            throw new IOException(e);
        }
    }

    private HashMap<String, String> getCustomProperties(ObjStat stat) {
        var properties = new HashMap<String, String>();
        properties.put(FS.OWNED_BY_LOCAL_PART, stat.getOwnerName());

        if(StringUtils.isNotEmpty(stat.getChecksum())) {
            properties.put(FS.CHECKSUM_LOCAL_PART, stat.getChecksum());
        }
        return properties;
    }
}
