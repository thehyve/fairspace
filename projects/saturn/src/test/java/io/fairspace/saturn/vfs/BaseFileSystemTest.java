package io.fairspace.saturn.vfs;

import org.junit.Test;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class BaseFileSystemTest {
    @Test
    public void containsInvalidBaseName() {
        // Allow regular filenames
        assertFalse(BaseFileSystem.containsInvalidBaseName("/test/some/dir/file.txt"));
        assertFalse(BaseFileSystem.containsInvalidBaseName("/test/some/dir/file23421 - _ABD.txt.some.more.extensions"));

        // Allow unicode characters
        assertFalse(BaseFileSystem.containsInvalidBaseName("/test/some/dir/⺲⺳⺴⺵⺶⺷⺸⺹⺺⺻⺼⺽"));

        // Only tests the basename
        assertFalse(BaseFileSystem.containsInvalidBaseName("/test/some/[]/test.txt"));

        // Disallow special characters
        assertTrue(BaseFileSystem.containsInvalidBaseName("/test/some/dir/["));
        assertTrue(BaseFileSystem.containsInvalidBaseName("/test/some/dir/^"));
        assertTrue(BaseFileSystem.containsInvalidBaseName("/test/some/dir/&@?"));

        // Handle only slashes as filename
        assertTrue(BaseFileSystem.containsInvalidBaseName("/test/some/dir/\\\\"));

        // Handle trailing slash correctly
        assertFalse(BaseFileSystem.containsInvalidBaseName("/test/some/abc/test.txt/"));
        assertTrue(BaseFileSystem.containsInvalidBaseName("/test/some/abc/[]/"));

    }
}
