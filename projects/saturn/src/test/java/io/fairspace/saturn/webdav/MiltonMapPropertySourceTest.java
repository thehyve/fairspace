package io.fairspace.saturn.webdav;

import org.junit.Test;

import javax.xml.namespace.QName;
import java.util.HashSet;
import java.util.Set;

import static org.junit.Assert.*;

public class MiltonMapPropertySourceTest {
    @Test
    public void testDelegation() {
        MiltonMapPropertySource<String> propertySource = new MiltonMapPropertySource<>();

        propertySource.put("property1", "value1");
        assertEquals("value1", propertySource.get("property1"));
    }

    @Test
    public void testGetPropertyNames() {
        MiltonMapPropertySource<String> propertySource = new MiltonMapPropertySource<>("ns");
        propertySource.put("property1", "value1");
        propertySource.put("property2", null);

        assertEquals(Set.of(
                new QName("ns", "property1"),
                new QName("ns", "property2")
        ), new HashSet<>(propertySource.getPropertyNames()));
    }

    @Test
    public void testHasProperty() {
        MiltonMapPropertySource<String> propertySource = new MiltonMapPropertySource<>("ns");
        propertySource.put("property1", "value1");
        propertySource.put("property2", null);

        assertTrue(propertySource.hasProperty(new QName("ns", "property1")));
        assertFalse(propertySource.hasProperty(new QName("other-ns", "property1")));
        assertFalse(propertySource.hasProperty(new QName("ns", "property3")));
    }

    @Test
    public void testGetProperty() {
        MiltonMapPropertySource<String> propertySource = new MiltonMapPropertySource<>("ns");
        propertySource.put("property1", "value1");
        propertySource.put("property2", null);

        assertEquals("value1", propertySource.getProperty(new QName("ns", "property1")));
        assertNull(propertySource.getProperty(new QName("other-ns", "property1")));
        assertNull(propertySource.getProperty(new QName("ns", "property3")));
    }

    @Test
    public void testGetPropertyMeta() {
        MiltonMapPropertySource<String> propertySource = new MiltonMapPropertySource<>("ns");
        propertySource.put("property1", "value1");
        propertySource.put("property2", null);

        assertEquals(String.class, propertySource.getPropertyMeta(new QName("ns", "property1")).getValueType());
        assertNull(propertySource.getPropertyMeta(new QName("ns", "property2")));
        assertNull(propertySource.getProperty(new QName("other-ns", "property1")));
        assertNull(propertySource.getProperty(new QName("ns", "property3")));
    }
}
