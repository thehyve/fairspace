package io.fairspace.saturn.vfs.managed;

import org.apache.commons.io.IOUtils;

import java.io.*;
import java.util.HashMap;
import java.util.Map;

import static java.util.UUID.randomUUID;

public class MemoryBlobStore implements BlobStore {
    private Map<String, byte[]> memo = new HashMap<>();

    @Override
    public String write(InputStream in) throws IOException {
        var id = randomUUID().toString();
        var os = new ByteArrayOutputStream();
        IOUtils.copy(in, os);
        memo.put(id, os.toByteArray());
        return id;
    }

    @Override
    public void read(String id, long offset, long maxLength, OutputStream out) throws IOException {
        IOUtils.copy(new ByteArrayInputStream(memo.get(id), (int) offset, (int) Math.min(maxLength, Integer.MAX_VALUE)), out);
    }
}
