package io.fairspace.saturn.webdav.blobstore;

import org.apache.commons.io.input.CountingInputStream;
import org.apache.commons.io.input.MessageDigestCalculatingInputStream;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.security.NoSuchAlgorithmException;

import static org.apache.commons.codec.binary.Hex.encodeHexString;

public interface BlobStore {
    String write(InputStream in) throws IOException;

    void read(String id, OutputStream out, long start, Long finish) throws IOException;

    default BlobInfo store(InputStream in) throws IOException {
        try {
            var countingInputStream = new CountingInputStream(in);
            var messageDigestCalculatingInputStream = new MessageDigestCalculatingInputStream(countingInputStream);

            var id = write(messageDigestCalculatingInputStream);

            return new BlobInfo(id, countingInputStream.getByteCount(), encodeHexString(messageDigestCalculatingInputStream.getMessageDigest().digest()));
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException(e);
        }
    }

    default boolean delete(String id) throws IOException {
        throw new RuntimeException("Cannot delete blob from read-only blob store");
    }
}
