package io.fairspace.saturn.webdav.blobstore;

import java.io.*;

public class DeletableLocalBlobStore extends LocalBlobStore {

    private final File dir;

    public DeletableLocalBlobStore(File dir) {
        super(dir);
        this.dir = dir;
    }

    public boolean delete(String id) throws IOException {
        var dest = new File(dir, id);
        return dest.delete();
    }
}
