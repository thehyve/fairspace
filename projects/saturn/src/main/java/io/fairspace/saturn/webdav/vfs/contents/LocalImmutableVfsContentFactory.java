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
public class LocalImmutableVfsContentFactory implements VfsContentFactory {
    private static final String DIRECTORY_SEPARATOR = "/";
    private String rootLocation;

    public LocalImmutableVfsContentFactory(File rootLocation) {
        this.rootLocation = rootLocation.getAbsolutePath();
    }

    @Override
    public void getContent(String contentLocation, OutputStream out) throws IOException {
        FileUtils.copyFile(getFileForLocation(contentLocation), out);
    }

    @Override
    public String putContent(String vfsPath, InputStream in) throws IOException {
        // Create a new location every time something is written
        String contentLocation = newLocation();

        try (OutputStream file = FileUtils.openOutputStream(getFileForLocation(contentLocation))) {
            IOUtils.copy(in, file);
        }

        return contentLocation;
    }

    private String newLocation() {
        // TODO: Make deterministic
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
