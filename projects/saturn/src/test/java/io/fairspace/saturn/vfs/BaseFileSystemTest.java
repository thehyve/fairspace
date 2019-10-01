package io.fairspace.saturn.vfs;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class BaseFileSystemTest {
    @Test
    public void containsInvalidBaseName() {
        // Allow regular filenames
        assertFalse(BaseFileSystem.containsInvalidPathName("/test/some/dir/file.txt"));
        assertFalse(BaseFileSystem.containsInvalidPathName("/test/some/dir/file23421 - _ABD.txt.some.more.extensions"));

        // Allow unicode characters
        assertFalse(BaseFileSystem.containsInvalidPathName("/test/some/dir/⺲⺳⺴⺵⺶⺷⺸⺹⺺⺻⺼⺽"));

        // Tests the full path
        assertTrue(BaseFileSystem.containsInvalidPathName("/test/some/[]/test.txt"));

        // Disallow special characters
        assertTrue(BaseFileSystem.containsInvalidPathName("/test/some/dir/["));
        assertTrue(BaseFileSystem.containsInvalidPathName("/test/some/dir/^"));
        assertTrue(BaseFileSystem.containsInvalidPathName("/test/some/dir/&@?"));

        // Handle only slashes as filename
        assertTrue(BaseFileSystem.containsInvalidPathName("/test/some/dir/\\\\"));

        // Allows multiple forward slashes
        assertFalse(BaseFileSystem.containsInvalidPathName("/test/some/dir///test///"));

        // Handle trailing slash correctly
        assertFalse(BaseFileSystem.containsInvalidPathName("/test/some/abc/test.txt/"));
        assertTrue(BaseFileSystem.containsInvalidPathName("/test/some/abc/[]/"));

    }
}
