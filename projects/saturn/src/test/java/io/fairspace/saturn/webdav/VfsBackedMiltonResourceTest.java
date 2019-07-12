package io.fairspace.saturn.webdav;

import io.fairspace.saturn.vfs.FileInfo;
import io.fairspace.saturn.vfs.VirtualFileSystem;
import io.fairspace.saturn.vocabulary.FS;
import io.milton.property.PropertySource;
import org.junit.Test;

import javax.xml.namespace.QName;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;

public class VfsBackedMiltonResourceTest {
    @Test
    public void testGetIriProperty() {
        var resource = new ResourceImpl(
                null,
                FileInfo.builder().iri("http://this-iri").build()
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
