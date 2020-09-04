package io.fairspace.saturn.webdav;

import io.milton.http.FileItem;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Map;

public class BlobFileItem implements FileItem {
    private final BlobInfo blob;
    private final String contentType;
    private final String fieldName;
    private final String name;
    private final Map<String, String> headers;

    public BlobFileItem(FileItem fileItem, BlobStore store) {
        try {
            blob = store.store(fileItem.getInputStream());
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        contentType = fileItem.getContentType();
        fieldName = fileItem.getFieldName();
        name = fileItem.getName();
        headers = fileItem.getHeaders();
    }

    public BlobInfo getBlob() {
        return blob;
    }

    @Override
    public String getContentType() {
        return contentType;
    }

    @Override
    public String getFieldName() {
        return fieldName;
    }

    @Override
    public InputStream getInputStream() {
        throw new UnsupportedOperationException();
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public long getSize() {
        return blob.size;
    }

    @Override
    public OutputStream getOutputStream() {
        throw new UnsupportedOperationException();
    }

    @Override
    public Map<String, String> getHeaders() {
        return headers;
    }
}
