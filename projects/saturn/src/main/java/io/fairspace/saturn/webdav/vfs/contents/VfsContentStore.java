package io.fairspace.saturn.webdav.vfs.contents;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public interface VfsContentStore {
    /**
     * Retrieves the content for a given contentLocation.
     * @param contentLocation location of the contents within the content store.
     *                        Is produced when using putContent
     * @param out             OutputStream to create the content to
     * @throws IOException
     */
    public void getContent(String contentLocation, OutputStream out) throws IOException;

    /**
     * Stores the content from the inputstream to disk
     * @param vfsPath The VFS path for which the content is stored. May be used to determine the location
     * @param in      InputStream with the contents to store
     * @return A data object describing the location and size of the content that were stored
     * @throws IOException
     */
    public StoredContent putContent(String vfsPath, InputStream in) throws IOException;
}
