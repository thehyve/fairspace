package io.fairspace.saturn.blobs;

import java.io.*;
import java.nio.file.FileAlreadyExistsException;
import java.util.UUID;

// TODO: Create subdirectories with no more than 100 files in each
public class LocalBlobStore implements BlobStore {
    private final File directory;

    public LocalBlobStore(File directory) {
        this.directory = directory;
        directory.mkdirs();
    }

    @Override
    public OutputContext openOutputStream() throws IOException {
        String blobId = "blob-" + UUID.randomUUID();
        return new OutputContext(blobId, new BufferedOutputStream(new FileOutputStream(new File(directory, blobId))));
    }

    @Override
    public InputStream openInputStream(String blobId) throws IOException {
        File file = new File(directory, blobId);
        if (!file.exists()) {
            throw new FileNotFoundException(blobId);
        }
        return new BufferedInputStream(new FileInputStream(file));
    }
}
