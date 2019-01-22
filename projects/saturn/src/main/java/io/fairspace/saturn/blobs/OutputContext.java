package io.fairspace.saturn.blobs;

import lombok.Value;

import java.io.OutputStream;

@Value
public class OutputContext {
    private final String blobId;
    private final OutputStream outputStream;
}
