package io.fairspace.saturn.services.metadata.serialization;

import io.fairspace.saturn.services.PayloadParsingException;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFDataMgr;

import java.io.StringReader;
import java.io.StringWriter;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.riot.RDFFormat.TURTLE;

@Slf4j
public class TurtleSerializer implements Serializer {
    public static final String TURTLE_HEADER_STRING = TURTLE.getLang().getHeaderString();

    @Override
    public String serialize(Model model) {
        var writer = new StringWriter();
        RDFDataMgr.write(writer, model, TURTLE);
        return writer.toString();
    }

    @Override
    public Model deserialize(String input, String baseURI) {
        try {
            var model = createDefaultModel();
            RDFDataMgr.read(model, new StringReader(input), baseURI, TURTLE.getLang());
            return model;
        } catch (Exception e) {
            throw new PayloadParsingException(e);
        }
    }
}
