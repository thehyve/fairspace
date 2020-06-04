package io.fairspace.saturn.vfs;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

import static io.fairspace.saturn.audit.Audit.audit;

public class AuditedFileSystem implements VirtualFileSystem {
    private final VirtualFileSystem fs;

    public AuditedFileSystem(VirtualFileSystem fs) {
        this.fs = fs;
    }

    @Override
    public FileInfo stat(String path) throws IOException {
        return fs.stat(path);
    }

    @Override
    public String iri(String path) throws IOException {
        return fs.iri(path);
    }

    @Override
    public List<FileInfo> list(String parentPath) throws IOException {
        return fs.list(parentPath);
    }

    @Override
    public FileInfo mkdir(String path) throws IOException {
        var result = fs.mkdir(path);
        audit("FS_MKDIR", "path", path);
        return result;
    }

    @Override
    public FileInfo create(String path, InputStream in) throws IOException {
        var result = fs.create(path, in);
        audit("FS_CREATE", "path", path);
        return result;
    }

    @Override
    public void modify(String path, InputStream in) throws IOException {
        fs.modify(path, in);
        audit("FS_MODIFY", "path", path);
    }

    @Override
    public void read(String path, OutputStream out, long start, Long finish) throws IOException {
        fs.read(path, out, start, finish);
        audit("FS_READ", "path", path);
    }

    @Override
    public void copy(String from, String to) throws IOException {
        fs.copy(from, to);
        audit("FS_COPY", "from", from, "to", to);
    }

    @Override
    public void move(String from, String to) throws IOException {
        fs.move(from, to);
        audit("FS_MOVE", "from", from, "to", to);
    }

    @Override
    public void delete(String path) throws IOException {
        fs.delete(path);
        audit("FS_DELETE", "path", path);
    }

    @Override
    public void restore(String path) throws IOException {
        fs.restore(path);
        audit("FS_RESTORE", "path", path);
    }

    @Override
    public void close() throws IOException {
        fs.close();
    }
}
