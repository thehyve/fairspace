package io.fairspace.saturn.vfs.managed;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public interface BlobStore {
    String write(InputStream in) throws IOException;

    void read(String id, long offset, long maxLength, OutputStream out) throws IOException;
}
