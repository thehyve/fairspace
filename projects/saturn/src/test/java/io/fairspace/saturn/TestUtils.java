package io.fairspace.saturn;

import org.apache.jena.rdf.model.Model;

import java.time.Instant;

import static java.time.Instant.now;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.argThat;

public class TestUtils {
    public static void ensureRecentInstant(Instant instant) {
        assertNotNull(instant);
        assertTrue(instant.isAfter(now().minusSeconds(1)));
        assertTrue(now().equals(instant) || instant.isBefore(now()));
    }

    public static Model isomorphic(Model m) {
        return argThat(m::isIsomorphicWith);
    }
}
