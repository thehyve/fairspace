package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.property.PropertySource;
import org.junit.Test;

import javax.xml.namespace.QName;
import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class VfsBackedMiltonResourceTest {
    @Test
    public void testGetIriProperty() throws IOException {
        var fs = mock(VirtualFileSystem.class);
        when(fs.iri(any())).thenReturn("http://this-iri");
        var resource = new ResourceImpl(
                fs,
                FileInfo.builder().build()
        );

        assertEquals("http://this-iri", resource.getProperty(new QName(FS.NS, "iri")));
    }

    @Test
    public void testGetPropertyMetaDataForCustomProperties() {
        var resource = new ResourceImpl(
                null,
                null,
                new MiltonMapPropertySource<>("ns", Map.of(
                        "property1", "value1",
                        "property2", "value2"
                ))
        );

        var expectedMetadata = new PropertySource.PropertyMetaData(PropertySource.PropertyAccessibility.READ_ONLY, String.class);
        var metadata = resource.getPropertyMetaData(new QName("ns", "property1"));
        assertEquals(expectedMetadata.getAccessibility(), metadata.getAccessibility());
        assertEquals(expectedMetadata.getValueType(), metadata.getValueType());
        assertNull(resource.getPropertyMetaData(new QName("ns", "property3")));
    }

    @Test
    public void testGetPropertyForCustomProperties() {
        var resource = new ResourceImpl(
                null,
                null,
                new MiltonMapPropertySource<>("ns", Map.of(
                        "property1", "value1",
                        "property2", "value2"
                ))
        );

        assertEquals("value1", resource.getProperty(new QName("ns", "property1")));
        assertNull(resource.getProperty(new QName("other-ns", "property1")));
        assertNull(resource.getProperty(new QName("ns", "property3")));
    }

    @Test
    public void getAllPropertyNames() {
        var resource = new ResourceImpl(
                null,
                null,
                new MiltonMapPropertySource<>("ns", Map.of(
                        "property1", "value1",
                        "property2", "value2"
                ))
        );

        List<QName> propertyNames = resource.getAllPropertyNames();

        assertTrue(propertyNames.contains(new QName("ns", "property1")));
        assertTrue(propertyNames.contains(new QName("ns", "property2")));
    }

    private class ResourceImpl extends VfsBackedMiltonResource {
        ResourceImpl(VirtualFileSystem fs, FileInfo info) {
            super(fs, info);
        }

        ResourceImpl(VirtualFileSystem fs, FileInfo info, MiltonMapPropertySource propertySource) {
            super(fs, info, propertySource);
        }

        @Override
        public String getUniqueId() {
            return "";
        }
    }
}
