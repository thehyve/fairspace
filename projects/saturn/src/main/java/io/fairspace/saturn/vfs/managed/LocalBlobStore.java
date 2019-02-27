package io.fairspace.saturn.vfs.managed;


import java.io.*;

import static java.lang.Math.min;
import static java.util.UUID.randomUUID;
import static org.apache.commons.io.IOUtils.copyLarge;

public class LocalBlobStore implements BlobStore {
    private static final int DEFAULT_BUFFER_SIZE = 1024 * 4;

    private final File dir;

    public LocalBlobStore(File dir) {
        this.dir = dir;
    }

    @Override
    public String write(InputStream in) throws IOException {
        if (!dir.exists() && !dir.mkdirs()) {
            throw new IOException("Cannot initialize the local blob store");
        }
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
    public void read(String id, long offset, long maxLength, OutputStream out) throws IOException {
        var src = new File(dir, id);
        try (var in = new BufferedInputStream(new FileInputStream(src))) {
            in.skip(offset);

            var numRead = 0L;
            var b = new byte[DEFAULT_BUFFER_SIZE];
            while (numRead < maxLength) {
                var remainingBytes = maxLength - numRead;
                var len = (int) min(remainingBytes, DEFAULT_BUFFER_SIZE);
                var s = in.read(b, 0, len);
                if (s < 0) {
                    break;
                }
                numRead += s;
                out.write(b, 0, s);
            }
        }
    }
}
