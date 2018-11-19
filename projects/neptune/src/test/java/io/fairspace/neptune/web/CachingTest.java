package io.fairspace.neptune.web;

import org.junit.Test;
import org.springframework.http.ResponseEntity;

import static org.junit.Assert.*;

public class CachingTest {

    @Test
    public void withCacheControl() {
        Caching caching = new Caching(3);

        ResponseEntity<String> entity = caching.withCacheControl("test");

        assertEquals("max-age=3", entity.getHeaders().getCacheControl());
        assertEquals("test", entity.getBody());
    }
}
