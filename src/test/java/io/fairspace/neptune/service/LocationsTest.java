package io.fairspace.neptune.service;

import io.fairspace.neptune.web.CollectionNotFoundException;
import org.junit.Test;

import static org.junit.Assert.*;

public class LocationsTest {

    @Test
    public void testLocation() {
        assertEquals("Blah_blah_123______________________-123", Locations.location("Blah blah 123 / ~  следы от дрели: ", 123L));
    }

    @Test
    public void extractIdShouldHandleValidNames() {
        assertEquals(Long.valueOf(123L), Locations.extractId("123"));
        assertEquals(Long.valueOf(123L), Locations.extractId("-123"));
        assertEquals(Long.valueOf(123L), Locations.extractId("blah-blah-123"));
    }

    @Test(expected = CollectionNotFoundException.class)
    public void extractIdShouldFailOnEmptyString() {
        assertEquals(Long.valueOf(123L), Locations.extractId(""));
    }

    @Test(expected = CollectionNotFoundException.class)
    public void extractIdShouldFailOnStringWithoutId() {
        Locations.extractId("blah-blah");
    }

    @Test(expected = CollectionNotFoundException.class)
    public void extractIdShouldFailOnStringWithInvalidId() {
        Locations.extractId("too-long-100" + Long.MAX_VALUE);
    }
}
