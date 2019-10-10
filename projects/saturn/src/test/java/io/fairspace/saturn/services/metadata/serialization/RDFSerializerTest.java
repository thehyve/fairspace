package io.fairspace.saturn.services.metadata.serialization;

import io.fairspace.saturn.services.PayloadParsingException;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFFormat;
import org.junit.Before;
import org.junit.Test;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.rdf.model.ResourceFactory.createProperty;
import static org.apache.jena.rdf.model.ResourceFactory.createResource;
import static org.junit.Assert.*;

public class RDFSerializerTest {
    private RDFSerializer serializer;
    private Model model;

    @Before
    public void setUp() throws Exception {
        serializer = new RDFSerializer(RDFFormat.TURTLE);

        model = createDefaultModel();
        model.add(createResource("http://a"), createProperty("http://label"), "test");
    }

    @Test
    public void serialize() {
        assertArrayEquals(new String[] {"<http://a>", "<http://label>", "\"test\"", "."}, serializer.serialize(model).trim().split("\\s+"));
    }

    @Test
    public void deserialize() {
        String input = "<http://a> <http://label> \"test\" .";

        Model deserialized = serializer.deserialize(input, "http://google.nl");

        assertTrue(deserialized.isIsomorphicWith(model));
    }

    @Test(expected = PayloadParsingException.class)
    public void deserializeExceptionHandling() {
        String input = "some invalid text with {\"json-like\": \"structure\"}";

        serializer.deserialize(input, "http://google.nl");
    }

}
