package io.fairspace.neptune.service;

import io.fairspace.neptune.web.CollectionNotFoundException;
import org.junit.Test;

import static org.junit.Assert.assertEquals;

public class LocationsTest {

    @Test
    public void testLocation() {
        assertEquals("Blah blah. 1-2 _ _  _____ __ ______ -123", Locations.location("Blah blah. 1-2 / ~  следы от дрели: ", 123L));
        String longName = new String(new char[1000]);
        assertEquals(255, Locations.location(longName, 123L).length());
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
