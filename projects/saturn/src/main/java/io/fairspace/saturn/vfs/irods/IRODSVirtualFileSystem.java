package io.fairspace.saturn.vfs.irods;

import io.fairspace.saturn.services.collections.Collection;
import io.fairspace.saturn.services.collections.CollectionsService;
import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import org.irods.jargon.core.connection.ClientServerNegotiationPolicy;
import org.irods.jargon.core.connection.IRODSAccount;
import org.irods.jargon.core.exception.JargonException;
import org.irods.jargon.core.pub.CollectionAndDataObjectListAndSearchAO;
import org.irods.jargon.core.pub.IRODSFileSystem;
import org.irods.jargon.core.pub.io.IRODSFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static io.fairspace.saturn.vfs.PathUtils.*;

public class IRODSVirtualFileSystem implements VirtualFileSystem {
    public static final String TYPE = "irods";

    private final IRODSFileSystem fs;
    private final CollectionsService collections;

    public IRODSVirtualFileSystem(CollectionsService collections) {
        try {
            this.fs = IRODSFileSystem.instance();
        } catch (JargonException e) {
            throw new RuntimeException(e);
        }
        this.collections = collections;
    }

    @Override
    public FileInfo stat(String path) throws IOException {
        try {
            var collection = collectionByPath(path);
            var account = accountForCollection(collection);
            var f = getFile(path, account);
            if (!f.exists()) {
                return null;
            }

            var stat = getAccessObject(account).retrieveObjectStatForPath(f.getAbsolutePath());

            return FileInfo.builder()
                    .iri(collection.getIri() + "-" + stat.getDataId())
                    .path(path)
                    .isDirectory(f.isDirectory())
                    .readOnly(!collection.canWrite() || !f.canWrite())
                    .created(Instant.ofEpochMilli(stat.getCreatedAt().getTime()))
                    .modified(Instant.ofEpochMilli(stat.getModifiedAt().getTime()))
                    .size(stat.getObjSize())
                    .build();
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    private IRODSFile getFile(String path, IRODSAccount account) throws JargonException {
        var irodsPath = getIrodsPath(path, account);

        return fs.getIRODSAccessObjectFactory()
                .getIRODSFileFactory(account)
                .instanceIRODSFile(irodsPath);
    }

    private String getIrodsPath(String path, IRODSAccount account) {
        return "/" + joinPaths(account.getHomeDirectory(), subPath(path));
    }

    private CollectionAndDataObjectListAndSearchAO getAccessObject(IRODSAccount account) throws JargonException {
        return fs.getIRODSAccessObjectFactory().getCollectionAndDataObjectListAndSearchAO(account);
    }

    @Override
    public List<FileInfo> list(String parentPath) throws IOException {
        try {
            var collection = collectionByPath(parentPath);
            var account = accountForCollection(collection);
            var f = getFile(parentPath, account);

            var cao = getAccessObject(account);

            var result = new ArrayList<FileInfo>();

            for (var child : f.listFiles()) {
                var stat = cao.retrieveObjectStatForPath(f.getAbsolutePath());
                result.add(FileInfo.builder()
                        .iri(collection.getIri() + "-" + stat.getDataId())
                        .path(joinPaths(parentPath, child.getName()))
                        .isDirectory(child.isDirectory())
                        .readOnly(!collection.canWrite() || !child.canWrite())
                        .created(Instant.ofEpochMilli(stat.getCreatedAt().getTime()))
                        .modified(Instant.ofEpochMilli(f.lastModified()))
                        .size(stat.getObjSize())
                        .build());
            }
            return result;
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    private Collection collectionByPath(String parentPath) throws FileNotFoundException {
        var collection = collections.getByLocation(splitPath(parentPath)[0]);
        if (collection == null) {
            throw new FileNotFoundException(parentPath);
        }
        return collection;
    }

    @Override
    public void mkdir(String path) throws IOException {
        var collection = collectionByPath(path);
        var account = accountForCollection(collection);
        try {
            var f = getFile(path, account);
            f.mkdir();
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    @Override
    public void create(String path, InputStream in) throws IOException {

    }

    @Override
    public void modify(String path, InputStream in) throws IOException {

    }

    @Override
    public void read(String path, OutputStream out) throws IOException {

    }

    @Override
    public void copy(String from, String to) throws IOException {

    }

    @Override
    public void move(String from, String to) throws IOException {

    }

    @Override
    public void delete(String path) throws IOException {
        var collection = collectionByPath(path);
        var account = accountForCollection(collection);
        try {
            var f = getFile(path, account);
            f.delete();
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    @Override
    public void close() throws IOException {
        try {
            fs.close();
        } catch (JargonException e) {
            throw new IOException(e);
        }
    }

    private IRODSAccount accountForCollection(Collection collection) throws IOException {
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
}
