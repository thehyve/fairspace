package io.fairspace.saturn.blobs;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public interface BlobStore {
    OutputContext openOutputStream() throws IOException;

    InputStream openInputStream(String blobId) throws IOException;
}
