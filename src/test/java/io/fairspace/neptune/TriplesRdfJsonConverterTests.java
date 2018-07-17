package io.fairspace.neptune;

import io.fairspace.neptune.model.ObjectType;
import io.fairspace.neptune.model.Triple;
import io.fairspace.neptune.model.TripleObject;
import io.fairspace.neptune.metadata.ceres.RdfJsonPayload;
import io.fairspace.neptune.metadata.ceres.RdfObject;
import io.fairspace.neptune.metadata.rdfjson.TriplesRdfJsonConverter;
import org.junit.Test;
import org.springframework.util.LinkedMultiValueMap;

import java.net.URI;
import java.util.*;

import static org.junit.Assert.assertEquals;

public class TriplesRdfJsonConverterTests {
    private final URI subject1 = URI.create("http://subject1.org");
    private final URI subject2 = URI.create("http://subject2.org");
    private final URI property1 = URI.create("http://property1.org");
    private final URI property2 = URI.create("http://property2.org");

    private final URI datatype1 = URI.create("http://type1.org");
    private final RdfObject object1 = new RdfObject("literal", "value1", "language1", datatype1);
    private final RdfObject object2 = new RdfObject("uri", "http://example.com", null, null);

    private final RdfJsonPayload payload = new RdfJsonPayload() {{
        put(subject1, new LinkedMultiValueMap<URI, RdfObject>() {{
            add(property1, object1);
        }});

        put(subject2, new LinkedMultiValueMap<URI, RdfObject>() {{
            add(property1, object1);
            add(property2, object2);
        }});

    }};

    private final List<Triple> triples = Arrays.asList(
            new Triple(subject1, property1, new TripleObject(ObjectType.literal, "value1", "language1", datatype1)),
            new Triple(subject2, property1, new TripleObject(ObjectType.literal, "value1", "language1", datatype1)),
            new Triple(subject2, property2, new TripleObject(ObjectType.uri, "http://example.com", null, null))
    );

    @Test
    public void testConversionToTriples() {
        List<Triple> result = TriplesRdfJsonConverter.convertRdfToTriples(payload);
        assertEquals(triples, result);
    }

    @Test
    public void testConversionFromTriples() {
        RdfJsonPayload result = TriplesRdfJsonConverter.convertTriplesToRdf(triples);
        assertEquals(payload, result);
    }
}
