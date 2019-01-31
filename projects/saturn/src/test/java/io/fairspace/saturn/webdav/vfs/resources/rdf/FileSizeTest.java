package io.fairspace.saturn.webdav.vfs.resources.rdf;

import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class FileSizeTest {

    @Test
    public void parseWithoutUnit() {
        assertEquals(0, FileSize.parse(null));
        assertEquals(0, FileSize.parse(""));
        assertEquals(0, FileSize.parse("     "));
        assertEquals(0, FileSize.parse("0"));

        // By default, the unit is KB
        assertEquals(1024, FileSize.parse("1"));
        assertEquals(102400, FileSize.parse("100"));
    }

    @Test
    public void parseWithUnit() {
        assertEquals(0, FileSize.parse("0B"));
        assertEquals(0, FileSize.parse("0KB"));
        assertEquals(0, FileSize.parse("0MB"));
        assertEquals(0, FileSize.parse("0GB"));
        assertEquals(0, FileSize.parse("0TB"));
        assertEquals(0, FileSize.parse("0PB"));
        assertEquals(0, FileSize.parse("0EB"));
        assertEquals(0, FileSize.parse("0YB"));
        assertEquals(0, FileSize.parse("0ZB"));

        assertEquals(1048576, FileSize.parse("1MB"));
    }

    @Test(expected = IllegalArgumentException.class)
    public void parseOnlyUnit() {
        FileSize.parse("KB");
    }

    @Test(expected = IllegalArgumentException.class)
    public void parseInvalidNumber() {
        FileSize.parse("one");
    }

    @Test(expected = IllegalArgumentException.class)
    public void parseUnknownUnit() {
        FileSize.parse("1XB");
    }

    @Test
    public void formatFileSize() {
        assertEquals("0B", FileSize.format(0));
        assertEquals("1024B", FileSize.format(1024));
        assertEquals("1048576B", FileSize.format(1048576));
    }

    @Test(expected = IllegalArgumentException.class)
    public void formatNegativeValue() {
        FileSize.format(-10);
    }

}
