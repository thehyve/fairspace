package io.fairspace.saturn.vfs;

import java.nio.file.FileSystemException;

public class InvalidFilenameException extends FileSystemException {
    public InvalidFilenameException(String message) {
        super(message);
    }
}
