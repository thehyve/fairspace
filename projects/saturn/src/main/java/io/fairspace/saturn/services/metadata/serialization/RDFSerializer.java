package io.fairspace.saturn.services.metadata.serialization;

import io.fairspace.saturn.services.PayloadParsingException;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.jena.rdf.model.Model;
import org.apache.jena.riot.RDFDataMgr;
import org.apache.jena.riot.RDFFormat;

import java.io.StringReader;
import java.io.StringWriter;

import static org.apache.jena.rdf.model.ModelFactory.createDefaultModel;
import static org.apache.jena.riot.RDFFormat.TURTLE;

@Slf4j
public class RDFSerializer implements Serializer {
    private RDFFormat format;

    public RDFSerializer(RDFFormat format) {
        this.format = format;
    }

    @Override
    public String getMimeType() {
        return format.getLang().getHeaderString();
    }

    @Override
    public String serialize(Model model) {
        var writer = new StringWriter();
        RDFDataMgr.write(writer, model, format);
        return writer.toString();
    }

    @Override
    public Model deserialize(String input, String baseURI) {
        try {
            var model = createDefaultModel();
            RDFDataMgr.read(model, new StringReader(input), baseURI, format.getLang());
            return model;
        } catch (Exception e) {
            throw new PayloadParsingException(e);
        }
    }
}
