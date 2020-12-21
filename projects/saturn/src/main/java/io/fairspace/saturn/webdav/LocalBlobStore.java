package io.fairspace.saturn.webdav;


import io.milton.common.RangeUtils;
import io.milton.http.Range;

import java.io.*;

import static java.util.UUID.randomUUID;
import static org.apache.commons.io.IOUtils.copyLarge;

public class LocalBlobStore implements BlobStore {
    private final File dir;

    public LocalBlobStore(File dir) {
        this.dir = dir;
        if(!dir.exists() && !dir.mkdirs()) {
            throw new RuntimeException("Cannot initialize the local blob store");
        }
    }

    @Override
    public String write(InputStream in) throws IOException {
        var id = randomUUID().toString();
        var dest = new File(dir, id);
        while (dest.exists()) {
            // The chance that this happens is zero, but we need to guarantee uniqueness.
            id = randomUUID().toString();
            dest = new File(dir, id);
        }
        try (var out = new BufferedOutputStream(new FileOutputStream(dest))) {
             copyLarge(in, out);
        } catch (IOException e) {
            dest.delete();
            throw e;
        }
        return id;
    }

    @Override
    public void read(String id, OutputStream out, long start, Long finish) throws IOException {
        var src = new File(dir, id);
        try(var in = new BufferedInputStream(new FileInputStream(src))) {
            RangeUtils.writeRange(in, new Range(start, finish), out);
        }
    }
}
