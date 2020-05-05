package io.fairspace.saturn.vfs;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class BaseFileSystemTest {
    @Test
    public void containsInvalidBaseName() {
        // Allow regular filenames
        assertFalse(BaseFileSystem.containsInvalidPathName("/test/some/dir/file.txt"));

        // Allow unicode characters
        assertFalse(BaseFileSystem.containsInvalidPathName("/test/some/dir/⺲⺳⺴⺵⺶⺷⺸⺹⺺⺻⺼⺽"));

        // Disallow invalid names
        assertTrue(BaseFileSystem.containsInvalidPathName("/test/some/dir/."));
        assertTrue(BaseFileSystem.containsInvalidPathName("/test/some/dir/.."));

        // Allow "..." as a name
        assertFalse(BaseFileSystem.containsInvalidPathName("/test/some/dir/..."));
    }
}
