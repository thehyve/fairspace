package io.fairspace.saturn.vfs.managed;


import java.io.*;

import static java.util.UUID.randomUUID;
import static org.apache.commons.io.IOUtils.copyLarge;

public class LocalBlobStore implements BlobStore {
    private final File dir;

    public LocalBlobStore(File dir) {
        this.dir = dir;
        if (!dir.exists() && !dir.mkdirs()) {
            throw new RuntimeException("Cannot initialize the local blob store");
        }
    }

    @Override
    public String write(InputStream in) throws IOException {
        var id = randomUUID().toString();
        var dest = new File(dir, id);
        try (var out = new BufferedOutputStream(new FileOutputStream(dest))) {
            copyLarge(in, out);
        } catch (IOException e) {
            dest.delete();
            throw e;
        }
        return id;
    }

    @Override
    public void read(String id, OutputStream out) throws IOException {
        var src = new File(dir, id);
        try (var in = new BufferedInputStream(new FileInputStream(src))) {
            copyLarge(in, out);
        }
    }
}
