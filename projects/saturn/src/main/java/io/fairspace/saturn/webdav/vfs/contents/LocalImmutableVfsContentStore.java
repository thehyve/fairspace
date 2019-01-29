package io.fairspace.saturn.webdav.vfs.contents;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.UUID;

/**
 * This content factory will store all files on local disk, while
 * never overwriting existing files. For every new write, a new location is generated
 */
public class LocalImmutableVfsContentStore implements VfsContentStore {
    private static final String DIRECTORY_SEPARATOR = "/";
    private String rootLocation;

    public LocalImmutableVfsContentStore(File rootLocation) {
        this.rootLocation = rootLocation.getAbsolutePath();
    }

    @Override
    public void getContent(String contentLocation, OutputStream out) throws IOException {
        FileUtils.copyFile(getFileForLocation(contentLocation), out);
    }

    @Override
    public StoredContent putContent(String vfsPath, InputStream in) throws IOException {
        // Create a new location every time something is written
        String contentLocation = newLocation();

        long contentSize;
        try (OutputStream file = FileUtils.openOutputStream(getFileForLocation(contentLocation))) {
            contentSize = IOUtils.copyLarge(in, file);
        }

        return new StoredContent(contentLocation, contentSize);
    }

    private String newLocation() {
        // TODO: Make deterministic?
        // TODO: Check for existence or rely on UUID randomness?
        return UUID.randomUUID().toString();
    }

    /**
     * Returns a File object pointing to the content on disk
     * @param contentLocation
     * @return
     */
    private File getFileForLocation(String contentLocation) {
        return new File(rootLocation + DIRECTORY_SEPARATOR + contentLocation);
    }
}
